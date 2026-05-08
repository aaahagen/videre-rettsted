[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:337](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L337)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:379](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L379)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:384](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L384)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

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

Defined in: [types.ts:234](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L234)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:408](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L408)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:403](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L403)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

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

Defined in: [types.ts:374](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L374)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:383](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L383)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:386](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L386)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:389](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L389)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:396](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L396)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:243](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L243)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:376](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L376)

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

Defined in: [types.ts:237](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L237)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:381](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L381)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:394](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L394)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:398](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L398)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:338](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L338)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:240](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L240)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:391](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L391)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:402](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L402)

***

### id

> **id**: `string`

Defined in: [types.ts:235](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L235)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:244](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L244)

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

Defined in: [types.ts:395](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L395)

***

### name

> **name**: `string`

Defined in: [types.ts:236](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L236)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:382](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L382)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:238](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L238)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:380](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L380)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:399](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L399)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:239](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L239)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:355](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L355)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:369](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L369)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:385](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L385)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:375](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L375)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:390](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L390)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:407](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L407)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:242](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L242)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:397](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L397)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:241](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L241)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:351](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L351)

#### end

> **end**: `string`

#### start

> **start**: `string`
