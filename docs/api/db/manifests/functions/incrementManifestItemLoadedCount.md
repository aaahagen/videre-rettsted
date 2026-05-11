[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / incrementManifestItemLoadedCount

# Function: incrementManifestItemLoadedCount()

> **incrementManifestItemLoadedCount**(`orgId`, `manifestId`, `orderId`, `userId`): `Promise`\<`void`\>

Defined in: [db/manifests.ts:121](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L121)

Øker antallet lastede varer for en spesifikk ordre i manifestet.

Hvis alle varer i ordren er lastet, oppdateres statusen automatisk til 'loaded' 
både i manifestet og på selve ordredokumentet.

## Parameters

### orgId

`string`

Organisasjonens ID.

### manifestId

`string`

Manifestets ID.

### orderId

`string`

Ordrens ID.

### userId

`string`

ID-en til brukeren som utfører lastingen.

## Returns

`Promise`\<`void`\>

## Throws

Feil hvis ordren ikke finnes eller allerede er ferdiglastet.
