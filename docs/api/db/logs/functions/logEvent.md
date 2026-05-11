[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/logs](../README.md) / logEvent

# Function: logEvent()

> **logEvent**(`orgId`, `userId`, `action`, `details?`): `Promise`\<`void`\>

Defined in: [db/logs.ts:21](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/logs.ts#L21)

Registrerer en viktig hendelse i systemets revisjonsspor (Audit Log).

Denne funksjonen brukes for å logge kritiske handlinger som krever 
sporbarhet i henhold til GDPR og interne sikkerhetsrutiner.

## Parameters

### orgId

`string`

Organisasjonens ID.

### userId

`string`

ID-en til brukeren som utførte handlingen.

### action

`"create_place"` \| `"delete_place"` \| `"login"` \| `"admin_view_worklog"` \| `"export_hr_data"`

Type handling som ble utført.

### details?

`any`

Valgfri metadata knyttet til hendelsen.

## Returns

`Promise`\<`void`\>

## Example

```typescript
await logEvent("org_123", "user_abc", "delete_place", { placeId: "p_99", name: "Gammelt lager" });
```
