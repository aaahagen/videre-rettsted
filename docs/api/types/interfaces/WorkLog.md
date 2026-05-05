[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:274](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L274)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:284](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L284)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:285](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L285)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:298](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L298)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:277](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L277)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:288](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L288)

***

### id

> **id**: `string`

Defined in: [types.ts:275](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L275)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:297](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L297)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:276](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L276)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:294](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L294)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:281](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L281)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:280](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L280)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:289](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L289)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:290](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L290)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:293](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L293)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:299](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L299)
