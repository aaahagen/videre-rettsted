# Testing Guide: VIDERE RettSted

This document outlines how to manually verify and test specific complex backend features and automated tasks within the application.

## GDPR Compliance & Data Retention

### 1. Audit Logging (`admin_view_worklog`)

Whenever an administrator views the time stamps (work logs) of drivers in the Time Approvals module, the system must securely log this action.

**How to verify:**
1. Start the local development server (`npm run dev`).
2. Log into the application using an account with the `admin` role.
3. Ensure the admin's organization has at least one pending work log (a driver must have stamped in/out).
4. Navigate to the **Workforce** page (`/dashboard/workforce`). This renders the `TimeApprovals` component.
5. Open the [Firebase Console](https://console.firebase.google.com/) for the project.
6. Navigate to **Firestore Database** -> **`logs`** collection.
7. **Expected Result:** You should see a new document created almost immediately with the following structure:
   - `action`: `"admin_view_worklog"`
   - `orgId`: The admin's organization ID.
   - `userId`: The UID of the admin who viewed the page.
   - `details`: An object containing the `workLogId` and `driverId`.
   - `timestamp`: The server timestamp of the event.

### 2. Data Retention Cronjob (`deleteOldWorkLogs`)

To comply with GDPR, a scheduled background job (Firebase Cloud Function) runs daily at midnight (Europe/Oslo) to permanently delete any driver `workLogs` where the `actualPunchIn` date is older than 3 years.

**How to verify (Force Run):**
1. Open the [Firebase Console](https://console.firebase.google.com/) and go to **Firestore Database**.
2. Navigate to the **`workLogs`** collection.
3. Manually create a dummy document (or edit an existing test document) and set the `actualPunchIn` field (string) to a date **older than 3 years** (e.g., `"2020-01-01T08:00:00.000Z"`). Note the document ID.
4. Open the [Google Cloud Scheduler Console](https://console.cloud.google.com/cloudscheduler) (ensure you are logged into the correct project).
5. Locate the job corresponding to `deleteOldWorkLogs` (it usually starts with `firebase-schedule-deleteOldWorkLogs`).
6. Click the actions menu (three dots) on the right side of the job and select **"Force run"**.
7. **Expected Result (Database):** Return to the Firestore Database in the Firebase Console. The dummy document you created in Step 3 should no longer exist.
8. **Expected Result (Logs):** You can view the execution logs by running the following command in your terminal:
   ```bash
   npm --prefix functions run logs
   ```
   You should see a log entry stating: `Successfully deleted X old worklogs.`
