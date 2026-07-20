import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function AvisoLegalFr() {
  return (
    <article>
      <LegalTitle>Mentions légales et conditions d&rsquo;utilisation</LegalTitle>

      <LegalHeading>1. Données du titulaire du site web</LegalHeading>
      <LegalParagraph>
        En application du devoir d&rsquo;information prévu par la loi espagnole 34/2002, du 11
        juillet, sur les services de la société de l&rsquo;information et le commerce
        électronique (LSSI-CE), il est porté à la connaissance des utilisateurs que le
        titulaire de ce site web est :
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Nom :</strong> WelcoKit.com
        </li>
        <li>
          <strong>Titulaire :</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>NIF (identifiant fiscal espagnol) :</strong> 31265006W
        </li>
        <li>
          <strong>Adresse :</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005
          Séville, Espagne
        </li>
        <li>
          <strong>Adresse e-mail :</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
        <li>
          <strong>Activité :</strong> Services numériques
        </li>
      </LegalList>

      <LegalHeading>2. Objet du site web</LegalHeading>
      <LegalParagraph>
        Ce site web a pour objectif de proposer une plateforme SaaS permettant aux hôtes de
        locations de courte durée de créer des guides numériques multilingues pour leurs
        voyageurs, incluant les informations WiFi, les modalités d&rsquo;arrivée et de départ, le
        règlement intérieur et des recommandations locales générées par intelligence
        artificielle.
      </LegalParagraph>

      <LegalHeading>3. Propriété intellectuelle et industrielle</LegalHeading>
      <LegalParagraph>
        L&rsquo;ensemble des contenus de ce site web (textes, images, vidéos, logos, designs, code
        source, etc.) sont la propriété de WelcoKit.com ou sont utilisés sous les licences
        nécessaires. Toute reproduction, distribution ou modification de ce contenu sans le
        consentement exprès du titulaire est interdite.
      </LegalParagraph>

      <LegalHeading>4. Responsabilité relative au contenu</LegalHeading>
      <LegalParagraph>
        WelcoKit.com décline toute responsabilité pour les dommages ou préjudices pouvant
        résulter d&rsquo;une mauvaise utilisation des informations publiées sur ce site web.
        WelcoKit.com ne saurait non plus être tenu responsable de l&rsquo;indisponibilité du site
        web pour des raisons techniques ou de maintenance.
      </LegalParagraph>

      <LegalHeading>5. Protection des données personnelles</LegalHeading>
      <LegalParagraph>
        Conformément au Règlement général sur la protection des données (UE) 2016/679 (RGPD)
        et à la loi organique espagnole 3/2018, du 5 décembre (LOPDGDD), les utilisateurs sont
        informés que les données personnelles fournies seront traitées de manière
        confidentielle afin de gérer la relation avec les utilisateurs et de fournir les
        services souscrits.
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Responsable du traitement :</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>Finalité :</strong> Gestion de la plateforme WelcoKit, fourniture du service
          souscrit, demandes et communications commerciales.
        </li>
        <li>
          <strong>Base légale :</strong> Consentement de la personne concernée et exécution du
          contrat de service.
        </li>
        <li>
          <strong>Droits :</strong> Accès, rectification, suppression et opposition, ainsi que
          les autres droits prévus par la législation en vigueur.
        </li>
        <li>
          <strong>Contact pour exercer vos droits :</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
      </LegalList>

      <LegalHeading>6. Utilisation des cookies</LegalHeading>
      <LegalParagraph>
        Ce site web utilise des cookies pour améliorer l&rsquo;expérience de l&rsquo;utilisateur. En
        naviguant sur ce site, l&rsquo;utilisateur accepte l&rsquo;utilisation de cookies conformément
        à notre{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          politique de cookies
        </a>
        .
      </LegalParagraph>

      <LegalHeading>7. Liens externes</LegalHeading>
      <LegalParagraph>
        Le site web peut contenir des liens vers des pages tierces. WelcoKit.com n&rsquo;est pas
        responsable du contenu ni des politiques de confidentialité de ces sites.
      </LegalParagraph>

      <LegalHeading>8. Législation applicable et juridiction</LegalHeading>
      <LegalParagraph>
        La législation applicable est la législation espagnole. Pour tout litige pouvant
        survenir en lien avec le site web, les parties se soumettent expressément à la
        juridiction des tribunaux de Séville, sauf disposition contraire de la réglementation.
      </LegalParagraph>

      <LegalHeading>9. Modifications des présentes mentions légales</LegalHeading>
      <LegalParagraph>
        Ignacio Jacquot se réserve le droit de modifier ces mentions légales à tout moment, en
        fonction des évolutions légales ou de la nature des services proposés.
      </LegalParagraph>
    </article>
  );
}
