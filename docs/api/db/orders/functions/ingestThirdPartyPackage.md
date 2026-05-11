[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/orders](../README.md) / ingestThirdPartyPackage

# Function: ingestThirdPartyPackage()

> **ingestThirdPartyPackage**(`data`): `Promise`\<\{ `isNew`: `boolean`; `orderId`: `string`; \}\>

Defined in: [db/orders.ts:107](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/orders.ts#L107)

Hurtigregistrering av en pakke fra tredjepart. Oppretter en "shell"-ordre eller oppdaterer eksisterende.

Brukes primært på terminalen/lasterampen når en sjåfør ankommer med uforutsette pakker som må spores.

## Parameters

### data

Inneholder organisasjons-ID, strekkode og valgfrie rute/sted-identifikatorer.

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

En Promise som returnerer ordre-ID og en boolsk verdi som indikerer om ordren var ny.

## Example

```typescript
const result = await ingestThirdPartyPackage({
  orgId: "org_abc",
  barcode: "3PS-12345",
  routeId: "route_morgen"
});
```
