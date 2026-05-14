[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Place

# Interface: Place

Defined in: [types.ts:98](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L98)

## Properties

### address

> **address**: `string`

Defined in: [types.ts:101](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L101)

***

### authorId?

> `optional` **authorId?**: `string`

Defined in: [types.ts:167](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L167)

***

### authorName?

> `optional` **authorName?**: `string`

Defined in: [types.ts:168](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L168)

***

### contactPersons?

> `optional` **contactPersons?**: `object`[]

Defined in: [types.ts:108](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L108)

#### email

> **email**: `string`

#### name

> **name**: `string`

#### phone

> **phone**: `string`

***

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:154](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L154)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:173](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L173)

***

### createdBy

> **createdBy**: `string`

Defined in: [types.ts:169](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L169)

***

### customerNumber?

> `optional` **customerNumber?**: `string`

Defined in: [types.ts:102](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L102)

***

### description

> **description**: `string`

Defined in: [types.ts:103](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L103)

***

### doorCode?

> `optional` **doorCode?**: `object`[]

Defined in: [types.ts:107](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L107)

#### category?

> `optional` **category?**: `string`

#### name?

> `optional` **name?**: `string`

#### value?

> `optional` **value?**: `string`

***

### estimatedDeliveryTime?

> `optional` **estimatedDeliveryTime?**: `number`

Defined in: [types.ts:146](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L146)

***

### field3?

> `optional` **field3?**: `string`

Defined in: [types.ts:105](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L105)

***

### field4?

> `optional` **field4?**: `string`

Defined in: [types.ts:106](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L106)

***

### hashtags?

> `optional` **hashtags?**: `string`[]

Defined in: [types.ts:109](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L109)

***

### hmsData?

> `optional` **hmsData?**: `object`

Defined in: [types.ts:116](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L116)

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

Defined in: [types.ts:99](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L99)

***

### imageHint?

> `optional` **imageHint?**: `string`

Defined in: [types.ts:150](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L150)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:151](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L151)

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

Defined in: [types.ts:149](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L149)

***

### isCityCenter?

> `optional` **isCityCenter?**: `boolean`

Defined in: [types.ts:126](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L126)

***

### isZeroEmissionZone?

> `optional` **isZeroEmissionZone?**: `boolean`

Defined in: [types.ts:125](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L125)

***

### location?

> `optional` **location?**: `object`

Defined in: [types.ts:158](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L158)

#### latitude

> **latitude**: `number`

#### longitude

> **longitude**: `number`

***

### maxVehicleHeight?

> `optional` **maxVehicleHeight?**: `number`

Defined in: [types.ts:129](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L129)

***

### maxVehicleLength?

> `optional` **maxVehicleLength?**: `number`

Defined in: [types.ts:131](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L131)

***

### maxVehicleWeight?

> `optional` **maxVehicleWeight?**: `number`

Defined in: [types.ts:132](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L132)

***

### maxVehicleWidth?

> `optional` **maxVehicleWidth?**: `number`

Defined in: [types.ts:130](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L130)

***

### name

> **name**: `string`

Defined in: [types.ts:100](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L100)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:104](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L104)

***

### organizationId?

> `optional` **organizationId?**: `string`

Defined in: [types.ts:165](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L165)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:164](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L164)

***

### salesMessage?

> `optional` **salesMessage?**: `string`

Defined in: [types.ts:112](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L112)

***

### salesMessageValidUntil?

> `optional` **salesMessageValidUntil?**: `any`

Defined in: [types.ts:113](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L113)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:174](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L174)

***

### updatedBy?

> `optional` **updatedBy?**: `string`

Defined in: [types.ts:170](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L170)

***

### updatedByName?

> `optional` **updatedByName?**: `string`

Defined in: [types.ts:171](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L171)

***

### weeklySchedule?

> `optional` **weeklySchedule?**: `object`

Defined in: [types.ts:135](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L135)

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
