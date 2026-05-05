[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / WorkLog

# Interface: WorkLog

Defined in: [types.ts:264](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L264)

## Properties

### actualPunchIn?

> `optional` **actualPunchIn?**: `string`

Defined in: [types.ts:274](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L274)

***

### actualPunchOut?

> `optional` **actualPunchOut?**: `string`

Defined in: [types.ts:275](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L275)

***

### createdAt

> **createdAt**: `Date` \| `FieldValue`

Defined in: [types.ts:288](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L288)

***

### driverId

> **driverId**: `string`

Defined in: [types.ts:267](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L267)

***

### entryMethod

> **entryMethod**: `"geofence"` \| `"gps_stamp"` \| `"manual_entry"`

Defined in: [types.ts:278](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L278)

***

### id

> **id**: `string`

Defined in: [types.ts:265](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L265)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:287](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L287)

***

### orgId

> **orgId**: `string`

Defined in: [types.ts:266](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L266)

***

### overtimeMinutes?

> `optional` **overtimeMinutes?**: `number`

Defined in: [types.ts:284](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L284)

***

### plannedEnd?

> `optional` **plannedEnd?**: `string`

Defined in: [types.ts:271](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L271)

***

### plannedStart?

> `optional` **plannedStart?**: `string`

Defined in: [types.ts:270](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L270)

***

### punchInLocation?

> `optional` **punchInLocation?**: `object`

Defined in: [types.ts:279](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L279)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### punchOutLocation?

> `optional` **punchOutLocation?**: `object`

Defined in: [types.ts:280](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L280)

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### status

> **status**: `"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Defined in: [types.ts:283](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L283)

***

### updatedAt

> **updatedAt**: `Date` \| `FieldValue`

Defined in: [types.ts:289](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L289)
