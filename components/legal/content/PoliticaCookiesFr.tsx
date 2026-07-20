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

export function PoliticaCookiesFr() {
  return (
    <article>
      <LegalTitle>Politique de cookies</LegalTitle>
      <LegalLead>
        Cette politique de cookies s&rsquo;applique aux citoyens et résidents légaux permanents
        de l&rsquo;Espace économique européen et de la Suisse.
      </LegalLead>

      <LegalHeading>1. Introduction</LegalHeading>
      <LegalParagraph>
        Notre site web,{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>{" "}
        (ci-après : « le site ») utilise des cookies et d&rsquo;autres technologies similaires.
        Le document suivant vous informe sur l&rsquo;utilisation des cookies sur notre site.
      </LegalParagraph>

      <LegalHeading>2. Que sont les cookies ?</LegalHeading>
      <LegalParagraph>
        Un cookie est un petit fichier envoyé avec les pages de ce site et stocké par votre
        navigateur sur votre appareil. Les informations stockées peuvent être renvoyées à nos
        serveurs ou aux serveurs de tiers concernés lors d&rsquo;une visite ultérieure.
      </LegalParagraph>

      <LegalHeading>3. Cookies</LegalHeading>
      <LegalSubheading>3.1 Cookies techniques ou fonctionnels</LegalSubheading>
      <LegalParagraph>
        Certains cookies garantissent le bon fonctionnement de certaines parties du site,
        comme le maintien de votre session ou la mémorisation de votre préférence de langue.
        Nous pouvons déposer ces cookies sans votre consentement, car ils sont nécessaires au
        fonctionnement du service.
      </LegalParagraph>
      <LegalSubheading>3.2 Cookies statistiques</LegalSubheading>
      <LegalParagraph>
        Le cas échéant, nous utilisons des cookies statistiques afin d&rsquo;optimiser
        l&rsquo;expérience du site pour nos utilisateurs. Nous vous demandons votre autorisation
        avant de déposer des cookies statistiques.
      </LegalParagraph>

      <LegalHeading>4. Cookies utilisés</LegalHeading>
      <LegalTableWrapper>
        <LegalTableHead labels={["Cookie", "Type", "Finalité"]} />
        <tbody>
          <LegalTableRow
            cells={[
              "NEXT_LOCALE",
              "Fonctionnel",
              "Mémoriser la langue préférée de l'utilisateur",
            ]}
          />
          <LegalTableRow
            cells={[
              "Cookies de session (Supabase Auth)",
              "Fonctionnel",
              "Maintenir la session de l'utilisateur authentifié",
            ]}
          />
          <LegalTableRow
            cells={[
              "Cookies Stripe",
              "Fonctionnel",
              "Traitement sécurisé des paiements et des abonnements",
            ]}
          />
        </tbody>
      </LegalTableWrapper>

      <LegalHeading>5. Consentement</LegalHeading>
      <LegalParagraph>
        Lors de votre première visite sur notre site, nous vous informerons de
        l&rsquo;utilisation des cookies. En poursuivant votre navigation, vous acceptez
        l&rsquo;utilisation des cookies strictement nécessaires décrits dans cette politique.
      </LegalParagraph>

      <LegalHeading>6. Activation/désactivation et suppression des cookies</LegalHeading>
      <LegalParagraph>
        Vous pouvez utiliser votre navigateur internet pour supprimer les cookies
        automatiquement ou manuellement, ou pour le configurer de manière à refuser leur
        installation. Notez que notre site peut ne pas fonctionner correctement (par exemple,
        vous risquez de ne pas pouvoir rester connecté) si les cookies techniques sont
        désactivés.
      </LegalParagraph>

      <LegalHeading>7. Vos droits concernant les données personnelles</LegalHeading>
      <LegalParagraph>
        Vous avez le droit d&rsquo;accéder à vos données personnelles, de les rectifier, de les
        supprimer, d&rsquo;en limiter le traitement, de vous y opposer et d&rsquo;en demander la
        portabilité. Pour exercer ces droits, contactez-nous à l&rsquo;aide des coordonnées
        indiquées ci-dessous. Vous avez également le droit d&rsquo;introduire une réclamation
        auprès de l&rsquo;Agence espagnole de protection des données (Agencia Española de
        Protección de Datos).
      </LegalParagraph>

      <LegalHeading>8. Coordonnées</LegalHeading>
      <LegalParagraph>
        WelcoKit.com
        <br />
        Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005 Séville, Espagne
        <br />
        Site web :{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>
        <br />
        Adresse e-mail :{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
