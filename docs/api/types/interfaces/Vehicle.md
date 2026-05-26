[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:285](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L285)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:305](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L305)

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

Defined in: [types.ts:299](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L299)

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

Defined in: [types.ts:291](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L291)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:328](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L328)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:327](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L327)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:331](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L331)

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

Defined in: [types.ts:317](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L317)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:292](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L292)

***

### id

> **id**: `string`

Defined in: [types.ts:286](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L286)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:330](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L330)

#### description?

> `optional` **description?**: `string`

#### isMain?

> `optional` **isMain?**: `boolean`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

***

### lastOdometerDate?

> `optional` **lastOdometerDate?**: `any`

Defined in: [types.ts:324](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L324)

***

### lastOdometerReading?

> `optional` **lastOdometerReading?**: `number`

Defined in: [types.ts:323](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L323)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:320](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L320)

***

### maxRange?

> `optional` **maxRange?**: `number`

Defined in: [types.ts:293](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L293)

***

### name

> **name**: `string`

Defined in: [types.ts:288](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L288)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:318](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L318)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:287](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L287)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:289](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L289)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:326](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L326)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:319](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L319)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:290](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L290)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:329](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L329)
