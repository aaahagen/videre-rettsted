[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / Organization

# Interface: Organization

Defined in: [types.ts:13](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L13)

## Properties

### dangerReportsEnabled?

> `optional` **dangerReportsEnabled?**: `boolean`

Defined in: [types.ts:90](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L90)

***

### fieldSettings?

> `optional` **fieldSettings?**: `object`

Defined in: [types.ts:53](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L53)

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

#### field3?

> `optional` **field3?**: `object`

##### field3.enabled?

> `optional` **enabled?**: `boolean`

##### field3.label

> **label**: `string`

##### field3.placeholder

> **placeholder**: `string`

#### field4?

> `optional` **field4?**: `object`

##### field4.enabled?

> `optional` **enabled?**: `boolean`

##### field4.label

> **label**: `string`

##### field4.placeholder

> **placeholder**: `string`

#### notes?

> `optional` **notes?**: `object`

##### notes.enabled?

> `optional` **enabled?**: `boolean`

##### notes.label

> **label**: `string`

##### notes.placeholder

> **placeholder**: `string`

#### salesMessage?

> `optional` **salesMessage?**: `object`

##### salesMessage.enabled?

> `optional` **enabled?**: `boolean`

##### salesMessage.label

> **label**: `string`

##### salesMessage.placeholder

> **placeholder**: `string`

***

### hmsSettings?

> `optional` **hmsSettings?**: `object`

Defined in: [types.ts:47](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L47)

#### enabled

> **enabled**: `boolean`

#### questions

> **questions**: `object`[]

#### requireComment?

> `optional` **requireComment?**: `boolean`

#### title?

> `optional` **title?**: `string`

***

### id

> **id**: `string`

Defined in: [types.ts:14](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L14)

***

### labelSettings?

> `optional` **labelSettings?**: `object`

Defined in: [types.ts:37](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L37)

#### format

> **format**: `"barcode"` \| `"qrcode"`

#### includeBranding?

> `optional` **includeBranding?**: `boolean`

#### size?

> `optional` **size?**: `"small"` \| `"standard"` \| `"large"`

***

### legal?

> `optional` **legal?**: `object`

Defined in: [types.ts:91](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L91)

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

Defined in: [types.ts:32](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L32)

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

Defined in: [types.ts:21](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L21)

#### analytics?

> `optional` **analytics?**: `boolean`

#### danger\_reports?

> `optional` **danger\_reports?**: `boolean`

#### fleet?

> `optional` **fleet?**: `boolean`

#### hms?

> `optional` **hms?**: `boolean`

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

### placeSettings?

> `optional` **placeSettings?**: `object`

Defined in: [types.ts:42](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L42)

#### autoGenerateCustomerNumbers?

> `optional` **autoGenerateCustomerNumbers?**: `boolean`

#### customerNumberPrefix?

> `optional` **customerNumberPrefix?**: `string`

#### nextCustomerNumber?

> `optional` **nextCustomerNumber?**: `number`

***

### plan?

> `optional` **plan?**: `"free"` \| `"pro"` \| `"enterprise"`

Defined in: [types.ts:19](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L19)

***

### status?

> `optional` **status?**: `"active"` \| `"trial"` \| `"suspended"`

Defined in: [types.ts:18](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L18)

***

### trialExpiresAt?

> `optional` **trialExpiresAt?**: `any`

Defined in: [types.ts:20](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L20)
