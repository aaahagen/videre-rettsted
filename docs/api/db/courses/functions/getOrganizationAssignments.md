[**VIDERE RettSted Internal API**](../../../README.md)

***

[VIDERE RettSted Internal API](../../../README.md) / [db/courses](../README.md) / getOrganizationAssignments

# Function: getOrganizationAssignments()

> **getOrganizationAssignments**(`orgId`): `Promise`\<[`CourseAssignment`](../../../types/interfaces/CourseAssignment.md)[]\>

Defined in: [db/courses.ts:151](https://github.com/aaahagen/videre-rettsted/blob/main/src/lib/db/courses.ts#L151)

Henter alle kurstildelinger for en hel organisasjon (for lederoversikt).

## Parameters

### orgId

`string`

Organisasjonens ID.

## Returns

`Promise`\<[`CourseAssignment`](../../../types/interfaces/CourseAssignment.md)[]\>

En Promise med alle tildelinger i organisasjonen.
