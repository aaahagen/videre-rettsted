[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / getVehicle

# Function: getVehicle()

> **getVehicle**(`id`): `Promise`\<[`Vehicle`](../../../types/interfaces/Vehicle.md) \| `null`\>

Defined in: [db/vehicles.ts:44](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L44)

Henter detaljert informasjon om et spesifikt kjøretøy.

## Parameters

### id

`string`

Dokument-ID-en til kjøretøyet i Firestore.

## Returns

`Promise`\<[`Vehicle`](../../../types/interfaces/Vehicle.md) \| `null`\>

En Promise som løses med et `Vehicle`-objekt eller `null`.
