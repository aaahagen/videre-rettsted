[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / ingestThirdPartyPackage

# Function: ingestThirdPartyPackage()

> **ingestThirdPartyPackage**(`data`): `Promise`\<\{ `isNew`: `boolean`; `orderId`: `string`; \}\>

Defined in: [db/orders.ts:69](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L69)

Rapidly ingests a 3rd party package. Creates a shell order or updates existing.

## Parameters

### data

#### barcode

`string`

#### orgId

`string`

#### placeId?

`string`

#### recipientName?

`string`

#### routeId?

`string`

#### senderName?

`string`

## Returns

`Promise`\<\{ `isNew`: `boolean`; `orderId`: `string`; \}\>
