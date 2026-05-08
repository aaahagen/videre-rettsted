[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:519](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L519)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:538](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L538)

***

### id

> **id**: `string`

Defined in: [types.ts:520](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L520)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:535](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L535)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:525](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L525)

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

Defined in: [types.ts:522](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L522)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:521](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L521)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:524](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L524)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:539](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L539)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:523](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L523)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:536](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L536)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:537](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L537)
