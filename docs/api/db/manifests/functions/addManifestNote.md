[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/manifests](../README.md) / addManifestNote

# Function: addManifestNote()

> **addManifestNote**(`orgId`, `manifestId`, `note`): `Promise`\<`void`\>

Defined in: [db/manifests.ts:87](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/manifests.ts#L87)

Legger til et notat eller en kommentar på lasteoversikten.

## Parameters

### orgId

`string`

Organisasjonens ID.

### manifestId

`string`

Manifestets ID.

### note

`Omit`\<[`ManifestNote`](../../../types/interfaces/ManifestNote.md), `"createdAt"`\>

Notat-data (innhold og type).

## Returns

`Promise`\<`void`\>
