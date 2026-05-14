'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { Organization } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';

export function HMSSettings({ organization }: { organization: Organization }) {
    const { toast } = useToast();
    const { dbUser } = useAuth();
    
    const [hmsEnabled, setHmsEnabled] = useState(organization.hmsSettings?.enabled ?? false);
    const [hmsTitle, setHmsTitle] = useState(organization.hmsSettings?.title || 'HMS Sjekkliste');
    const [hmsRequireComment, setHmsRequireComment] = useState(organization.hmsSettings?.requireComment ?? false);
    const [hmsQuestions, setHmsQuestions] = useState<{ id: string, text: string }[]>(organization.hmsSettings?.questions || []);
    const [isSaving, setIsSaving] = useState(false);

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
                            <Label className="text-sm font-bold">Sjekkpunkter (Store avkrysningsbokser)</Label>
                            <div className="space-y-3">
                                {hmsQuestions.map((q, idx) => (
                                    <div key={q.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border">
                                        <div className="bg-slate-100 h-8 w-8 rounded flex items-center justify-center text-xs font-bold text-slate-500">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <Input 
                                                value={q.text}
                                                onChange={(e) => {
                                                    const updated = [...hmsQuestions];
                                                    updated[idx].text = e.target.value;
                                                    setHmsQuestions(updated);
                                                }}
                                                className="border-none focus-visible:ring-0 h-8"
                                                placeholder={`Skriv spørsmål her...`}
                                            />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => setHmsQuestions(hmsQuestions.filter((_, i) => i !== idx))}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full border-dashed h-10"
                                    onClick={() => setHmsQuestions([...hmsQuestions, { id: Date.now().toString(), text: '' }])}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Legg til nytt punkt
                                </Button>
                            </div>
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