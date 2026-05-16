[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:435](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L435)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:438](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L438)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:465](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L465)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:464](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L464)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:444](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L444)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:463](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L463)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:468](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L468)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:452](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L452)

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

Defined in: [types.ts:449](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L449)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:460](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L460)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:448](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L448)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:447](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L447)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:441](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L441)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:437](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L437)
