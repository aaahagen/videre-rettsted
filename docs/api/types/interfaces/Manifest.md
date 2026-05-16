[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:530](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L530)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:549](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L549)

***

### id

> **id**: `string`

Defined in: [types.ts:531](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L531)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:546](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L546)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:536](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L536)

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

Defined in: [types.ts:533](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L533)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:532](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L532)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:535](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L535)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:550](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L550)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:534](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L534)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:547](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L547)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:548](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L548)
