[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:221](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L221)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:241](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L241)

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

Defined in: [types.ts:235](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L235)

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

Defined in: [types.ts:227](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L227)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:259](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L259)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:258](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L258)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:230](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L230)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:262](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L262)

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

Defined in: [types.ts:253](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L253)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:228](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L228)

***

### id

> **id**: `string`

Defined in: [types.ts:222](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L222)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:261](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L261)

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

Defined in: [types.ts:229](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L229)

***

### name

> **name**: `string`

Defined in: [types.ts:224](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L224)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:254](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L254)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:223](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L223)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:225](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L225)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:257](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L257)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:255](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L255)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:226](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L226)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:260](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L260)
