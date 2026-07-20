import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function AvisoLegalIt() {
  return (
    <article>
      <LegalTitle>Note legali e condizioni d&rsquo;uso</LegalTitle>

      <LegalHeading>1. Dati del titolare del sito web</LegalHeading>
      <LegalParagraph>
        In adempimento dell&rsquo;obbligo di informativa stabilito dalla Legge spagnola 34/2002,
        dell&rsquo;11 luglio, sui Servizi della Società dell&rsquo;Informazione e il Commercio
        Elettronico (LSSI-CE), si informa che il titolare di questo sito web è:
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Nome:</strong> WelcoKit.com
        </li>
        <li>
          <strong>Titolare:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>NIF (codice fiscale spagnolo):</strong> 31265006W
        </li>
        <li>
          <strong>Indirizzo:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D,
          41005 Siviglia, Spagna
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
        <li>
          <strong>Attività:</strong> Servizi digitali
        </li>
      </LegalList>

      <LegalHeading>2. Oggetto del sito web</LegalHeading>
      <LegalParagraph>
        Questo sito web ha l&rsquo;obiettivo di offrire una piattaforma SaaS che consenta agli
        host di affitti brevi di creare guide digitali multilingue per i propri ospiti,
        comprensive di informazioni sul WiFi, check-in/check-out, regole della casa e consigli
        locali generati con intelligenza artificiale.
      </LegalParagraph>

      <LegalHeading>3. Proprietà intellettuale e industriale</LegalHeading>
      <LegalParagraph>
        Tutti i contenuti di questo sito web (testi, immagini, video, loghi, design, codice
        sorgente, ecc.) sono di proprietà di WelcoKit.com o vengono utilizzati con le licenze
        necessarie. È vietata la riproduzione, distribuzione o modifica di qualsiasi contenuto
        senza il consenso espresso del titolare.
      </LegalParagraph>

      <LegalHeading>4. Responsabilità dei contenuti</LegalHeading>
      <LegalParagraph>
        WelcoKit.com non è responsabile dei danni o pregiudizi che possano derivare da un uso
        improprio delle informazioni pubblicate su questo sito web. Non è inoltre responsabile
        della mancata disponibilità del sito web per cause tecniche o di manutenzione.
      </LegalParagraph>

      <LegalHeading>5. Protezione dei dati personali</LegalHeading>
      <LegalParagraph>
        In conformità al Regolamento generale sulla protezione dei dati (UE) 2016/679 (GDPR) e
        alla Legge organica spagnola 3/2018, del 5 dicembre (LOPDGDD), si informano gli utenti
        che i dati personali forniti saranno trattati in modo confidenziale al fine di gestire
        il rapporto con gli utenti e fornire i servizi contrattati.
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Titolare del trattamento:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>Finalità:</strong> Gestione della piattaforma WelcoKit, erogazione del
          servizio contrattato, richieste e comunicazioni commerciali.
        </li>
        <li>
          <strong>Base giuridica:</strong> Consenso dell&rsquo;interessato ed esecuzione del
          contratto di servizio.
        </li>
        <li>
          <strong>Diritti:</strong> Accesso, rettifica, cancellazione e opposizione, oltre agli
          altri diritti previsti dalla normativa vigente.
        </li>
        <li>
          <strong>Contatto per esercitare i diritti:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
      </LegalList>

      <LegalHeading>6. Uso dei cookie</LegalHeading>
      <LegalParagraph>
        Questo sito web utilizza cookie per migliorare l&rsquo;esperienza dell&rsquo;utente.
        Navigando su questo sito, l&rsquo;utente accetta l&rsquo;uso dei cookie secondo la nostra{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          cookie policy
        </a>
        .
      </LegalParagraph>

      <LegalHeading>7. Link esterni</LegalHeading>
      <LegalParagraph>
        Il sito web può contenere link a pagine di terzi. WelcoKit.com non è responsabile del
        contenuto né delle politiche sulla privacy di tali siti.
      </LegalParagraph>

      <LegalHeading>8. Legislazione applicabile e giurisdizione</LegalHeading>
      <LegalParagraph>
        La legislazione applicabile è quella spagnola. Per qualsiasi controversia che possa
        sorgere in relazione al sito web, le parti si sottomettono espressamente alla
        giurisdizione dei Tribunali di Siviglia, salvo quanto diversamente stabilito dalla
        normativa.
      </LegalParagraph>

      <LegalHeading>9. Modifiche alle presenti note legali</LegalHeading>
      <LegalParagraph>
        Ignacio Jacquot si riserva il diritto di modificare le presenti note legali in
        qualsiasi momento, in base a cambiamenti normativi o alla natura dei servizi offerti.
      </LegalParagraph>
    </article>
  );
}
