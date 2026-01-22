
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase/firebase';

export default function HomePage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return <p>Laster...</p>;
  }

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800">Finn frem på første forsøk. Hver gang.</h1>
          <p className="text-xl text-gray-600 mt-4">Spar tid, reduser stress og øk leveringspresisjonen med Videre RettSted.</p>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          {user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 text-lg"
            >
              Gå til dashbord
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 text-lg"
              >
                Logg inn
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-gray-600 text-white px-8 py-3 rounded-md hover:bg-gray-700 text-lg"
              >
                Registrer
              </button>
            </>
          )}
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error.message}</p>}

        <div className="mt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Utfordringen: Den "siste meteren"</h2>
              <p className="text-gray-600 mt-4">Standard GPS tar sjåføren til adressen, men ikke til den rette rampen, riktig dør eller den skjulte kjellerinngangen. Dette fører til:</p>
              <ul className="list-disc list-inside mt-4 text-gray-600">
                <li>Sjåfører kaster bort tid på å lete</li>
                <li>Kundeservice får telefoner om forsinkelser</li>
                <li>Nye sjåfører bruker lang tid på opplæring</li>
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Løsningen: Visuell leveringsstøtte</h2>
              <p className="text-gray-600 mt-4">Videre RettSted er en enkel web-app som gir sjåføren din nøyaktig det bildet de trenger for å fullføre jobben. Ingen mer forvirring, bare klare, visuelle instruksjoner.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-gray-800">Hvorfor velge Videre RettSted for din bedrift?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Bilder som forklarer mer enn ord</h3>
              <p className="text-gray-600">Sjåførene ser faktiske bilder av innganger og porter, og eliminerer misforståelser.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Laget for alle</h3>
              <p className="text-gray-600">Appen er ekstremt intuitiv. Hvis sjåførene dine kan bruke et kamera, kan de bruke denne appen.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Full kontroll</h3>
              <p className="text-gray-600">Som leder styrer du tilgangen. Nye drivere inviteres enkelt via en sikker lenke.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
