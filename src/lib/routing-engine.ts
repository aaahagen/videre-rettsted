import { Order, Vehicle, Place, DriverProfile } from './types';

// Helper to calculate distance between two coordinates (Haversine formula)
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Convert "HH:mm" to minutes since midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validates if coordinates are present and realistic (not 0,0)
 */
function isValidCoordinate(coords?: { lat: number, lng: number }): boolean {
    if (!coords) return false;
    if (coords.lat === 0 && coords.lng === 0) return false;
    if (Math.abs(coords.lat) < 0.000001 && Math.abs(coords.lng) < 0.000001) return false;
    if (coords.lat < -90 || coords.lat > 90 || coords.lng < -180 || coords.lng > 180) return false;
    return true;
}

/**
 * Normalizes coordinates from various possible field names
 */
function getNormalizedCoords(place: Place): { lat: number, lng: number } | null {
    if (isValidCoordinate(place.coordinates)) return place.coordinates!;
    if (place.location && typeof place.location.latitude === 'number' && typeof place.location.longitude === 'number') {
        const coords = { lat: place.location.latitude, lng: place.location.longitude };
        if (isValidCoordinate(coords)) return coords;
    }
    return null;
}

export interface RouteSuggestion {
    vehicleId: string;
    trailerId?: string;
    trailerName?: string;
    driverId?: string;
    orders: Order[];
    places: Place[];
    estimatedDuration: number; // minutes
    estimatedDistance: number; // km
    warnings: string[]; 
    errors: string[];   
}

/**
 * Represents a logical planning unit (e.g. Tractor + Semi, or just a Van)
 */
export interface VehicleSetup {
    powerUnit: Vehicle;
    passiveUnit?: Vehicle; // Trailer, Semi, Swap-body
    combinedCapacity: {
        weight: number;
        volume: number;
        pallets: number;
        emptyWeight: number;
    };
    combinedDimensions: {
        height: number;
        width: number;
        length: number;
    };
}

export interface RoutingEngineOptions {
    volumeBufferPercent?: number; 
    weightBufferPercent?: number; 
    averageSpeedKmph?: number; 
    baseUnloadTimeMinutes?: number; 
    maxDrivingTimeMinutes?: number; 
    assignmentStrategy?: 'fill_first' | 'balanced';
}

export class ConstraintEngine {
    options: RoutingEngineOptions;

    constructor(options: RoutingEngineOptions = {}) {
        this.options = {
            volumeBufferPercent: options.volumeBufferPercent || 0.85,
            weightBufferPercent: options.weightBufferPercent || 0.95,
            averageSpeedKmph: options.averageSpeedKmph || 40,
            baseUnloadTimeMinutes: options.baseUnloadTimeMinutes || 15,
            maxDrivingTimeMinutes: options.maxDrivingTimeMinutes || 540,
            assignmentStrategy: options.assignmentStrategy || 'fill_first',
        };
    }

    /**
     * Creates a logical setup from a Power Unit and optional Passive Unit.
     */
    createSetup(powerUnit: Vehicle, passiveUnit?: Vehicle): VehicleSetup {
        const capP = powerUnit.capacity;
        const capS = passiveUnit?.capacity;
        
        const dimP = powerUnit.dimensions;
        const dimS = passiveUnit?.dimensions;

        // Capacity is additive
        const weight = (capP?.weight || 0) + (capS?.weight || 0);
        const volume = (capP?.volume || 0) + (capS?.volume || 0);
        const pallets = (capP?.pallets || 0) + (capS?.pallets || 0);
        
        // Empty weight is additive
        let emptyWeight = (capP?.emptyWeight || 0) + (capS?.emptyWeight || 0);
        if (!capP?.emptyWeight) {
             // Fallback estimates
             if (powerUnit.type === 'truck') emptyWeight += 7500;
             else if (powerUnit.type === 'tractor') emptyWeight += 8000;
             else if (powerUnit.type === 'van') emptyWeight += 2200;
             else emptyWeight += 1500;
        }
        if (passiveUnit && !capS?.emptyWeight) {
             if (passiveUnit.config === 'semi') emptyWeight += 6000;
             else emptyWeight += 3000;
        }

        // Dimensions: Max height/width, additive length (roughly)
        const height = Math.max(dimP?.height || 0, dimS?.height || 0);
        const width = Math.max(dimP?.width || 0, dimS?.width || 0);
        const length = (dimP?.length || 0) + (dimS?.length || 0);

        return {
            powerUnit,
            passiveUnit,
            combinedCapacity: { weight, volume, pallets, emptyWeight },
            combinedDimensions: { height, width, length }
        };
    }

