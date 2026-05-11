[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/workLogs](../README.md) / updateWorkLog

# Function: updateWorkLog()

> **updateWorkLog**(`id`, `updates`): `Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)\>

Defined in: [db/workLogs.ts:111](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/workLogs.ts#L111)

Oppdaterer data for en eksisterende arbeidsøkt.

Brukes typisk ved utstempling eller når en administrator korrigerer/godkjenner en time.

## Parameters

### id

`string`

Identifikatoren til arbeidsøkten som skal endres.

### updates

`Partial`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)\>

De spesifikke feltene som skal oppdateres.

## Returns

`Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)\>

En Promise med den oppdaterte arbeidsloggen.
