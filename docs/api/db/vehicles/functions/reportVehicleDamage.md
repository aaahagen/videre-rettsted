[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / reportVehicleDamage

# Function: reportVehicleDamage()

> **reportVehicleDamage**(`data`): `Promise`\<[`VehicleDamageReport`](../../../types/interfaces/VehicleDamageReport.md)\>

Defined in: [db/vehicles.ts:247](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L247)

Oppretter en ny skaderapport og setter kjøretøyet automatisk i 'observation'-status.

## Parameters

### data

`Omit`\<[`VehicleDamageReport`](../../../types/interfaces/VehicleDamageReport.md), `"id"` \| `"createdAt"`\>

Skaderapport-data (uten ID).

## Returns

`Promise`\<[`VehicleDamageReport`](../../../types/interfaces/VehicleDamageReport.md)\>

Den opprettede rapporten.
