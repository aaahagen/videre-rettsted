[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [database](../README.md) / Database

# Interface: Database

Defined in: [database.ts:3](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L3)

## Methods

### addManifestNote()

> **addManifestNote**(`orgId`, `manifestId`, `note`): `Promise`\<`void`\>

Defined in: [database.ts:71](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L71)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

##### note

`Omit`\<[`ManifestNote`](../../types/interfaces/ManifestNote.md), `"createdAt"`\>

#### Returns

`Promise`\<`void`\>

***

### createLogEntry()

> **createLogEntry**(`logEntry`): `Promise`\<`string`\>

Defined in: [database.ts:49](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L49)

#### Parameters

##### logEntry

`Omit`\<[`LogEntry`](../../types/interfaces/LogEntry.md), `"id"` \| `"timestamp"`\>

#### Returns

`Promise`\<`string`\>

***

### createManifest()

> **createManifest**(`manifest`): `Promise`\<`string`\>

Defined in: [database.ts:63](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L63)

#### Parameters

##### manifest

`Omit`\<[`Manifest`](../../types/interfaces/Manifest.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

#### Returns

`Promise`\<`string`\>

***

### createOrder()

> **createOrder**(`order`): `Promise`\<`string`\>

Defined in: [database.ts:54](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L54)

#### Parameters

##### order

`Omit`\<[`Order`](../../types/interfaces/Order.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

#### Returns

`Promise`\<`string`\>

***

### createOrganization()

> **createOrganization**(`name`): `Promise`\<`string`\>

Defined in: [database.ts:4](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L4)

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`string`\>

***

### createPlace()

> **createPlace**(`place`): `Promise`\<[`Place`](../../types/interfaces/Place.md)\>

Defined in: [database.ts:17](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L17)

#### Parameters

##### place

`Omit`\<[`Place`](../../types/interfaces/Place.md), `"id"` \| `"createdAt"` \| `"updatedAt"` \| `"createdBy"`\>

#### Returns

`Promise`\<[`Place`](../../types/interfaces/Place.md)\>

***

### createRoute()

> **createRoute**(`route`): `Promise`\<[`Route`](../../types/interfaces/Route.md)\>

Defined in: [database.ts:23](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L23)

#### Parameters

##### route

`Omit`\<[`Route`](../../types/interfaces/Route.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

#### Returns

`Promise`\<[`Route`](../../types/interfaces/Route.md)\>

***

### createUser()

> **createUser**(`uid`, `name`, `email`, `orgId`, `role`): `Promise`\<`void`\>

Defined in: [database.ts:9](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L9)

#### Parameters

##### uid

`string`

##### name

`string`

##### email

`string`

##### orgId

`string`

##### role

`"admin"` \| `"driver"`

#### Returns

`Promise`\<`void`\>

***

### createVehicle()

> **createVehicle**(`vehicle`): `Promise`\<[`Vehicle`](../../types/interfaces/Vehicle.md)\>

Defined in: [database.ts:29](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L29)

#### Parameters

##### vehicle

`Omit`\<[`Vehicle`](../../types/interfaces/Vehicle.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

#### Returns

`Promise`\<[`Vehicle`](../../types/interfaces/Vehicle.md)\>

***

### createVehicleDamageReport()

> **createVehicleDamageReport**(`data`): `Promise`\<[`VehicleDamageReport`](../../types/interfaces/VehicleDamageReport.md)\>

Defined in: [database.ts:36](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L36)

#### Parameters

##### data

`Omit`\<[`VehicleDamageReport`](../../types/interfaces/VehicleDamageReport.md), `"id"` \| `"createdAt"`\>

#### Returns

`Promise`\<[`VehicleDamageReport`](../../types/interfaces/VehicleDamageReport.md)\>

***

### createWorkLog()

> **createWorkLog**(`workLog`): `Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)\>

Defined in: [database.ts:39](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L39)

#### Parameters

##### workLog

`Omit`\<[`WorkLog`](../../types/interfaces/WorkLog.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

#### Returns

`Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)\>

***

### decrementManifestItemLoadedCount()

> **decrementManifestItemLoadedCount**(`orgId`, `manifestId`, `orderId`): `Promise`\<`void`\>

Defined in: [database.ts:69](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L69)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

##### orderId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteManifest()

> **deleteManifest**(`orgId`, `manifestId`): `Promise`\<`void`\>

Defined in: [database.ts:65](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L65)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteOrder()

> **deleteOrder**(`orgId`, `orderId`): `Promise`\<`void`\>

Defined in: [database.ts:60](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L60)

#### Parameters

##### orgId

`string`

##### orderId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteOrganization()

> **deleteOrganization**(`orgId`): `Promise`\<`void`\>

Defined in: [database.ts:6](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L6)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<`void`\>

***

### deletePlace()

> **deletePlace**(`id`): `Promise`\<`void`\>

Defined in: [database.ts:21](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L21)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteRoute()

> **deleteRoute**(`orgId`, `id`): `Promise`\<`void`\>

Defined in: [database.ts:27](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L27)

#### Parameters

##### orgId

`string`

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteUser()

> **deleteUser**(`uid`): `Promise`\<`void`\>

Defined in: [database.ts:13](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L13)

#### Parameters

##### uid

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteVehicle()

> **deleteVehicle**(`id`): `Promise`\<`void`\>

Defined in: [database.ts:33](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L33)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteWorkLog()

> **deleteWorkLog**(`id`): `Promise`\<`void`\>

Defined in: [database.ts:44](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L44)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### finalizeManifest()

> **finalizeManifest**(`orgId`, `manifestId`, `userId`): `Promise`\<`void`\>

Defined in: [database.ts:70](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L70)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### getLogs()

> **getLogs**(`orgId`): `Promise`\<[`LogEntry`](../../types/interfaces/LogEntry.md)[]\>

Defined in: [database.ts:48](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L48)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`LogEntry`](../../types/interfaces/LogEntry.md)[]\>

***

### getManifestByRoute()

> **getManifestByRoute**(`orgId`, `routeId`): `Promise`\<[`Manifest`](../../types/interfaces/Manifest.md) \| `null`\>

Defined in: [database.ts:66](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L66)

#### Parameters

##### orgId

`string`

##### routeId

`string`

#### Returns

`Promise`\<[`Manifest`](../../types/interfaces/Manifest.md) \| `null`\>

***

### getOrder()

> **getOrder**(`orgId`, `orderId`): `Promise`\<[`Order`](../../types/interfaces/Order.md) \| `null`\>

Defined in: [database.ts:55](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L55)

#### Parameters

##### orgId

`string`

##### orderId

`string`

#### Returns

`Promise`\<[`Order`](../../types/interfaces/Order.md) \| `null`\>

***

### getOrders()

> **getOrders**(`orgId`): `Promise`\<[`Order`](../../types/interfaces/Order.md)[]\>

Defined in: [database.ts:56](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L56)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`Order`](../../types/interfaces/Order.md)[]\>

***

### getOrdersForRoute()

> **getOrdersForRoute**(`orgId`, `routeId`): `Promise`\<[`Order`](../../types/interfaces/Order.md)[]\>

Defined in: [database.ts:57](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L57)

#### Parameters

##### orgId

`string`

##### routeId

`string`

#### Returns

`Promise`\<[`Order`](../../types/interfaces/Order.md)[]\>

***

### getOrganization()

> **getOrganization**(`orgId`): `Promise`\<[`Organization`](../../types/interfaces/Organization.md) \| `null`\>

Defined in: [database.ts:5](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L5)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`Organization`](../../types/interfaces/Organization.md) \| `null`\>

***

### getPlace()

> **getPlace**(`id`): `Promise`\<[`Place`](../../types/interfaces/Place.md) \| `null`\>

Defined in: [database.ts:18](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L18)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`Place`](../../types/interfaces/Place.md) \| `null`\>

