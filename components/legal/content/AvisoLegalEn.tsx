import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function AvisoLegalEn() {
  return (
    <article>
      <LegalTitle>Legal notice and terms of use</LegalTitle>

      <LegalHeading>1. Website owner details</LegalHeading>
      <LegalParagraph>
        In compliance with the information duty established by Spanish Law 34/2002, of 11
        July, on Information Society Services and Electronic Commerce (LSSI-CE), the owner of
        this website is:
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Name:</strong> WelcoKit.com
        </li>
        <li>
          <strong>Owner:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>Tax ID (NIF):</strong> 31265006W
        </li>
        <li>
          <strong>Address:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005
          Sevilla, Spain
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
        <li>
          <strong>Activity:</strong> Digital Services
        </li>
      </LegalList>

      <LegalHeading>2. Purpose of the website</LegalHeading>
      <LegalParagraph>
        This website is intended to provide a SaaS platform for short-term rental hosts to
        create multilingual digital guides for their guests, including WiFi information,
        check-in/check-out details, house rules, and AI-generated local recommendations.
      </LegalParagraph>

      <LegalHeading>3. Intellectual and industrial property</LegalHeading>
      <LegalParagraph>
        All content on this website (text, images, videos, logos, designs, source code, etc.)
        is the property of WelcoKit.com or is used under the necessary licenses. Reproduction,
        distribution, or modification of any content without the owner&rsquo;s express consent is
        prohibited.
      </LegalParagraph>

      <LegalHeading>4. Liability for content</LegalHeading>
      <LegalParagraph>
        WelcoKit.com is not liable for any damage or harm arising from misuse of the
        information published on this website. Nor is it liable for the website&rsquo;s
        unavailability due to technical or maintenance reasons.
      </LegalParagraph>

      <LegalHeading>5. Personal data protection</LegalHeading>
      <LegalParagraph>
        In accordance with the General Data Protection Regulation (EU) 2016/679 (GDPR) and
        Spanish Organic Law 3/2018, of 5 December (LOPDGDD), users are informed that the
        personal data provided will be treated confidentially in order to manage the
        relationship with users and provide the contracted services.
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Data controller:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>Purpose:</strong> Managing the WelcoKit platform, providing the contracted
          service, inquiries, and commercial communications.
        </li>
        <li>
          <strong>Legal basis:</strong> Consent of the data subject and performance of the
          service contract.
        </li>
        <li>
          <strong>Rights:</strong> Access, rectification, erasure, and objection, as well as
          other rights under applicable law.
        </li>
        <li>
          <strong>Contact to exercise your rights:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
      </LegalList>

      <LegalHeading>6. Use of cookies</LegalHeading>
      <LegalParagraph>
        This website uses cookies to improve the user experience. By browsing this site, the
        user accepts the use of cookies in accordance with our{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          cookie policy
        </a>
        .
      </LegalParagraph>

      <LegalHeading>7. External links</LegalHeading>
      <LegalParagraph>
        The website may contain links to third-party pages. WelcoKit.com is not responsible
        for the content or privacy policies of those sites.
      </LegalParagraph>

      <LegalHeading>8. Applicable law and jurisdiction</LegalHeading>
      <LegalParagraph>
        Spanish law applies. For any dispute that may arise in connection with the website,
        the parties expressly submit to the jurisdiction of the Courts of Seville, unless
        otherwise required by law.
      </LegalParagraph>

      <LegalHeading>9. Amendments to this legal notice</LegalHeading>
      <LegalParagraph>
        Ignacio Jacquot reserves the right to amend this legal notice at any time, in response
        to legal changes or to the nature of the services offered.
      </LegalParagraph>
    </article>
  );
}
