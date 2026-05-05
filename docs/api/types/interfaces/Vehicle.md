[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:211](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L211)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:231](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L231)

#### adr

> **adr**: `boolean`

#### customFields?

> `optional` **customFields?**: `object`[]

#### fifthWheel?

> `optional` **fifthWheel?**: `boolean`

#### flatbed?

> `optional` **flatbed?**: `boolean`

#### notes?

> `optional` **notes?**: `string`

#### refrigeration

> **refrigeration**: `boolean`

#### tailLift

> **tailLift**: `boolean`

#### trailerCoupling

> **trailerCoupling**: `boolean`

***

### capacity

> **capacity**: `object`

Defined in: [types.ts:225](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L225)

#### notes?

> `optional` **notes?**: `string`

#### pallets?

> `optional` **pallets?**: `number`

#### volume?

> `optional` **volume?**: `number`

#### weight?

> `optional` **weight?**: `number`

***

### config?

> `optional` **config?**: `"tractor"` \| `"rigid"` \| `"drawbar"` \| `"semi"` \| `"box_swap"` \| `"fixed_box"`

Defined in: [types.ts:217](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L217)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:249](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L249)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:248](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L248)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:220](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L220)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:252](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L252)

#### name

> **name**: `string`

#### type

> **type**: `"registration"` \| `"insurance"` \| `"other"` \| `"workshop_order"` \| `"workshop_receipt"`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

***

### euControl?

> `optional` **euControl?**: `string`

Defined in: [types.ts:243](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L243)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:218](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L218)

***

### id

> **id**: `string`

Defined in: [types.ts:212](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L212)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:251](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L251)

#### description?

> `optional` **description?**: `string`

#### isMain?

> `optional` **isMain?**: `boolean`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

***

### maxRange?

> `optional` **maxRange?**: `number`

Defined in: [types.ts:219](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L219)

***

### name

> **name**: `string`

Defined in: [types.ts:214](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L214)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:244](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L244)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:213](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L213)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:215](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L215)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:247](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L247)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:245](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L245)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:216](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L216)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:250](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L250)
