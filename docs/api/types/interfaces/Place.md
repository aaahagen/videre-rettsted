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

Defined in: [types.ts:163](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L163)

***

### authorName?

> `optional` **authorName?**: `string`

Defined in: [types.ts:164](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L164)

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

Defined in: [types.ts:150](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L150)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:169](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L169)

***

### createdBy

> **createdBy**: `string`

Defined in: [types.ts:165](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L165)

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

Defined in: [types.ts:142](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L142)

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

Defined in: [types.ts:112](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L112)

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

Defined in: [types.ts:146](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L146)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:147](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L147)

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

Defined in: [types.ts:145](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L145)

***

### isCityCenter?

> `optional` **isCityCenter?**: `boolean`

Defined in: [types.ts:122](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L122)

***

### isZeroEmissionZone?

> `optional` **isZeroEmissionZone?**: `boolean`

Defined in: [types.ts:121](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L121)

***

### location?

> `optional` **location?**: `object`

Defined in: [types.ts:154](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L154)

#### latitude

> **latitude**: `number`

#### longitude

> **longitude**: `number`

***

### maxVehicleHeight?

> `optional` **maxVehicleHeight?**: `number`

Defined in: [types.ts:125](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L125)

***

### maxVehicleLength?

> `optional` **maxVehicleLength?**: `number`

Defined in: [types.ts:127](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L127)

***

### maxVehicleWeight?

> `optional` **maxVehicleWeight?**: `number`

Defined in: [types.ts:128](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L128)

***

### maxVehicleWidth?

> `optional` **maxVehicleWidth?**: `number`

Defined in: [types.ts:126](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L126)

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

Defined in: [types.ts:161](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L161)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:160](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L160)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:170](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L170)

***

### updatedBy?

> `optional` **updatedBy?**: `string`

Defined in: [types.ts:166](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L166)

***

### updatedByName?

> `optional` **updatedByName?**: `string`

Defined in: [types.ts:167](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L167)

***

### weeklySchedule?

> `optional` **weeklySchedule?**: `object`

Defined in: [types.ts:131](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L131)

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
