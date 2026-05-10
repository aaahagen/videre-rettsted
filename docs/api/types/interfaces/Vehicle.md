[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:258](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L258)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:278](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L278)

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

Defined in: [types.ts:272](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L272)

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

Defined in: [types.ts:264](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L264)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:296](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L296)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:295](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L295)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:267](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L267)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:299](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L299)

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

Defined in: [types.ts:290](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L290)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:265](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L265)

***

### id

> **id**: `string`

Defined in: [types.ts:259](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L259)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:298](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L298)

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

Defined in: [types.ts:266](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L266)

***

### name

> **name**: `string`

Defined in: [types.ts:261](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L261)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:291](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L291)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:260](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L260)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:262](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L262)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:292](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L292)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:263](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L263)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:297](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L297)
