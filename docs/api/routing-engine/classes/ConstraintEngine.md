[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [routing-engine](../README.md) / ConstraintEngine

# Class: ConstraintEngine

Defined in: [routing-engine.ts:60](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L60)

## Constructors

### Constructor

> **new ConstraintEngine**(`options?`): `ConstraintEngine`

Defined in: [routing-engine.ts:63](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L63)

#### Parameters

##### options?

[`RoutingEngineOptions`](../interfaces/RoutingEngineOptions.md) = `{}`

#### Returns

`ConstraintEngine`

## Properties

### options

> **options**: [`RoutingEngineOptions`](../interfaces/RoutingEngineOptions.md)

Defined in: [routing-engine.ts:61](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L61)

## Methods

### checkCapabilities()

> **checkCapabilities**(`vehicle`, `order`): `string`[]

Defined in: [routing-engine.ts:78](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L78)

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

Defined in: [routing-engine.ts:99](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L99)

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

Defined in: [routing-engine.ts:163](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L163)

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

Defined in: [routing-engine.ts:209](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L209)

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

Defined in: [routing-engine.ts:193](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L193)

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

Defined in: [routing-engine.ts:136](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L136)

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

Defined in: [routing-engine.ts:241](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/routing-engine.ts#L241)

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
