[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:276](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L276)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:296](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L296)

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

Defined in: [types.ts:290](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L290)

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

Defined in: [types.ts:282](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L282)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:319](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L319)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:318](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L318)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:285](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L285)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:322](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L322)

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

Defined in: [types.ts:308](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L308)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:283](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L283)

***

### id

> **id**: `string`

Defined in: [types.ts:277](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L277)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:321](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L321)

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

Defined in: [types.ts:315](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L315)

***

### lastOdometerReading?

> `optional` **lastOdometerReading?**: `number`

Defined in: [types.ts:314](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L314)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:311](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L311)

***

### maxRange?

> `optional` **maxRange?**: `number`

Defined in: [types.ts:284](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L284)

***

### name

> **name**: `string`

Defined in: [types.ts:279](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L279)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:309](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L309)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:278](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L278)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:280](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L280)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:317](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L317)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:310](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L310)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:281](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L281)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:320](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L320)
