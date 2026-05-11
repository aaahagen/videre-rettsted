[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/routes](../README.md) / updateRoute

# Function: updateRoute()

> **updateRoute**(`id`, `updates`): `Promise`\<[`Route`](../../../types/interfaces/Route.md)\>

Defined in: [db/routes.ts:108](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/routes.ts#L108)

Oppdaterer attributtene til en eksisterende rute.

Brukes for å endre status, legge til stopp (places), eller oppdatere rutenotater.
Oppdaterer automatisk `updatedAt`-feltet.

## Parameters

### id

`string`

Identifikatoren til ruten som skal oppdateres.

### updates

`Partial`\<[`Route`](../../../types/interfaces/Route.md)\>

De spesifikke feltene som skal endres.

## Returns

`Promise`\<[`Route`](../../../types/interfaces/Route.md)\>

En Promise med det oppdaterte ruteobjektet.

## Example

```typescript
await updateRoute("route_123", { 
  status: "completed", 
  notes: "Rute fullført uten avvik." 
});
```
