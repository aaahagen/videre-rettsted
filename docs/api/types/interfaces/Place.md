[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Place

# Interface: Place

Defined in: [types.ts:111](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L111)

## Properties

### address

> **address**: `string`

Defined in: [types.ts:114](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L114)

***

### authorId?

> `optional` **authorId?**: `string`

Defined in: [types.ts:180](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L180)

***

### authorName?

> `optional` **authorName?**: `string`

Defined in: [types.ts:181](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L181)

***

### contactPersons?

> `optional` **contactPersons?**: `object`[]

Defined in: [types.ts:121](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L121)

#### email

> **email**: `string`

#### name

> **name**: `string`

#### phone

> **phone**: `string`

***

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:167](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L167)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:186](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L186)

***

### createdBy

> **createdBy**: `string`

Defined in: [types.ts:182](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L182)

***

### customerNumber?

> `optional` **customerNumber?**: `string`

Defined in: [types.ts:115](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L115)

***

### description

> **description**: `string`

Defined in: [types.ts:116](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L116)

***

### doorCode?

> `optional` **doorCode?**: `object`[]

Defined in: [types.ts:120](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L120)

#### category?

> `optional` **category?**: `string`

#### name?

> `optional` **name?**: `string`

#### value?

> `optional` **value?**: `string`

***

### estimatedDeliveryTime?

> `optional` **estimatedDeliveryTime?**: `number`

Defined in: [types.ts:159](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L159)

***

### field3?

> `optional` **field3?**: `string`

Defined in: [types.ts:118](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L118)

***

### field4?

> `optional` **field4?**: `string`

Defined in: [types.ts:119](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L119)

***

### hashtags?

> `optional` **hashtags?**: `string`[]

Defined in: [types.ts:122](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L122)

***

### hmsData?

> `optional` **hmsData?**: `object`

Defined in: [types.ts:129](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L129)

#### answers

> **answers**: `Record`\<`string`, `boolean`\>

#### comment?

> `optional` **comment?**: `string`

#### completedAt?

> `optional` **completedAt?**: `any`

#### completedBy?

> `optional` **completedBy?**: `string`

#### completedByName?

> `optional` **completedByName?**: `string`

***

### id

> **id**: `string`

Defined in: [types.ts:112](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L112)

***

### imageHint?

> `optional` **imageHint?**: `string`

Defined in: [types.ts:163](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L163)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:164](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L164)

#### description?

> `optional` **description?**: `string`

#### isMain?

> `optional` **isMain?**: `boolean`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

***

### imageUrl?

> `optional` **imageUrl?**: `string`

Defined in: [types.ts:162](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L162)

***

### isCityCenter?

> `optional` **isCityCenter?**: `boolean`

Defined in: [types.ts:139](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L139)

***

### isZeroEmissionZone?

> `optional` **isZeroEmissionZone?**: `boolean`

Defined in: [types.ts:138](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L138)

***

### location?

> `optional` **location?**: `object`

Defined in: [types.ts:171](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L171)

#### latitude

> **latitude**: `number`

#### longitude

> **longitude**: `number`

***

### maxVehicleHeight?

> `optional` **maxVehicleHeight?**: `number`

Defined in: [types.ts:142](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L142)

***

### maxVehicleLength?

> `optional` **maxVehicleLength?**: `number`

Defined in: [types.ts:144](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L144)

***

### maxVehicleWeight?

> `optional` **maxVehicleWeight?**: `number`

Defined in: [types.ts:145](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L145)

***

### maxVehicleWidth?

> `optional` **maxVehicleWidth?**: `number`

Defined in: [types.ts:143](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L143)

***

### name

> **name**: `string`

Defined in: [types.ts:113](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L113)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:117](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L117)

***

### organizationId?

> `optional` **organizationId?**: `string`

Defined in: [types.ts:178](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L178)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:177](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L177)

***

### salesMessage?

> `optional` **salesMessage?**: `string`

Defined in: [types.ts:125](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L125)

***

### salesMessageValidUntil?

> `optional` **salesMessageValidUntil?**: `any`

Defined in: [types.ts:126](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L126)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:187](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L187)

***

### updatedBy?

> `optional` **updatedBy?**: `string`

Defined in: [types.ts:183](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L183)

***

### updatedByName?

> `optional` **updatedByName?**: `string`

Defined in: [types.ts:184](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L184)

***

### weeklySchedule?

> `optional` **weeklySchedule?**: `object`

Defined in: [types.ts:148](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L148)

#### friday

> **friday**: [`OpeningHours`](OpeningHours.md)

#### monday

> **monday**: [`OpeningHours`](OpeningHours.md)

#### saturday

> **saturday**: [`OpeningHours`](OpeningHours.md)

#### sunday

> **sunday**: [`OpeningHours`](OpeningHours.md)

#### thursday

> **thursday**: [`OpeningHours`](OpeningHours.md)

#### tuesday

> **tuesday**: [`OpeningHours`](OpeningHours.md)

#### wednesday

> **wednesday**: [`OpeningHours`](OpeningHours.md)
