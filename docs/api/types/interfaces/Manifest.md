[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Manifest

# Interface: Manifest

Defined in: [types.ts:538](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L538)

## Properties

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:557](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L557)

***

### id

> **id**: `string`

Defined in: [types.ts:539](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L539)

***

### notes?

> `optional` **notes?**: [`ManifestNote`](ManifestNote.md)[]

Defined in: [types.ts:554](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L554)

***

### orders

> **orders**: `object`[]

Defined in: [types.ts:544](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L544)

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

Defined in: [types.ts:541](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L541)

***

### routeId

> **routeId**: `string`

Defined in: [types.ts:540](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L540)

***

### status

> **status**: `"loading"` \| `"pending"` \| `"verified"` \| `"departed"`

Defined in: [types.ts:543](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L543)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:558](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L558)

***

### vehicleId

> **vehicleId**: `string`

Defined in: [types.ts:542](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L542)

***

### verifiedAt?

> `optional` **verifiedAt?**: `string` \| `Date` \| `FieldValue`

Defined in: [types.ts:555](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L555)

***

### verifiedBy?

> `optional` **verifiedBy?**: `string`

Defined in: [types.ts:556](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L556)
