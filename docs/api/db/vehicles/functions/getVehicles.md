[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / getVehicles

# Function: getVehicles()

> **getVehicles**(`orgId`): `Promise`\<[`Vehicle`](../../../types/interfaces/Vehicle.md)[]\>

Defined in: [db/vehicles.ts:22](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L22)

Henter alle registrerte kjøretøy tilhørende en organisasjon.

Resultatet inkluderer tekniske detaljer som registreringsnummer, EU-kontrollfrister 
og nåværende operasjonell status.

## Parameters

### orgId

`string`

Den unike ID-en til organisasjonen.

## Returns

`Promise`\<[`Vehicle`](../../../types/interfaces/Vehicle.md)[]\>

En Promise som løses med en liste over `Vehicle`-objekter.

## Throws

Feil ved databaseoppslag.

## Example

```typescript
const myFleet = await getVehicles("org_123");
console.log(`Bedriften har ${myFleet.length} enheter i bilparken.`);
```
