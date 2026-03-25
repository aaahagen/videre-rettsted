
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const deleteUser = functions.https.onCall(async (request) => {
    const auth = request.auth;
    if (!auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be authenticated to perform this action."
        );
    }

    const callerUid = auth.uid;
    const userIdToDelete = request.data.userId;

    if (!userIdToDelete) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with a \"userId\" argument."
        );
    }

    const db = admin.firestore();

    try {
        const callerDocRef = db.collection("users").doc(callerUid);
        const callerDoc = await callerDocRef.get();

        if (!callerDoc.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Caller's user document not found."
            );
        }

        const callerData = callerDoc.data();
        if (callerData?.role !== "admin") {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Only administrators can delete users."
            );
        }

        const userToDeleteDocRef = db.collection("users").doc(userIdToDelete);
        const userToDeleteDoc = await userToDeleteDocRef.get();

        if (userToDeleteDoc.exists) {
            const userToDeleteData = userToDeleteDoc.data();
            if (userToDeleteData?.orgId !== callerData.orgId) {
                throw new functions.https.HttpsError(
                    "permission-denied",
                    "Administrators can only delete users within their own organization."
                );
            }
        }

        await admin.auth().deleteUser(userIdToDelete);

        if (userToDeleteDoc.exists) {
            await userToDeleteDocRef.delete();
        }

        return {
            success: true,
            message: `Successfully deleted user ${userIdToDelete}.`,
        };
    } catch (error: unknown) {
        console.error("Error deleting user:", error);

        const firebaseError = error as { code?: string };
        if (firebaseError.code === "auth/user-not-found") {
            try {
                const userToDeleteDocRef =
                    db.collection("users").doc(userIdToDelete);
                await userToDeleteDocRef.delete();
                return {
                    success: true,
                    message: "User's auth record not found, but DB record was deleted.",
                };
            } catch (dbError) {
                throw new functions.https.HttpsError(
                    "internal",
                    "Auth record not found, and an error occurred deleting from DB."
                );
            }
        }

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            "internal",
            "An unexpected error occurred while deleting the user."
        );
    }
});
