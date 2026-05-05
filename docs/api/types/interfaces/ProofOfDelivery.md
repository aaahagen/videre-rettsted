[**VIDERE RettSted Internal API**](../../README.md)

***

[VIDERE RettSted Internal API](../../README.md) / [types](../README.md) / ProofOfDelivery

# Interface: ProofOfDelivery

Defined in: [types.ts:389](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L389)

## Properties

### coordinates?

> `optional` **coordinates?**: `object`

Defined in: [types.ts:392](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L392)

#### accuracy?

> `optional` **accuracy?**: `number`

#### lat

> **lat**: `number`

#### lng

> **lng**: `number`

***

### damageDetails?

> `optional` **damageDetails?**: `string`

Defined in: [types.ts:419](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L419)

***

### damageReported?

> `optional` **damageReported?**: `boolean`

Defined in: [types.ts:418](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L418)

***

### deliveryMethod?

> `optional` **deliveryMethod?**: `"handed_to_recipient"` \| `"left_at_door"` \| `"left_in_safe_place"` \| `"mailroom_reception"` \| `"neighbor"`

Defined in: [types.ts:398](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L398)

***

### failureReason?

> `optional` **failureReason?**: `"other"` \| `"recipient_unavailable"` \| `"address_not_found"` \| `"access_denied"` \| `"package_damaged_refused"`

Defined in: [types.ts:417](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L417)

***

### notes?

> `optional` **notes?**: `string`

Defined in: [types.ts:422](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L422)

***

### photos?

> `optional` **photos?**: `object`[]

Defined in: [types.ts:406](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L406)

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

Defined in: [types.ts:403](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L403)

***

### scannedBarcodes?

> `optional` **scannedBarcodes?**: `string`[]

Defined in: [types.ts:414](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L414)

***

### signatureName?

> `optional` **signatureName?**: `string`

Defined in: [types.ts:402](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L402)

***

### signatureUrl?

> `optional` **signatureUrl?**: `string`

Defined in: [types.ts:401](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L401)

***

### status

> **status**: `"successful"` \| `"partially_successful"` \| `"failed_attempt"`

Defined in: [types.ts:395](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L395)

***

### timestamp

> **timestamp**: `any`

Defined in: [types.ts:391](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/types.ts#L391)
