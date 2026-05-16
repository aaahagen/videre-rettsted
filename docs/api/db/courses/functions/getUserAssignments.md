[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/courses](../README.md) / getUserAssignments

# Function: getUserAssignments()

> **getUserAssignments**(`userId`): `Promise`\<[`CourseAssignment`](../../../types/interfaces/CourseAssignment.md)[]\>

Defined in: [db/courses.ts:136](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/courses.ts#L136)

Henter alle aktive og fullførte kurstildelinger for en bruker.

## Parameters

### userId

`string`

Brukerens ID.

## Returns

`Promise`\<[`CourseAssignment`](../../../types/interfaces/CourseAssignment.md)[]\>

En Promise med listen over tildelte kurs.
