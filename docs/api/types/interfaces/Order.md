[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:440](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L440)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:446](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L446)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:460](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L460)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:462](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L462)

***

### details

> **details**: `object`

Defined in: [types.ts:447](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L447)

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

Defined in: [types.ts:461](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L461)

***

### id

> **id**: `string`

Defined in: [types.ts:441](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L441)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:459](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L459)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:442](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L442)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:444](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L444)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:443](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L443)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:445](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L445)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:463](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L463)
