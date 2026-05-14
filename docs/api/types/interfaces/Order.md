[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:491](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L491)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:497](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L497)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:511](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L511)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:513](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L513)

***

### details

> **details**: `object`

Defined in: [types.ts:498](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L498)

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

Defined in: [types.ts:512](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L512)

***

### id

> **id**: `string`

Defined in: [types.ts:492](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L492)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:510](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L510)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:493](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L493)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:495](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L495)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:494](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L494)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:496](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L496)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:514](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L514)
