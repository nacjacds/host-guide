import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function PoliticaPrivacidadEn() {
  return (
    <article>
      <LegalTitle>Privacy policy</LegalTitle>

      <LegalParagraph>
        In compliance with Regulation (EU) 2016/679 of the European Parliament and of the
        Council, of 27 April 2016 (GDPR), as well as Spanish Organic Law 3/2018, of 5 December
        (LOPDGDD), users of this website are informed about the privacy policy applied to the
        collection, processing, and protection of their personal data.
      </LegalParagraph>

      <LegalHeading>1. Data controller</LegalHeading>
      <LegalList>
        <li>
          <strong>Name:</strong> WelcoKit.com
        </li>
        <li>
          <strong>Tax ID (NIF):</strong> 31265006W
        </li>
        <li>
          <strong>Address:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005
          Sevilla, Spain
        </li>
        <li>
          <strong>Activity:</strong> Digital Services
        </li>
      </LegalList>

      <LegalHeading>2. Purpose of data processing</LegalHeading>
      <LegalParagraph>
        The personal data collected will be used for the following purposes:
      </LegalParagraph>
      <LegalList>
        <li>Managing the user&rsquo;s registration and account on the platform.</li>
        <li>
          Providing the contracted service (creating and managing digital guides for
          accommodations).
        </li>
        <li>Handling inquiries received through contact or support forms.</li>
        <li>Sending commercial communications related to the services offered.</li>
        <li>Managing billing and subscription payments.</li>
        <li>Complying with applicable legal obligations.</li>
      </LegalList>

      <LegalHeading>3. Legal basis for data processing</LegalHeading>
      <LegalParagraph>
        Personal data is processed on the legal basis of the user&rsquo;s explicit consent, the
        performance of a contract, or compliance with applicable legal obligations.
      </LegalParagraph>

      <LegalHeading>4. Data retention</LegalHeading>
      <LegalParagraph>
        Personal data provided will be retained for as long as necessary to fulfill the
        purpose for which it was collected, for as long as the contractual relationship
        remains active, or for the period required by applicable law.
      </LegalParagraph>

      <LegalHeading>5. Disclosure of data to third parties</LegalHeading>
      <LegalParagraph>
        Personal data will not be disclosed to third parties, except where legally required or
        where necessary to provide the contracted services (technology providers such as
        server hosting, payment processing, or artificial intelligence services used to
        generate guide content).
      </LegalParagraph>

      <LegalHeading>6. User rights</LegalHeading>
      <LegalParagraph>Users have the right to:</LegalParagraph>
      <LegalList>
        <li>Access their personal data.</li>
        <li>Request the rectification of inaccurate data.</li>
        <li>Request the erasure of their data when it is no longer necessary.</li>
        <li>Request the restriction of the processing of their data.</li>
        <li>Object to the processing of their data.</li>
        <li>Request the portability of their data.</li>
      </LegalList>
      <LegalParagraph>
        Users may exercise their rights by sending a written request to the following email
        address:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>

      <LegalHeading>7. Security measures</LegalHeading>
      <LegalParagraph>
        WelcoKit.com has adopted the technical and organizational measures necessary to ensure
        the security of personal data and to prevent its loss, misuse, alteration, or
        unauthorized access.
      </LegalParagraph>

      <LegalHeading>8. Cookies</LegalHeading>
      <LegalParagraph>
        This website uses cookies to improve the user experience. You can find more details in
        our{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          Cookie Policy
        </a>
        .
      </LegalParagraph>

      <LegalHeading>9. Changes to this privacy policy</LegalHeading>
      <LegalParagraph>
        WelcoKit.com reserves the right to amend this privacy policy to adapt it to
        legislative developments or changes in the services offered. Users are advised to
        review this policy periodically.
      </LegalParagraph>

      <LegalHeading>10. Applicable law and jurisdiction</LegalHeading>
      <LegalParagraph>
        This privacy policy is governed by Spanish law. Any dispute shall be submitted to the
        Courts of Seville, unless otherwise required by law.
      </LegalParagraph>

      <hr className="mt-10 border-[#DDD8CC]" />

      <LegalParagraph>
        If you have any questions about this privacy policy, please feel free to contact us at:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
