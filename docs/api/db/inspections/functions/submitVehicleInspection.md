[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/inspections](../README.md) / submitVehicleInspection

# Function: submitVehicleInspection()

> **submitVehicleInspection**(`inspection`): `Promise`\<`string`\>

Defined in: [db/inspections.ts:43](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/inspections.ts#L43)

Lagrer en gjennomført kjøretøykontroll (pre- eller post-trip).

Funksjonen arkiverer sjekklisten i en egen subcollection for full sporbarhet 
og samsvar med transportforskrifter.

## Parameters

### inspection

`Omit`\<[`VehicleInspection`](../../../types/interfaces/VehicleInspection.md), `"id"`\>

Kontrolldata (uten ID). Inkluderer sjekkpunkter og kjøretøy-ID.

## Returns

`Promise`\<`string`\>

En Promise som løses med dokument-ID for den lagrede kontrollen.
