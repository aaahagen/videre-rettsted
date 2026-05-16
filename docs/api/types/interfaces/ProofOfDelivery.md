[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:448](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L448)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:451](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L451)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:478](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L478)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:477](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L477)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:457](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L457)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:476](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L476)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:481](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L481)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:465](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L465)

#### description?

> `optional` **description?**: `string`

#### type?

> `optional` **type?**: `"package_in_situ"` \| `"damage_proof"` \| `"door_number"` \| `"general"`

#### uploadedAt?

> `optional` **uploadedAt?**: `any`

#### url

> **url**: `string`

***

### recipientPhone?

> `optional` **recipientPhone?**: `string`

Defined in: [types.ts:462](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L462)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:473](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L473)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:461](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L461)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:460](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L460)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:454](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L454)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:450](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L450)
