[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / updateVehicle

# Function: updateVehicle()

> **updateVehicle**(`id`, `data`): `Promise`\<`void`\>

Defined in: [db/vehicles.ts:105](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L105)

Oppdaterer tekniske data eller informasjon om et kjøretøy.

## Parameters

### id

`string`

Identifikatoren til kjøretøyet.

### data

`Partial`\<[`Vehicle`](../../../types/interfaces/Vehicle.md)\>

Delvis modell med feltene som skal endres.

## Returns

`Promise`\<`void`\>
