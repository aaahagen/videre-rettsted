[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/courses](../README.md) / assignCourseToUser

# Function: assignCourseToUser()

> **assignCourseToUser**(`assignment`): `Promise`\<`string`\>

Defined in: [db/courses.ts:120](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/courses.ts#L120)

Tildeler et kurs til en spesifikk bruker.

## Parameters

### assignment

`Omit`\<[`CourseAssignment`](../../../types/interfaces/CourseAssignment.md), `"id"` \| `"assignedAt"`\>

Tildelingsdata (uten ID).

## Returns

`Promise`\<`string`\>

En Promise med ID for tildelingen.

## Example

```typescript
await assignCourseToUser({
  userId: "user_abc",
  courseId: "course_123",
  orgId: "org_99"
});
```
