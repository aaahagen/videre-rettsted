[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:525](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L525)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:544](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L544)

***

### id

> **id**: `string`

Defined in: [types.ts:526](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L526)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:541](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L541)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:531](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L531)

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

Defined in: [types.ts:528](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L528)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:527](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L527)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:530](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L530)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:545](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L545)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:529](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L529)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:542](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L542)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:543](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L543)
