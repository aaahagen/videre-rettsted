[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:328](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L328)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:338](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L338)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:352](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L352)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:331](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L331)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:342](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L342)

***

### id

> **id**: `string`

Defined in: [types.ts:329](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L329)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:351](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L351)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:330](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L330)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:348](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L348)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:343](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L343)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:347](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L347)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)
