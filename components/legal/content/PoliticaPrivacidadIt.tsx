import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function PoliticaPrivacidadIt() {
  return (
    <article>
      <LegalTitle>Informativa sulla privacy</LegalTitle>

      <LegalParagraph>
        In conformità al Regolamento (UE) 2016/679 del Parlamento europeo e del Consiglio, del
        27 aprile 2016 (GDPR), nonché alla Legge organica spagnola 3/2018, del 5 dicembre
        (LOPDGDD), gli utenti di questo sito vengono informati sulla politica sulla privacy
        applicata alla raccolta, al trattamento e alla protezione dei loro dati personali.
      </LegalParagraph>

      <LegalHeading>1. Titolare del trattamento</LegalHeading>
      <LegalList>
        <li>
          <strong>Nome:</strong> WelcoKit.com
        </li>
        <li>
          <strong>NIF (codice fiscale spagnolo):</strong> 31265006W
        </li>
        <li>
          <strong>Indirizzo:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D,
          41005 Siviglia, Spagna
        </li>
        <li>
          <strong>Attività:</strong> Servizi digitali
        </li>
      </LegalList>

      <LegalHeading>2. Finalità del trattamento dei dati</LegalHeading>
      <LegalParagraph>
        I dati personali raccolti saranno utilizzati per le seguenti finalità:
      </LegalParagraph>
      <LegalList>
        <li>Gestire la registrazione e l&rsquo;account dell&rsquo;utente sulla piattaforma.</li>
        <li>
          Erogare il servizio contrattato (creazione e gestione di guide digitali per gli
          alloggi).
        </li>
        <li>Gestire le richieste ricevute tramite moduli di contatto o assistenza.</li>
        <li>Effettuare comunicazioni commerciali relative ai servizi offerti.</li>
        <li>Gestire la fatturazione e il pagamento degli abbonamenti.</li>
        <li>Adempiere agli obblighi legali applicabili.</li>
      </LegalList>

      <LegalHeading>3. Base giuridica del trattamento dei dati</LegalHeading>
      <LegalParagraph>
        Il trattamento dei dati personali si basa sul consenso esplicito dell&rsquo;utente,
        sull&rsquo;esecuzione di un contratto o sull&rsquo;adempimento di obblighi legali
        applicabili.
      </LegalParagraph>

      <LegalHeading>4. Conservazione dei dati</LegalHeading>
      <LegalParagraph>
        I dati personali forniti saranno conservati per il tempo necessario ad adempiere alla
        finalità per cui sono stati raccolti, per tutta la durata del rapporto contrattuale, o
        per il periodo richiesto dalla normativa vigente.
      </LegalParagraph>

      <LegalHeading>5. Comunicazione dei dati a terzi</LegalHeading>
      <LegalParagraph>
        I dati personali non saranno ceduti a terzi, salvo obbligo di legge o quando ciò sia
        necessario per l&rsquo;erogazione dei servizi contrattati (fornitori tecnologici come
        l&rsquo;hosting dei server, l&rsquo;elaborazione dei pagamenti, o servizi di intelligenza
        artificiale utilizzati per generare i contenuti delle guide).
      </LegalParagraph>

      <LegalHeading>6. Diritti dell&rsquo;utente</LegalHeading>
      <LegalParagraph>Gli utenti hanno diritto a:</LegalParagraph>
      <LegalList>
        <li>Accedere ai propri dati personali.</li>
        <li>Richiedere la rettifica di dati inesatti.</li>
        <li>Richiedere la cancellazione dei propri dati quando non sono più necessari.</li>
        <li>Richiedere la limitazione del trattamento dei propri dati.</li>
        <li>Opporsi al trattamento dei propri dati.</li>
        <li>Richiedere la portabilità dei propri dati.</li>
      </LegalList>
      <LegalParagraph>
        Gli utenti possono esercitare i propri diritti inviando una richiesta scritta al
        seguente indirizzo email:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>

      <LegalHeading>7. Misure di sicurezza</LegalHeading>
      <LegalParagraph>
        WelcoKit.com ha adottato le misure tecniche e organizzative necessarie per garantire
        la sicurezza dei dati personali ed evitarne la perdita, l&rsquo;uso improprio,
        l&rsquo;alterazione o l&rsquo;accesso non autorizzato.
      </LegalParagraph>

      <LegalHeading>8. Cookie</LegalHeading>
      <LegalParagraph>
        Questo sito web utilizza cookie per migliorare l&rsquo;esperienza dell&rsquo;utente. Puoi
        trovare maggiori dettagli nella nostra{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          Cookie Policy
        </a>
        .
      </LegalParagraph>

      <LegalHeading>9. Modifiche alla presente informativa sulla privacy</LegalHeading>
      <LegalParagraph>
        WelcoKit.com si riserva il diritto di modificare la presente informativa sulla privacy
        per adeguarla a novità legislative o a modifiche dei servizi offerti. Si raccomanda
        agli utenti di consultare periodicamente questa informativa.
      </LegalParagraph>

      <LegalHeading>10. Legislazione applicabile e giurisdizione</LegalHeading>
      <LegalParagraph>
        La presente informativa sulla privacy è disciplinata dalla legislazione spagnola. Per
        la risoluzione di qualsiasi controversia, le parti si sottoporranno ai Tribunali di
        Siviglia, salvo quanto diversamente stabilito dalla normativa.
      </LegalParagraph>

      <hr className="mt-10 border-[#DDD8CC]" />

      <LegalParagraph>
        Per qualsiasi dubbio su questa informativa sulla privacy, non esitare a contattarci
        all&rsquo;indirizzo email:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
