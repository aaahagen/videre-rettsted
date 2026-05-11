[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/workLogs](../README.md) / getWorkLogsForDriver

# Function: getWorkLogsForDriver()

> **getWorkLogsForDriver**(`driverId`, `startDate?`, `endDate?`): `Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)[]\>

Defined in: [db/workLogs.ts:64](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/workLogs.ts#L64)

Henter alle arbeidsøkter for en spesifikk sjåfør, valgfritt filtrert på dato.

Resultatene sorteres alltid med nyeste innstempling først.

## Parameters

### driverId

`string`

ID-en til sjåføren.

### startDate?

`string`

Valgfri startdato for filtrering (ISO-streng).

### endDate?

`string`

Valgfri sluttdato for filtrering (ISO-streng).

## Returns

`Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)[]\>

En Promise med en liste over sjåførens arbeidslogg.

## Example

```typescript
const marchLogs = await getWorkLogsForDriver("user_123", "2024-03-01", "2024-03-31");
```
