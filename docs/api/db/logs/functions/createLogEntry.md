[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/logs](../README.md) / createLogEntry

# Function: createLogEntry()

> **createLogEntry**(`logEntry`): `Promise`\<`string`\>

Defined in: [db/logs.ts:64](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/logs.ts#L64)

Oppretter en rå loggføring i systemloggen.

## Parameters

### logEntry

`Omit`\<[`LogEntry`](../../../types/interfaces/LogEntry.md), `"id"` \| `"timestamp"`\>

Loggdata uten systemfelter.

## Returns

`Promise`\<`string`\>

Dokument-ID for den nye loggføringen.
