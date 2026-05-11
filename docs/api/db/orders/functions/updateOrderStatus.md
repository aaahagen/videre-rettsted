[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / updateOrderStatus

# Function: updateOrderStatus()

> **updateOrderStatus**(`orgId`, `orderId`, `status`): `Promise`\<`void`\>

Defined in: [db/orders.ts:203](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L203)

Oppdaterer kun statusen på en ordre.

## Parameters

### orgId

`string`

Organisasjonens ID.

### orderId

`string`

Ordrens ID.

### status

`"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Den nye statusverdien (f.eks. 'picked_up', 'delivered').

## Returns

`Promise`\<`void`\>
