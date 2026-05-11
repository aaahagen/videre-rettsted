[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/routes](../README.md) / getRoutes

# Function: getRoutes()

> **getRoutes**(`orgId`): `Promise`\<[`Route`](../../../types/interfaces/Route.md)[]\>

Defined in: [db/routes.ts:49](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/routes.ts#L49)

Henter alle ruter tilhørende en spesifikk organisasjon.

Denne funksjonen brukes primært av ruteplanleggere og administratorer for å få 
oversikt over aktive, fullførte og planlagte ruter.

## Parameters

### orgId

`string`

Organisasjonens unike ID.

## Returns

`Promise`\<[`Route`](../../../types/interfaces/Route.md)[]\>

En Promise med en liste over alle rutene knyttet til organisasjonen.

## Example

```typescript
const allRoutes = await getRoutes("org_123");
const activeRoutes = allRoutes.filter(r => r.status === 'active');
```
