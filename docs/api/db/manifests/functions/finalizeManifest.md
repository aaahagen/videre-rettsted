[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / finalizeManifest

# Function: finalizeManifest()

> **finalizeManifest**(`orgId`, `manifestId`, `userId`): `Promise`\<`void`\>

Defined in: [db/manifests.ts:208](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L208)

Markerer et manifest som ferdig verifisert.

Brukes når terminalarbeideren har bekreftet at alt er lastet korrekt på bilen.

## Parameters

### orgId

`string`

Organisasjonens ID.

### manifestId

`string`

Manifestets ID.

### userId

`string`

ID-en til den som verifiserer manifestet.

## Returns

`Promise`\<`void`\>
