[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:309](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L309)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:319](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L319)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:320](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L320)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:333](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L333)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:312](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L312)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:323](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L323)

***

### id

> **id**: `string`

Defined in: [types.ts:310](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L310)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:332](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L332)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:311](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L311)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:329](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L329)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:316](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L316)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:315](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L315)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:324](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L324)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:325](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L325)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:328](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L328)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)
