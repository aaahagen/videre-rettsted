[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/users](../README.md) / getUser

# Function: getUser()

> **getUser**(`uid`): `Promise`\<[`User`](../../../types/interfaces/User.md) \| `null`\>

Defined in: [db/users.ts:32](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/users.ts#L32)

Henter profilinformasjon for en spesifikk bruker.

## Parameters

### uid

`string`

Brukerens unike ID (fra Auth).

## Returns

`Promise`\<[`User`](../../../types/interfaces/User.md) \| `null`\>

En Promise som løses med et `User`-objekt, eller `null` hvis profilen ikke finnes.
