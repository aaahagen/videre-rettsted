[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:543](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L543)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:562](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L562)

***

### id

> **id**: `string`

Defined in: [types.ts:544](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L544)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:559](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L559)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:549](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L549)

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

Defined in: [types.ts:546](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L546)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:545](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L545)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:548](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L548)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:563](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L563)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:547](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L547)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:560](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L560)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:561](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L561)
