[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [auth](../README.md) / Auth

# Interface: Auth

Defined in: [auth.ts:3](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/auth.ts#L3)

## Methods

### getCurrentUser()

> **getCurrentUser**(): `Promise`\<[`UserProfile`](../../types/interfaces/UserProfile.md) \| `null`\>

Defined in: [auth.ts:8](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/auth.ts#L8)

#### Returns

`Promise`\<[`UserProfile`](../../types/interfaces/UserProfile.md) \| `null`\>

***

### inviteUser()

> **inviteUser**(`email`, `role`, `name?`): `Promise`\<`string`\>

Defined in: [auth.ts:7](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/auth.ts#L7)

#### Parameters

##### email

`string`

##### role

`"loader"` \| `"admin"` \| `"driver"` \| `"contractor"` \| `"planner"`

##### name?

`string`

#### Returns

`Promise`\<`string`\>

***

### login()

> **login**(`email`, `password?`): `Promise`\<`void`\>

Defined in: [auth.ts:4](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/auth.ts#L4)

#### Parameters

##### email

`string`

##### password?

`string`

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(): `Promise`\<`void`\>

Defined in: [auth.ts:5](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/auth.ts#L5)

#### Returns

`Promise`\<`void`\>

***

### register()

> **register**(`email`, `password?`, `name?`, `orgName?`): `Promise`\<`void`\>

Defined in: [auth.ts:6](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/auth.ts#L6)

#### Parameters

##### email

`string`

##### password?

`string`

##### name?

`string`

##### orgName?

`string`

#### Returns

`Promise`\<`void`\>
