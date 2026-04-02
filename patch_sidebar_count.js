const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = `import { Organization, User } from '@/lib/types';`;
const newImport = `import { Organization, User } from '@/lib/types';
import { collection, query, where, onSnapshot as onSnapshotFirestore } from 'firebase/firestore';`;

content = content.replace(targetImport, newImport);

const targetState = `  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();
  const [isLegalOpen, setIsLegalOpen] = useState(false);`;

const newState = `  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);`;

content = content.replace(targetState, newState);

const targetEffect = `  // Changed to real-time listener to handle permission propagation delays
  useEffect(() => {
    let unsubscribe: () => void;`;

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

const targetMenuItem = `                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                    </SidebarMenuButton>`;

const newMenuItem = `                    <Link href={item.href} className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                           <item.icon />
                           <span>{item.label}</span>
                        </div>
                        {item.href === '/dashboard/messages' && unreadMessages > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                                {unreadMessages}
                            </span>
                        )}
                    </Link>
                    </SidebarMenuButton>`;

content = content.replace(targetMenuItem, newMenuItem);

fs.writeFileSync(file, content);
