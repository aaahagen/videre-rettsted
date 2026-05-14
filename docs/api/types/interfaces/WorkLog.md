[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:315](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L315)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:325](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L325)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:326](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L326)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:318](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L318)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:329](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L329)

***

### id

> **id**: `string`

Defined in: [types.ts:316](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L316)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:338](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L338)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:317](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L317)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:322](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L322)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:321](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L321)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:330](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L330)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:331](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L331)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)
