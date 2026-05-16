[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Order

# Interface: Order

Defined in: [types.ts:496](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L496)

## Properties

### barcode

> **barcode**: `string`

Defined in: [types.ts:502](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L502)

***

### collies?

> `optional` **collies?**: [`Collie`](Collie.md)[]

Defined in: [types.ts:516](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L516)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:518](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L518)

***

### details

> **details**: `object`

Defined in: [types.ts:503](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L503)

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

Defined in: [types.ts:517](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L517)

***

### id

> **id**: `string`

Defined in: [types.ts:497](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L497)

***

### lineItems?

> `optional` **lineItems?**: [`LineItem`](LineItem.md)[]

Defined in: [types.ts:515](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L515)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:498](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L498)

***

### placeId

> **placeId**: `string`

Defined in: [types.ts:500](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L500)

***

### routeId?

> `optional` **routeId?**: `string`

Defined in: [types.ts:499](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L499)

***

### status

> **status**: `"pending"` \| `"loaded"` \| `"delivered"` \| `"failed"`

Defined in: [types.ts:501](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L501)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:519](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L519)