***

### getPlaces()

> **getPlaces**(`orgId`): `Promise`\<[`Place`](../../types/interfaces/Place.md)[]\>

Defined in: [database.ts:19](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L19)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`Place`](../../types/interfaces/Place.md)[]\>

***

### getRoute()

> **getRoute**(`id`): `Promise`\<[`Route`](../../types/interfaces/Route.md) \| `null`\>

Defined in: [database.ts:24](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L24)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`Route`](../../types/interfaces/Route.md) \| `null`\>

***

### getRoutes()

> **getRoutes**(`orgId`): `Promise`\<[`Route`](../../types/interfaces/Route.md)[]\>

Defined in: [database.ts:25](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L25)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`Route`](../../types/interfaces/Route.md)[]\>

***

### getUser()

> **getUser**(`uid`): `Promise`\<[`User`](../../types/interfaces/User.md) \| `null`\>

Defined in: [database.ts:10](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L10)

#### Parameters

##### uid

`string`

#### Returns

`Promise`\<[`User`](../../types/interfaces/User.md) \| `null`\>

***

### getUsers()

> **getUsers**(`orgId`): `Promise`\<[`User`](../../types/interfaces/User.md)[]\>

Defined in: [database.ts:11](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L11)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`User`](../../types/interfaces/User.md)[]\>

