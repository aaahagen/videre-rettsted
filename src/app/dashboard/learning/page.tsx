'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getCourses, getUserAssignments, updateAssignmentStatus } from '@/lib/db/courses';
import { Course, CourseAssignment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Video, 
  ExternalLink,
  PlayCircle,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  PlusCircle,
  Users
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SplashScreen } from '@/components/ui/splash-screen';
import Link from 'next/link';

export default function LearningPortalPage() {
  const { dbUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dbUser?.id && dbUser?.orgId) {
      loadData();
    }
  }, [dbUser]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allCourses, myAssignments] = await Promise.all([
        getCourses(dbUser!.orgId),
        getUserAssignments(dbUser!.id)
      ]);
      setCourses(allCourses);
      setAssignments(myAssignments);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <SplashScreen />;

  // Group assignments by status
  const activeAssignments = assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            Læringsportal
          </h1>
          <p className="text-slate-500 font-medium">Få oversikt over din kompetanse og tildelte kurs.</p>
        </div>
      </div>

      {/* ADMIN QUICK ACTIONS */}
      {dbUser?.role === 'admin' && (
        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 hidden sm:block">
            <ShieldCheck className="h-24 w-24 text-indigo-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Administrasjon
            </CardTitle>
            <CardDescription className="text-indigo-700 font-medium">
              Som administrator kan du opprette kurs, tildele dem til ansatte og overvåke organisasjonens fremdrift.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-sm">
              <Link href="/dashboard/learning/admin?tab=library">
                <PlusCircle className="mr-2 h-4 w-4" />
                Administrer Kursbibliotek
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 font-bold">
               <Link href="/dashboard/learning/admin?tab=status">
                <Users className="mr-2 h-4 w-4" />
                Se Status per Ansatt
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STATS OVERVIEW SECTION */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Min Status
            </h2>
            <p className="text-xs text-slate-500 font-medium">Oversikt over din egen fremdrift og gjennomføring.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="h-6 w-6" />
                </div>
                <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktive Kurs</p>
                <p className="text-2xl font-black text-slate-900">{activeAssignments.length}</p>
                </div>
            </CardContent>
            </Card>
            
            <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fullført</p>
                <p className="text-2xl font-black text-slate-900">{completedAssignments.length}</p>
                </div>
            </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sertifiseringer</p>
                <p className="text-2xl font-black text-slate-900">{completedAssignments.filter(a => {
                    const c = courses.find(course => course.id === a.courseId);
                    return c?.isCertification;
                }).length}</p>
                </div>
            </CardContent>
            </Card>
        </div>
      </div>

      {/* ASSIGNED COURSES */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Mine Tildelinger
            </h2>
            <p className="text-xs text-slate-500 font-medium">Kurs som er tildelt deg for gjennomføring.</p>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-600">Ingen utestående kurs</h3>
            <p className="text-sm text-slate-400">Du er helt oppdatert på alle kurs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAssignments.map(assignment => {
              const course = courses.find(c => c.id === assignment.courseId);
              if (!course) return null;

              return (
                <Card key={assignment.id} className="group overflow-hidden border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all">
                  <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="outline" className="bg-white capitalize font-bold text-[10px]">
                            {course.category}
                        </Badge>
                        {course.isCertification && (
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[10px]">SERTIFISERING</Badge>
                        )}
                      </div>
                      {assignment.status === 'in_progress' ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-black text-[10px]">PÅGÅR</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-black text-[10px]">NYTT</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-black group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {course.estimatedMinutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        {course.content[0]?.type === 'video' ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        {course.content.length} leksjoner
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                        <span>Fremdrift</span>
                        <span>{assignment.progress || 0}%</span>
                      </div>
                      <Progress value={assignment.progress || 0} className="h-1.5" />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/30 border-t p-4">
                    <Button asChild className="w-full font-bold bg-indigo-600 hover:bg-indigo-700">
                      <Link href={`/dashboard/learning/course/${course.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Kurs
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETED COURSES */}
      {completedAssignments.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 opacity-60">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Fullførte Kurs & Sertifiseringer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAssignments.map(assignment => {
              const course = courses.find(c => c.id === assignment.courseId);
              if (!course) return null;

              return (
                <Card key={assignment.id} className="opacity-75 grayscale hover:opacity-100 hover:grayscale-0 transition-all border-slate-200">
                   <CardHeader className="pb-3">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex gap-1">
                            <Badge variant="outline" className="text-[10px]">{course.category}</Badge>
                            {course.isCertification && (
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[10px]">SERTIFISERING</Badge>
                            )}
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px]">FULLFØRT</Badge>
                    </div>
                    <CardTitle className="text-base font-bold">{course.title}</CardTitle>
                   </CardHeader>
                   <CardFooter className="pt-0">
                      <p className="text-[10px] font-medium text-slate-400 italic">
                        Fullført: {assignment.completedAt instanceof Date ? assignment.completedAt.toLocaleDateString() : 'Nylig'}
                      </p>
                   </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
