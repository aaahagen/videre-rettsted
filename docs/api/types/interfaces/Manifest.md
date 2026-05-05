[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:474](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L474)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:493](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L493)

***

### id

> **id**: `string`

Defined in: [types.ts:475](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L475)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:490](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L490)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:480](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L480)

#### barcode

> **barcode**: `string`

#### loadedAt?

> `optional` **loadedAt?**: `string` \| `Date` \| `FieldValue`

#### loadedBy?

> `optional` **loadedBy?**: `string`

#### loadedItems

> **loadedItems**: `number`

#### orderId

> **orderId**: `string`

#### scannedCollieIds?

> `optional` **scannedCollieIds?**: `string`[]

#### status

> **status**: `"pending"` \| `"loaded"`

#### totalItems

> **totalItems**: `number`

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:477](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L477)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:476](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L476)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:479](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L479)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:494](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L494)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:478](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L478)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:491](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L491)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:492](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L492)