    checkCapabilities(setup: VehicleSetup, order: Order): string[] {
        const errors: string[] = [];
        if (!order.details?.specialRequirements) return errors;

        const reqs = order.details.specialRequirements;
        const capsP = setup.powerUnit.capabilities;
        const capsS = setup.passiveUnit?.capabilities;

        if (reqs.adr && !capsP?.adr && !capsS?.adr) {
            errors.push(`Order ${order.barcode} requires ADR.`);
        }
        if (reqs.temperatureControlled && !capsP?.refrigeration && !capsS?.refrigeration) {
            errors.push(`Order ${order.barcode} requires refrigeration.`);
        }
        return errors;
    }

    checkCapacity(setup: VehicleSetup, currentOrders: Order[], newOrder: Order): string[] {
        const warnings: string[] = [];
        const cap = setup.combinedCapacity;
        
        const currentWeight = currentOrders.reduce((sum, o) => sum + (o.details?.weight || 0), 0);
        const currentVolume = currentOrders.reduce((sum, o) => sum + (o.details?.volume || 0), 0);
        
        const newWeight = currentWeight + (newOrder.details?.weight || 0);
        const newVolume = currentVolume + (newOrder.details?.volume || 0);

        if (cap.weight > 0) {
            const maxWeight = cap.weight * this.options.weightBufferPercent!;
            if (newWeight > maxWeight) {
                if (newWeight > cap.weight) {
                     warnings.push(`HARD_LIMIT_WEIGHT: Total weight (${newWeight}kg) exceeds setup max (${cap.weight}kg).`);
                } else {
                     warnings.push(`Warning: Weight approaches limit.`);
                }
            }
        }

        if (cap.volume > 0) {
            const maxVolume = cap.volume * this.options.volumeBufferPercent!;
            if (newVolume > maxVolume) {
                 if (newVolume > cap.volume) {
                     warnings.push(`HARD_LIMIT_VOLUME: Total volume (${newVolume}m3) exceeds setup max (${cap.volume}m3).`);
                 } else {
                     warnings.push(`Warning: Volume approaches limit.`);
                 }
            }
        }

        return warnings;
    }

    checkPhysicalConstraints(setup: VehicleSetup, place: Place): string[] {
        const errors: string[] = [];
        const dim = setup.combinedDimensions;

        if (place.maxVehicleHeight && dim.height > place.maxVehicleHeight) {
            errors.push(`PHYSICAL_ERROR: Too tall (${dim.height}m). Max: ${place.maxVehicleHeight}m.`);
        }
        if (place.maxVehicleWidth && dim.width > place.maxVehicleWidth) {
            errors.push(`PHYSICAL_ERROR: Too wide (${dim.width}m). Max: ${place.maxVehicleWidth}m.`);
        }
        if (place.maxVehicleLength && dim.length > place.maxVehicleLength) {
            errors.push(`PHYSICAL_ERROR: Too long (${dim.length}m). Max: ${place.maxVehicleLength}m.`);
        }
        
        if (place.maxVehicleWeight) {
            const totalGVM = setup.combinedCapacity.weight + setup.combinedCapacity.emptyWeight;
            if (totalGVM > place.maxVehicleWeight) {
                 errors.push(`PHYSICAL_ERROR: Potential GVM (${totalGVM}kg) exceeds site limit (${place.maxVehicleWeight}kg).`);
            }
        }

        return errors;
    }

    checkDeliveryWindow(place: Place, dayOfWeek: string, etaMinutes: number): string[] {
        const warnings: string[] = [];
        const schedule = (place.weeklySchedule as any)?.[dayOfWeek];
        if (!schedule) return warnings;
        if (!schedule.isOpen) {
            warnings.push(`Closed today.`);
            return warnings;
        }
        if (schedule.open && schedule.close) {
            const openTime = timeToMinutes(schedule.open);
            const closeTime = timeToMinutes(schedule.close);
            if (etaMinutes < openTime) warnings.push(`Before opening.`);
            else if (etaMinutes > closeTime) warnings.push(`Past closing.`);
        }
        return warnings;
    }

