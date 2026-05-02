'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getCourses, createCourse, updateCourse, deleteCourse, assignCourseToUser } from '@/lib/db/courses';
import { firebaseDB } from '@/lib/firebase/database';
import { firebaseStorage } from '@/lib/firebase/storage';
import { Course, User, CourseAssignment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Plus, 
  Settings2, 
  Trash2, 
  Users, 
  UserPlus,
  CheckCircle2, 
  FileText, 
  Video, 
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Link as LinkIcon,
  X,
  AlertCircle,
  Search,
  Check,
  Smartphone,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SplashScreen } from '@/components/ui/splash-screen';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { cn } from '@/lib/utils';

export default function LearningAdminPage() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [alreadyAssignedIds, setAlreadyAssignedIds] = useState<Set<string>>(new Set());
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  // Course Form State
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'safety',
    content: [{ type: 'text', body: '' }],
    estimatedMinutes: 15,
    isPublished: true,
    isCertification: false,
    validityMonths: 12
  });

  useEffect(() => {
    if (dbUser?.orgId) {
      loadData();
    }
  }, [dbUser]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [orgCourses, orgUsers] = await Promise.all([
        getCourses(dbUser!.orgId),
        firebaseDB.getUsers(dbUser!.orgId)
      ]);
      setCourses(orgCourses);
      setAllUsers(orgUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !dbUser?.orgId) return;

    setUploadProgress(0);
    setActiveUploadIndex(index);
    try {
      const timestamp = Date.now();
      const path = `organizations/${dbUser.orgId}/learning/${timestamp}_${file.name}`;
      const url = await firebaseStorage.uploadFile(path, file);
      
      const updatedContent = [...(courseData.content || [])];
      updatedContent[index] = { ...updatedContent[index], url };
      setCourseData({ ...courseData, content: updatedContent });
      
      toast({ title: "Fil lastet opp" });
    } catch (error) {
      toast({ title: "Opplasting feilet", variant: "destructive" });
    } finally {
      setUploadProgress(null);
      setActiveUploadIndex(null);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseData.title || !courseData.description) return;
    
    setIsSubmitting(true);
    try {
      if (editingCourseId) {
          await updateCourse(editingCourseId, courseData);
          toast({ title: "Kurs oppdatert" });
      } else {
          await createCourse({
            orgId: dbUser!.orgId,
            title: courseData.title!,
            description: courseData.description!,
            category: courseData.category as any,
            content: courseData.content as any,
            estimatedMinutes: courseData.estimatedMinutes,
            isPublished: courseData.isPublished ?? true,
            isCertification: courseData.isCertification || false,
            validityMonths: courseData.validityMonths || 12,
            requiredRoles: []
          });
          toast({ title: "Kurs opprettet" });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: "Feil", description: "Kunne ikke lagre kurset.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
      setEditingCourseId(null);
      setCourseData({ 
        title: '', 
        description: '', 
        category: 'safety', 
        content: [{ type: 'text', body: '' }], 
        estimatedMinutes: 15, 
        isPublished: true,
        isCertification: false,
        validityMonths: 12
      });
  };

  const handleEdit = (course: Course) => {
      setEditingCourseId(course.id);
      setCourseData({
          title: course.title,
          description: course.description,
          category: course.category,
          content: course.content,
          estimatedMinutes: course.estimatedMinutes,
          isPublished: course.isPublished,
          isCertification: course.isCertification || false,
          validityMonths: course.validityMonths || 12
      });
      setIsDialogOpen(true);
  };

  const handleOpenAssignDialog = async (course: Course) => {
      if (!dbUser?.orgId) return;
      setSelectedCourse(course);
      setIsAssignDialogOpen(true);
      
      try {
          const assignmentsRef = collection(db, 'courseAssignments');
          const q = query(
            assignmentsRef, 
            where('orgId', '==', dbUser.orgId),
            where('courseId', '==', course.id)
          );
          const snap = await getDocs(q);
          const assignedIds = new Set(snap.docs.map(d => d.data().userId));
          setAlreadyAssignedIds(assignedIds);
      } catch (e) {
          console.error("Error fetching assignments", e);
      }
  };

  const handleAssignToUser = async (userId: string) => {
    if (!selectedCourse || !dbUser?.orgId) return;
    
    setAssigningUserId(userId);
    try {
      await assignCourseToUser({
        orgId: dbUser.orgId,
        courseId: selectedCourse.id,
        userId: userId,
        status: 'assigned'
      });
      
      setAlreadyAssignedIds(prev => new Set([...Array.from(prev), userId]));
      toast({ title: "Tildelt", description: "Kurset er tildelt brukeren." });
    } catch (e) {
      console.error(e);
      toast({ title: "Feil", description: "Kunne ikke tildele kurs.", variant: "destructive" });
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleAssignToAll = async (courseId: string) => {
    if (!dbUser?.orgId) return;
    if (!confirm("Vil du tildele dette kurset til ALLE brukere i organisasjonen? Dette vil kun legge til nye tildelinger.")) return;
    
    setIsSubmitting(true);
    let assignedCount = 0;
    try {
      // 1. Get existing assignments for this course to avoid duplicates
      const assignmentsRef = collection(db, 'courseAssignments');
      const q = query(
        assignmentsRef, 
        where('orgId', '==', dbUser.orgId),
        where('courseId', '==', courseId)
      );
      const existingSnap = await getDocs(q);
      const assignedUserIds = new Set(existingSnap.docs.map(d => d.data().userId));

      const promises = allUsers
        .filter(user => !assignedUserIds.has(user.id))
        .map(user => {
            assignedCount++;
            return assignCourseToUser({
              orgId: dbUser!.orgId,
              courseId,
              userId: user.id,
              status: 'assigned'
            });
        });
        
      await Promise.all(promises);
      toast({ title: "Tildeling fullført", description: `Kurset er tildelt ${assignedCount} nye brukere.` });
    } catch (e) {
      console.error("Assign to all error:", e);
      toast({ title: "Feil", description: "Kunne ikke tildele kurs.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette dette kurset permanent?") || !dbUser?.orgId) return;
    try {
      await deleteCourse(id, dbUser.orgId);
      setCourses(courses.filter(c => c.id !== id));
      toast({ title: "Kurs slettet" });
    } catch (e) {
      console.error("Delete error:", e);
      toast({ title: "Feil ved sletting", description: "Sjekk at du har rettigheter til å slette dette kurset.", variant: "destructive" });
    }
  };

  const filteredUsers = allUsers.filter(u => 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
      switch(category) {
          case 'safety': return 'Helse & Sikkerhet';
          case 'tools': return 'Digitale Verktøy';
          case 'equipment': return 'Utstyr & Vedlikehold';
          case 'company_policy': return 'Bedriftsregler';
          default: return 'Annet';
      }
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/learning">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Kursadministrasjon</h1>
            <p className="text-slate-500 font-medium text-sm">Opprett og administrer opplæringsmateriell.</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
              <Plus className="mr-2 h-4 w-4" /> Nytt Kurs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                  {editingCourseId ? 'Rediger Kurs' : 'Opprett Nytt Opplæringskurs'}
              </DialogTitle>
              <DialogDescription>Legg til innhold og tildel til de ansatte.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* 1. GENERAL INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Kurstittel</Label>
                  <Input 
                    value={courseData.title} 
                    onChange={e => setCourseData({...courseData, title: e.target.value})} 
                    placeholder="F.eks. Bruk av RettSted-appen"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Kategori</Label>
                  <Select 
                    value={courseData.category} 
                    onValueChange={val => setCourseData({...courseData, category: val as any})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Helse & Sikkerhet</SelectItem>
                      <SelectItem value="tools">Digitale Verktøy</SelectItem>
                      <SelectItem value="equipment">Utstyr & Vedlikehold</SelectItem>
                      <SelectItem value="company_policy">Bedriftsregler</SelectItem>
                      <SelectItem value="other">Annet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Beskrivelse</Label>
                <Textarea 
                   value={courseData.description} 
                   onChange={e => setCourseData({...courseData, description: e.target.value})}
                   placeholder="Kort introduksjon til kurset..."
                   className="min-h-[80px]"
                />
              </div>

              {/* 2. CERTIFICATION SETTINGS */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-indigo-600" />
                          <Label className="font-bold text-indigo-900">Sertifisering</Label>
                      </div>
                      <Switch 
                        checked={courseData.isCertification} 
                        onCheckedChange={val => setCourseData({...courseData, isCertification: val})} 
                      />
                  </div>
                  
                  {courseData.isCertification && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-indigo-700">Varighet (Måneder)</Label>
                              <Input 
                                type="number" 
                                value={courseData.validityMonths} 
                                onChange={e => setCourseData({...courseData, validityMonths: Number(e.target.value)})}
                                className="bg-white"
                              />
                              <p className="text-[10px] text-indigo-500">Hvor lenge er sertifiseringen gyldig etter fullføring?</p>
                          </div>
                          <div className="flex items-center justify-center p-3 bg-white rounded-lg border border-indigo-100">
                             <div className="text-center">
                                 <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                                 <p className="text-xs font-bold text-indigo-700">Utløper etter {courseData.validityMonths} mnd</p>
                             </div>
                          </div>
                      </div>
                  )}
              </div>

              {/* 3. CONTENT */}
              <div className="space-y-4 border-t pt-6">
                 <div className="flex items-center justify-between">
                    <Label className="text-lg font-black flex items-center gap-2">
                       <FileText className="h-5 w-5 text-indigo-500" /> Leksjoner
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCourseData({...courseData, content: [...(courseData.content || []), { type: 'text', body: '' }]})}
                      className="font-bold"
                    >
                      + Legg til
                    </Button>
                 </div>

                 <div className="space-y-4">
                    {courseData.content?.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow-sm text-slate-400 hover:text-red-500"
                          onClick={() => {
                            const updated = [...(courseData.content || [])];
                            updated.splice(idx, 1);
                            setCourseData({...courseData, content: updated});
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Type</Label>
                            <Select 
                              value={item.type} 
                              onValueChange={val => {
                                const updated = [...(courseData.content || [])];
                                updated[idx] = { ...updated[idx], type: val as any, url: '', body: '' };
                                setCourseData({...courseData, content: updated});
                              }}
                            >
                              <SelectTrigger className="h-9 text-xs font-bold"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Tekst</SelectItem>
                                <SelectItem value="pdf">PDF Fil</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="link">Lenke</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-3 space-y-1.5">
                            {item.type === 'text' ? (
                              <Textarea 
                                className="min-h-[80px] text-sm bg-white" 
                                value={item.body}
                                onChange={e => {
                                  const updated = [...(courseData.content || [])];
                                  updated[idx].body = e.target.value;
                                  setCourseData({...courseData, content: updated});
                                }}
                              />
                            ) : (
                              <div className="flex gap-2">
                                <Input 
                                  className="h-9 text-xs bg-white" 
                                  placeholder={item.type === 'link' ? "https://..." : "Velg fil eller lim inn URL"}
                                  value={item.url || ''}
                                  onChange={e => {
                                    const updated = [...(courseData.content || [])];
                                    updated[idx].url = e.target.value;
                                    setCourseData({...courseData, content: updated});
                                  }}
                                />
                                {(item.type === 'pdf' || item.type === 'video') && (
                                  <div className="relative">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-9 w-9 shrink-0 border-indigo-200 text-indigo-600 bg-white"
                                      onClick={() => {
                                         setActiveUploadIndex(idx);
                                         fileInputRef.current?.click();
                                      }}
                                      disabled={uploadProgress !== null}
                                    >
                                      {uploadProgress !== null && activeUploadIndex === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    </Button>
                                    <input 
                                      type="file" 
                                      ref={fileInputRef} 
                                      className="hidden" 
                                      accept={item.type === 'pdf' ? '.pdf' : 'video/*'}
                                      onChange={(e) => handleFileUpload(e, activeUploadIndex ?? idx)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <DialogFooter className="border-t pt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Avbryt</Button>
              <Button onClick={handleSaveCourse} disabled={isSubmitting || !courseData.title}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingCourseId ? 'Oppdater Kurs' : 'Lagre og Publiser Kurs'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* INDIVIDUAL ASSIGNMENT DIALOG */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
              <DialogHeader className="p-6 bg-slate-50 border-b">
                  <DialogTitle className="text-xl font-black">Tildel til person</DialogTitle>
                  <DialogDescription className="font-medium">
                      Velg ansatte som skal gjennomføre <strong>{selectedCourse?.title}</strong>.
                  </DialogDescription>
              </DialogHeader>

              <div className="p-4 space-y-4">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                          placeholder="Søk på navn eller e-post..." 
                          className="pl-10 h-10"
                          value={userSearchTerm}
                          onChange={e => setUserSearchTerm(e.target.value)}
                      />
                  </div>

                  <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                          {filteredUsers.map(user => {
                              const isAssigned = alreadyAssignedIds.has(user.id);
                              const isProcessing = assigningUserId === user.id;

                              return (
                                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                                      <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-sm text-slate-900 truncate">{user.name}</span>
                                          <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                                      </div>
                                      
                                      {isAssigned ? (
                                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1 font-bold h-8">
                                              <Check className="h-3 w-3" /> Tildelt
                                          </Badge>
                                      ) : (
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 font-bold border-indigo-200 text-indigo-700"
                                            onClick={() => handleAssignToUser(user.id)}
                                            disabled={isProcessing}
                                          >
                                              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1.5" />}
                                              Tildel
                                          </Button>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </ScrollArea>
              </div>

              <DialogFooter className="p-4 bg-slate-50 border-t">
                  <Button variant="secondary" className="w-full font-bold" onClick={() => setIsAssignDialogOpen(false)}>
                      Ferdig
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* COURSE LIST */}
      <div className="grid grid-cols-1 gap-4">
        {courses.length === 0 ? (
          <div className="bg-white border-2 border-dashed rounded-2xl p-20 text-center">
            <GraduationCap className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Biblioteket er tomt</h3>
            <p className="text-slate-400 mt-2">Opprett ditt første kurs for å komme i gang.</p>
          </div>
        ) : (
          courses.map(course => (
            <Card key={course.id} className="overflow-hidden border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="uppercase font-bold text-[10px] tracking-tighter flex items-center gap-1.5">
                        {course.category === 'tools' ? <Smartphone className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {getCategoryLabel(course.category)}
                    </Badge>
                    {course.isCertification && (
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> SERTIFISERING
                        </Badge>
                    )}
                    {course.isPublished ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold">PUBLISERT</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold text-slate-400">UTKAST</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1 font-medium">{course.description}</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        <FileText className="h-3 w-3" /> {course.content.length} Moduler
                     </span>
                     {course.isCertification && (
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-tight">
                             <CalendarDays className="h-3 w-3" /> Gyldig {course.validityMonths} mnd
                         </span>
                     )}
                  </div>
                </div>
                
                <div className="md:w-80 bg-slate-50/50 border-l border-slate-100 p-6 flex flex-col justify-center gap-2">
                  <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 font-bold text-[10px] h-9 shadow-sm"
                        onClick={() => handleOpenAssignDialog(course)}
                      >
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Enkeltperson
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 font-bold text-[10px] h-9 shadow-sm"
                        onClick={() => handleAssignToAll(course.id)}
                        disabled={isSubmitting}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" /> Alle ansatte
                      </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-9 bg-white shadow-sm font-bold text-xs" onClick={() => handleEdit(course)}>
                      <Settings2 className="h-3.5 w-3.5 mr-1.5 text-slate-600" /> Rediger
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-9 hover:bg-red-50 hover:text-red-600 border-red-100 bg-white shadow-sm font-bold text-xs"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Slett
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
