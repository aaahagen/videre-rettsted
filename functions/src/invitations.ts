import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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

        if (role !== "admin" && role !== "super_admin") {
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

        let uid: string;
        try {
            // Attempt to create the user in Auth
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: name,
            });
            uid = userRecord.uid;
        } catch (authError: unknown) {
            const e = authError as { code?: string };
            
            // If the user already exists in Auth, let's see if we can finish their setup
            if (e.code === "auth/email-already-exists") {
                const existingUser = await admin.auth().getUserByEmail(email);
                uid = existingUser.uid;
                
                // Check if the user already has a document in Firestore
                const userDoc = await db.collection("users").doc(uid).get();
                if (userDoc.exists) {
                     throw new functions.https.HttpsError(
                        "already-exists",
                        "Denne e-postadressen er allerede i bruk av en aktiv konto."
                    );
                }
                
                // If they exist in Auth but not in Firestore, we update their password and proceed
                await admin.auth().updateUser(uid, {
                    password: password,
                    displayName: name
                });
                
                console.log("User existed in Auth but not DB. Updated password and finishing setup for UID:", uid);
            } else if (e.code === "auth/invalid-password") {
                throw new functions.https.HttpsError(
                    "invalid-argument",
                    "Passordet må være minst 6 tegn."
                );
            } else {
                throw new functions.https.HttpsError(
                    "internal",
                    "Kunne ikke opprette bruker: " + (authError instanceof Error ? authError.message : "Ukjent feil")
                );
            }
        }

        const batch = db.batch();

        const userRef = db.collection("users").doc(uid);
        
        const userData: any = {
            name: name,
            email: email,
            orgId: orgId,
            role: role,
            favorites: [],
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (role === 'contractor') {
            userData.employmentType = 'external';
        }

        batch.set(userRef, userData);

        // Mark invitation as accepted instead of deleting it, or delete it
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
