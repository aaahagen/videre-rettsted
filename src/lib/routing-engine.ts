import { Order, Vehicle, Place, DriverProfile } from './types';

// Helper to calculate distance between two coordinates (Haversine formula)
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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
    if (Math.abs(coords.lat) < 0.0001 && Math.abs(coords.lng) < 0.0001) return false;
    if (coords.lat < -90 || coords.lat > 90 || coords.lng < -180 || coords.lng > 180) return false;
    return true;
}

export interface RouteSuggestion {
    vehicleId: string;
    driverId?: string;
    orders: Order[];
    places: Place[];
    estimatedDuration: number; // minutes
    estimatedDistance: number; // km
    warnings: string[]; // Soft warnings (e.g., "Vehicle is at 95% volume capacity", "Overtime warning")
    errors: string[];   // Hard errors preventing this route (e.g., "Vehicle lacks ADR for Order Y")
}

export interface RoutingEngineOptions {
    volumeBufferPercent?: number; // e.g., 0.85 means vehicle holds 85% of its max volume safely
    weightBufferPercent?: number; // e.g., 0.95
    averageSpeedKmph?: number; // fallback speed for ETA calculation
    baseUnloadTimeMinutes?: number; // Default Time spent at each stop if place has none defined
    maxDrivingTimeMinutes?: number; // EU 561/2006 baseline e.g. 9 hours (540 mins)
    assignmentStrategy?: 'fill_first' | 'balanced'; // NEW: Balancing mode
}

export class ConstraintEngine {
    options: RoutingEngineOptions;

    constructor(options: RoutingEngineOptions = {}) {
        this.options = {
            volumeBufferPercent: options.volumeBufferPercent || 0.85,
            weightBufferPercent: options.weightBufferPercent || 0.95,
            averageSpeedKmph: options.averageSpeedKmph || 40, // 40km/h average city/mixed driving
            baseUnloadTimeMinutes: options.baseUnloadTimeMinutes || 15,
            maxDrivingTimeMinutes: options.maxDrivingTimeMinutes || 540,
            assignmentStrategy: options.assignmentStrategy || 'fill_first',
        };
    }

    /**
     * Checks if an order's specific requirements match the vehicle's capabilities.
     * Returns an array of error strings if constraints are violated.
     */
    checkCapabilities(vehicle: Vehicle, order: Order): string[] {
        const errors: string[] = [];
        if (!order.details?.specialRequirements) return errors;

        const reqs = order.details.specialRequirements;
        const caps = vehicle.capabilities;

        if (reqs.adr && !caps?.adr) {
            errors.push(`Order ${order.barcode} requires ADR, but vehicle ${vehicle.name} lacks ADR capability.`);
        }
        if (reqs.temperatureControlled && !caps?.refrigeration) {
            errors.push(`Order ${order.barcode} requires refrigeration, but vehicle ${vehicle.name} does not have it.`);
        }
        // Can be expanded with Tail-lift checks etc.

        return errors;
    }

    /**
     * Checks if adding an order exceeds the vehicle's physical capacity buffers.
     */
    checkCapacity(vehicle: Vehicle, currentOrders: Order[], newOrder: Order): string[] {
        const warnings: string[] = [];
        
        const currentWeight = currentOrders.reduce((sum, o) => sum + (o.details?.weight || 0), 0);
        const currentVolume = currentOrders.reduce((sum, o) => sum + (o.details?.volume || 0), 0);
        
        const newWeight = currentWeight + (newOrder.details?.weight || 0);
        const newVolume = currentVolume + (newOrder.details?.volume || 0);

        if (vehicle.capacity?.weight) {
            const maxWeight = vehicle.capacity.weight * this.options.weightBufferPercent!;
            if (newWeight > maxWeight) {
                if (newWeight > vehicle.capacity.weight) {
                     warnings.push(`HARD_LIMIT_WEIGHT: Total weight (${newWeight}kg) exceeds vehicle max (${vehicle.capacity.weight}kg).`);
                } else {
                     warnings.push(`Warning: Total weight (${newWeight}kg) approaches vehicle limit (Buffer: ${Math.round(vehicle.capacity.weight * this.options.weightBufferPercent!)}kg).`);
                }
            }
        }

        if (vehicle.capacity?.volume) {
            const maxVolume = vehicle.capacity.volume * this.options.volumeBufferPercent!;
            if (newVolume > maxVolume) {
                 if (newVolume > vehicle.capacity.volume) {
                     warnings.push(`HARD_LIMIT_VOLUME: Total volume (${newVolume}m3) exceeds vehicle max (${vehicle.capacity.volume}m3).`);
                 } else {
                     warnings.push(`Warning: Total volume (${newVolume}m3) approaches vehicle limit (Buffer: ${Math.round(vehicle.capacity.volume * this.options.volumeBufferPercent!)}m3).`);
                 }
            }
        }

        return warnings;
    }

