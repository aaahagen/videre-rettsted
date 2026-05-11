[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/workLogs](../README.md) / createWorkLog

# Function: createWorkLog()

> **createWorkLog**(`workLog`): `Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)\>

Defined in: [db/workLogs.ts:24](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/workLogs.ts#L24)

Registrerer en ny arbeidsøkt (stempling) i databasen.

Brukes når en ansatt stempler inn manuelt eller via geofence. Funksjonen 
initialiserer økten med system-tidsstempler for opprettelse.

## Parameters

### workLog

`Omit`\<[`WorkLog`](../../../types/interfaces/WorkLog.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Data for arbeidsøkten (uten ID). Inkluderer fører-ID, organisasjons-ID og innstemplingstidspunkt.

## Returns

`Promise`\<[`WorkLog`](../../../types/interfaces/WorkLog.md)\>

En Promise med den lagrede `WorkLog`-modellen inkludert generert ID.

## Example

```typescript
const log = await createWorkLog({
  driverId: "driver_1",
  orgId: "org_a",
  status: "pending",
  actualPunchIn: new Date().toISOString()
});
```
