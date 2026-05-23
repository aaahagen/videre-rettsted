[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:453](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L453)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:456](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L456)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:483](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L483)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:482](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L482)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:462](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L462)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:481](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L481)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:486](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L486)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:470](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L470)

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

Defined in: [types.ts:467](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L467)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:478](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L478)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:466](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L466)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:465](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L465)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:459](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L459)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:455](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L455)