    /**
     * Checks if the vehicle fits within the physical constraints of the delivery place.
     */
    checkPhysicalConstraints(vehicle: Vehicle, place: Place): string[] {
        const errors: string[] = [];
        const dim = vehicle.dimensions;

        if (place.maxVehicleHeight && dim?.height && dim.height > place.maxVehicleHeight) {
            errors.push(`PHYSICAL_ERROR: Vehicle is too tall (${dim.height}m) for ${place.name} (Max: ${place.maxVehicleHeight}m).`);
        }
        if (place.maxVehicleWidth && dim?.width && dim.width > place.maxVehicleWidth) {
            errors.push(`PHYSICAL_ERROR: Vehicle is too wide (${dim.width}m) for ${place.name} (Max: ${place.maxVehicleWidth}m).`);
        }
        if (place.maxVehicleLength && dim?.length && dim.length > place.maxVehicleLength) {
            errors.push(`PHYSICAL_ERROR: Vehicle is too long (${dim.length}m) for ${place.name} (Max: ${place.maxVehicleLength}m).`);
        }
        // Assuming maxVehicleWeight refers to the vehicle's actual total weight (empty + load)
        // For now comparing against max potential weight (tare + capacity) for safety
        const estimatedTotalWeight = (vehicle.capacity.weight || 0) + 15000; // Simplified tare weight guess for now
        if (place.maxVehicleWeight && estimatedTotalWeight > place.maxVehicleWeight) {
             errors.push(`PHYSICAL_ERROR: Vehicle potential weight (${estimatedTotalWeight}kg) exceeds site limit (${place.maxVehicleWeight}kg).`);
        }

        return errors;
    }

    /**
     * Checks if the ETA falls within the delivery window for a specific day.
     */
    checkDeliveryWindow(place: Place, dayOfWeek: string, etaMinutes: number): string[] {
        const warnings: string[] = [];
        const schedule = (place.weeklySchedule as any)?.[dayOfWeek];

        if (!schedule) return warnings; // No schedule defined, assume open

        if (!schedule.isOpen) {
            warnings.push(`Delivery Window: Place ${place.name} is scheduled to be closed today.`);
            return warnings;
        }

        if (schedule.open && schedule.close) {
            const openTime = timeToMinutes(schedule.open);
            const closeTime = timeToMinutes(schedule.close);

            if (etaMinutes < openTime) {
                warnings.push(`Delivery Window: ETA for ${place.name} is before opening time (${schedule.open}).`);
            } else if (etaMinutes > closeTime) {
                warnings.push(`Delivery Window: ETA for ${place.name} is past closing time (${schedule.close}).`);
            } else if (closeTime - etaMinutes < 30) {
                 warnings.push(`Delivery Window: ETA is within 30 minutes of closing time for ${place.name}.`);
            }
        }

        return warnings;
    }