***

### getVehicle()

> **getVehicle**(`id`): `Promise`\<[`Vehicle`](../../types/interfaces/Vehicle.md) \| `null`\>

Defined in: [database.ts:30](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L30)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`Vehicle`](../../types/interfaces/Vehicle.md) \| `null`\>

***

### getVehicleDamages()

> **getVehicleDamages**(`vehicleId`): `Promise`\<[`VehicleDamageReport`](../../types/interfaces/VehicleDamageReport.md)[]\>

Defined in: [database.ts:35](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L35)

#### Parameters

##### vehicleId

`string`

#### Returns

`Promise`\<[`VehicleDamageReport`](../../types/interfaces/VehicleDamageReport.md)[]\>

***

### getVehicleInspections()

> **getVehicleInspections**(`orgId`, `vehicleId`): `Promise`\<[`VehicleInspection`](../../types/interfaces/VehicleInspection.md)[]\>

Defined in: [database.ts:78](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L78)

#### Parameters

##### orgId

`string`

##### vehicleId

`string`

#### Returns

`Promise`\<[`VehicleInspection`](../../types/interfaces/VehicleInspection.md)[]\>

***

### getVehicles()

> **getVehicles**(`orgId`): `Promise`\<[`Vehicle`](../../types/interfaces/Vehicle.md)[]\>

Defined in: [database.ts:31](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L31)

#### Parameters

##### orgId

`string`

#### Returns

`Promise`\<[`Vehicle`](../../types/interfaces/Vehicle.md)[]\>

***

### getWorkLog()

> **getWorkLog**(`id`): `Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md) \| `null`\>

Defined in: [database.ts:40](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L40)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md) \| `null`\>

***

### getWorkLogsForDriver()

> **getWorkLogsForDriver**(`driverId`, `startDate?`, `endDate?`): `Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)[]\>

Defined in: [database.ts:41](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L41)

#### Parameters

##### driverId

`string`

##### startDate?

`string`

##### endDate?

`string`

#### Returns

`Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)[]\>

***

### getWorkLogsForOrganization()

> **getWorkLogsForOrganization**(`orgId`, `status?`): `Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)[]\>

Defined in: [database.ts:42](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L42)

#### Parameters

##### orgId

`string`

##### status?

`"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

#### Returns

`Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)[]\>

***

### incrementManifestItemLoadedCount()

> **incrementManifestItemLoadedCount**(`orgId`, `manifestId`, `orderId`, `userId`): `Promise`\<`void`\>

Defined in: [database.ts:67](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L67)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

##### orderId

`string`

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### logEvent()

> **logEvent**(`orgId`, `userId`, `action`, `details?`): `Promise`\<`void`\>

Defined in: [database.ts:47](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L47)

#### Parameters

##### orgId

`string`

##### userId

`string`

##### action

`string`

##### details?

`any`

#### Returns

`Promise`\<`void`\>

***

### markPlaceVisited()

> **markPlaceVisited**(`userId`, `placeId`): `Promise`\<`void`\>

Defined in: [database.ts:15](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L15)

#### Parameters

##### userId

`string`

##### placeId

`string`

#### Returns

`Promise`\<`void`\>

***

### processManifestScan()

