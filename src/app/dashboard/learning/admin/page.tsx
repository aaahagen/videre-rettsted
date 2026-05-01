'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getCourses, createCourse, updateCourse, deleteCourse, assignCourseToUser } from '@/lib/db/courses';
import { firebaseDB } from '@/lib/firebase/database';
import { firebaseStorage } from '@/lib/firebase/storage';
import { Course, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Plus, 
  Settings2, 
  Trash2, 
  Users, 
  CheckCircle2, 
  FileText, 
  Video, 
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Link as LinkIcon,
  X
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
import { SplashScreen } from '@/components/ui/splash-screen';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LearningAdminPage() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  // New Course State
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'safety',
    content: [{ type: 'text', body: '' }],
    estimatedMinutes: 15,
    isPublished: true
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
      
      const updatedContent = [...(newCourse.content || [])];
      updatedContent[index] = { ...updatedContent[index], url };
      setNewCourse({ ...newCourse, content: updatedContent });
      
      toast({ title: "Fil lastet opp" });
    } catch (error) {
      toast({ title: "Opplasting feilet", variant: "destructive" });
    } finally {
      setUploadProgress(null);
      setActiveUploadIndex(null);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description) return;
    
    setIsSubmitting(true);
    try {
      await createCourse({
        orgId: dbUser!.orgId,
        title: newCourse.title!,
        description: newCourse.description!,
        category: newCourse.category as any,
        content: newCourse.content as any,
        estimatedMinutes: newCourse.estimatedMinutes,
        isPublished: newCourse.isPublished ?? true,
        requiredRoles: []
      });
      
      toast({ title: "Kurs opprettet", description: "Kurset er lagt til i biblioteket." });
      setIsAddOpen(false);
      setNewCourse({ title: '', description: '', category: 'safety', content: [{ type: 'text', body: '' }], estimatedMinutes: 15, isPublished: true });
      loadData();
    } catch (e) {
      toast({ title: "Feil", description: "Kunne ikke opprette kurset.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToAll = async (courseId: string) => {
    if (!confirm("Vil du tildele dette kurset til ALLE brukere i organisasjonen?")) return;
    
    setIsSubmitting(true);
    try {
      const promises = allUsers.map(user => 
        assignCourseToUser({
          orgId: dbUser!.orgId,
          courseId,
          userId: user.id,
          status: 'assigned'
        })
      );
      await Promise.all(promises);
      toast({ title: "Tildeling fullført", description: `Kurset er tildelt ${allUsers.length} brukere.` });
    } catch (e) {
      toast({ title: "Feil", description: "Kunne ikke tildele kurs.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette dette kurset permanent?")) return;
    try {
      await deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
      toast({ title: "Kurs slettet" });
    } catch (e) {
      toast({ title: "Feil ved sletting", variant: "destructive" });
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
              <Plus className="mr-2 h-4 w-4" /> Nytt Kurs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Opprett Nytt Opplæringskurs</DialogTitle>
              <DialogDescription>Legg til innhold og tildel til de ansatte.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Kurstittel</Label>
                  <Input 
                    value={newCourse.title} 
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                    placeholder="F.eks. ADR-Sikkerhet 2024"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Kategori</Label>
                  <Select 
                    value={newCourse.category} 
                    onValueChange={val => setNewCourse({...newCourse, category: val as any})}
                  >
                    <SelectTrigger className="font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Helse & Sikkerhet</SelectItem>
                      <SelectItem value="adr">Farlig Goods (ADR)</SelectItem>
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
                   value={newCourse.description} 
                   onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                   placeholder="Kort introduksjon til kurset..."
                   className="min-h-[100px]"
                />
              </div>

              <div className="space-y-4 border-t pt-6">
                 <div className="flex items-center justify-between">
                    <Label className="text-lg font-black flex items-center gap-2">
                       <FileText className="h-5 w-5 text-indigo-500" /> Innhold & Leksjoner
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setNewCourse({...newCourse, content: [...(newCourse.content || []), { type: 'text', body: '' }]})}
                      className="font-bold"
                    >
                      + Legg til leksjon
                    </Button>
                 </div>

                 <div className="space-y-4">
                    {newCourse.content?.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow-sm text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const updated = [...(newCourse.content || [])];
                            updated.splice(idx, 1);
                            setNewCourse({...newCourse, content: updated});
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
                                const updated = [...(newCourse.content || [])];
                                updated[idx] = { ...updated[idx], type: val as any, url: '', body: '' };
                                setNewCourse({...newCourse, content: updated});
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
                            <Label className="text-[10px] font-black uppercase text-slate-400">
                              {item.type === 'text' ? 'Innhold' : 'Kildefil / URL'}
                            </Label>
                            
                            {item.type === 'text' ? (
                              <Textarea 
                                className="min-h-[80px] text-sm" 
                                value={item.body}
                                onChange={e => {
                                  const updated = [...(newCourse.content || [])];
                                  updated[idx].body = e.target.value;
                                  setNewCourse({...newCourse, content: updated});
                                }}
                              />
                            ) : (
                              <div className="flex gap-2">
                                <Input 
                                  className="h-9 text-xs font-mono" 
                                  placeholder={item.type === 'link' ? "https://..." : "Velg fil eller lim inn URL"}
                                  value={item.url || ''}
                                  onChange={e => {
                                    const updated = [...(newCourse.content || [])];
                                    updated[idx].url = e.target.value;
                                    setNewCourse({...newCourse, content: updated});
                                  }}
                                />
                                {(item.type === 'pdf' || item.type === 'video') && (
                                  <div className="relative">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-9 w-9 shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
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
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Avbryt</Button>
              <Button onClick={handleCreateCourse} disabled={isSubmitting || !newCourse.title}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lagre og Publiser Kurs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                    <Badge variant="secondary" className="uppercase font-bold text-[10px] tracking-tighter">{course.category}</Badge>
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
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        <Users className="h-3 w-3" /> Tildelt alle
                     </span>
                  </div>
                </div>
                
                <div className="md:w-72 bg-slate-50/50 border-l border-slate-100 p-6 flex flex-col justify-center gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 font-bold text-xs h-9 shadow-sm"
                    onClick={() => handleAssignToAll(course.id)}
                    disabled={isSubmitting}
                  >
                    <Users className="mr-2 h-3.5 w-3.5" /> Tildel til alle
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1 h-9 bg-white shadow-sm">
                      <Settings2 className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="flex-1 h-9 hover:bg-red-50 hover:text-red-600 border-red-100 bg-white shadow-sm"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
