'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getCourses, createCourse, updateCourse, deleteCourse, assignCourseToUser } from '@/lib/db/courses';
import { firebaseDB } from '@/lib/firebase/database';
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
  Save
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
  const [isAssignDialogOpen, setIsAssignOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Nytt Kurs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Opprett Nytt Opplæringskurs</DialogTitle>
              <CardDescription>Legg til innhold og tildel til de ansatte.</CardDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kurstittel</Label>
                  <Input 
                    value={newCourse.title} 
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                    placeholder="F.eks. ADR-Sikkerhet 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select 
                    value={newCourse.category} 
                    onValueChange={val => setNewCourse({...newCourse, category: val as any})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Helse & Sikkerhet</SelectItem>
                      <SelectItem value="adr">Farlig Gods (ADR)</SelectItem>
                      <SelectItem value="equipment">Utstyr & Vedlikehold</SelectItem>
                      <SelectItem value="company_policy">Bedriftsregler</SelectItem>
                      <SelectItem value="other">Annet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Beskrivelse</Label>
                <Textarea 
                   value={newCourse.description} 
                   onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                   placeholder="Kort introduksjon til kurset..."
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                 <Label className="font-bold">Innhold (Leksjon 1)</Label>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="col-span-1">
                      <Select 
                        value={newCourse.content?.[0].type} 
                        onValueChange={val => {
                           const updatedContent = [...(newCourse.content || [])];
                           updatedContent[0] = { ...updatedContent[0], type: val as any };
                           setNewCourse({...newCourse, content: updatedContent});
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Ren Tekst</SelectItem>
                          <SelectItem value="link">Ekstern Lenke</SelectItem>
                          <SelectItem value="pdf">PDF Fil (URL)</SelectItem>
                          <SelectItem value="video">Video (URL)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="col-span-2">
                      <Input 
                        placeholder={newCourse.content?.[0].type === 'text' ? "Skriv tekst her..." : "Lim inn URL her..."}
                        value={newCourse.content?.[0].type === 'text' ? newCourse.content[0].body : newCourse.content?.[0].url}
                        onChange={e => {
                          const updatedContent = [...(newCourse.content || [])];
                          if (updatedContent[0].type === 'text') {
                            updatedContent[0].body = e.target.value;
                          } else {
                            updatedContent[0].url = e.target.value;
                          }
                          setNewCourse({...newCourse, content: updatedContent});
                        }}
                      />
                   </div>
                 </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Avbryt</Button>
              <Button onClick={handleCreateCourse} disabled={isSubmitting || !newCourse.title}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lagre og Publiser
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
          </div>
        ) : (
          courses.map(course => (
            <Card key={course.id} className="overflow-hidden border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="uppercase font-bold text-[10px]">{course.category}</Badge>
                    {course.isPublished ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold">PUBLISERT</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold">UTKAST</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{course.description}</p>
                </div>
                
                <div className="md:w-72 bg-slate-50/50 border-l border-slate-100 p-6 flex flex-col justify-center gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 font-bold text-xs h-9"
                    onClick={() => handleAssignToAll(course.id)}
                    disabled={isSubmitting}
                  >
                    <Users className="mr-2 h-3.5 w-3.5" /> Tildel til alle
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1 h-9">
                      <Settings2 className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="flex-1 h-9 hover:bg-red-50 hover:text-red-600 border-red-100"
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
