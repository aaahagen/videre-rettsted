[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:292](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L292)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:300](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L300)

#### contactPerson

> **contactPerson**: `string`

#### email

> **email**: `string`

#### name

> **name**: `string`

#### phone

> **phone**: `string`

***

### avatarUrl?

> `optional` **avatarUrl?**: `string`

Defined in: [types.ts:189](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L189)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:363](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L363)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:358](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L358)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:295](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L295)

#### address

> **address**: `string`

#### coordinates

> **coordinates**: `object`

##### coordinates.lat

> **lat**: `number`

##### coordinates.lng

> **lng**: `number`

#### radius

> **radius**: `number`

***

### certifications?

> `optional` **certifications?**: `string`[]

Defined in: [types.ts:329](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L329)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:338](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L338)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:341](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L341)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:351](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L351)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:198](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L198)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:331](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L331)

#### name

> **name**: `string`

#### type

> **type**: `string`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

***

### email

> **email**: `string`

Defined in: [types.ts:192](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L192)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:336](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L336)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:349](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L349)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:293](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L293)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:195](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L195)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:346](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L346)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

***

### id

> **id**: `string`

Defined in: [types.ts:190](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L190)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:199](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L199)

#### description?

> `optional` **description?**: `string`

#### isMain?

> `optional` **isMain?**: `boolean`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

#### Inherited from

[`User`](User.md).[`images`](User.md#images)

***

### jobTitle?

> `optional` **jobTitle?**: `string`

Defined in: [types.ts:350](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L350)

***

### name

> **name**: `string`

Defined in: [types.ts:191](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L191)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:337](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L337)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:193](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L193)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:354](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L354)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:194](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L194)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:310](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L310)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:324](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L324)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:330](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L330)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:362](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L362)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:197](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L197)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:352](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L352)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:359](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L359)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:196](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L196)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:306](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L306)

#### end

> **end**: `string`

#### start

> **start**: `string`
