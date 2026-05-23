[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:338](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L338)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:348](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L348)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:349](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L349)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:362](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L362)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:341](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L341)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:352](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L352)

***

### id

> **id**: `string`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:361](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L361)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:358](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L358)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:353](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L353)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:354](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L354)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:357](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L357)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:363](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L363)
