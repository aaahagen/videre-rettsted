[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:356](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L356)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:398](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L398)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:403](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L403)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:364](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L364)

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

Defined in: [types.ts:245](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L245)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:427](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L427)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:422](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L422)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:359](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L359)

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

Defined in: [types.ts:393](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L393)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:402](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L402)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:405](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L405)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:408](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L408)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:415](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L415)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:254](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L254)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:395](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L395)

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

Defined in: [types.ts:248](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L248)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:400](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L400)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:413](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L413)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:417](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L417)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:251](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L251)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:410](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L410)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:421](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L421)

***

### id

> **id**: `string`

Defined in: [types.ts:246](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L246)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:255](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L255)

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

Defined in: [types.ts:414](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L414)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:258](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L258)

#### Inherited from

[`User`](User.md).[`lastTachoDownloadDate`](User.md#lasttachodownloaddate)

***

### name

> **name**: `string`

Defined in: [types.ts:247](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L247)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:401](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L401)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:249](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L249)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:399](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L399)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:418](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L418)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"owner"` \| `"hms_responsible"` \| `"salesman"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:250](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L250)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:374](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L374)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:388](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L388)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:394](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L394)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:409](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L409)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:426](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L426)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:253](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L253)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:416](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L416)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:423](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L423)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:358](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L358)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:252](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L252)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:370](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L370)

#### end

> **end**: `string`

#### start

> **start**: `string`
