[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/logs](../README.md) / getLogs

# Function: getLogs()

> **getLogs**(`orgId`): `Promise`\<[`LogEntry`](../../../types/interfaces/LogEntry.md)[]\>

Defined in: [db/logs.ts:41](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/logs.ts#L41)

Henter alle revisjonslogger for en spesifikk organisasjon.

## Parameters

### orgId

`string`

Den unike ID-en til organisasjonen.

## Returns

`Promise`\<[`LogEntry`](../../../types/interfaces/LogEntry.md)[]\>

En Promise med en liste over loggføringer (`LogEntry`).
