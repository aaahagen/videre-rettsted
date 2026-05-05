[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/workLogs](../README.md) / getWorkLogsForOrganization

# Function: getWorkLogsForOrganization()

> **getWorkLogsForOrganization**(`orgId`, `status?`): `Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)[]\>

Defined in: [db/workLogs.ts:42](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/workLogs.ts#L42)

## Parameters

### orgId

`string`

### status?

`"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

## Returns

`Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)[]\>
