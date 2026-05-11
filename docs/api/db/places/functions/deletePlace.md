[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/places](../README.md) / deletePlace

# Function: deletePlace()

> **deletePlace**(`id`): `Promise`\<`void`\>

Defined in: [db/places.ts:210](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/places.ts#L210)

Sletter et leveringssted permanent fra databasen.

## Parameters

### id

`string`

Identifikatoren til stedet som skal fjernes.

## Returns

`Promise`\<`void`\>

En Promise som løses når slettingen er bekreftet av Firestore.

## Throws

Feil ved manglende slettetilgang (kun Admins/Super Admins).

## Example

```typescript
await deletePlace("place_old_456");
```
