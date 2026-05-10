[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:381](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L381)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:386](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L386)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:347](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L347)

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

Defined in: [types.ts:236](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L236)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:410](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L410)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:405](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L405)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:342](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L342)

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

Defined in: [types.ts:376](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L376)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:385](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L385)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:388](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L388)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:391](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L391)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:398](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L398)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:245](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L245)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:378](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L378)

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

Defined in: [types.ts:239](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L239)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:383](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L383)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:396](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L396)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:400](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L400)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:242](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L242)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:393](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L393)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### id

> **id**: `string`

Defined in: [types.ts:237](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L237)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:246](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L246)

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

Defined in: [types.ts:397](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L397)

***

### name

> **name**: `string`

Defined in: [types.ts:238](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L238)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:384](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L384)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:240](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L240)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:382](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L382)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:401](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L401)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"owner"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:241](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L241)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:371](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L371)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:387](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L387)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:377](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L377)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:392](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L392)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:409](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L409)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:244](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L244)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:399](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L399)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:406](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L406)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:341](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L341)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:243](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L243)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)

#### end

> **end**: `string`

#### start

> **start**: `string`
