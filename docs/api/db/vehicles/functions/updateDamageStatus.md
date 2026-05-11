[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/vehicles](../README.md) / updateDamageStatus

# Function: updateDamageStatus()

> **updateDamageStatus**(`damageId`, `status`, `resolvedBy?`): `Promise`\<`void`\>

Defined in: [db/vehicles.ts:296](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/vehicles.ts#L296)

Endrer status på en skadesak (f.eks. fra 'reported' til 'fixed').

Dersom status settes til 'fixed', lagres automatisk tidspunkt og hvem som løste saken.

## Parameters

### damageId

`string`

ID-en til skadesaken.

### status

`"fixed"` \| `"reported"` \| `"in_progress"`

Den nye statusen.

### resolvedBy?

`string`

Valgfri bruker-ID som markerte saken som utbedret.

## Returns

`Promise`\<`void`\>
