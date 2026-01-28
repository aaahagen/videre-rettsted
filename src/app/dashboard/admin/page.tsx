'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { firebaseAuth } from '@/lib/firebase/auth';

// Mock data for admin page
const users = [
  {
    name: 'Ola Nordmann',
    email: 'ola.nordmann@example.com',
    role: 'admin',
    status: 'Aktiv',
  },
  {
    name: 'Kari Nordmann',
    email: 'kari.nordmann@example.com',
    role: 'sjåfør',
    status: 'Aktiv',
  },
  {
    name: 'venter.bruker@example.com',
    email: 'venter.bruker@example.com',
    role: 'sjåfør',
    status: 'Venter',
  },
];

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'driver' | 'admin'>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) {
      toast({
        title: 'Feil',
        description: 'Vennligst fyll ut alle feltene.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseAuth.inviteUser(email, role);
      toast({
        title: 'Suksess',
        description: `Invitasjon sendt til ${email}.`,
      });
      setEmail('');
      setRole('driver');
    } catch (error: any) {
      console.error('Kunne ikke invitere bruker:', error);
      toast({
        title: 'Invitasjon Mislyktes',
        description: error.message || 'En uventet feil oppstod.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Adminpanel
            </CardTitle>
            <CardDescription>
              Administrer din organisasjon og brukere.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Opprett Ny Bruker
            </CardTitle>
            <CardDescription>
              Legg til en ny sjåfør eller administrator i organisasjonen din. De vil motta en invitasjon for å sette opp kontoen sin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteUser} className="max-w-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bruker@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <Select
                  value={role}
                  onValueChange={(value: 'driver' | 'admin') => setRole(value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Sjåfør</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Sender Invitasjon...' : 'Opprett og Inviter Bruker'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Administrer Brukere
            </CardTitle>
            <CardDescription>Se og administrer nåværende brukere i din organisasjon.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={user.role === 'admin' ? 'bg-primary' : ''}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'Aktiv' ? 'outline' : 'destructive'
                        }
                        className={user.status === 'Aktiv' ? 'text-green-600 border-green-400' : ''}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Rediger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
