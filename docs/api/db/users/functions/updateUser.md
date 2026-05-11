[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/users](../README.md) / updateUser

# Function: updateUser()

> **updateUser**(`uid`, `data`): `Promise`\<`void`\>

Defined in: [db/users.ts:75](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/users.ts#L75)

Oppdaterer profilinformasjon for en bruker med avansert datarensing.

Funksjonen utfører en dyp rensing av inndata for å fjerne `undefined`-verdier, 
samtidig som den bevarer spesielle Firestore-typer som `deleteField()`.

## Parameters

### uid

`string`

ID-en til brukeren som skal oppdateres.

### data

`Partial`\<[`User`](../../../types/interfaces/User.md)\>

Delvis brukerobjekt med feltene som skal endres.

## Returns

`Promise`\<`void`\>

## Example

```typescript
await updateUser("user_123", { name: "Ola N. Nordmann", status: "active" });
```
