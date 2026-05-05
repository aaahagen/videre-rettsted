[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:484](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L484)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:503](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L503)

***

### id

> **id**: `string`

Defined in: [types.ts:485](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L485)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:500](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L500)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:490](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L490)

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

Defined in: [types.ts:487](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L487)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:486](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L486)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:489](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L489)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:504](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L504)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:488](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L488)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:501](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L501)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:502](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L502)
