[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:379](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L379)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:382](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L382)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:409](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L409)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:408](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L408)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:388](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L388)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:407](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L407)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:412](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L412)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:396](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L396)

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

Defined in: [types.ts:393](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L393)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:404](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L404)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:392](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L392)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:391](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L391)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:385](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L385)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:381](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L381)
