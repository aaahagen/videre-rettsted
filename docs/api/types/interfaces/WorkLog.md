[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:343](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L343)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:354](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L354)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:367](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L367)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:346](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L346)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

***

### id

> **id**: `string`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:366](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L366)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:363](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L363)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:350](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L350)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:349](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L349)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:358](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L358)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:359](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L359)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:362](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L362)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:368](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L368)
