[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/places](../README.md) / getPlace

# Function: getPlace()

> **getPlace**(`id`): `Promise`\<[`Place`](../../../types/interfaces/Place.md) \| `null`\>

Defined in: [db/places.ts:70](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/places.ts#L70)

Henter detaljert informasjon om et enkelt leveringssted basert på dets unike ID.

Inkluderer alle metadata som bilder, koordinater, åpningstider og HMS-data.

## Parameters

### id

`string`

Dokument-ID-en til leveringsstedet i Firestore.

## Returns

`Promise`\<[`Place`](../../../types/interfaces/Place.md) \| `null`\>

En Promise som løses med et `Place`-objekt, eller `null` dersom stedet ikke finnes.

## Example

```typescript
const place = await getPlace("place_abc_123");
if (place) {
  console.log(`Navn: ${place.name}, Adresse: ${place.address}`);
}
```
