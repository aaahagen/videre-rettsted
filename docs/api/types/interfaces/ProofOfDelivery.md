[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:449](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L449)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:452](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L452)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:479](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L479)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:478](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L478)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:458](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L458)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:477](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L477)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:482](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L482)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:466](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L466)

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

Defined in: [types.ts:463](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L463)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:474](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L474)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:462](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L462)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:461](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L461)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:455](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L455)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:451](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L451)
