[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / getOrder

# Function: getOrder()

> **getOrder**(`orgId`, `orderId`): `Promise`\<[`Order`](../../../types/interfaces/Order.md) \| `null`\>

Defined in: [db/orders.ts:162](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L162)

Henter en spesifikk ordre basert på organisasjons-ID og ordre-ID.

## Parameters

### orgId

`string`

Den unike ID-en til organisasjonen.

### orderId

`string`

Dokument-ID-en til ordren.

## Returns

`Promise`\<[`Order`](../../../types/interfaces/Order.md) \| `null`\>

En Promise med `Order`-objektet eller `null` hvis den ikke finnes.