    /**
     * Checks environmental zone compatibility (Diesel bans/tolls)
     */
    checkEnvironmentalZones(vehicle: Vehicle, place: Place): string[] {
        const warnings: string[] = [];
        const isDiesel = vehicle.fuelType === 'diesel';

        if (place.isZeroEmissionZone && isDiesel) {
            warnings.push(`ENVIRONMENTAL_ERROR: Place ${place.name} is in a Zero-Emission Zone. Diesel vehicles are prohibited.`);
        } else if (place.isCityCenter && isDiesel) {
            warnings.push(`Environmental: ${place.name} is in a high-toll city center. Diesel vehicles will incur extra costs.`);
        }

        return warnings;
    }

    /**
     * Checks if the route duration exceeds the driver's planned shift or legal limits.
     */
    checkDriverShift(driver: DriverProfile, routeStartTime: string, estimatedDurationMinutes: number): string[] {
        const warnings: string[] = [];
        
        // 1. Legal Limit Check (e.g. EU driving rules)
        if (estimatedDurationMinutes > this.options.maxDrivingTimeMinutes!) {
            warnings.push(`HARD_LIMIT_DRIVING: Estimated route duration (${Math.floor(estimatedDurationMinutes/60)}h ${Math.floor(estimatedDurationMinutes%60)}m) exceeds legal daily driving limits.`);
        }

        // 2. Scheduled Shift Check
        if (!driver.workingHours || !driver.workingHours.end) {
            warnings.push(`Driver Shift: ${driver.name} has no standard working hours defined. Assuming flexible schedule.`);
            return warnings;
        }

        const shiftEndTime = timeToMinutes(driver.workingHours.end);
        const startTime = timeToMinutes(routeStartTime);
        
        let availableMinutes = shiftEndTime - startTime;
        if (availableMinutes < 0) availableMinutes += 24 * 60; // Cross-midnight adjustment

        // 3. Overtime calculation
        if (estimatedDurationMinutes > availableMinutes) {
            const overtime = Math.ceil(estimatedDurationMinutes - availableMinutes);
            warnings.push(`Driver Shift: Route duration will cause approx ${overtime} mins of overtime for ${driver.name} (Shift ends at ${driver.workingHours.end}).`);
        }

        return warnings;
    }

