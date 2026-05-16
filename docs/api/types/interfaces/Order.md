[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:509](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L509)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:515](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L515)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:529](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L529)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:531](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L531)

***

### details

> **details**: `object`

Defined in: [types.ts:516](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L516)

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

Defined in: [types.ts:530](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L530)

***

### id

> **id**: `string`

Defined in: [types.ts:510](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L510)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:528](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L528)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:511](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L511)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:513](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L513)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:512](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L512)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:514](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L514)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:532](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L532)
