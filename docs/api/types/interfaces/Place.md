[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Place

# Interface: Place

Defined in: [types.ts:103](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L103)

## Properties

### address

> **address**: `string`

Defined in: [types.ts:106](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L106)

***

### authorId?

> `optional` **authorId?**: `string`

Defined in: [types.ts:172](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L172)

***

### authorName?

> `optional` **authorName?**: `string`

Defined in: [types.ts:173](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L173)

***

### contactPersons?

> `optional` **contactPersons?**: `object`[]

Defined in: [types.ts:113](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L113)

#### email

> **email**: `string`

#### name

> **name**: `string`

#### phone

> **phone**: `string`

***

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:159](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L159)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:178](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L178)

***

### createdBy

> **createdBy**: `string`

Defined in: [types.ts:174](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L174)

***

### customerNumber?

> `optional` **customerNumber?**: `string`

Defined in: [types.ts:107](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L107)

***

### description

> **description**: `string`

Defined in: [types.ts:108](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L108)

***

### doorCode?

> `optional` **doorCode?**: `object`[]

Defined in: [types.ts:112](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L112)

#### category?

> `optional` **category?**: `string`

#### name?

> `optional` **name?**: `string`

#### value?

> `optional` **value?**: `string`

***

### estimatedDeliveryTime?

> `optional` **estimatedDeliveryTime?**: `number`

Defined in: [types.ts:151](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L151)

***

### field3?

> `optional` **field3?**: `string`

Defined in: [types.ts:110](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L110)

***

### field4?

> `optional` **field4?**: `string`

Defined in: [types.ts:111](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L111)

***

### hashtags?

> `optional` **hashtags?**: `string`[]

Defined in: [types.ts:114](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L114)

***

### hmsData?

> `optional` **hmsData?**: `object`

Defined in: [types.ts:121](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L121)

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

Defined in: [types.ts:104](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L104)

***

### imageHint?

> `optional` **imageHint?**: `string`

Defined in: [types.ts:155](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L155)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:156](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L156)

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

Defined in: [types.ts:154](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L154)

***

### isCityCenter?

> `optional` **isCityCenter?**: `boolean`

Defined in: [types.ts:131](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L131)

***

### isZeroEmissionZone?

> `optional` **isZeroEmissionZone?**: `boolean`

Defined in: [types.ts:130](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L130)

***

### location?

> `optional` **location?**: `object`

Defined in: [types.ts:163](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L163)

#### latitude

> **latitude**: `number`

#### longitude

> **longitude**: `number`

***

### maxVehicleHeight?

> `optional` **maxVehicleHeight?**: `number`

Defined in: [types.ts:134](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L134)

***

### maxVehicleLength?

> `optional` **maxVehicleLength?**: `number`

Defined in: [types.ts:136](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L136)

***

### maxVehicleWeight?

> `optional` **maxVehicleWeight?**: `number`

Defined in: [types.ts:137](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L137)

***

### maxVehicleWidth?

> `optional` **maxVehicleWidth?**: `number`

Defined in: [types.ts:135](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L135)

***

### name

> **name**: `string`

Defined in: [types.ts:105](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L105)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:109](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L109)

***

### organizationId?

> `optional` **organizationId?**: `string`

Defined in: [types.ts:170](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L170)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:169](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L169)

***

### salesMessage?

> `optional` **salesMessage?**: `string`

Defined in: [types.ts:117](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L117)

***

### salesMessageValidUntil?

> `optional` **salesMessageValidUntil?**: `any`

Defined in: [types.ts:118](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L118)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:179](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L179)

***

### updatedBy?

> `optional` **updatedBy?**: `string`

Defined in: [types.ts:175](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L175)

***

### updatedByName?

> `optional` **updatedByName?**: `string`

Defined in: [types.ts:176](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L176)

***

### weeklySchedule?

> `optional` **weeklySchedule?**: `object`

Defined in: [types.ts:140](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L140)

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
