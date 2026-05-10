[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:487](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L487)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:493](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L493)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:507](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L507)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:509](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L509)

***

### details

> **details**: `object`

Defined in: [types.ts:494](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L494)

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

Defined in: [types.ts:508](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L508)

***

### id

> **id**: `string`

Defined in: [types.ts:488](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L488)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:506](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L506)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:489](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L489)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:491](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L491)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:490](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L490)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:492](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L492)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:510](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L510)
