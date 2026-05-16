[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:320](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L320)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:330](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L330)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:331](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L331)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:344](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L344)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:323](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L323)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### id

> **id**: `string`

Defined in: [types.ts:321](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L321)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:343](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L343)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:322](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L322)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:340](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L340)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:327](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L327)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:326](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L326)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:336](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L336)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:339](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L339)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:345](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L345)
