[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / createVehicle

# Function: createVehicle()

> **createVehicle**(`data`): `Promise`\<[`Vehicle`](../../../types/interfaces/Vehicle.md)\>

Defined in: [db/vehicles.ts:81](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L81)

Registrerer en ny enhet i bilparken.

Funksjonen renser inndata for systemfelter og setter standardstatus til 'ready'.

## Parameters

### data

`Omit`\<[`Vehicle`](../../../types/interfaces/Vehicle.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Kjøretøydata (uten ID og tidsstempler).

## Returns

`Promise`\<[`Vehicle`](../../../types/interfaces/Vehicle.md)\>

En Promise med det nyopprettede `Vehicle`-objektet inkludert ID.

## Example

```typescript
const newTruck = await createVehicle({
  name: "Lastebil 1",
  plateNumber: "AB12345",
  type: "truck",
  orgId: "org_123"
});
```
