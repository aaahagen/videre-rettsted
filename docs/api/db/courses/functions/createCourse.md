[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/courses](../README.md) / createCourse

# Function: createCourse()

> **createCourse**(`course`): `Promise`\<`string`\>

Defined in: [db/courses.ts:24](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/courses.ts#L24)

Oppretter et nytt kurs i læringsportalen (LMS).

Kurs kan inneholde moduler, videoer og dokumenter, og kan markeres som 
obligatorisk sertifisering med utløpsdato.

## Parameters

### course

`Omit`\<[`Course`](../../../types/interfaces/Course.md), `"id"` \| `"createdAt"` \| `"updatedAt"`\>

Kursdata (uten ID).

## Returns

`Promise`\<`string`\>

En Promise som løses med dokument-ID for det nye kurset.

## Example

```typescript
const courseId = await createCourse({
  title: "HMS på terminalen",
  orgId: "org_123",
  isCertification: true,
  validityMonths: 12
});
```
