[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / createManifest

# Function: createManifest()

> **createManifest**(`manifest`): `Promise`\<`string`\>

Defined in: [db/manifests.ts:25](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L25)

Oppretter et nytt laste-manifest for en kjørerute.

Funksjonen initialiserer alle ordrer i manifestet med `loadedItems: 0` og 
setter standardstatus til 'pending'. Dette sikrer et rent utgangspunkt for 
terminalarbeiderne.

## Parameters

### manifest

`Omit`\<[`Manifest`](../../../types/interfaces/Manifest.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Manifestdata (uten ID). Inneholder referanse til rute og tilhørende ordrer.

## Returns

`Promise`\<`string`\>

En Promise som løses med den nye manifest-ID-en.

## Example

```typescript
const manifestId = await createManifest({
  orgId: "org_123",
  routeId: "route_456",
  orders: [{ orderId: "ord_1", barcode: "B123", totalItems: 5 }]
});
```
