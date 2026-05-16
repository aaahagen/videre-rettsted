[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:504](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L504)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:510](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L510)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:524](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L524)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:526](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L526)

***

### details

> **details**: `object`

Defined in: [types.ts:511](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L511)

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

Defined in: [types.ts:525](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L525)

***

### id

> **id**: `string`

Defined in: [types.ts:505](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L505)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:523](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L523)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:506](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L506)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:508](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L508)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:507](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L507)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:509](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L509)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:527](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L527)
