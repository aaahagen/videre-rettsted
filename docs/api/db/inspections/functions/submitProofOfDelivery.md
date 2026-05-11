[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/inspections](../README.md) / submitProofOfDelivery

# Function: submitProofOfDelivery()

> **submitProofOfDelivery**(`orgId`, `routeId`, `placeId`, `pod`): `Promise`\<`void`\>

Defined in: [db/inspections.ts:25](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/inspections.ts#L25)

Sender inn bevis for levering (Proof of Delivery) for et spesifikt stopp på en rute.

Funksjonen lagrer POD-data (bilder, signatur, koordinater) direkte inn i rutens 
`completedStopEvents` kart for rask tilgang og historikk.

## Parameters

### orgId

`string`

Organisasjonens ID.

### routeId

`string`

Identifikatoren til ruten.

### placeId

`string`

Identifikatoren til leveringsstedet (stoppet).

### pod

[`ProofOfDelivery`](../../../types/interfaces/ProofOfDelivery.md)

Objektet som inneholder leveringsbeviset.

## Returns

`Promise`\<`void`\>

## Example

```typescript
await submitProofOfDelivery("org_123", "route_456", "place_789", {
  status: "delivered",
  photoUrl: "https://storage.googleapis.com/...",
  deliveredAt: new Date()
});
```
