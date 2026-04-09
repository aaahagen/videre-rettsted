import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const deleteOldWorkLogs = functions.pubsub.schedule("0 0 * * *") // Runs every day at midnight
    .timeZone("Europe/Oslo") // Set appropriate timezone
    .onRun(async (context) => {
        const db = admin.firestore();
        
        // Calculate the date 3 years ago
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

        const workLogsRef = db.collection("workLogs");
        
        // Find logs where 'actualPunchIn' is older than 3 years
        const query = workLogsRef.where("actualPunchIn", "<", threeYearsAgo.toISOString());
        
        try {
            const snapshot = await query.get();
            
            if (snapshot.empty) {
                console.log("No old worklogs found.");
                return null;
            }

            const batch = db.batch();
            let count = 0;

            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
            });

            await batch.commit();
            console.log(`Successfully deleted ${count} old worklogs.`);
            return null;
        } catch (error) {
            console.error("Error deleting old worklogs:", error);
            return null;
        }
    });
