'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link href="/" className="flex flex-col items-center gap-2">
            <Logo className="h-32 w-32" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-[#1A237E]">
            VIDERE RettSted
            </h1>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none bg-white rounded-3xl overflow-hidden">
        <div className="h-2 bg-[#1A237E] w-full" />
        <CardHeader className="space-y-4 p-8 text-center">
          <div className="mx-auto bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-2">
                <ShieldCheck className="h-8 w-8 text-[#1A237E]" />
          </div>
          <CardTitle className="font-headline text-3xl text-[#1A237E] tracking-tight">Manuell Onboarding</CardTitle>
          <CardDescription className="text-slate-500 text-lg font-medium leading-relaxed">
            Vi har for øyeblikket stengt for automatisk registrering av nye organisasjoner for å sikre best mulig oppfølging av våre kunder.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-slate-600 font-medium mb-4">
              Ønsker du å ta i bruk VIDERE RettSted for din bedrift? Ta kontakt med oss for en uforpliktende demo og oppsett.
            </p>
            <Button asChild className="w-full bg-[#1A237E] hover:bg-[#1A237E]/90 h-12 rounded-xl font-bold shadow-lg shadow-indigo-100">
                <Link href="mailto:videre.logistics@gmail.com">
                    <Mail className="mr-2 h-4 w-4" /> Kontakt oss på e-post
                </Link>
            </Button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Allerede invitert?</p>
            <p className="text-sm text-slate-500">
                Hvis du har mottatt en invitasjon fra din administrator, vennligst bruk lenken i e-posten du mottok.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
          <Button variant="ghost" asChild className="text-slate-500 font-bold hover:text-[#1A237E]">
            <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til innlogging
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-slate-400 text-xs font-medium">
        © {new Date().getFullYear()} VIDERE RettSted. Alle rettigheter reservert.
      </p>
    </div>
  );
}
