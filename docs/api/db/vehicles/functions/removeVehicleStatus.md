[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / removeVehicleStatus

# Function: removeVehicleStatus()

> **removeVehicleStatus**(`id`, `status`): `Promise`\<`void`\>

Defined in: [db/vehicles.ts:176](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L176)

Fjerner en spesifikk status fra et kjøretøy.

Dersom kjøretøyet står uten statuser etter fjerning, settes det automatisk tilbake til 'ready'.

## Parameters

### id

`string`

Kjøretøyets ID.

### status

`string`

Statusen som skal fjernes.

## Returns

`Promise`\<`void`\>
