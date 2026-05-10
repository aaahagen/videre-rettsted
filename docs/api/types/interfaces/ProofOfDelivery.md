[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:426](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L426)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:429](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L429)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:456](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L456)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:455](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L455)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:435](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L435)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:454](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L454)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:459](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L459)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:443](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L443)

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

Defined in: [types.ts:440](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L440)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:451](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L451)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:439](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L439)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:438](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L438)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:432](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L432)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:428](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L428)
