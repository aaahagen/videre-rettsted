[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/users](../README.md) / markPlaceVisited

# Function: markPlaceVisited()

> **markPlaceVisited**(`userId`, `placeId`): `Promise`\<`void`\>

Defined in: [db/users.ts:153](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/users.ts#L153)

Markerer et sted som besøkt av brukeren.

Brukes for å generere statistikk og historikk over sjåførens aktiviteter.

## Parameters

### userId

`string`

ID-en til brukeren.

### placeId

`string`

ID-en til stedet som er besøkt.

## Returns

`Promise`\<`void`\>
