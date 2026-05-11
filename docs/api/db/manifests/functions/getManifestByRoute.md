[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / getManifestByRoute

# Function: getManifestByRoute()

> **getManifestByRoute**(`orgId`, `routeId`): `Promise`\<[`Manifest`](../../../types/interfaces/Manifest.md) \| `null`\>

Defined in: [db/manifests.ts:56](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L56)

Henter manifestet tilknyttet en spesifikk rute.

Siden det kun skal eksistere ett manifest per rute, returnerer denne 
funksjonen det første treffet.

## Parameters

### orgId

`string`

Organisasjonens ID.

### routeId

`string`

Rutens ID.

## Returns

`Promise`\<[`Manifest`](../../../types/interfaces/Manifest.md) \| `null`\>

En Promise med `Manifest`-objektet eller `null`.
