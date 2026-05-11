[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / getVehicleDamages

# Function: getVehicleDamages()

> **getVehicleDamages**(`vehicleId`, `orgId?`): `Promise`\<[`VehicleDamageReport`](../../../types/interfaces/VehicleDamageReport.md)[]\>

Defined in: [db/vehicles.ts:205](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L205)

Henter historikk over skaderapporter for et spesifikt kjøretøy.

## Parameters

### vehicleId

`string`

ID-en til kjøretøyet.

### orgId?

`string`

Valgfri organisasjons-ID for filtrering (sikkerhet).

## Returns

`Promise`\<[`VehicleDamageReport`](../../../types/interfaces/VehicleDamageReport.md)[]\>

En liste over skaderapporter sortert nyeste først.
