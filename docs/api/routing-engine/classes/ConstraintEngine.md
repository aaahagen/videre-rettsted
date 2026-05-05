[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [routing-engine](../README.md) / ConstraintEngine

# Class: ConstraintEngine

Defined in: [routing-engine.ts:59](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L59)

## Constructors

### Constructor

> **new ConstraintEngine**(`options?`): `ConstraintEngine`

Defined in: [routing-engine.ts:62](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L62)

#### Parameters

##### options?

[`RoutingEngineOptions`](../interfaces/RoutingEngineOptions.md) = `{}`

#### Returns

`ConstraintEngine`

## Properties

### options

> **options**: [`RoutingEngineOptions`](../interfaces/RoutingEngineOptions.md)

Defined in: [routing-engine.ts:60](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L60)

## Methods

### checkCapabilities()

> **checkCapabilities**(`vehicle`, `order`): `string`[]

Defined in: [routing-engine.ts:77](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L77)

Checks if an order's specific requirements match the vehicle's capabilities.
Returns an array of error strings if constraints are violated.

#### Parameters

##### vehicle

[`Vehicle`](../../types/interfaces/Vehicle.md)

##### order

[`Order`](../../types/interfaces/Order.md)

#### Returns

`string`[]

***

### checkCapacity()

> **checkCapacity**(`vehicle`, `currentOrders`, `newOrder`): `string`[]

Defined in: [routing-engine.ts:98](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L98)

Checks if adding an order exceeds the vehicle's physical capacity buffers.

#### Parameters

##### vehicle

[`Vehicle`](../../types/interfaces/Vehicle.md)

##### currentOrders

[`Order`](../../types/interfaces/Order.md)[]

##### newOrder

[`Order`](../../types/interfaces/Order.md)

#### Returns

`string`[]

***

### checkDeliveryWindow()

> **checkDeliveryWindow**(`place`, `dayOfWeek`, `etaMinutes`): `string`[]

Defined in: [routing-engine.ts:162](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L162)

Checks if the ETA falls within the delivery window for a specific day.

#### Parameters

##### place

[`Place`](../../types/interfaces/Place.md)

##### dayOfWeek

`string`

##### etaMinutes

`number`

#### Returns

`string`[]

***

### checkDriverShift()

> **checkDriverShift**(`driver`, `routeStartTime`, `estimatedDurationMinutes`): `string`[]

Defined in: [routing-engine.ts:208](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L208)

Checks if the route duration exceeds the driver's planned shift or legal limits.

#### Parameters

##### driver

[`DriverProfile`](../../types/interfaces/DriverProfile.md)

##### routeStartTime

`string`

##### estimatedDurationMinutes

`number`

#### Returns

`string`[]

***

### checkEnvironmentalZones()

> **checkEnvironmentalZones**(`vehicle`, `place`): `string`[]

Defined in: [routing-engine.ts:192](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L192)

Checks environmental zone compatibility (Diesel bans/tolls)

#### Parameters

##### vehicle

[`Vehicle`](../../types/interfaces/Vehicle.md)

##### place

[`Place`](../../types/interfaces/Place.md)

#### Returns

`string`[]

***

### checkPhysicalConstraints()

> **checkPhysicalConstraints**(`vehicle`, `place`): `string`[]

Defined in: [routing-engine.ts:135](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L135)

Checks if the vehicle fits within the physical constraints of the delivery place.

#### Parameters

##### vehicle

[`Vehicle`](../../types/interfaces/Vehicle.md)

##### place

[`Place`](../../types/interfaces/Place.md)

#### Returns

`string`[]

***

### generateBasicSuggestion()

> **generateBasicSuggestion**(`availableVehicles`, `availableDrivers`, `unassignedOrders`, `placesMap`, `depotCoords`, `startTimeStr?`, `dayOfWeek?`): [`RouteSuggestion`](../interfaces/RouteSuggestion.md)[]

Defined in: [routing-engine.ts:240](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L240)

Basic greedy heuristic (Nearest Neighbor) to suggest a route.

#### Parameters

##### availableVehicles

[`Vehicle`](../../types/interfaces/Vehicle.md)[]

##### availableDrivers

[`DriverProfile`](../../types/interfaces/DriverProfile.md)[]

##### unassignedOrders

[`Order`](../../types/interfaces/Order.md)[]

##### placesMap

`Map`\<`string`, [`Place`](../../types/interfaces/Place.md)\>

##### depotCoords

###### lat

`number`

###### lng

`number`

##### startTimeStr?

`string` = `"08:00"`

##### dayOfWeek?

`string` = `'monday'`

#### Returns

[`RouteSuggestion`](../interfaces/RouteSuggestion.md)[]
