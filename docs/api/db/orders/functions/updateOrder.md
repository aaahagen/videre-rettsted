[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / updateOrder

# Function: updateOrder()

> **updateOrder**(`orgId`, `orderId`, `updates`): `Promise`\<`void`\>

Defined in: [db/orders.ts:215](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L215)

Utfører en delvis oppdatering av et ordreobjekt.

## Parameters

### orgId

`string`

Organisasjonens ID.

### orderId

`string`

Ordrens ID.

### updates

`Partial`\<[`Order`](../../../types/interfaces/Order.md)\>

Objektet som inneholder feltene som skal endres.

## Returns

`Promise`\<`void`\>
