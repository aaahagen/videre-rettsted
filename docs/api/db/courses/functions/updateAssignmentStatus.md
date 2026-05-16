[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/courses](../README.md) / updateAssignmentStatus

# Function: updateAssignmentStatus()

> **updateAssignmentStatus**(`id`, `status`, `progress?`): `Promise`\<`void`\>

Defined in: [db/courses.ts:172](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/courses.ts#L172)

Oppdaterer status og fremdrift for en kurstildeling.

Hvis status settes til 'completed', vil funksjonen automatisk beregne 
utløpsdato dersom kurset er markert som en sertifisering.

## Parameters

### id

`string`

Identifikatoren til tildelingen.

### status

`"completed"` \| `"expired"` \| `"in_progress"` \| `"assigned"`

Den nye statusen (f.eks. 'in_progress', 'completed').

### progress?

`number`

Valgfri prosentvis fremdrift (0-100).

## Returns

`Promise`\<`void`\>
