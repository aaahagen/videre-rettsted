[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:358](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L358)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:337](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L337)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:348](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L348)

***

### id

> **id**: `string`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:336](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L336)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:354](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L354)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:341](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L341)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:349](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L349)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:350](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L350)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:359](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L359)
