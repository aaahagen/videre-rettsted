[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/users](../README.md) / toggleFavorite

# Function: toggleFavorite()

> **toggleFavorite**(`userId`, `placeId`): `Promise`\<`void`\>

Defined in: [db/users.ts:131](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/users.ts#L131)

Legger til eller fjerner et leveringssted fra brukerens favorittliste.

## Parameters

### userId

`string`

ID-en til brukeren.

### placeId

`string`

ID-en til stedet som skal toggles.

## Returns

`Promise`\<`void`\>

## Example

```typescript
await toggleFavorite("user_123", "place_456");
```
