[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/routes](../README.md) / getRoute

# Function: getRoute()

> **getRoute**(`id`): `Promise`\<[`Route`](../../../types/interfaces/Route.md) \| `null`\>

Defined in: [db/routes.ts:21](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/routes.ts#L21)

Henter en spesifikk rute fra databasen basert på dens unike dokument-ID.

Inkluderer konvertering av Firestore-tidsstempler til standard JavaScript Date-objekter.

## Parameters

### id

`string`

Identifikatoren til ruten som skal hentes.

## Returns

`Promise`\<[`Route`](../../../types/interfaces/Route.md) \| `null`\>

En Promise som løses med et `Route`-objekt, eller `null` hvis ruten ikke finnes.

## Example

```typescript
const route = await getRoute("route_789");
if (route) {
  console.log(`Rute: ${route.name}, Status: ${route.status}`);
}
```
