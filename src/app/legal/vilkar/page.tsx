
import { NextPage } from 'next';

const TermsAndConditions: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Brukervilkår og lisensavtale
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
            Sist oppdatert: 8. mars 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Aksept og Tjeneste</h2>
            <p>
              Ved å opprette en konto aksepterer Kunden disse Vilkårene. VIDERE
              RettSted er en plattform som hjelper leverandører med å veilede
              sjåfører frem til leveringssteder ved hjelp av bilder,
              rutinebeskrivelser, kart og søk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Abonnement og Betaling
            </h2>
            <p>
              Tjenesten leveres som et månedlig abonnement via Stripe.
              Oppsigelse må skje senest 7 dager før neste fakturadato.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Brukernes plikter</h2>
            <p>
              Kunden er ansvarlig for at innhold som lastes opp er lovlig.
              Dette inkluderer å sikre at kontaktinformasjon og
              rutinebeskrivelser som legges inn er korrekte, og at eventuelle
              tredjepersoner er inneforstått med at deres info deles i
              systemet.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Immaterielle rettigheter og Ansvar
            </h2>
            <p>
              All kildekode og innhold tilhører Leverandøren. Leverandørens
              totale erstatningsansvar er begrenset til det beløp Kunden har
              betalt de siste tre månedene.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Kontakt</h2>
            <p>
              For spørsmål om disse Vilkårene, kontakt:{' '}
              <a
                href="mailto:videre-communication@gmail.com"
                className="text-blue-500 hover:underline"
              >
                videre-communication@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;
