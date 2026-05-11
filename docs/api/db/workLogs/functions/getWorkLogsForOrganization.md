[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/workLogs](../README.md) / getWorkLogsForOrganization

# Function: getWorkLogsForOrganization()

> **getWorkLogsForOrganization**(`orgId`, `status?`): `Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)[]\>

Defined in: [db/workLogs.ts:89](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/workLogs.ts#L89)

Henter alle arbeidsøkter for en hel organisasjon, valgfritt filtrert på status.

Brukes av administratorer for godkjenning av timelister og lønnskjøring.

## Parameters

### orgId

`string`

Organisasjonens ID.

### status?

`"active"` \| `"pending_review"` \| `"needs_overtime_approval"` \| `"approved"` \| `"declined"`

Valgfri status-filter (f.eks. 'pending', 'approved').

## Returns

`Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)[]\>

En Promise med alle relevante arbeidsøkter for organisasjonen.
