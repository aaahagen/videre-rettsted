[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/places](../README.md) / createPlace

# Function: createPlace()

> **createPlace**(`place`): `Promise`\<[`Place`](../../../types/interfaces/Place.md)\>

Defined in: [db/places.ts:110](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/places.ts#L110)

Oppretter et nytt leveringssted i databasen ved bruk av en atomær transaksjon.

Funksjonen håndterer automatisk generering av kundenummer dersom organisasjonen 
har aktivert dette i sine innstillinger. Transaksjonen sikrer at nummerrekkefølgen 
forblir korrekt selv ved samtidige opprettelser.

## Parameters

### place

`Omit`\<[`Place`](../../../types/interfaces/Place.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Dataene for det nye stedet. `id` og tidsstempler utelates da de settes av systemet.

## Returns

`Promise`\<[`Place`](../../../types/interfaces/Place.md)\>

En Promise med det nyopprettede `Place`-objektet inkludert ID og tidsstempler.

## Example

```typescript
const newPlace = await createPlace({
  name: "Hovedlageret",
  address: "Industriveien 5, 0001 Oslo",
  orgId: "org_123",
  coordinates: { lat: 59.9, lng: 10.7 }
});
```
