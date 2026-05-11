[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / updateManifest

# Function: updateManifest()

> **updateManifest**(`orgId`, `manifestId`, `updates`): `Promise`\<`void`\>

Defined in: [db/manifests.ts:72](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L72)

Oppdaterer generelle metadata på et manifest.

## Parameters

### orgId

`string`

Organisasjonens ID.

### manifestId

`string`

Manifestets ID.

### updates

`Partial`\<[`Manifest`](../../../types/interfaces/Manifest.md)\>

De delvise endringene som skal utføres.

## Returns

`Promise`\<`void`\>
