[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / createOrder

# Function: createOrder()

> **createOrder**(`order`): `Promise`\<`string`\>

Defined in: [db/orders.ts:30](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L30)

Initialiserer og lagrer en ny ordre i organisasjonens ordresystem.

Denne arkitektoniske funksjonen utfører tre kritiske operasjoner:
1. Beregner volumetrisk behov (antall paller) basert på varelinjer.
2. Genererer unike strekkoder for hvert enkelt kolli (Collie) for full sporbarhet.
3. Oppretter handling units (paller) og knytter kolliene til disse via en round-robin logikk.

## Parameters

### order

`Omit`\<[`Order`](../../../types/interfaces/Order.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Ordreobjektet som skal lagres. Bruker `Omit` for å sikre at `id` og tidsstempler genereres av databasen.

## Returns

`Promise`\<`string`\>

En Promise som løses med den autogenererte dokument-ID-en fra Firestore.

## Throws

Kan kaste feil ved nettverksbrudd eller manglende skrivetilgang til organisasjonens subcollection.

## Example

```typescript
const newOrderId = await createOrder({
  orgId: "org_123",
  barcode: "ORD-999",
  placeId: "loc_456",
  status: "pending",
  lineItems: [{ id: "item_1", name: "Pakke", quantity: 5, weight: 10 }]
});
console.log(`Ordre opprettet med ID: ${newOrderId}`);
```
