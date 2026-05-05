[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:302](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L302)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:349](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L349)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:310](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L310)

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

Defined in: [types.ts:199](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L199)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:373](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L373)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:368](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L368)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:305](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L305)

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

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:348](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L348)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:351](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L351)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:354](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L354)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:361](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L361)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:208](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L208)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:341](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L341)

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

Defined in: [types.ts:202](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L202)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:346](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L346)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:359](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L359)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:363](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L363)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:303](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L303)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:205](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L205)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:356](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L356)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:367](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L367)

***

### id

> **id**: `string`

Defined in: [types.ts:200](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L200)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:209](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L209)

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

Defined in: [types.ts:360](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L360)

***

### name

> **name**: `string`

Defined in: [types.ts:201](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L201)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:347](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L347)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:203](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L203)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:364](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L364)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:204](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L204)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:320](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L320)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:350](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L350)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:355](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L355)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:372](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L372)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:207](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L207)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:362](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L362)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:369](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L369)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:304](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L304)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:206](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L206)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:316](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L316)

#### end

> **end**: `string`

#### start

> **start**: `string`
