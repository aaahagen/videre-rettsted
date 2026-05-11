[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/users](../README.md) / getUsers

# Function: getUsers()

> **getUsers**(`orgId`): `Promise`\<[`User`](../../../types/interfaces/User.md)[]\>

Defined in: [db/users.ts:52](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/users.ts#L52)

Henter alle brukere tilknyttet en organisasjon.

Brukes typisk i admin-panelet for å administrere ansatte og tilganger.

## Parameters

### orgId

`string`

ID-en til organisasjonen.

## Returns

`Promise`\<[`User`](../../../types/interfaces/User.md)[]\>

En Promise med en liste over alle brukernes profiler.

## Example

```typescript
const employees = await getUsers("org_123");
const driversOnly = employees.filter(u => u.role === 'driver');
```
