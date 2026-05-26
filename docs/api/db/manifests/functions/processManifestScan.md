[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / processManifestScan

# Function: processManifestScan()

> **processManifestScan**(`orgId`, `manifestId`, `scannedBarcode`, `userId`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Defined in: [db/manifests.ts:233](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L233)

Prosesserer en strekkodeskan mot et manifest.

Denne intelligente funksjonen gjenkjenner automatisk om strekkoden tilhører:
1. En hel ordre (alle underliggende kolli markeres).
2. En spesifikk pall (alle kolli på pallen markeres).
3. Et enkeltkolli.

## Parameters

### orgId

`string`

Organisasjonens ID.

### manifestId

`string`

Manifestets ID.

### scannedBarcode

`string`

Strekkoden som ble lest av skanneren.

### userId

`string`

ID-en til brukeren som skanner.

## Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

En Promise med suksess-status og en beskrivende melding for UI.
