[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:450](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L450)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:456](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L456)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:470](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L470)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:472](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L472)

***

### details

> **details**: `object`

Defined in: [types.ts:457](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L457)

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

Defined in: [types.ts:471](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L471)

***

### id

> **id**: `string`

Defined in: [types.ts:451](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L451)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:469](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L469)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:452](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L452)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:454](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L454)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:453](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L453)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:455](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L455)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:473](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L473)
