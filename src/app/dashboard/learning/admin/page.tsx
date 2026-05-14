'use client';

import { useState, useEffect, useRef, Suspense, use } from 'react';
import { useAuth } from '@/components/auth-provider';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  assignCourseToUser,
  getOrganizationAssignments,
  updateAssignmentStatus
} from '@/lib/db/courses';
import { Course, User, CourseAssignment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  Edit2, 
  Trash2, 
  UserPlus, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  ExternalLink,
  MoreVertical,
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Save
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SplashScreen } from '@/components/ui/splash-screen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { cn } from '@/lib/utils';

function LearningAdminContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const resolvedSearchParams = use(searchParams);
  const initialTab = (resolvedSearchParams.tab as string) || 'library';
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAssignments, setAllAssignments] = useState<CourseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Course Form State
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'other',
    estimatedMinutes: 15,
    content: [{ type: 'text', body: '' }]
  });

  useEffect(() => {
    if (dbUser?.orgId) {
      loadData();
    }
  }, [dbUser]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [coursesData, assignmentsData] = await Promise.all([
        getCourses(dbUser!.orgId),
        getOrganizationAssignments(dbUser!.orgId)
      ]);
      
      setCourses(coursesData);
      setAllAssignments(assignmentsData);

      // Fetch users for assignment
      const usersSnap = await getDocs(query(collection(db, 'users'), where('orgId', '==', dbUser!.orgId)));
      setAllUsers(usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
    } catch (e) {
      console.error(e);
      toast({ title: 'Feil', description: 'Kunne ikke laste data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !dbUser?.orgId) return;
    
    setIsSubmitting(true);
    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, courseForm);
        toast({ title: 'Oppdatert', description: 'Kurset ble lagret.' });
      } else {
        await createCourse({
          ...courseForm,
          orgId: dbUser.orgId,
          createdBy: dbUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublished: true
        } as Course);
        toast({ title: 'Opprettet', description: 'Nytt kurs er lagt til.' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Feil', description: 'Kunne ikke lagre kurset.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette kurset?')) return;
    try {
      await deleteCourse(id, dbUser!.orgId);
      toast({ title: 'Slettet', description: 'Kurset er fjernet.' });
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Feil', description: 'Kunne ikke slette.', variant: 'destructive' });
    }
  };

  const handleAssign = async (userId: string) => {
    if (!selectedCourse) return;
    try {
      await assignCourseToUser({
        userId,
        courseId: selectedCourse.id,
        orgId: dbUser!.orgId,
        status: 'assigned'
      });
      toast({ title: 'Tildelt', description: 'Kurset er tildelt brukeren.' });
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Feil', description: 'Brukeren har kanskje allerede dette kurset.', variant: 'destructive' });
    }
  };

  const addContentStep = () => {
    setCourseForm({
      ...courseForm,
      content: [...(courseForm.content || []), { type: 'text', body: '' }]
    });
  };

  const removeContentStep = (index: number) => {
    const newContent = [...(courseForm.content || [])];
    newContent.splice(index, 1);
    setCourseForm({ ...courseForm, content: newContent });
  };

  const updateContentStep = (index: number, data: any) => {
    const newContent = [...(courseForm.content || [])];
    newContent[index] = { ...newContent[index], ...data };
    setCourseForm({ ...courseForm, content: newContent });
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Læringsportal</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kursadministrasjon</h1>
          <p className="text-slate-500 font-medium mt-1">Opprett kurs og følg opp ansattes fremgang.</p>
        </div>
        
        <Button 
          onClick={() => {
            setEditingCourseId(null);
            setCourseForm({
              title: '',
              description: '',
              category: 'other',
              estimatedMinutes: 15,
              content: [{ type: 'text', body: '' }]
            });
            setIsDialogOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 rounded-2xl shadow-lg shadow-indigo-100"
        >
          <Plus className="mr-2 h-5 w-5" /> Opprett Kurs
        </Button>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-8">
        <TabsList className="bg-white p-1 rounded-2xl border shadow-sm h-14 w-full md:w-auto">
          <TabsTrigger value="library" className="rounded-xl px-8 h-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-bold">
            <BookOpen className="w-4 h-4 mr-2" /> Kursbibliotek
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-8 h-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 font-bold">
            <BarChart3 className="w-4 h-4 mr-2" /> Ansattstatus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <Card key={course.id} className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group overflow-hidden">
                    <CardHeader className="p-0">
                        <div className="bg-indigo-600 p-8 flex items-center justify-center relative">
                            <GraduationCap className="h-12 w-12 text-indigo-200/50" />
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-white/20 text-white border-none backdrop-blur-md uppercase text-[10px] font-bold">
                                    {course.category}
                                </Badge>
                            </div>
                            <div className="absolute top-4 right-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                        <DropdownMenuItem onClick={() => {
                                            setEditingCourseId(course.id);
                                            setCourseForm(course);
                                            setIsDialogOpen(true);
                                        }} className="rounded-lg font-bold">
                                            <Edit2 className="w-4 h-4 mr-2 text-indigo-600" /> Rediger Kurs
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedCourse(course);
                                            setIsAssignDialogOpen(true);
                                        }} className="rounded-lg font-bold">
                                            <UserPlus className="w-4 h-4 mr-2 text-emerald-600" /> Tildel Ansatte
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(course.id)} className="rounded-lg font-bold text-red-600 focus:text-red-600 focus:bg-red-50">
                                            <Trash2 className="w-4 h-4 mr-2" /> Slett Kurs
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium line-clamp-2 h-10">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{course.estimatedMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">{course.content.length} steg</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">
                                {allAssignments.filter(a => a.courseId === course.id).length} tildelt
                            </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 border-t bg-slate-50/50">
                        <Button variant="ghost" className="w-full h-12 rounded-none font-bold text-indigo-600 hover:bg-indigo-50" onClick={() => {
                             setSelectedCourse(course);
                             setIsAssignDialogOpen(true);
                        }}>
                            Tildel til ansatte <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {courses.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center justify-center">
                        <div className="p-6 bg-slate-50 rounded-full mb-6">
                            <BookOpen className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Ingen kurs ennå</h3>
                        <p className="text-slate-400 max-w-sm text-center font-medium">
                            Begynn med å opprette din organisasjons første kurs for å komme i gang med opplæring.
                        </p>
                    </div>
                )}
            </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
            {/* STATS SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Totale Tildelinger', val: allAssignments.length, icon: Layers, color: 'blue' },
                    { label: 'Fullførte', val: allAssignments.filter(a => a.status === 'completed').length, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Igangsatt', val: allAssignments.filter(a => a.status === 'in_progress').length, icon: Clock, color: 'indigo' },
                    { label: 'Ikke startet', val: allAssignments.filter(a => a.status === 'assigned').length, icon: AlertCircle, color: 'amber' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-slate-200/50">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("p-4 rounded-2xl", {
                                'bg-blue-50 text-blue-600': stat.color === 'blue',
                                'bg-emerald-50 text-emerald-600': stat.color === 'emerald',
                                'bg-indigo-50 text-indigo-600': stat.color === 'indigo',
                                'bg-amber-50 text-amber-600': stat.color === 'amber',
                            })}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ASSIGNMENT TABLE */}
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-white border-b p-8">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Gjennomføringsoversikt
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Ansatt</th>
                                <th className="px-8 py-5">Kurs</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Progresjon</th>
                                <th className="px-8 py-5">Sist oppdatert</th>
                                <th className="px-8 py-5 text-right">Handlinger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {allAssignments.map(assignment => {
                                const user = allUsers.find(u => u.id === assignment.userId);
                                const course = courses.find(c => c.id === assignment.courseId);
                                
                                return (
                                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                                    {user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900">{user?.name || 'Slettet bruker'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-slate-600">{course?.title || 'Slettet kurs'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge className={cn("uppercase text-[10px] font-bold border-none", {
                                                'bg-emerald-100 text-emerald-700': assignment.status === 'completed',
                                                'bg-indigo-100 text-indigo-700': assignment.status === 'in_progress',
                                                'bg-amber-100 text-amber-700': assignment.status === 'assigned',
                                            })}>
                                                {assignment.status === 'completed' ? 'Fullført' : 
                                                 assignment.status === 'in_progress' ? 'I gang' : 'Tildelt'}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full transition-all", {
                                                            'bg-emerald-500': assignment.status === 'completed',
                                                            'bg-indigo-500': assignment.status === 'in_progress',
                                                            'bg-slate-300': assignment.status === 'assigned',
                                                        })} 
                                                        style={{ width: `${assignment.progress}%` }} 
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400">{assignment.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500">
                                                {new Date(assignment.updatedAt instanceof Date ? assignment.updatedAt : (assignment.updatedAt as any).toDate()).toLocaleDateString('nb-NO')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 rounded-full">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE/EDIT COURSE DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl">
              <DialogHeader className="p-8 bg-slate-900 text-white">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Kursbehandling</span>
                  </div>
                  <DialogTitle className="text-3xl font-black tracking-tight">{editingCourseId ? 'Rediger Kurs' : 'Opprett Nytt Kurs'}</DialogTitle>
                  <DialogDescription className="text-slate-400 font-medium">
                      Definer innholdet i opplæringsmodulen din.
                  </DialogDescription>
              </DialogHeader>

              <div className="p-8 space-y-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kurstittel</label>
                        <Input 
                            value={courseForm.title} 
                            onChange={e => setCourseForm({...courseForm, title: e.target.value})}
                            placeholder="f.eks. HMS Grunnkurs"
                            className="h-12 text-lg font-bold bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori</label>
                        <Select 
                            value={courseForm.category as string} 
                            onValueChange={val => setCourseForm({...courseForm, category: val as any})}
                        >
                            <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold">
                                <SelectValue placeholder="Velg kategori" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="safety">HMS & Sikkerhet</SelectItem>
                                <SelectItem value="tools">Verktøy</SelectItem>
                                <SelectItem value="equipment">Utstyr</SelectItem>
                                <SelectItem value="company_policy">Bedriftspolicy</SelectItem>
                                <SelectItem value="other">Annet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Beskrivelse</label>
                    <Textarea 
                        value={courseForm.description} 
                        onChange={e => setCourseForm({...courseForm, description: e.target.value})}
                        placeholder="Gi en kort introduksjon til kurset..."
                        className="min-h-[100px] bg-slate-50 border-none rounded-xl text-base font-medium focus-visible:ring-indigo-500 p-4"
                    />
                </div>

                {/* CONTENT BUILDER */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Kursinnhold</h3>
                        <Button variant="outline" size="sm" onClick={addContentStep} className="font-bold rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                            <Plus className="w-4 h-4 mr-2" /> Legg til steg
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {courseForm.content?.map((step, idx) => (
                            <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 relative group">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeContentStep(idx)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-32">
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Type</label>
                                        <Select 
                                            value={step.type} 
                                            onValueChange={val => updateContentStep(idx, { type: val })}
                                        >
                                            <SelectTrigger className="bg-white border-none h-10 font-bold rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Tekst</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="pdf">PDF</SelectItem>
                                                <SelectItem value="link">Lenke</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Steg {idx + 1}</label>
                                    </div>
                                </div>

                                {step.type === 'text' ? (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Leksjonstekst</label>
                                        <Textarea 
                                            value={step.body} 
                                            onChange={e => updateContentStep(idx, { body: e.target.value })}
                                            className="bg-white border-none min-h-[150px] font-medium rounded-xl p-4"
                                            placeholder="Skriv selve innholdet for dette steget her..."
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">URL / Ressurslenke</label>
                                        <Input 
                                            value={step.url} 
                                            onChange={e => updateContentStep(idx, { url: e.target.value })}
                                            placeholder="https://..."
                                            className="bg-white border-none h-10 font-medium rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <DialogFooter className="p-8 bg-slate-50 border-t sticky bottom-0">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold text-slate-500">Avbryt</Button>
                  <Button 
                    onClick={handleSaveCourse} 
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 h-14 rounded-2xl shadow-lg shadow-indigo-100"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Lagre Kurs
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* ASSIGN COURSE DIALOG */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md p-0 border-none overflow-hidden rounded-3xl">
              <DialogHeader className="p-8 bg-slate-900 text-white">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <UserPlus className="h-5 w-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tildeling</span>
                  </div>
                  <DialogTitle className="text-2xl font-black">Tildel Ansatte</DialogTitle>
                  <p className="text-slate-400 font-medium">{selectedCourse?.title}</p>
              </DialogHeader>

              <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto bg-white">
                  {allUsers.map(user => {
                      const isAssigned = allAssignments.some(a => a.courseId === selectedCourse?.id && a.userId === user.id);
                      
                      return (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center font-black text-slate-400 text-xs">
                                      {user.name?.[0] || 'U'}
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-900">{user.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role}</p>
                                  </div>
                              </div>
                              
                              {isAssigned ? (
                                  <Badge className="bg-emerald-50 text-emerald-600 border-none flex items-center gap-1 font-bold rounded-lg px-3 h-8">
                                      <Check className="h-3 w-3" /> Tildelt
                                  </Badge>
                              ) : (
                                  <Button size="sm" onClick={() => handleAssign(user.id)} className="bg-white hover:bg-slate-100 border text-slate-900 font-bold h-8 rounded-lg px-4">
                                      Tildel
                                  </Button>
                              )}
                          </div>
                      );
                  })}
              </div>

              <DialogFooter className="p-4 bg-slate-50 border-t">
                  <Button variant="secondary" className="w-full font-bold" onClick={() => setIsAssignDialogOpen(false)}>
                      Ferdig
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LearningAdminPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    return (
        <Suspense fallback={<SplashScreen />}>
            <LearningAdminContent searchParams={searchParams} />
        </Suspense>
    );
}
