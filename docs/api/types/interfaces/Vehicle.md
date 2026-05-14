[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Vehicle

# Interface: Vehicle

Defined in: [types.ts:262](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L262)

## Properties

### capabilities

> **capabilities**: `object`

Defined in: [types.ts:282](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L282)

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

Defined in: [types.ts:276](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L276)

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

Defined in: [types.ts:268](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L268)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:300](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L300)

***

### currentStatuses

> **currentStatuses**: (`"ready"` \| `"pending_workshop"` \| `"workshop"` \| `"observation"` \| `"on_tour"` \| `"parked"`)[]

Defined in: [types.ts:299](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L299)

***

### dimensions?

> `optional` **dimensions?**: `object`

Defined in: [types.ts:271](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L271)

#### height?

> `optional` **height?**: `number`

#### length?

> `optional` **length?**: `number`

#### width?

> `optional` **width?**: `number`

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:303](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L303)

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

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

***

### fuelType?

> `optional` **fuelType?**: `"diesel"` \| `"electric"` \| `"gas"` \| `"hybrid"`

Defined in: [types.ts:269](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L269)

***

### id

> **id**: `string`

Defined in: [types.ts:263](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L263)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:302](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L302)

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

Defined in: [types.ts:270](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L270)

***

### name

> **name**: `string`

Defined in: [types.ts:265](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L265)

***

### nextService?

> `optional` **nextService?**: `string`

Defined in: [types.ts:295](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L295)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:264](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L264)

***

### registrationNumber

> **registrationNumber**: `string`

Defined in: [types.ts:266](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L266)

***

### status

> **status**: `"active"` \| `"maintenance"` \| `"inactive"`

Defined in: [types.ts:298](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L298)

***

### tachographCalibration?

> `optional` **tachographCalibration?**: `string`

Defined in: [types.ts:296](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L296)

***

### type

> **type**: `"truck"` \| `"van"` \| `"car"` \| `"trailer"` \| `"tractor"`

Defined in: [types.ts:267](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L267)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:301](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L301)
