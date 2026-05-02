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
    checkDeliveryWindow(place: Place, dayOfWeek: keyof Place['weeklySchedule'], etaMinutes: number): string[] {
        const warnings: string[] = [];
        const schedule = place.weeklySchedule?.[dayOfWeek];

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
        const isGreenVehicle = vehicle.fuelType === 'electric' || vehicle.fuelType === 'gas';
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
        dayOfWeek: keyof Place['weeklySchedule'] = 'monday'
    ): RouteSuggestion[] {
        
        let remainingOrders = [...unassignedOrders];
        const suggestions: RouteSuggestion[] = [];
        const startTimeMinutes = timeToMinutes(startTimeStr);

        // Assign one vehicle and one driver at a time
        for (let i = 0; i < availableVehicles.length; i++) {
            const vehicle = availableVehicles[i];
            const driver = availableDrivers[i] || null; 
            
            if (remainingOrders.length === 0) break;

            const suggestion: RouteSuggestion = {
                vehicleId: vehicle.id,
                driverId: driver?.id,
                orders: [],
                places: [],
                estimatedDistance: 0,
                estimatedDuration: 0,
                warnings: [],
                errors: []
            };

            let currentCoords = depotCoords;
            let currentTime = startTimeMinutes;

            let findingOrders = true;
            while(findingOrders && remainingOrders.length > 0) {
                let bestOrderIndex = -1;
                let shortestDistance = Infinity;

                for (let j = 0; j < remainingOrders.length; j++) {
                    const candidateOrder = remainingOrders[j];
                    const place = placesMap.get(candidateOrder.placeId);
                    if (!place || !place.coordinates) continue;

                    // 1. Check Hard Capabilities (ADR, Refrigeration)
                    const capErrors = this.checkCapabilities(vehicle, candidateOrder);
                    if (capErrors.length > 0) continue; 

                    // 2. Check Capacity Limits
                    const capWarnings = this.checkCapacity(vehicle, suggestion.orders, candidateOrder);
                    if (capWarnings.some(w => w.includes("HARD_LIMIT"))) continue; 

                    // 3. Check Range (If Electric/Gas)
                    if (vehicle.maxRange && (suggestion.estimatedDistance + getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, place.coordinates.lat, place.coordinates.lng)) > vehicle.maxRange) {
                        continue;
                    }

                    // 4. Check Environmental Zones (Hard Prohibitions)
                    const envWarnings = this.checkEnvironmentalZones(vehicle, place);
                    if (envWarnings.some(w => w.includes("ENVIRONMENTAL_ERROR"))) continue;

                    // 5. Check Physical Limitations at site (Height, Width, Weight)
                    const physicalErrors = this.checkPhysicalConstraints(vehicle, place);
                    if (physicalErrors.length > 0) continue;

                    // 6. Find closest geographic point
                    const dist = getDistanceFromLatLonInKm(
                        currentCoords.lat, currentCoords.lng, 
                        place.coordinates.lat, place.coordinates.lng
                    );

                    if (dist < shortestDistance) {
                        shortestDistance = dist;
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
                    
                    // Add warnings
                    const capWarnings = this.checkCapacity(vehicle, suggestion.orders.slice(0,-1), selectedOrder);
                    suggestion.warnings.push(...capWarnings.filter(w => !w.includes("HARD_LIMIT")));
                    
                    const envWarnings = this.checkEnvironmentalZones(vehicle, place);
                    suggestion.warnings.push(...envWarnings);

                    // Update temporal/spatial state
                    suggestion.estimatedDistance += shortestDistance;
                    const travelTimeMins = (shortestDistance / this.options.averageSpeedKmph!) * 60;
                    currentTime += travelTimeMins;

                    // Check Delivery Window
                    const windowWarnings = this.checkDeliveryWindow(place, dayOfWeek, currentTime);
                    suggestion.warnings.push(...windowWarnings);

                    currentTime += (place.estimatedDeliveryTime || this.options.baseUnloadTimeMinutes!);
                    currentCoords = place.coordinates;
                    remainingOrders.splice(bestOrderIndex, 1);
                } else {
                    findingOrders = false;
                }
            }

            suggestion.estimatedDuration = currentTime - startTimeMinutes;
            
            if (driver && suggestion.estimatedDuration > 0) {
                const shiftWarnings = this.checkDriverShift(driver, startTimeStr, suggestion.estimatedDuration);
                if (shiftWarnings.some(w => w.includes("HARD_LIMIT"))) {
                     suggestion.errors.push(...shiftWarnings.filter(w => w.includes("HARD_LIMIT")));
                }
                suggestion.warnings.push(...shiftWarnings.filter(w => !w.includes("HARD_LIMIT")));
            }

            if (suggestion.orders.length > 0) {
                 suggestion.warnings = [...new Set(suggestion.warnings)];
                 suggestions.push(suggestion);
            }
        }

        return suggestions;
    }
}