    /**
     * Basic greedy heuristic (Nearest Neighbor) to suggest a route.
     */
    generateBasicSuggestion(
        availableVehicles: Vehicle[], 
        availableDrivers: DriverProfile[],
        unassignedOrders: Order[], 
        placesMap: Map<string, Place>, // PlaceID -> Place
        depotCoords: { lat: number, lng: number },
        startTimeStr: string = "08:00",
        dayOfWeek: string = 'monday'
    ): RouteSuggestion[] {
        
        // 1. Initial Data Validation: Skip orders with invalid coordinates
        const validOrders: Order[] = [];
        const invalidOrderCount: string[] = [];

        for (const order of unassignedOrders) {
            const place = placesMap.get(order.placeId);
            if (place && isValidCoordinate(place.coordinates)) {
                validOrders.push(order);
            } else {
                invalidOrderCount.push(order.barcode);
            }
        }

        let remainingOrders = [...validOrders];
        const suggestions: RouteSuggestion[] = [];
        const startTimeMinutes = timeToMinutes(startTimeStr);

        // Sort drivers to prioritize regular employees (internal) over external contractors
        const sortedDrivers = [...availableDrivers].sort((a, b) => {
            const typeA = a.employmentType || 'internal';
            const typeB = b.employmentType || 'internal';
            if (typeA === 'internal' && typeB === 'external') return -1;
            if (typeA === 'external' && typeB === 'internal') return 1;
            return 0;
        });

        const maxRoutes = Math.min(availableVehicles.length, sortedDrivers.length);
        if (maxRoutes === 0 || remainingOrders.length === 0) return [];

        for (let i = 0; i < maxRoutes; i++) {
            suggestions.push({
                vehicleId: availableVehicles[i].id,
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

        while (remainingOrders.length > 0 && stalledRoutes.size < maxRoutes) {
            
            // In balanced mode, skip drivers that can't take any more orders
            if (isBalanced && stalledRoutes.has(currentRouteIdx)) {
                currentRouteIdx = (currentRouteIdx + 1) % maxRoutes;
                continue;
            }

            const suggestion = suggestions[currentRouteIdx];
            const vehicle = availableVehicles[currentRouteIdx];
            const driver = sortedDrivers[currentRouteIdx];
            
            const lastPlaceId = suggestion.places[suggestion.places.length - 1]?.id;
            const currentCoords = lastPlaceId ? placesMap.get(lastPlaceId)?.coordinates || depotCoords : depotCoords;

            let bestOrderIndex = -1;
            let shortestDistance = Infinity;

            for (let j = 0; j < remainingOrders.length; j++) {
                const candidateOrder = remainingOrders[j];
                const place = placesMap.get(candidateOrder.placeId);
                if (!place || !place.coordinates) continue;

                // Constraint Checks
                if (this.checkCapabilities(vehicle, candidateOrder).length > 0) continue; 
                if (this.checkCapacity(vehicle, suggestion.orders, candidateOrder).some(w => w.includes("HARD_LIMIT"))) continue; 

                const distToNext = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, place.coordinates.lat, place.coordinates.lng);
                if (vehicle.maxRange && (suggestion.estimatedDistance + distToNext) > vehicle.maxRange) continue;
                if (this.checkEnvironmentalZones(vehicle, place).some(w => w.includes("ENVIRONMENTAL_ERROR"))) continue;
                if (this.checkPhysicalConstraints(vehicle, place).length > 0) continue;

                if (distToNext < shortestDistance) {
                    shortestDistance = distToNext;
                    bestOrderIndex = j;
                }
            }

            if (bestOrderIndex !== -1) {
                const selectedOrder = remainingOrders[bestOrderIndex];
                const place = placesMap.get(selectedOrder.placeId)!;
                
                suggestion.orders.push(selectedOrder);
                if (!suggestion.places.some(p => p.id === place.id)) {
                    suggestion.places.push(place);
                }
                
                suggestion.warnings.push(...this.checkCapacity(vehicle, suggestion.orders.slice(0,-1), selectedOrder).filter(w => !w.includes("HARD_LIMIT")));
                suggestion.warnings.push(...this.checkEnvironmentalZones(vehicle, place));

                suggestion.estimatedDistance += shortestDistance;
                const travelTimeMins = (shortestDistance / this.options.averageSpeedKmph!) * 60;
                suggestion.estimatedDuration += travelTimeMins + (place.estimatedDeliveryTime || this.options.baseUnloadTimeMinutes!);
                
                suggestion.warnings.push(...this.checkDeliveryWindow(place, dayOfWeek, startTimeMinutes + suggestion.estimatedDuration));
                
                remainingOrders.splice(bestOrderIndex, 1);

                if (isBalanced) {
                    currentRouteIdx = (currentRouteIdx + 1) % maxRoutes;
                }
            } else {
                // This route is stalled
                stalledRoutes.add(currentRouteIdx);
                if (!isBalanced) {
                    currentRouteIdx++;
                    if (currentRouteIdx >= maxRoutes) break;
                } else {
                    currentRouteIdx = (currentRouteIdx + 1) % maxRoutes;
                }
            }
        }

        return suggestions.filter(s => s.orders.length > 0).map(s => {
            const driver = sortedDrivers.find(d => d.id === s.driverId)!;
            const shiftWarnings = this.checkDriverShift(driver, startTimeStr, s.estimatedDuration);
            s.errors.push(...shiftWarnings.filter(w => w.includes("HARD_LIMIT")));
            s.warnings.push(...shiftWarnings.filter(w => !w.includes("HARD_LIMIT")));
            if (invalidOrderCount.length > 0) {
                s.warnings.push(`DATA_WARNING: ${invalidOrderCount.length} ordre hoppet over pga manglende koordinater.`);
            }
            s.warnings = [...new Set(s.warnings)];
            return s;
        });
    }
}