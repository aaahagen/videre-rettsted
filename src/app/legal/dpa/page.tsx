
import { NextPage } from 'next';

const DataProcessingAgreement: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Databehandleravtale (DPA)
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
            Versjon 1.2 – 8. mars 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Parter</h2>
            <p className="mb-4">
              Denne databehandleravtalen («Avtalen») er inngått mellom:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Behandlingsansvarlig:</strong> Den bedrift som har inngått
                abonnementsavtale med VIDERE RettSted («Kunden»).
              </li>
              <li>
                <strong>Databehandler:</strong> Anders Aavik Hagen, Oslo, som
                drifter tjenesten VIDERE RettSted («Leverandøren»).
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Formål og omfang</h2>
            <p className="mb-4">
              Leverandøren behandler personopplysninger på vegne av Kunden i
              forbindelse med levering av tjenesten VIDERE RettSted. Behandlingen
              omfatter:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Lagring og visning av brukerdata (navn, e-post, bilder,
                lokasjon).
              </li>
              <li>
                Lagring og strukturering av leveringsinstrukser, rutiner og
                kontaktinformasjon for spesifikke leveringssteder.
              </li>
              <li>
                Autentisering og tilgangsstyring for Kundens ansatte.
              </li>
              <li>GPS- og lokasjonsdata ved bruk av kartfunksjoner.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Leverandørens forpliktelser
            </h2>
            <p>
              Leverandøren forplikter seg til å behandle personopplysninger kun
              etter instruks, sikre konfidensialitet, og iverksette tekniske
              sikkerhetstiltak som kryptering (TLS) og rollebasert
              tilgangskontroll. Ved opphør skal data slettes innen 90 dager.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Underleverandører</h2>
            <p className="mb-4">
              Kunden gir herved generell tillatelse til bruk av følgende
              underleverandører:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Google LLC:</strong> Firebase-plattformen og Google Cloud
                Functions (lagring, autentisering, hosting og serverless
                logikk).
              </li>
              <li><strong>Stripe Inc.:</strong> Betalingsbehandling.</li>
              <li>
                <strong>Domene AS (domene.no):</strong> Domene- og
                DNS-tjenester.
              </li>
              <li><strong>Google LLC:</strong> Google Maps-tjenester.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Overføring til tredjeland
            </h2>
            <p>
              Personopplysninger kan overføres til USA via Google og Stripe basert
              på EUs standardkontraktklausuler (SCC).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Verneting</h2>
            <p>
              Avtalen er underlagt norsk rett med Oslo tingrett som verneting.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DataProcessingAgreement;
