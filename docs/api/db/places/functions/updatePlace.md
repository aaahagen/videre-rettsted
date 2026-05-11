[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/places](../README.md) / updatePlace

# Function: updatePlace()

> **updatePlace**(`id`, `updates`): `Promise`\<[`Place`](../../../types/interfaces/Place.md)\>

Defined in: [db/places.ts:171](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/places.ts#L171)

Oppdaterer eksisterende data for et spesifikt leveringssted.

Funksjonen renser objektet for `undefined`-verdier før lagring og sørger for at 
systemfelter som `createdAt` ikke overskrives.

## Parameters

### id

`string`

Identifikatoren til stedet som skal endres.

### updates

`Partial`\<[`Place`](../../../types/interfaces/Place.md)\>

En delvis `Place`-modell med de feltene som skal oppdateres.

## Returns

`Promise`\<[`Place`](../../../types/interfaces/Place.md)\>

En Promise med det oppdaterte `Place`-objektet i sin helhet.

## Example

```typescript
await updatePlace("place_123", { 
  notes: "Viktig: Bruk bakdøren etter kl. 16:00" 
});
```
