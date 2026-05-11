[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / getOrdersForRoute

# Function: getOrdersForRoute()

> **getOrdersForRoute**(`orgId`, `routeId`): `Promise`\<[`Order`](../../../types/interfaces/Order.md)[]\>

Defined in: [db/orders.ts:189](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L189)

Henter alle ordrer som er tildelt en spesifikk rute.

## Parameters

### orgId

`string`

Organisasjonens ID.

### routeId

`string`

Identifikatoren til ruten.

## Returns

`Promise`\<[`Order`](../../../types/interfaces/Order.md)[]\>

En Promise med listen over ordrer på ruten.
