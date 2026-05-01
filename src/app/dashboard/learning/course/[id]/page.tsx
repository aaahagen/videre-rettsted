'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getCourse, getUserAssignments, updateAssignmentStatus } from '@/lib/db/courses';
import { Course, CourseAssignment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Video, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/ui/splash-screen';
import Link from 'next/link';

export default function CoursePlayerPage() {
  const { id } = useParams() as { id: string };
  const { dbUser } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (id && dbUser?.id) {
      loadData();
    }
  }, [id, dbUser]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [c, myAssignments] = await Promise.all([
        getCourse(id),
        getUserAssignments(dbUser!.id)
      ]);
      
      setCourse(c);
      const myAssignment = myAssignments.find(a => a.courseId === id);
      setAssignment(myAssignment || null);

      // If it's a new course, mark it as in-progress
      if (myAssignment && myAssignment.status === 'assigned') {
        await updateAssignmentStatus(myAssignment.id, 'in_progress', 10);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!assignment) return;
    setIsCompleting(true);
    try {
      await updateAssignmentStatus(assignment.id, 'completed', 100);
      router.push('/dashboard/learning?completed=true');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) return <SplashScreen />;
  if (!course) return <div>Kurs ikke funnet.</div>;

  const currentContent = course.content[activeStep];
  const isLastStep = activeStep === course.content.length - 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MINIMAL PLAYER HEADER */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/learning">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="hidden sm:block">
              <h1 className="font-black text-slate-900 line-clamp-1">{course.title}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Steg {activeStep + 1} av {course.content.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${((activeStep + 1) / course.content.length) * 100}%` }}
                />
             </div>
             {isLastStep ? (
               <Button 
                onClick={handleComplete} 
                disabled={isCompleting}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
               >
                 {isCompleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                 Fullfør Kurs
               </Button>
             ) : (
               <Button onClick={() => setActiveStep(prev => prev + 1)} className="bg-indigo-600 font-bold">
                 Neste <ChevronRight className="ml-2 h-4 w-4" />
               </Button>
             )}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 py-12">
        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="bg-white border-b p-8">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                   {currentContent.type === 'video' ? <Video className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                </div>
                <Badge variant="secondary" className="uppercase font-bold tracking-widest text-[10px]">
                  {currentContent.type === 'text' ? 'Leksjon' : currentContent.type}
                </Badge>
             </div>
             <CardTitle className="text-3xl font-black text-slate-900 leading-tight">
               {course.title}
             </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white prose prose-slate max-w-none">
            {currentContent.type === 'text' && (
              <div className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {currentContent.body}
              </div>
            )}

            {(currentContent.type === 'video' || currentContent.type === 'link' || currentContent.type === 'pdf') && (
              <div className="space-y-8">
                 <div className="bg-slate-50 border-2 border-indigo-100 rounded-3xl p-12 text-center flex flex-col items-center">
                    <Sparkles className="h-12 w-12 text-indigo-400 mb-6" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">Eksternt innhold</h3>
                    <p className="text-slate-500 mb-8 max-w-sm">
                      Dette steget inneholder {currentContent.type === 'video' ? 'en video' : 'et dokument'} som må åpnes i en ny fane.
                    </p>
                    <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 font-bold h-14 px-8 rounded-2xl text-lg shadow-lg shadow-indigo-200">
                      <a href={currentContent.url} target="_blank" rel="noopener noreferrer">
                         Åpne Innhold <ExternalLink className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NAVIGATION FOOTER */}
        <div className="mt-8 flex justify-between">
           <Button 
            variant="ghost" 
            onClick={() => setActiveStep(prev => prev - 1)}
            disabled={activeStep === 0}
            className="font-bold text-slate-500"
           >
             <ChevronLeft className="mr-2 h-4 w-4" /> Tilbake
           </Button>

           {!isLastStep && (
             <Button 
              variant="outline"
              onClick={() => setActiveStep(prev => prev + 1)}
              className="font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
             >
               Gå til neste steg <ChevronRight className="ml-2 h-4 w-4" />
             </Button>
           )}
        </div>
      </main>
    </div>
  );
}
