[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/routes](../README.md) / deleteRoute

# Function: deleteRoute()

> **deleteRoute**(`orgId`, `id`): `Promise`\<`void`\>

Defined in: [db/routes.ts:139](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/routes.ts#L139)

Sletter en rute permanent og utfører kaskadesletting av tilhørende manifester.

Dette sikrer dataintegritet ved å fjerne lasteoversikter (manifests) som er 
direkte knyttet til ruten som fjernes.

## Parameters

### orgId

`string`

Organisasjonens ID (nødvendig for å finne manifest-subcollection).

### id

`string`

Identifikatoren til ruten som skal slettes.

## Returns

`Promise`\<`void`\>

En Promise som løses når rute og manifest er slettet.

## Example

```typescript
await deleteRoute("org_123", "route_abc");
```
