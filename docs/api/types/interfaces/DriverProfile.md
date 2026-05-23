[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / DriverProfile

# Interface: DriverProfile

Defined in: [types.ts:366](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L366)

## Extends

- [`User`](User.md)

## Properties

### address?

> `optional` **address?**: `string`

Defined in: [types.ts:408](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L408)

***

### adminNotes?

> `optional` **adminNotes?**: `string`

Defined in: [types.ts:413](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L413)

***

### agencyInfo?

> `optional` **agencyInfo?**: `object`

Defined in: [types.ts:374](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L374)

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

Defined in: [types.ts:255](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L255)

#### Inherited from

[`User`](User.md).[`avatarUrl`](User.md#avatarurl)

***

### backgroundCheckDate?

> `optional` **backgroundCheckDate?**: `string`

Defined in: [types.ts:437](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L437)

***

### bankAccountNumber?

> `optional` **bankAccountNumber?**: `string`

Defined in: [types.ts:432](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L432)

***

### baseLocation?

> `optional` **baseLocation?**: `object`

Defined in: [types.ts:369](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L369)

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

Defined in: [types.ts:403](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L403)

***

### children?

> `optional` **children?**: `string`

Defined in: [types.ts:412](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L412)

***

### contracts?

> `optional` **contracts?**: [`Contract`](Contract.md)[]

Defined in: [types.ts:415](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L415)

***

### dateOfBirth?

> `optional` **dateOfBirth?**: `string`

Defined in: [types.ts:418](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L418)

***

### department?

> `optional` **department?**: `string`

Defined in: [types.ts:425](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L425)

***

### disabled?

> `optional` **disabled?**: `boolean`

Defined in: [types.ts:264](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L264)

#### Inherited from

[`User`](User.md).[`disabled`](User.md#disabled)

***

### documents?

> `optional` **documents?**: `object`[]

Defined in: [types.ts:405](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L405)

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

Defined in: [types.ts:258](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L258)

#### Inherited from

[`User`](User.md).[`email`](User.md#email)

***

### emergencyContact?

> `optional` **emergencyContact?**: `string`

Defined in: [types.ts:410](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L410)

***

### employeeId?

> `optional` **employeeId?**: `string`

Defined in: [types.ts:423](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L423)

***

### employmentStatus?

> `optional` **employmentStatus?**: `string`

Defined in: [types.ts:427](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L427)

***

### employmentType?

> `optional` **employmentType?**: `"internal"` \| `"external"`

Defined in: [types.ts:367](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L367)

***

### favorites

> **favorites**: `string`[]

Defined in: [types.ts:261](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L261)

#### Inherited from

[`User`](User.md).[`favorites`](User.md#favorites)

***

### gender?

> `optional` **gender?**: `string`

Defined in: [types.ts:420](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L420)

***

### hourlyRate?

> `optional` **hourlyRate?**: `number`

Defined in: [types.ts:431](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L431)

***

### id

> **id**: `string`

Defined in: [types.ts:256](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L256)

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### images?

> `optional` **images?**: `object`[]

Defined in: [types.ts:265](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L265)

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

Defined in: [types.ts:424](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L424)

***

### lastTachoDownloadDate?

> `optional` **lastTachoDownloadDate?**: `string`

Defined in: [types.ts:268](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L268)

#### Inherited from

[`User`](User.md).[`lastTachoDownloadDate`](User.md#lasttachodownloaddate)

***

### name

> **name**: `string`

Defined in: [types.ts:257](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L257)

#### Inherited from

[`User`](User.md).[`name`](User.md#name)

***

### nextOfKin?

> `optional` **nextOfKin?**: `string`

Defined in: [types.ts:411](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L411)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:259](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L259)

#### Inherited from

[`User`](User.md).[`orgId`](User.md#orgid)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [types.ts:409](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L409)

***

### probationEndDate?

> `optional` **probationEndDate?**: `string`

Defined in: [types.ts:428](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L428)

***

### role

> **role**: `"loader"` \| `"admin"` \| `"driver"` \| `"super_admin"` \| `"owner"` \| `"hms_responsible"` \| `"salesman"` \| `"contractor"` \| `"planner"`

Defined in: [types.ts:260](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L260)

#### Inherited from

[`User`](User.md).[`role`](User.md#role)

***

### rotation?

> `optional` **rotation?**: `object`

Defined in: [types.ts:384](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L384)

#### startDate

> **startDate**: `string`

#### weeks

> **weeks**: `object`[]

***

### scheduleOverrides?

> `optional` **scheduleOverrides?**: `Record`\<`string`, \{ `end?`: `string`; `start?`: `string`; `type`: `"off"` \| `"other"` \| `"vacation"` \| `"sick"` \| `"custom"`; \}\>

Defined in: [types.ts:398](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L398)

***

### seniorityDate?

> `optional` **seniorityDate?**: `string`

Defined in: [types.ts:414](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L414)

***

### skills?

> `optional` **skills?**: `string`[]

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### socialSecurityNumber?

> `optional` **socialSecurityNumber?**: `string`

Defined in: [types.ts:419](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L419)

***

### staffHandbookAcknowledged?

> `optional` **staffHandbookAcknowledged?**: `boolean`

Defined in: [types.ts:436](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L436)

***

### status?

> `optional` **status?**: `"active"` \| `"paused"`

Defined in: [types.ts:263](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L263)

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### supervisor?

> `optional` **supervisor?**: `string`

Defined in: [types.ts:426](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L426)

***

### taxCode?

> `optional` **taxCode?**: `string`

Defined in: [types.ts:433](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L433)

***

### timeTrackingMethod?

> `optional` **timeTrackingMethod?**: `"fixed_location"` \| `"flexible_location"`

Defined in: [types.ts:368](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L368)

***

### visitedPlaces?

> `optional` **visitedPlaces?**: `string`[]

Defined in: [types.ts:262](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L262)

#### Inherited from

[`User`](User.md).[`visitedPlaces`](User.md#visitedplaces)

***

### workingHours?

> `optional` **workingHours?**: `object`

Defined in: [types.ts:380](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L380)

#### end

> **end**: `string`

#### start

> **start**: `string`
