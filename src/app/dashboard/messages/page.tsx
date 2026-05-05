'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy, 
  doc, 
  updateDoc, 
  arrayUnion,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { Message, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Users, 
  User as UserIcon, 
  Shield, 
  Search, 
  Circle, 
  CheckCheck,
  MoreVertical,
  Trash2,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const { dbUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'broadcast'>('broadcast');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allOrgUsers, setAllOrgUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!dbUser?.orgId) return;

    // Fetch all users in organization
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('orgId', '==', dbUser.orgId));
      const snap = await getDocs(q);
      const users = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      setAllOrgUsers(users.filter(u => u.id !== dbUser.id));
    };
    fetchUsers();

    // Listen for messages
    const q = query(
      collection(db, 'messages'),
      where('orgId', '==', dbUser.orgId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [dbUser?.orgId, dbUser?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !dbUser) return;

    const recipientId = activeTab === 'broadcast' ? 'all' : selectedUser?.id;
    if (!recipientId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        orgId: dbUser.orgId,
        senderId: dbUser.id,
        recipientId,
        content: newMessage,
        createdAt: serverTimestamp(),
        readBy: [dbUser.id],
        type: activeTab
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!dbUser) return;
    const msg = messages.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(dbUser.id)) {
      await updateDoc(doc(db, 'messages', messageId), {
        readBy: arrayUnion(dbUser.id)
      });
    }
  };

  const isPrivileged = dbUser?.role === 'admin' || dbUser?.role === 'super_admin';

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'broadcast') {
      return m.type === 'broadcast';
    } else {
      if (!selectedUser) return false;
      return m.type === 'direct' && (
        (m.senderId === dbUser?.id && m.recipientId === selectedUser.id) ||
        (m.senderId === selectedUser.id && m.recipientId === dbUser?.id)
      );
    }
  });

  const unreadCount = (userId: string) => {
    return messages.filter(m => 
      m.type === 'direct' && 
      m.senderId === userId && 
      m.recipientId === dbUser?.id && 
      !m.readBy.includes(dbUser?.id || '')
    ).length;
  };

  const filteredUsers = allOrgUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!dbUser) return null;

  const isAdmin = isPrivileged;

  // Type-safe date conversion helper
  const toDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    return new Date();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar - Contacts */}
      <div className="w-full lg:w-80 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b space-y-4">
          <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Meldinger
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Søk i kontakter..." 
              className="pl-9 bg-slate-50 border-none h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <button
              onClick={() => { setActiveTab('broadcast'); setSelectedUser(null); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'broadcast' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeTab === 'broadcast' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-xs uppercase tracking-widest">Felleskanalen</p>
                <p className="text-[10px] opacity-70">Viktige beskjeder til alle</p>
              </div>
            </button>

            <div className="pt-4 pb-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Direktemeldinger</div>
            
            {filteredUsers.map(u => (
              <button
                key={u.id}
                onClick={() => { setActiveTab('direct'); setSelectedUser(u); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedUser?.id === u.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarImage src={u.avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
                    {u.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left truncate">
                  <p className="font-bold text-sm truncate">
                    {u.name || u.email} {u.role === 'admin' || u.role === 'super_admin' ? '(Admin)' : ''}
                  </p>
                  <p className="text-[10px] opacity-70 truncate uppercase tracking-tighter font-medium">{u.role}</p>
                </div>
                {unreadCount(u.id) > 0 && (
                  <Badge className="bg-blue-600 text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] animate-bounce">
                    {unreadCount(u.id)}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Chat Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {activeTab === 'broadcast' ? (
              <>
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800 uppercase tracking-tight">Felleskanalen</h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Alle ansatte</p>
                </div>
              </>
            ) : selectedUser ? (
              <>
                <Avatar className="h-10 w-10 border-2 border-blue-50 shadow-sm">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="bg-blue-600 text-white font-black">{selectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-black text-slate-800 uppercase tracking-tight">{selectedUser.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tilgjengelig</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 font-medium">Velg en samtale for å starte</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <ScrollArea className="flex-1 p-6 bg-slate-50/50">
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-30">
                <div className="p-6 bg-slate-100 rounded-full">
                  <MessageSquare className="h-12 w-12 text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ingen meldinger ennå</p>
              </div>
            ) : (
              filteredMessages.map((m, idx) => {
                const isMe = m.senderId === dbUser.id;
                const sender = allOrgUsers.find(u => u.id === m.senderId) || (isMe ? dbUser : null);
                
                const showDate = idx === 0 || 
                  format(toDate(messages[idx-1].createdAt), 'yyyy-MM-dd') !== 
                  format(toDate(m.createdAt), 'yyyy-MM-dd');

                return (
                  <div key={m.id} className="space-y-2">
                    {showDate && m.createdAt && (
                      <div className="flex justify-center my-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-4 py-1 rounded-full border border-slate-100 shadow-sm">
                          {format(toDate(m.createdAt), "eeee d. MMMM", { locale: nb })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 shrink-0 border border-white shadow-sm">
                          <AvatarImage src={sender?.avatarUrl} />
                          <AvatarFallback className="text-[10px] font-black">{sender?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && activeTab === 'broadcast' && (
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{sender?.name}</span>
                        )}
                        <div 
                          onMouseEnter={() => !isMe && markAsRead(m.id)}
                          className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none hover:shadow-md'
                        }`}
                        >
                          {m.content}
                        </div>
                        <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {m.createdAt ? format(toDate(m.createdAt), 'HH:mm') : 'Sender...'}
                          </span>
                          {isMe && (
                            <span className="text-blue-500">
                                {activeTab === 'broadcast' ? (
                                    <div className="flex -space-x-1">
                                        {m.readBy.length > 1 ? <CheckCheck className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                                    </div>
                                ) : (
                                    m.readBy.includes(selectedUser?.id || '') ? <CheckCheck className="h-3 w-3" /> : <Circle className="h-3 w-3" />
                                )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-white border-t sticky bottom-0 z-10">
          {(activeTab === 'direct' && !selectedUser) ? (
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs font-bold uppercase tracking-widest">
              Velg en mottaker for å sende melding
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={activeTab === 'broadcast' ? "Skriv en fellesbeskjed..." : `Melding til ${selectedUser?.name}...`}
                  className="bg-slate-50 border-none h-12 pr-12 focus-visible:ring-blue-600 rounded-xl shadow-inner font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   {/* Emoji or Attachment icons could go here */}
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!newMessage.trim()} 
                className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
