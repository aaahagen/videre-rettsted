'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { firebaseDB } from '@/lib/firebase/database';
import { Message, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, MessageSquare, Check, CheckCheck, Users, Trash2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearch } from '@/hooks/use-search';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function MessagesPage() {
  const { user: authUser, dbUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all_drivers');
  const [isSending, setIsSending] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { query: searchQuery } = useSearch();

  useEffect(() => {
    if (!dbUser?.orgId || !dbUser?.id) return;

    // Fetch users for display names
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await firebaseDB.getUsers(dbUser.orgId);
        const usersMap: Record<string, User> = {};
        fetchedUsers.forEach(u => usersMap[u.id] = u);
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();

    // Listen to messages
    const messagesRef = collection(db, 'messages');
    
    // Admins see all messages in the org. Drivers see broadcasts + direct messages to them.
    let q;
    if (dbUser.role === 'admin') {
         q = query(
            messagesRef, 
            where('orgId', '==', dbUser.orgId),
            orderBy('createdAt', 'asc')
        );
    } else {
        // Drivers see messages sent to 'all_drivers', 'all', or directly to them
        // Firestore doesn't support OR queries across different fields easily with ordering,
        // so we'll fetch all org messages and filter client-side for simplicity and speed.
        q = query(
            messagesRef, 
            where('orgId', '==', dbUser.orgId),
            orderBy('createdAt', 'asc')
        );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() } as Message;
          
          if (dbUser.role === 'admin') {
              msgs.push(data);
          } else {
             // Client-side filter for drivers
             if (data.recipientId === 'all' || data.recipientId === 'all_drivers' || data.recipientId === dbUser.id || data.senderId === dbUser.id) {
                 msgs.push(data);
             }
          }
      });
      setMessages(msgs);
      setLoading(false);
      
      // Mark visible messages as read
      msgs.forEach(msg => {
          if (msg.senderId !== dbUser.id && !(msg.readBy || []).includes(dbUser.id)) {
             markAsRead(msg.id);
          }
      });
      
    }, (error) => {
      console.error("Error listening to messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dbUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markAsRead = async (messageId: string) => {
      if (!dbUser) return;
      try {
          const msgRef = doc(db, 'messages', messageId);
          await updateDoc(msgRef, {
              readBy: arrayUnion(dbUser.id)
          });
      } catch (err) {
          console.error("Error marking message as read:", err);
      }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !dbUser?.orgId) return;

    setIsSending(true);
    try {
      const msgData: Partial<Message> = {
        orgId: dbUser.orgId,
        senderId: dbUser.id,
        recipientId: selectedRecipient,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        readBy: [dbUser.id], // Sender has read it
        type: ['all', 'all_drivers', 'all_admins'].includes(selectedRecipient) ? 'broadcast' : 'direct'
      };

      await addDoc(collection(db, 'messages'), msgData);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Feil", description: "Kunne ikke sende meldingen.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async () => {
      if (!messageToDelete) return;
      
      try {
          await deleteDoc(doc(db, 'messages', messageToDelete));
          toast({ title: "Slettet", description: "Meldingen ble slettet." });
      } catch (error) {
          console.error("Error deleting message:", error);
          toast({ title: "Feil", description: "Kunne ikke slette meldingen.", variant: "destructive" });
      } finally {
          setMessageToDelete(null);
      }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm - dd.MM.yy');
  };

  const filteredMessages = messages.filter(msg => {
      if (!searchQuery) return true;
      
      const q = searchQuery.toLowerCase();
      const contentMatch = msg.content.toLowerCase().includes(q);
      const sender = users[msg.senderId];
      const senderNameMatch = sender && (sender.name?.toLowerCase().includes(q) || sender.email?.toLowerCase().includes(q));
      
      return contentMatch || senderNameMatch;
  });

  if (loading || !dbUser) {
    return <SplashScreen />;
  }

  const isAdmin = dbUser.role === 'admin';

  return (
    <>
    <div className="container mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Meldinger
        </h1>
        <p className="text-muted-foreground mt-2">
          Intern kommunikasjon og oppdateringer.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
        {/* Recipient Selection (Admins only) */}
        {isAdmin && (
           <div className="p-4 border-b bg-slate-50/50 flex items-center gap-4 shrink-0">
               <span className="text-sm font-medium text-slate-600">Til:</span>
               <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger className="w-[280px] bg-white">
                    <SelectValue placeholder="Velg mottaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_drivers">
                        <div className="flex items-center gap-2 font-medium text-blue-600">
                            <Users className="h-4 w-4" /> Alle Sjåfører (Kringkasting)
                        </div>
                    </SelectItem>
                    <SelectItem value="all_admins">Alle Administratorer</SelectItem>
                    <SelectItem value="all">Hele Organisasjonen</SelectItem>
                    {/* List individual users */}
                    {Object.values(users).filter(u => u.id !== dbUser.id).map(u => (
                        <SelectItem key={u.id} value={u.id}>
                            {u.name || u.email} {u.role === 'admin' ? '(Admin)' : ''}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
           </div>
        )}
        {!isAdmin && (
             <div className="p-3 border-b bg-slate-50/50 flex items-center justify-center shrink-0">
                 <span className="text-sm font-medium text-slate-600">Meldinger til Admin-teamet</span>
             </div>
        )}

        <ScrollArea className="flex-1 p-4 bg-slate-50/30">
          <div className="flex flex-col gap-4 pr-10">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground h-full">
                <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
                <p>{searchQuery ? 'Ingen meldinger matcher søket ditt.' : 'Ingen meldinger enda.'}</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === dbUser.id;
                const sender = users[msg.senderId];
                const senderName = isMe ? 'Du' : (sender?.name || sender?.email || 'Ukjent');
                const isBroadcast = msg.type === 'broadcast';
                const canDelete = isAdmin || isMe; // Admins can delete any, users can delete their own
                
                // Determine read status for messages I sent
                let readStatusIcon = null;
                if (isMe) {
                    const otherReadersIds = (msg.readBy || []).filter(id => id !== dbUser.id);
                    const hasBeenRead = otherReadersIds.length > 0;

                    if (isBroadcast && isAdmin) {
                         // Determine who should have read it based on the recipient type
                        let expectedReaders: User[] = [];
                        const allOrgUsers = Object.values(users);
                        
                        if (msg.recipientId === 'all') {
                             expectedReaders = allOrgUsers.filter(u => u.id !== dbUser.id);
                        } else if (msg.recipientId === 'all_drivers') {
                             expectedReaders = allOrgUsers.filter(u => u.role === 'driver' && u.id !== dbUser.id);
                        } else if (msg.recipientId === 'all_admins') {
                             expectedReaders = allOrgUsers.filter(u => u.role === 'admin' && u.id !== dbUser.id);
                        }

                        const readUsers = expectedReaders.filter(u => otherReadersIds.includes(u.id));
                        const unreadUsers = expectedReaders.filter(u => !otherReadersIds.includes(u.id));
                        
                        // Calculate percentage for visual feedback (optional)
                        // const percentRead = expectedReaders.length > 0 ? Math.round((readUsers.length / expectedReaders.length) * 100) : 0;

                        readStatusIcon = (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                 <span className="flex items-center gap-1 cursor-help" title="Lest status">
                                    {hasBeenRead ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3 text-slate-400" />}
                                    <span className="text-[10px] text-muted-foreground ml-1">({readUsers.length}/{expectedReaders.length})</span>
                                 </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold">Lest status</h4>
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                     <div>
                                         <span className="font-semibold text-green-600 block mb-1">Lest av:</span>
                                         {readUsers.length > 0 ? (
                                             <ul className="list-disc pl-4 space-y-1">
                                                 {readUsers.map(u => <li key={u.id}>{u.name || u.email}</li>)}
                                             </ul>
                                         ) : <span className="text-muted-foreground italic">Ingen enda</span>}
                                     </div>
                                     <div>
                                         <span className="font-semibold text-slate-500 block mb-1">Venter på:</span>
                                         {unreadUsers.length > 0 ? (
                                             <ul className="list-disc pl-4 space-y-1">
                                                {unreadUsers.map(u => <li key={u.id}>{u.name || u.email}</li>)}
                                             </ul>
                                         ) : <span className="text-muted-foreground italic">Alle har lest</span>}
                                     </div>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                        )

                    } else {
                         // Standard direct message read receipt
                        readStatusIcon = hasBeenRead ? (
                            <span title="Lest"><CheckCheck className="h-3 w-3 text-blue-500" /></span>
                        ) : (
                            <span title="Levert"><Check className="h-3 w-3 text-slate-400" /></span>
                        );
                    }
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'} group relative`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                        {!isMe && <span className="text-xs font-semibold text-slate-600">{senderName}</span>}
                        {isBroadcast && !isMe && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Kunngjøring</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 relative w-full">
                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm break-words relative ${
                            isMe 
                                ? 'bg-primary text-primary-foreground rounded-tr-sm w-full' 
                                : isBroadcast 
                                    ? 'bg-blue-50 border border-blue-100 text-slate-800 rounded-tl-sm w-full'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm w-full'
                        }`}>
                          {msg.content}
                           {canDelete && (
                                 <button 
                                    type="button"
                                    className={`h-8 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 hover:bg-red-50 hover:text-red-600 text-slate-400 ${isMe ? '-left-10' : '-right-10'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMessageToDelete(msg.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1 px-1 opacity-70">
                        <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                        {readStatusIcon}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-white border-t shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Skriv en melding..."
              className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
              disabled={isSending}
            />
            <Button 
                type="submit" 
                size="icon" 
                className="rounded-full shrink-0"
                disabled={!newMessage.trim() || isSending}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>

    <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Slett melding</AlertDialogTitle>
                <AlertDialogDescription>
                    Er du sikker på at du vil slette denne meldingen? Dette kan ikke angres.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Slett
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
