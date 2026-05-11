[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / deleteOrder

# Function: deleteOrder()

> **deleteOrder**(`orgId`, `orderId`): `Promise`\<`void`\>

Defined in: [db/orders.ts:232](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L232)

Sletter en ordre permanent og håndterer kaskadeoppdateringer for tilhørende ruter og manifester.

Funksjonen utfører følgende:
1. Fjerner referansen til ordren fra tilknyttede ruter.
2. Oppdaterer tilknyttede manifester for å reflektere fjerningen.
3. Sletter selve ordredokumentet.

## Parameters

### orgId

`string`

Organisasjonens ID.

### orderId

`string`

Ordrens ID som skal slettes.

## Returns

`Promise`\<`void`\>

## Throws

Feil ved databaseoperasjoner.
