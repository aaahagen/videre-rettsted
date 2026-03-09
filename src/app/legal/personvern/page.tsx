
import { NextPage } from 'next';

const PrivacyPolicy: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Personvernerklæring
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
            Sist oppdatert: 8. mars 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Behandlingsansvarlig
            </h2>
            <p>
              Anders Aavik Hagen er behandlingsansvarlig for personopplysninger i
              tjenesten.
            </p>
            <p>
              Kontakt:{' '}
              <a
                href="mailto:videre-communication@gmail.com"
                className="text-blue-500 hover:underline"
              >
                videre-communication@gmail.com
              </a>
              , Oslo, Norge.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Hvilke personopplysninger vi samler inn
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Navn og e-postadresse.</li>
              <li>Bilder og beskrivelser av leveringsrutiner.</li>
              <li>
                Kontaktinformasjon til tredjepersoner på leveringssteder lagt
                inn av kunden.
              </li>
              <li>Lokasjon og GPS-data ved navigasjon.</li>
              <li>Betalingsinformasjon via Stripe.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Informasjonskapsler (cookies) og lokal lagring
            </h2>
            <p className="mb-4">
              Vi bruker informasjonskapsler og lignende teknologier (som Local Storage) i nettleseren eller på enheten din for at VIDERE RettSted skal fungere teknisk, raskt og sikkert.
            </p>
            <p className="mb-4">
              Dette inkluderer strengt nødvendige funksjoner for:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Autentisering og innlogging (Google Firebase):</strong> Vi lagrer en sikkerhetsnøkkel lokalt på enheten din slik at du forblir innlogget og slipper å skrive inn passordet på nytt hver gang du åpner appen.
              </li>
              <li>
                <strong>Sikkerhet og betaling (Stripe):</strong> Nødvendige informasjonskapsler brukes i betalingsløsningen for å verifisere transaksjoner og forhindre svindel.
              </li>
              <li>
                <strong>Kartfunksjonalitet (Google Maps):</strong> Brukes for å levere kartvisninger og prosessere lokasjonsforespørsler på en effektiv måte.
              </li>
            </ul>
            <p>
              Disse teknologiene er strengt nødvendige for å levere tjenesten du har bedt om. Vi benytter for øyeblikket ikke informasjonskapsler til markedsføring, profilering eller sporing på tvers av tredjeparts nettsider. Dersom vi i fremtiden innfører analyseverktøy (som f.eks. Google Analytics), vil vi be om ditt aktive samtykke til dette i forkant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Datalagring og tredjeparter
            </h2>
            <p className="mb-4">
              Vi benytter følgende underleverandører for å levere tjenesten:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Google Firebase og Google Cloud Functions:</strong>{' '}
                Lagring, logikk og drift.
              </li>
              <li><strong>Stripe:</strong> Betalingsbehandling.</li>
              <li><strong>Google Maps:</strong> Kartvisning.</li>
              <li><strong>Domene AS:</strong> DNS og domene-infrastruktur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Lagringstid og rettigheter
            </h2>
            <p className="mb-4">
              Personopplysninger slettes innen 90 dager etter avsluttet
              abonnement. Brukere har rett til innsyn, retting og sletting.
              Henvendelser sendes til{' '}
              <a
                href="mailto:videre-communication@gmail.com"
                className="text-blue-500 hover:underline"
              >
                videre-communication@gmail.com
              </a>
              . Du kan også klage til Datatilsynet.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
