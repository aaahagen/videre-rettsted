[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Organization

# Interface: Organization

Defined in: [types.ts:13](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L13)

## Properties

### fieldSettings?

> `optional` **fieldSettings?**: `object`

Defined in: [types.ts:33](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L33)

#### contactPersons?

> `optional` **contactPersons?**: `object`

##### contactPersons.enabled?

> `optional` **enabled?**: `boolean`

##### contactPersons.label

> **label**: `string`

##### contactPersons.placeholder

> **placeholder**: `string`

#### description?

> `optional` **description?**: `object`

##### description.enabled?

> `optional` **enabled?**: `boolean`

##### description.label

> **label**: `string`

##### description.placeholder

> **placeholder**: `string`

#### doorCode?

> `optional` **doorCode?**: `object`

##### doorCode.enabled?

> `optional` **enabled?**: `boolean`

##### doorCode.label

> **label**: `string`

##### doorCode.placeholder

> **placeholder**: `string`

#### notes?

> `optional` **notes?**: `object`

##### notes.enabled?

> `optional` **enabled?**: `boolean`

##### notes.label

> **label**: `string`

##### notes.placeholder

> **placeholder**: `string`

***

### id

> **id**: `string`

Defined in: [types.ts:14](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L14)

***

### legal?

> `optional` **legal?**: `object`

Defined in: [types.ts:55](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L55)

#### dpaAcceptedAt?

> `optional` **dpaAcceptedAt?**: `object`

##### dpaAcceptedAt.toDate

> **toDate**: () => `Date`

###### Returns

`Date`

#### dpaAcceptedBy?

> `optional` **dpaAcceptedBy?**: `string`

#### dpaAcceptedByEmail?

> `optional` **dpaAcceptedByEmail?**: `string`

#### dpaVersion?

> `optional` **dpaVersion?**: `string`

#### termsAcceptedAt?

> `optional` **termsAcceptedAt?**: `object`

##### termsAcceptedAt.toDate

> **toDate**: () => `Date`

###### Returns

`Date`

#### termsVersion?

> `optional` **termsVersion?**: `string`

***

### mainDepot?

> `optional` **mainDepot?**: `object`

Defined in: [types.ts:28](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L28)

#### address

> **address**: `string`

#### coordinates

> **coordinates**: `object`

##### coordinates.lat

> **lat**: `number`

##### coordinates.lng

> **lng**: `number`

#### radius

> **radius**: `number`

***

### modules?

> `optional` **modules?**: `object`

Defined in: [types.ts:19](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L19)

#### analytics?

> `optional` **analytics?**: `boolean`

#### fleet?

> `optional` **fleet?**: `boolean`

#### learning?

> `optional` **learning?**: `boolean`

#### logistics?

> `optional` **logistics?**: `boolean`

#### messages?

> `optional` **messages?**: `boolean`

#### places?

> `optional` **places?**: `boolean`

#### workforce?

> `optional` **workforce?**: `boolean`

***

### name

> **name**: `string`

Defined in: [types.ts:15](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L15)

***

### orgNumber?

> `optional` **orgNumber?**: `string`

Defined in: [types.ts:16](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L16)

***

### ownerId?

> `optional` **ownerId?**: `string`

Defined in: [types.ts:17](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L17)

***

### status?

> `optional` **status?**: `"active"` \| `"trial"` \| `"suspended"`

Defined in: [types.ts:18](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L18)
