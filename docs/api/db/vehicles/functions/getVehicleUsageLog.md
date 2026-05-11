[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / getVehicleUsageLog

# Function: getVehicleUsageLog()

> **getVehicleUsageLog**(`vehicleId`, `days?`): `Promise`\<`any`[]\>

Defined in: [db/vehicles.ts:318](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L318)

Henter en logg over kjøretøyets bruk i ruter de siste dagene.

## Parameters

### vehicleId

`string`

Kjøretøyets ID.

### days?

`number` = `7`

Antall dager tilbake i tid (standard er 7).

## Returns

`Promise`\<`any`[]\>

En liste over rute-hendelser knyttet til kjøretøyet.
