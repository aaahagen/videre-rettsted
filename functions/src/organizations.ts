
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const deleteOrganization = functions.https.onCall(async (request) => {
    if (!request.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated to delete an organization."
        );
    }

    const userId = request.auth.uid;
    const db = admin.firestore();

    try {
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "No user found.");
        }

        const userData = userDoc.data();
        const orgId = userData?.orgId;
        const role = userData?.role;

        if (!orgId) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "User is not associated with an organization."
            );
        }

        if (role !== "admin") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only administrators can delete the organization."
            );
        }

        const usersRef = db.collection("users");
        const usersSnap = await usersRef.where("orgId", "==", orgId).get();

        const uidsToDelete: string[] = [];
        usersSnap.forEach((doc) => {
            uidsToDelete.push(doc.id);
        });

        if (uidsToDelete.length > 0) {
            try {
                for (let i = 0; i < uidsToDelete.length; i += 1000) {
                    const batchUids = uidsToDelete.slice(i, i + 1000);
                    await admin.auth().deleteUsers(batchUids);
                }
            } catch (authError) {
                console.error("Error deleting Auth users:", authError);
            }
        }

        const batch = db.batch();

        const plRef = db.collection("places");
        const placesSnap = await plRef.where("orgId", "==", orgId).get();
        placesSnap.forEach((doc) => batch.delete(doc.ref));

        usersSnap.forEach((doc) => batch.delete(doc.ref));

        const invRef = db.collection("invitations");
        const invSnap = await invRef.where("orgId", "==", orgId).get();
        invSnap.forEach((doc) => batch.delete(doc.ref));

        const rRef = db.collection("routes");
        const routesSnap = await rRef.where("orgId", "==", orgId).get();
        routesSnap.forEach((doc) => batch.delete(doc.ref));

        const orgRef = db.collection("organizations").doc(orgId);
        batch.delete(orgRef);

        await batch.commit();

        const bucket = admin.storage().bucket();
        const folderPath = `places/${orgId}/`;

        try {
            await bucket.deleteFiles({ prefix: folderPath });
        } catch (storageError) {
            console.error(`Storage err ${folderPath}:`, storageError);
        }

        return { success: true, message: "Organization deleted." };
    } catch (error: unknown) {
        console.error("Error deleting organization:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError(
            "internal",
            "An error occurred while deleting the organization."
        );
    }
});