    checkEnvironmentalZones(setup: VehicleSetup, place: Place): string[] {
        const warnings: string[] = [];
        const isDiesel = setup.powerUnit.fuelType === 'diesel';
        if (place.isZeroEmissionZone && isDiesel) {
            warnings.push(`ENVIRONMENTAL_ERROR: Zero-Emission Zone.`);
        }
        return warnings;
    }

    checkDriverShift(driver: DriverProfile, routeStartTime: string, estimatedDurationMinutes: number): string[] {
        const warnings: string[] = [];
        if (estimatedDurationMinutes > this.options.maxDrivingTimeMinutes!) {
            warnings.push(`HARD_LIMIT_DRIVING: Exceeds legal limit.`);
        }
        if (!driver.workingHours || !driver.workingHours.end) return warnings;

        const shiftEndTime = timeToMinutes(driver.workingHours.end);
        const startTime = timeToMinutes(routeStartTime);
        let availableMinutes = shiftEndTime - startTime;
        if (availableMinutes < 0) availableMinutes += 1440;

        if (estimatedDurationMinutes > availableMinutes) {
            warnings.push(`Driver Shift: Overtime predicted.`);
        }
        return warnings;
    }

    /**
     * Main Generation logic using Setups
     */
    generateBasicSuggestion(
        availableVehicles: Vehicle[], 
        availableDrivers: DriverProfile[],
        unassignedOrders: Order[], 
        placesMap: Map<string, Place>,
        depotCoords: { lat: number, lng: number },
        startTimeStr: string = "08:00",
        dayOfWeek: string = 'monday'
    ): RouteSuggestion[] {
        
        console.log(`[Engine] Start: ${unassignedOrders.length} orders, ${availableVehicles.length} vehicles.`);

        // 1. FORM SETUPS
        const powerUnits = availableVehicles.filter(v => ['truck', 'tractor', 'van', 'car'].includes(v.type));
        const passiveUnits = availableVehicles.filter(v => v.type === 'trailer');

        const setups: VehicleSetup[] = [];
        const remainingPassives = [...passiveUnits];

        for (const p of powerUnits) {
            if (p.type === 'tractor') {
                const semi = remainingPassives.find(s => s.config === 'semi');
                if (semi) {
                    setups.push(this.createSetup(p, semi));
                    remainingPassives.splice(remainingPassives.indexOf(semi), 1);
                } else {
                    console.log(`[Engine] Skipping tractor ${p.name} - No Semi-trailer available.`);
                }
            } else if (p.type === 'truck' && p.config === 'box_swap') {
                const swapBody = remainingPassives.find(s => s.config === 'box_swap');
                if (swapBody) {
                    setups.push(this.createSetup(p, swapBody));
                    remainingPassives.splice(remainingPassives.indexOf(swapBody), 1);
                } else {
                    console.log(`[Engine] Skipping truck ${p.name} - No Swap-body available.`);
                }
            } else {
                // Optional trailer for rigid trucks
                if (p.type === 'truck' && remainingPassives.length > 0) {
                     const trailer = remainingPassives.find(s => s.config === 'drawbar');
                     if (trailer) {
                        setups.push(this.createSetup(p, trailer));
                        remainingPassives.splice(remainingPassives.indexOf(trailer), 1);
                     } else {
                        setups.push(this.createSetup(p));
                     }
                } else {
                    setups.push(this.createSetup(p));
                }
            }
        }

        // 2. FILTER ORDERS
        const validOrders: Order[] = [];
        for (const order of unassignedOrders) {
            const place = placesMap.get(order.placeId);
            if (place && getNormalizedCoords(place)) validOrders.push(order);
        }

        let remainingOrders = [...validOrders];
        const sortedDrivers = [...availableDrivers].sort((a, b) => (a.employmentType === 'internal' ? -1 : 1));

        const maxRoutes = Math.min(setups.length, sortedDrivers.length);
        if (maxRoutes === 0) return [];

        const suggestions: RouteSuggestion[] = [];
        for (let i = 0; i < maxRoutes; i++) {
            suggestions.push({
                vehicleId: setups[i].powerUnit.id,
                trailerId: setups[i].passiveUnit?.id,
                trailerName: setups[i].passiveUnit?.name,
                driverId: sortedDrivers[i].id,
                orders: [],
                places: [],
                estimatedDistance: 0,
                estimatedDuration: 0,
                warnings: [],
                errors: []
            });
        }

        const isBalanced = this.options.assignmentStrategy === 'balanced';
        let currentRouteIdx = 0;
        let stalledRoutes = new Set<number>();
        let safetyCounter = 0;

        while (remainingOrders.length > 0 && stalledRoutes.size < maxRoutes) {
            if (++safetyCounter > (remainingOrders.length * maxRoutes * 2)) break;
            
            if (isBalanced && stalledRoutes.has(currentRouteIdx)) {
                currentRouteIdx = (currentRouteIdx + 1) % maxRoutes;
                continue;
            }

            const suggestion = suggestions[currentRouteIdx];
            const setup = setups[currentRouteIdx];
            const lastPlaceId = suggestion.places[suggestion.places.length - 1]?.id;
            const currentCoords = lastPlaceId ? (getNormalizedCoords(placesMap.get(lastPlaceId)!) || depotCoords) : depotCoords;

            let bestOrderIndex = -1;
            let shortestDistance = Infinity;

            for (let j = 0; j < remainingOrders.length; j++) {
                const candidateOrder = remainingOrders[j];
                const place = placesMap.get(candidateOrder.placeId);
                const placeCoords = place ? getNormalizedCoords(place) : null;
                if (!placeCoords) continue;

                if (this.checkCapabilities(setup, candidateOrder).length > 0) continue;
                if (this.checkCapacity(setup, suggestion.orders, candidateOrder).some(w => w.includes("HARD_LIMIT"))) continue;
                
                const distToNext = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, placeCoords.lat, placeCoords.lng);
                if (setup.powerUnit.maxRange && (suggestion.estimatedDistance + distToNext) > setup.powerUnit.maxRange) continue;
                if (this.checkEnvironmentalZones(setup, place!).some(w => w.includes("ENVIRONMENTAL_ERROR"))) continue;
                if (this.checkPhysicalConstraints(setup, place!).length > 0) continue;

                if (distToNext < shortestDistance) {
                    shortestDistance = distToNext;
                    bestOrderIndex = j;
                }
            }

            if (bestOrderIndex !== -1) {
                const selectedOrder = remainingOrders[bestOrderIndex];
                const place = placesMap.get(selectedOrder.placeId)!;
                const isNewStop = !suggestion.places.some(p => p.id === place.id);
                
                suggestion.orders.push(selectedOrder);
                if (isNewStop) suggestion.places.push(place);
                
                suggestion.estimatedDistance += shortestDistance;
                const travelTime = (shortestDistance / this.options.averageSpeedKmph!) * 60;
                const stopTime = isNewStop ? (place.estimatedDeliveryTime || this.options.baseUnloadTimeMinutes!) : 2;
                suggestion.estimatedDuration += travelTime + stopTime;
                
                remainingOrders.splice(bestOrderIndex, 1);
                stalledRoutes.delete(currentRouteIdx);
                if (isBalanced) currentRouteIdx = (currentRouteIdx + 1) % maxRoutes;
            } else {
                stalledRoutes.add(currentRouteIdx);
                currentRouteIdx = (currentRouteIdx + 1) % maxRoutes;
            }
        }

        return suggestions.filter(s => s.orders.length > 0).map(s => {
            const driver = sortedDrivers.find(d => d.id === s.driverId)!;
            const shiftWarnings = this.checkDriverShift(driver, startTimeStr, s.estimatedDuration);
            s.errors.push(...shiftWarnings.filter(w => w.includes("HARD_LIMIT")));
            s.warnings.push(...shiftWarnings.filter(w => !w.includes("HARD_LIMIT")));
            s.warnings = [...new Set(s.warnings)];
            return s;
        });
    }
}