[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:514](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L514)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:520](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L520)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:534](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L534)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:536](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L536)

***

### details

> **details**: `object`

Defined in: [types.ts:521](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L521)

#### description

> **description**: `string`

#### form?

> `optional` **form?**: `"other"` \| `"pallet"` \| `"package"` \| `"liquid"`

#### numberOfItems?

> `optional` **numberOfItems?**: `number`

#### specialRequirements?

> `optional` **specialRequirements?**: `object`

##### specialRequirements.adr?

> `optional` **adr?**: `boolean`

##### specialRequirements.fragile?

> `optional` **fragile?**: `boolean`

##### specialRequirements.temperatureControlled?

> `optional` **temperatureControlled?**: `boolean`

#### volume?

> `optional` **volume?**: `number`

#### weight?

> `optional` **weight?**: `number`

***

### handlingUnits?

> `optional` **handlingUnits?**: [`HandlingUnit`](HandlingUnit.md)[]

Defined in: [types.ts:535](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L535)

***

### id

> **id**: `string`

Defined in: [types.ts:515](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L515)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:533](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L533)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:516](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L516)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:518](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L518)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:517](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L517)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:519](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L519)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:537](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L537)
