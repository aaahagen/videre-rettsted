[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:362](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L362)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:409](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L409)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:370](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L370)

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

Defined in: [types.ts:251](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L251)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:433](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L433)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:428](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L428)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:365](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L365)

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

Defined in: [types.ts:399](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L399)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:408](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L408)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:411](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L411)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:414](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L414)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:421](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L421)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:260](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L260)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:401](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L401)

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

Defined in: [types.ts:254](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L254)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:406](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L406)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:419](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L419)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:423](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L423)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:363](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L363)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:257](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L257)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:416](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L416)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:427](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L427)

***

### id

> **id**: `string`

Defined in: [types.ts:252](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L252)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:261](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L261)

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

Defined in: [types.ts:420](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L420)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:264](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L264)

#### Inherited from

[`User`](User.md).[`lastTachoDownloadDate`](User.md#lasttachodownloaddate)

***

### name

> **name**: `string`

Defined in: [types.ts:253](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L253)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:407](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L407)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:255](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L255)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:405](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L405)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:424](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L424)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"owner"` \| `"hms_responsible"` \| `"salesman"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:256](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L256)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:380](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L380)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:394](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L394)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:410](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L410)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:400](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L400)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:415](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L415)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:432](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L432)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:259](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L259)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:422](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L422)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:429](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L429)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:364](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L364)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:258](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L258)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:376](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L376)

#### end

> **end**: `string`

#### start

> **start**: `string`
