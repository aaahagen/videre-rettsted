[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:256](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L256)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:276](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L276)

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

Defined in: [types.ts:270](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L270)

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

Defined in: [types.ts:262](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L262)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:293](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L293)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:265](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L265)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:297](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L297)

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

Defined in: [types.ts:288](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L288)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:263](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L263)

***

### id

> **id**: `string`

Defined in: [types.ts:257](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L257)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:296](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L296)

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

Defined in: [types.ts:264](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L264)

***

### name

> **name**: `string`

Defined in: [types.ts:259](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L259)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:289](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L289)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:258](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L258)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:260](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L260)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:292](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L292)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:290](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L290)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:261](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L261)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:295](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L295)
