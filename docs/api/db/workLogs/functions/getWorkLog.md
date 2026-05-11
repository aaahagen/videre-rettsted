[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/workLogs](../README.md) / getWorkLog

# Function: getWorkLog()

> **getWorkLog**(`id`): `Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md) \| `null`\>

Defined in: [db/workLogs.ts:40](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/workLogs.ts#L40)

Henter en spesifikk arbeidsøkt basert på ID.

## Parameters

### id

`string`

Identifikatoren til arbeidsøkten.

## Returns

`Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md) \| `null`\>

En Promise med `WorkLog`-objektet eller `null`.
