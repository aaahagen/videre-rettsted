[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:333](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L333)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:343](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L343)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:336](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L336)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:347](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L347)

***

### id

> **id**: `string`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:356](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L356)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:348](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L348)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:349](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L349)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:352](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L352)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:358](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L358)
