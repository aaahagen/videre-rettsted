[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/courses](../README.md) / deleteCourse

# Function: deleteCourse()

> **deleteCourse**(`courseId`, `orgId`): `Promise`\<`void`\>

Defined in: [db/courses.ts:84](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/courses.ts#L84)

Sletter et kurs og alle tilhørende kurstildelinger (kaskadesletting).

Denne funksjonen bruker en atomær `writeBatch` for å sikre at ingen 
foreldreløse tildelinger blir liggende igjen i databasen hvis kurset slettes.

## Parameters

### courseId

`string`

ID-en til kurset som skal fjernes.

### orgId

`string`

Organisasjonens ID (påkrevd for sikkerhetsverifisering).

## Returns

`Promise`\<`void`\>
