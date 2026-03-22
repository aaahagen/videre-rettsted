import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getInvitations = functions.https.onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to fetch invitations."
    );
  }

  const userId = request.auth.uid;

  try {
    // 1. Get the user's organization ID
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User document not found."
      );
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
        "Only administrators can view invitations."
      );
    }

    const invitationsSnapshot = await admin
      .firestore()
      .collection("invitations")
      .where("orgId", "==", orgId)
      .get();

    const invitations: unknown[] = [];
    invitationsSnapshot.forEach((doc) => {
      invitations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return invitations;
  } catch (error: unknown) {
    console.error("Error fetching invitations:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while fetching invitations."
    );
  }
});
