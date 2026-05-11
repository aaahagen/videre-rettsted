[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / getOrders

# Function: getOrders()

> **getOrders**(`orgId`): `Promise`\<[`Order`](../../../types/interfaces/Order.md)[]\>

Defined in: [db/orders.ts:175](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L175)

Henter alle ordrer for en gitt organisasjon, sortert etter opprettelsesdato (nyeste først).

## Parameters

### orgId

`string`

Den unike ID-en til organisasjonen.

## Returns

`Promise`\<[`Order`](../../../types/interfaces/Order.md)[]\>

En Promise med en liste over alle ordrer.
