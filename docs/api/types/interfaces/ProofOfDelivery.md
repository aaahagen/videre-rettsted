[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:424](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L424)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:427](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L427)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:454](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L454)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:453](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L453)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:433](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L433)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:452](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L452)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:457](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L457)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:441](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L441)

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

Defined in: [types.ts:438](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L438)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:449](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L449)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:437](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L437)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:436](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L436)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:430](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L430)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:426](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L426)
