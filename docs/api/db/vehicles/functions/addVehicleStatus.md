[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / addVehicleStatus

# Function: addVehicleStatus()

> **addVehicleStatus**(`id`, `status`): `Promise`\<`void`\>

Defined in: [db/vehicles.ts:150](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L150)

Legger til en operasjonell status på et kjøretøy.

Hvis statusen som legges til er noe annet enn 'ready', fjernes 'ready'-flagget 
automatisk for å indikere at enheten krever oppmerksomhet eller er i bruk.

## Parameters

### id

`string`

Kjøretøyets ID.

### status

`string`

Statusstreng (f.eks. 'observation', 'workshop').

## Returns

`Promise`\<`void`\>

## Example

```typescript
await addVehicleStatus("v123", "observation");
```
