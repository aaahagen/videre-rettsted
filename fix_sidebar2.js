const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetToRemove = `    if (dbUser?.orgId) {
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

content = content.replace(targetToRemove, '');
fs.writeFileSync(file, content);
