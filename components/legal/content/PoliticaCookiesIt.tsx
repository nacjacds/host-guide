import {
  LegalTitle,
  LegalLead,
  LegalHeading,
  LegalSubheading,
  LegalParagraph,
  LegalTableWrapper,
  LegalTableHead,
  LegalTableRow,
} from "@/components/legal/LegalTypography";

export function PoliticaCookiesIt() {
  return (
    <article>
      <LegalTitle>Cookie policy</LegalTitle>
      <LegalLead>
        Questa cookie policy si applica ai cittadini e ai residenti legali permanenti dello
        Spazio Economico Europeo e della Svizzera.
      </LegalLead>

      <LegalHeading>1. Introduzione</LegalHeading>
      <LegalParagraph>
        Il nostro sito web,{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>{" "}
        (di seguito: «il sito») utilizza cookie e altre tecnologie correlate. Il seguente
        documento ti informa sull&rsquo;uso dei cookie sul nostro sito.
      </LegalParagraph>

      <LegalHeading>2. Cosa sono i cookie?</LegalHeading>
      <LegalParagraph>
        Un cookie è un piccolo file inviato insieme alle pagine di questo sito e memorizzato
        dal tuo browser sul tuo dispositivo. Le informazioni memorizzate possono essere
        rinviate ai nostri server o ai server di terzi interessati durante una visita
        successiva.
      </LegalParagraph>

      <LegalHeading>3. Cookie</LegalHeading>
      <LegalSubheading>3.1 Cookie tecnici o funzionali</LegalSubheading>
      <LegalParagraph>
        Alcuni cookie garantiscono il corretto funzionamento di alcune parti del sito, come il
        mantenimento della sessione o la memorizzazione della lingua preferita. Questi cookie
        possono essere installati senza il tuo consenso, in quanto necessari al funzionamento
        del servizio.
      </LegalParagraph>
      <LegalSubheading>3.2 Cookie statistici</LegalSubheading>
      <LegalParagraph>
        Se applicabile, utilizziamo cookie statistici per ottimizzare l&rsquo;esperienza del
        sito per i nostri utenti. Ti chiediamo il permesso prima di installare cookie
        statistici.
      </LegalParagraph>

      <LegalHeading>4. Cookie utilizzati</LegalHeading>
      <LegalTableWrapper>
        <LegalTableHead labels={["Cookie", "Tipo", "Finalità"]} />
        <tbody>
          <LegalTableRow
            cells={["NEXT_LOCALE", "Funzionale", "Memorizzare la lingua preferita dall'utente"]}
          />
          <LegalTableRow
            cells={[
              "Cookie di sessione (Supabase Auth)",
              "Funzionale",
              "Mantenere attiva la sessione dell'utente autenticato",
            ]}
          />
          <LegalTableRow
            cells={[
              "Cookie di Stripe",
              "Funzionale",
              "Elaborazione sicura di pagamenti e abbonamenti",
            ]}
          />
        </tbody>
      </LegalTableWrapper>

      <LegalHeading>5. Consenso</LegalHeading>
      <LegalParagraph>
        Alla prima visita del nostro sito, ti informeremo sull&rsquo;uso dei cookie.
        Continuando a navigare, accetti l&rsquo;uso dei cookie strettamente necessari descritti
        in questa politica.
      </LegalParagraph>

      <LegalHeading>6. Attivazione/disattivazione ed eliminazione dei cookie</LegalHeading>
      <LegalParagraph>
        Puoi utilizzare il tuo browser internet per eliminare i cookie in modo automatico o
        manuale, oppure per configurarlo in modo che ne rifiuti l&rsquo;installazione. Tieni
        presente che il nostro sito potrebbe non funzionare correttamente (ad esempio, non
        sarai in grado di rimanere connesso) se i cookie tecnici sono disattivati.
      </LegalParagraph>

      <LegalHeading>7. I tuoi diritti in materia di dati personali</LegalHeading>
      <LegalParagraph>
        Hai il diritto di accedere, rettificare, cancellare, limitare il trattamento, opporti
        e richiedere la portabilità dei tuoi dati personali. Per esercitare questi diritti,
        contattaci utilizzando i dati di contatto indicati di seguito. Hai inoltre il diritto
        di presentare un reclamo all&rsquo;Agenzia spagnola per la protezione dei dati (Agencia
        Española de Protección de Datos).
      </LegalParagraph>

      <LegalHeading>8. Dati di contatto</LegalHeading>
      <LegalParagraph>
        WelcoKit.com
        <br />
        Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005 Siviglia, Spagna
        <br />
        Sito web:{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>
        <br />
        Email:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
