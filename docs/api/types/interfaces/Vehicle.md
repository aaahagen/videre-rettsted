[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:270](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L270)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:290](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L290)

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

Defined in: [types.ts:284](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L284)

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

Defined in: [types.ts:276](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L276)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:313](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L313)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:312](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L312)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:279](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L279)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:316](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L316)

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

Defined in: [types.ts:302](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L302)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:277](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L277)

***

### id

> **id**: `string`

Defined in: [types.ts:271](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L271)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:315](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L315)

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

Defined in: [types.ts:309](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L309)

***

### lastOdometerReading?

> `optional` **lastOdometerReading?**: `number`

Defined in: [types.ts:308](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L308)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:305](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L305)

***

### maxRange?

> `optional` **maxRange?**: `number`

Defined in: [types.ts:278](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L278)

***

### name

> **name**: `string`

Defined in: [types.ts:273](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L273)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:303](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L303)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:272](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L272)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:274](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L274)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:311](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L311)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:304](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L304)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:275](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L275)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:314](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L314)
