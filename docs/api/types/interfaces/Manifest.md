[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:548](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L548)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:567](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L567)

***

### id

> **id**: `string`

Defined in: [types.ts:549](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L549)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:564](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L564)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:554](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L554)

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

Defined in: [types.ts:551](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L551)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:550](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L550)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:553](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L553)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:568](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L568)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:552](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L552)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:565](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L565)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:566](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L566)
