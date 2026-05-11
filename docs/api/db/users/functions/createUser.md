[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/users](../README.md) / createUser

# Function: createUser()

> **createUser**(`uid`, `name`, `email`, `orgId`, `role`): `Promise`\<`void`\>

Defined in: [db/users.ts:22](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/users.ts#L22)

Oppretter en ny brukerprofil i Firestore-databasen.

Denne funksjonen brukes etter at en bruker har fullført registrering eller 
akseptert en invitasjon. Den initialiserer standardverdier som favorittliste.

## Parameters

### uid

`string`

Den unike identifikatoren fra Firebase Authentication.

### name

`string`

Fullt navn på brukeren.

### email

`string`

Brukerens e-postadresse.

### orgId

`string`

ID-en til organisasjonen brukeren tilhører.

### role

`string`

Brukerens tilgangsnivå (f.eks. 'admin', 'driver', 'owner').

## Returns

`Promise`\<`void`\>

## Example

```typescript
await createUser("auth_uid_123", "Ola Nordmann", "ola@transport.no", "org_abc", "driver");
```
