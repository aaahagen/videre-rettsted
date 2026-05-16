[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:443](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L443)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:446](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L446)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:473](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L473)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:472](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L472)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:452](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L452)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:471](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L471)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:476](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L476)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:460](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L460)

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

Defined in: [types.ts:457](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L457)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:468](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L468)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:456](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L456)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:455](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L455)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:449](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L449)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:445](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L445)
