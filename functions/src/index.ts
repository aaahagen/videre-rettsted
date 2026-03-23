import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getInvitations = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to fetch invitations."
    );
  }

  const userId = request.auth.uid;

  try {
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

export const acceptInvitation = functions.https.onCall(async (request) => {
  const data = request.data;
  const inviteId = data.inviteId;
  const password = data.password;
  const name = data.name;

  if (!inviteId || !password || !name) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: inviteId, password, or name."
    );
  }

  const db = admin.firestore();

  try {
    const inviteRef = db.collection("invitations").doc(inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Invitation not found or has already been used."
      );
    }

    const inviteData = inviteSnap.data();

    if (!inviteData) {
      throw new functions.https.HttpsError("internal", "No invite data.");
    }

    if (inviteData.status === "accepted") {
      throw new functions.https.HttpsError(
        "already-exists",
        "This invitation has already been used."
      );
    }

    if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "This invitation has expired."
      );
    }

    const email = inviteData.email;
    const orgId = inviteData.orgId;
    const role = inviteData.role;

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
      });
    } catch (authError: unknown) {
      const e = authError as { code?: string };
      if (e.code === "auth/email-already-exists") {
        throw new functions.https.HttpsError(
          "already-exists",
          "Email already in use."
        );
      }
      if (e.code === "auth/invalid-password") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Password must be at least 6 characters."
        );
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create user"
      );
    }

    const uid = userRecord.uid;

    const batch = db.batch();

    const userRef = db.collection("users").doc(uid);
    batch.set(userRef, {
      name: name,
      email: email,
      orgId: orgId,
      role: role,
      favorites: [],
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.delete(inviteRef);
    await batch.commit();

    return {
      success: true,
      uid: uid,
    };
  } catch (error: unknown) {
    console.error("Error accepting invitation:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while accepting the invitation."
    );
  }
});

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

export const deleteUser = functions.https.onCall(async (request, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be authenticated to perform this action."
    );
  }

  const callerUid = context.auth.uid;
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
