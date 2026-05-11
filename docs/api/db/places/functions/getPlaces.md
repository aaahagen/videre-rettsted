[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/places](../README.md) / getPlaces

# Function: getPlaces()

> **getPlaces**(`orgId`): `Promise`\<[`Place`](../../../types/interfaces/Place.md)[]\>

Defined in: [db/places.ts:35](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/places.ts#L35)

Henter alle lagrede leveringssteder tilhørende en spesifikk organisasjon.

Brukes primært for å populere oversiktslister og kartvisninger i dashbordet.

## Parameters

### orgId

`string`

Den unike identifikatoren til organisasjonen (f.eks. "org_123").

## Returns

`Promise`\<[`Place`](../../../types/interfaces/Place.md)[]\>

En Promise som løses med en liste (array) av `Place`-objekter.

## Throws

Feil ved manglende tilgang eller nettverksproblemer.

## Example

```typescript
const myPlaces = await getPlaces("my-org-id");
console.log(`Fant ${myPlaces.length} leveringssteder.`);
```
