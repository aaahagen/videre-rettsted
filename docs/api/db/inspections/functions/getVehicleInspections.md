[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/inspections](../README.md) / getVehicleInspections

# Function: getVehicleInspections()

> **getVehicleInspections**(`orgId`, `vehicleId`): `Promise`\<[`VehicleInspection`](../../../types/interfaces/VehicleInspection.md)[]\>

Defined in: [db/inspections.ts:62](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/inspections.ts#L62)

Henter historikk over tekniske kontroller for et spesifikt kjøretøy.

Resultatene sorteres kronologisk med den nyeste kontrollen først.

## Parameters

### orgId

`string`

Organisasjonens ID.

### vehicleId

`string`

Kjøretøyets ID.

## Returns

`Promise`\<[`VehicleInspection`](../../../types/interfaces/VehicleInspection.md)[]\>

En liste over gjennomførte kontroller.
