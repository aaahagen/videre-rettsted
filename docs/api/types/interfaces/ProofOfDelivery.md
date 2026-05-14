[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:430](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L430)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:433](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L433)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:460](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L460)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:459](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L459)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:439](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L439)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:458](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L458)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:463](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L463)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:447](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L447)

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

Defined in: [types.ts:444](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L444)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:455](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L455)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:443](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L443)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:442](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L442)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:436](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L436)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:432](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L432)
