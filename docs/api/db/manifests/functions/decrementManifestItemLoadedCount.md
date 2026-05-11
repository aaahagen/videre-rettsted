[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / decrementManifestItemLoadedCount

# Function: decrementManifestItemLoadedCount()

> **decrementManifestItemLoadedCount**(`orgId`, `manifestId`, `orderId`): `Promise`\<`void`\>

Defined in: [db/manifests.ts:166](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L166)

Reduserer antallet lastede varer (angreoperasjon).

Setter status tilbake til 'pending' dersom antallet lastede varer blir mindre enn totalen.

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

## Returns

`Promise`\<`void`\>
