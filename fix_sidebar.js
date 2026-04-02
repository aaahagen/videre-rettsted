const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetEffect = `  // Changed to real-time listener to handle permission propagation delays
  useEffect(() => {
    let unsubscribeOrg: () => void;
    let unsubscribeMessages: () => void;

    if (dbUser?.orgId) {
      setOrgLoading(true);
      const orgRef = doc(db, 'organizations', dbUser.orgId);
      
      unsubscribeOrg = onSnapshot(orgRef, (docSnap) => {
        if (docSnap.exists()) {
          setOrg({ ...docSnap.data(), id: docSnap.id } as Organization);
        } else {
          setOrg(null);
        }
        setOrgLoading(false);
      }, (error) => {
        console.error("Error listening to org data:", error);
        setOrgLoading(false);
      });

      // Listen for unread messages
      const messagesRef = collection(db, 'messages');
      const q = query(
          messagesRef,
          where('orgId', '==', dbUser.orgId)
      );

      unsubscribeMessages = onSnapshotFirestore(q, (snapshot) => {
          let count = 0;
          snapshot.forEach(doc => {
              const msg = doc.data();
              
              // Only count if it's meant for me
              let isForMe = false;
              if (dbUser.role === 'admin') {
                  isForMe = true; // Admins see everything
              } else {
                  isForMe = msg.recipientId === 'all' || msg.recipientId === 'all_drivers' || msg.recipientId === dbUser.id;
              }

              // AND I haven't read it AND I didn't send it
              if (isForMe && msg.senderId !== dbUser.id && !(msg.readBy || []).includes(dbUser.id)) {
                  count++;
              }
          });
          setUnreadMessages(count);
      });

    } else {
      setOrg(null);
      setOrgLoading(false);
      setUnreadMessages(0);
    }

    return () => {
      if (unsubscribeOrg) unsubscribeOrg();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [dbUser]);
    let unsubscribe: () => void;

    if (dbUser?.orgId) {
      setOrgLoading(true);
      const orgRef = doc(db, 'organizations', dbUser.orgId);
      
      unsubscribe = onSnapshot(orgRef, (docSnap) => {
        if (docSnap.exists()) {
          setOrg({ ...docSnap.data(), id: docSnap.id } as Organization);
        } else {
          setOrg(null);
        }
        setOrgLoading(false);
      }, (error) => {
        console.error("Error listening to org data:", error);
        // Don't setOrg(null) immediately on error, might be temporary permission issue
        // But do stop loading to prevent infinite skeleton
        setOrgLoading(false);
      });
    } else {
      setOrg(null);
      setOrgLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dbUser]);`;

const newEffect = `  // Changed to real-time listener to handle permission propagation delays
  useEffect(() => {
    let unsubscribeOrg: () => void;
    let unsubscribeMessages: () => void;

    if (dbUser?.orgId) {
      setOrgLoading(true);
      const orgRef = doc(db, 'organizations', dbUser.orgId);
      
      unsubscribeOrg = onSnapshot(orgRef, (docSnap) => {
        if (docSnap.exists()) {
          setOrg({ ...docSnap.data(), id: docSnap.id } as Organization);
        } else {
          setOrg(null);
        }
        setOrgLoading(false);
      }, (error) => {
        console.error("Error listening to org data:", error);
        setOrgLoading(false);
      });

      // Listen for unread messages
      const messagesRef = collection(db, 'messages');
      const q = query(
          messagesRef,
          where('orgId', '==', dbUser.orgId)
      );

      unsubscribeMessages = onSnapshotFirestore(q, (snapshot) => {
          let count = 0;
          snapshot.forEach(doc => {
              const msg = doc.data();
              
              // Only count if it's meant for me
              let isForMe = false;
              if (dbUser.role === 'admin') {
                  isForMe = true; // Admins see everything
              } else {
                  isForMe = msg.recipientId === 'all' || msg.recipientId === 'all_drivers' || msg.recipientId === dbUser.id;
              }

              // AND I haven't read it AND I didn't send it
              if (isForMe && msg.senderId !== dbUser.id && !(msg.readBy || []).includes(dbUser.id)) {
                  count++;
              }
          });
          setUnreadMessages(count);
      });

    } else {
      setOrg(null);
      setOrgLoading(false);
      setUnreadMessages(0);
    }

    return () => {
      if (unsubscribeOrg) unsubscribeOrg();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [dbUser]);`;

content = content.replace(targetEffect, newEffect);
fs.writeFileSync(file, content);
