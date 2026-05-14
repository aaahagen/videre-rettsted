[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:343](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L343)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:385](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L385)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:390](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L390)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:351](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L351)

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

Defined in: [types.ts:240](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L240)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:414](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L414)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:409](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L409)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:346](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L346)

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

Defined in: [types.ts:380](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L380)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:389](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L389)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:392](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L392)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:395](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L395)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:402](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L402)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:249](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L249)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:382](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L382)

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

Defined in: [types.ts:243](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L243)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:387](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L387)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:400](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L400)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:246](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L246)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:397](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L397)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:408](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L408)

***

### id

> **id**: `string`

Defined in: [types.ts:241](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L241)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:250](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L250)

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

Defined in: [types.ts:401](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L401)

***

### name

> **name**: `string`

Defined in: [types.ts:242](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L242)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:388](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L388)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:244](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L244)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:386](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L386)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:405](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L405)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"owner"` \| `"hms_responsible"` \| `"salesman"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:245](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L245)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:361](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L361)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:375](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L375)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:391](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L391)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:381](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L381)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:396](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L396)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:413](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L413)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:248](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L248)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:403](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L403)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:410](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L410)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:247](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L247)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

#### end

> **end**: `string`

#### start

> **start**: `string`
