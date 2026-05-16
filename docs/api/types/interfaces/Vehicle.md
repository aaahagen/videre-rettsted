[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:267](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L267)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:287](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L287)

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

Defined in: [types.ts:281](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L281)

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

Defined in: [types.ts:273](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L273)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:305](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L305)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:304](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L304)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:276](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L276)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:308](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L308)

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

Defined in: [types.ts:299](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L299)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:274](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L274)

***

### id

> **id**: `string`

Defined in: [types.ts:268](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L268)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:307](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L307)

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

Defined in: [types.ts:275](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L275)

***

### name

> **name**: `string`

Defined in: [types.ts:270](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L270)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:300](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L300)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:269](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L269)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:271](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L271)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:303](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L303)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:301](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L301)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:272](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L272)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:306](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L306)
