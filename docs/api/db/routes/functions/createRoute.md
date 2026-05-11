[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/routes](../README.md) / createRoute

# Function: createRoute()

> **createRoute**(`route`): `Promise`\<[`Route`](../../../types/interfaces/Route.md)\>

Defined in: [db/routes.ts:76](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/routes.ts#L76)

Oppretter en ny kjørerute i systemet.

Genererer automatisk tidsstempler for opprettelse og siste endring.

## Parameters

### route

`Omit`\<[`Route`](../../../types/interfaces/Route.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Rutedataene som skal lagres. `id` og tidsstempler settes automatisk.

## Returns

`Promise`\<[`Route`](../../../types/interfaces/Route.md)\>

En Promise med det nyopprettede `Route`-objektet inkludert ID.

## Example

```typescript
const newRoute = await createRoute({
  name: "Morgenrute Sentrum",
  orgId: "org_123",
  status: "active",
  places: ["place_1", "place_2"]
});
```
