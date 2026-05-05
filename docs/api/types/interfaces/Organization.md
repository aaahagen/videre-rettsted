[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Organization

# Interface: Organization

Defined in: [types.ts:13](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L13)

## Properties

### fieldSettings?

> `optional` **fieldSettings?**: `object`

Defined in: [types.ts:23](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L23)

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

Defined in: [types.ts:45](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L45)

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

Defined in: [types.ts:18](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L18)

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