> **processManifestScan**(`orgId`, `manifestId`, `scannedBarcode`, `userId`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [database.ts:68](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L68)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

##### scannedBarcode

`string`

##### userId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

***

### submitProofOfDelivery()

> **submitProofOfDelivery**(`orgId`, `routeId`, `placeId`, `pod`): `Promise`\<`void`\>

Defined in: [database.ts:74](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L74)

#### Parameters

##### orgId

`string`

##### routeId

`string`

##### placeId

`string`

##### pod

[`ProofOfDelivery`](../../types/interfaces/ProofOfDelivery.md)

#### Returns

`Promise`\<`void`\>

***

### submitVehicleInspection()

> **submitVehicleInspection**(`inspection`): `Promise`\<`string`\>

Defined in: [database.ts:77](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L77)

#### Parameters

##### inspection

`Omit`\<[`VehicleInspection`](../../types/interfaces/VehicleInspection.md), `"id"`\>

#### Returns

`Promise`\<`string`\>

***

### toggleFavorite()

> **toggleFavorite**(`userId`, `placeId`): `Promise`\<`void`\>

Defined in: [database.ts:14](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L14)

#### Parameters

##### userId

`string`

##### placeId

`string`

#### Returns

`Promise`\<`void`\>

***

### updateManifest()

> **updateManifest**(`orgId`, `manifestId`, `updates`): `Promise`\<`void`\>

Defined in: [database.ts:64](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L64)

#### Parameters

##### orgId

`string`

##### manifestId

`string`

##### updates

`Partial`\<[`Manifest`](../../types/interfaces/Manifest.md)\>

#### Returns

`Promise`\<`void`\>

***

### updateOrder()

> **updateOrder**(`orgId`, `orderId`, `updates`): `Promise`\<`void`\>

Defined in: [database.ts:59](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L59)

#### Parameters

##### orgId

`string`

##### orderId

`string`

##### updates

`Partial`\<[`Order`](../../types/interfaces/Order.md)\>

#### Returns

`Promise`\<`void`\>

***

### updateOrderStatus()

> **updateOrderStatus**(`orgId`, `orderId`, `status`): `Promise`\<`void`\>

Defined in: [database.ts:58](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L58)

#### Parameters

##### orgId

`string`

##### orderId

`string`

##### status

`"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

#### Returns

`Promise`\<`void`\>

***

### updateOrganization()

> **updateOrganization**(`orgId`, `data`): `Promise`\<`void`\>

Defined in: [database.ts:7](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L7)

#### Parameters

##### orgId

`string`

##### data

`Partial`\<[`Organization`](../../types/interfaces/Organization.md)\>

#### Returns

`Promise`\<`void`\>

***

### updatePlace()

> **updatePlace**(`id`, `updates`): `Promise`\<[`Place`](../../types/interfaces/Place.md)\>

Defined in: [database.ts:20](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L20)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`Place`](../../types/interfaces/Place.md)\>

#### Returns

`Promise`\<[`Place`](../../types/interfaces/Place.md)\>

***

### updateRoute()

> **updateRoute**(`id`, `updates`): `Promise`\<[`Route`](../../types/interfaces/Route.md)\>

Defined in: [database.ts:26](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L26)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`Route`](../../types/interfaces/Route.md)\>

#### Returns

`Promise`\<[`Route`](../../types/interfaces/Route.md)\>

***

### updateUser()

> **updateUser**(`uid`, `data`): `Promise`\<`void`\>

Defined in: [database.ts:12](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L12)

#### Parameters

##### uid

`string`

##### data

`Partial`\<[`User`](../../types/interfaces/User.md)\>

#### Returns

`Promise`\<`void`\>

***

### updateVehicle()

> **updateVehicle**(`id`, `updates`): `Promise`\<`void`\>

Defined in: [database.ts:32](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L32)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`Vehicle`](../../types/interfaces/Vehicle.md)\>

#### Returns

`Promise`\<`void`\>

***

### updateVehicleDamageReport()

> **updateVehicleDamageReport**(`id`, `data`): `Promise`\<`void`\>

Defined in: [database.ts:37](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L37)

#### Parameters

##### id

`string`

##### data

`Partial`\<[`VehicleDamageReport`](../../types/interfaces/VehicleDamageReport.md)\>

#### Returns

`Promise`\<`void`\>

***

### updateWorkLog()

> **updateWorkLog**(`id`, `updates`): `Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)\>

Defined in: [database.ts:43](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/database.ts#L43)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`WorkLog`](../../types/interfaces/WorkLog.md)\>

#### Returns

`Promise`\<[`WorkLog`](../../types/interfaces/WorkLog.md)\>
