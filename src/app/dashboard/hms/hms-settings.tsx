'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, Trash2, Save, Loader2, Type, CheckSquare, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { Organization } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableQuestionProps {
    q: { id: string, text: string, type?: 'question' | 'heading' };
    idx: number;
    onTextChange: (text: string) => void;
    onToggleType: () => void;
    onDelete: () => void;
}

function SortableQuestion({ q, idx, onTextChange, onToggleType, onDelete }: SortableQuestionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: q.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex gap-2 items-center p-2 rounded-lg border transition-all",
                q.type === 'heading' ? "bg-slate-100/50 border-slate-300" : "bg-white border-slate-200",
                isDragging && "opacity-50 shadow-lg border-primary/50 ring-2 ring-primary/20"
            )}
        >
            <div 
                {...attributes} 
                {...listeners}
                className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
            >
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <Input 
                    value={q.text}
                    onChange={(e) => onTextChange(e.target.value)}
                    className={cn(
                        "border-none focus-visible:ring-0 h-8",
                        q.type === 'heading' ? "font-bold text-slate-900" : "text-slate-700"
                    )}
                    placeholder={q.type === 'heading' ? "Skriv overskrift her..." : "Skriv spørsmål her..."}
                />
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8",
                        q.type === 'heading' ? "text-primary bg-primary/10" : "text-slate-400"
                    )}
                    onClick={onToggleType}
                    title={q.type === 'heading' ? "Bytt til spørsmål" : "Bytt til overskrift"}
                >
                    {q.type === 'heading' ? <Type className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function HMSSettings({ organization }: { organization: Organization }) {
    const { toast } = useToast();
    const { dbUser } = useAuth();
    
    const [hmsEnabled, setHmsEnabled] = useState(organization.hmsSettings?.enabled ?? false);
    const [hmsTitle, setHmsTitle] = useState(organization.hmsSettings?.title || 'HMS Sjekkliste');
    const [hmsRequireComment, setHmsRequireComment] = useState(organization.hmsSettings?.requireComment ?? false);
    const [hmsQuestions, setHmsQuestions] = useState<{ id: string, text: string, type?: 'question' | 'heading' }[]>(organization.hmsSettings?.questions || []);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSave = async () => {
        if (!dbUser || !organization) return;
        setIsSaving(true);
        try {
            await firebaseDB.updateOrganization(organization.id, {
                hmsSettings: {
                    enabled: hmsEnabled,
                    title: hmsTitle,
                    requireComment: hmsRequireComment,
                    questions: hmsQuestions
                }
            });
            toast({
                title: "Innstillinger lagret",
                description: "HMS-innstillingene er oppdatert.",
            });
        } catch (error: any) {
            toast({
                title: "Feil ved lagring",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const addQuestion = (type: 'question' | 'heading' = 'question') => {
        setHmsQuestions([...hmsQuestions, { id: Date.now().toString(), text: '', type }]);
    };

    const toggleType = (idx: number) => {
        const updated = [...hmsQuestions];
        updated[idx].type = updated[idx].type === 'heading' ? 'question' : 'heading';
        setHmsQuestions(updated);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setHmsQuestions((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm mb-8">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    <Shield className="h-5 w-5 text-red-500" />
                </div>
                <div>
                    <CardTitle className="font-headline text-xl">HMS Innstillinger & Skjema</CardTitle>
                    <CardDescription className="text-xs">Konfigurer HMS-spørsmål for leveringssteder</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Aktiver HMS Sjekkliste</Label>
                        <p className="text-xs text-muted-foreground">Viser en sjekkliste som fylles ut på steder.</p>
                    </div>
                    <Switch 
                        checked={hmsEnabled}
                        onCheckedChange={setHmsEnabled}
                    />
                </div>

                {hmsEnabled && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="hmsTitle">Tittel på sjekkliste</Label>
                                <Input 
                                    id="hmsTitle"
                                    value={hmsTitle}
                                    onChange={(e) => setHmsTitle(e.target.value)}
                                    placeholder="F.eks. HMS Krav"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 mt-6">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Inkluder kommentar-felt</Label>
                                    <p className="text-xs text-muted-foreground">Legger til et tekstfelt på slutten av listen.</p>
                                </div>
                                <Switch 
                                    checked={hmsRequireComment}
                                    onCheckedChange={setHmsRequireComment}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold">Sjekkpunkter & Overskrifter</Label>
                                <div className="flex gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => addQuestion('heading')}
                                        className="text-[10px] font-bold h-8"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Overskrift
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => addQuestion('question')}
                                        className="text-[10px] font-bold h-8"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Punkt
                                    </Button>
                                </div>
                            </div>
                            
                            <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext 
                                    items={hmsQuestions.map(q => q.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {hmsQuestions.map((q, idx) => (
                                            <SortableQuestion 
                                                key={q.id}
                                                q={q}
                                                idx={idx}
                                                onTextChange={(text) => {
                                                    const updated = [...hmsQuestions];
                                                    updated[idx].text = text;
                                                    setHmsQuestions(updated);
                                                }}
                                                onToggleType={() => toggleType(idx)}
                                                onDelete={() => setHmsQuestions(hmsQuestions.filter((_, i) => i !== idx))}
                                            />
                                        ))}
                                        
                                        {hmsQuestions.length === 0 && (
                                            <div className="p-8 text-center border-2 border-dashed rounded-xl text-slate-400">
                                                Ingen sjekkpunkter lagt til ennå.
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                )}
                
                <div className="pt-4 border-t flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="font-bold">
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Lagrer...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Lagre HMS Oppsett
                            </>
                        )}
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
    );
}
