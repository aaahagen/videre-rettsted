[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:311](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L311)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:321](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L321)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:322](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L322)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:335](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L335)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:314](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L314)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:325](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L325)

***

### id

> **id**: `string`

Defined in: [types.ts:312](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L312)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:334](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L334)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:313](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L313)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:331](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L331)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:318](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L318)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:317](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L317)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:326](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L326)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:327](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L327)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:330](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L330)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:336](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L336)
