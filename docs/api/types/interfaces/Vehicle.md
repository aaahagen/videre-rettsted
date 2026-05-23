[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:280](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L280)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:300](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L300)

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

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

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

Defined in: [types.ts:286](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L286)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:323](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L323)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:322](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L322)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:289](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L289)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:326](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L326)

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

Defined in: [types.ts:312](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L312)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:287](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L287)

***

### id

> **id**: `string`

Defined in: [types.ts:281](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L281)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:325](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L325)

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

Defined in: [types.ts:319](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L319)

***

### lastOdometerReading?

> `optional` **lastOdometerReading?**: `number`

Defined in: [types.ts:318](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L318)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:315](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L315)

***

### maxRange?

> `optional` **maxRange?**: `number`

Defined in: [types.ts:288](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L288)

***

### name

> **name**: `string`

Defined in: [types.ts:283](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L283)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:313](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L313)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:282](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L282)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:284](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L284)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:321](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L321)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:314](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L314)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:285](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L285)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:324](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L324)
