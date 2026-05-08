[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Place

# Interface: Place

Defined in: [types.ts:96](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L96)

## Properties

### address

> **address**: `string`

Defined in: [types.ts:99](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L99)

***

### authorId?

> `optional` **authorId?**: `string`

Defined in: [types.ts:161](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L161)

***

### authorName?

> `optional` **authorName?**: `string`

Defined in: [types.ts:162](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L162)

***

### contactPersons?

> `optional` **contactPersons?**: `object`[]

Defined in: [types.ts:106](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L106)

#### email

> **email**: `string`

#### name

> **name**: `string`

#### phone

> **phone**: `string`

***

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:148](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L148)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:167](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L167)

***

### createdBy

> **createdBy**: `string`

Defined in: [types.ts:163](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L163)

***

### customerNumber?

> `optional` **customerNumber?**: `string`

Defined in: [types.ts:100](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L100)

***

### description

> **description**: `string`

Defined in: [types.ts:101](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L101)

***

### doorCode?

> `optional` **doorCode?**: `object`[]

Defined in: [types.ts:105](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L105)

#### category?

> `optional` **category?**: `string`

#### name?

> `optional` **name?**: `string`

#### value?

> `optional` **value?**: `string`

***

### estimatedDeliveryTime?

> `optional` **estimatedDeliveryTime?**: `number`

Defined in: [types.ts:140](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L140)

***

### field3?

> `optional` **field3?**: `string`

Defined in: [types.ts:103](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L103)

***

### field4?

> `optional` **field4?**: `string`

Defined in: [types.ts:104](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L104)

***

### hashtags?

> `optional` **hashtags?**: `string`[]

Defined in: [types.ts:107](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L107)

***

### hmsData?

> `optional` **hmsData?**: `object`

Defined in: [types.ts:110](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L110)

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

Defined in: [types.ts:97](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L97)

***

### imageHint?

> `optional` **imageHint?**: `string`

Defined in: [types.ts:144](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L144)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:145](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L145)

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

Defined in: [types.ts:143](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L143)

***

### isCityCenter?

> `optional` **isCityCenter?**: `boolean`

Defined in: [types.ts:120](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L120)

***

### isZeroEmissionZone?

> `optional` **isZeroEmissionZone?**: `boolean`

Defined in: [types.ts:119](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L119)

***

### location?

> `optional` **location?**: `object`

Defined in: [types.ts:152](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L152)

#### latitude

> **latitude**: `number`

#### longitude

> **longitude**: `number`

***

### maxVehicleHeight?

> `optional` **maxVehicleHeight?**: `number`

Defined in: [types.ts:123](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L123)

***

### maxVehicleLength?

> `optional` **maxVehicleLength?**: `number`

Defined in: [types.ts:125](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L125)

***

### maxVehicleWeight?

> `optional` **maxVehicleWeight?**: `number`

Defined in: [types.ts:126](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L126)

***

### maxVehicleWidth?

> `optional` **maxVehicleWidth?**: `number`

Defined in: [types.ts:124](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L124)

***

### name

> **name**: `string`

Defined in: [types.ts:98](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L98)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:102](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L102)

***

### organizationId?

> `optional` **organizationId?**: `string`

Defined in: [types.ts:159](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L159)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:158](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L158)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:168](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L168)

***

### updatedBy?

> `optional` **updatedBy?**: `string`

Defined in: [types.ts:164](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L164)

***

### updatedByName?

> `optional` **updatedByName?**: `string`

Defined in: [types.ts:165](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L165)

***

### weeklySchedule?

> `optional` **weeklySchedule?**: `object`

Defined in: [types.ts:129](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L129)

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
