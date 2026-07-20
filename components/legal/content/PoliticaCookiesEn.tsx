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

export function PoliticaCookiesEn() {
  return (
    <article>
      <LegalTitle>Cookie policy</LegalTitle>
      <LegalLead>
        This cookie policy applies to citizens and legal permanent residents of the European
        Economic Area and Switzerland.
      </LegalLead>

      <LegalHeading>1. Introduction</LegalHeading>
      <LegalParagraph>
        Our website,{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>{" "}
        (hereinafter: &ldquo;the website&rdquo;) uses cookies and other related technologies.
        The following document explains how we use cookies on our website.
      </LegalParagraph>

      <LegalHeading>2. What are cookies?</LegalHeading>
      <LegalParagraph>
        A cookie is a small file sent along with the pages of this website and stored by your
        browser on your device. The information stored may be sent back to our servers or to
        the servers of the relevant third parties during a subsequent visit.
      </LegalParagraph>

      <LegalHeading>3. Cookies</LegalHeading>
      <LegalSubheading>3.1 Technical or functional cookies</LegalSubheading>
      <LegalParagraph>
        Some cookies ensure that certain parts of the website work properly, such as keeping
        you logged in or remembering your language preference. We may place these cookies
        without your consent, as they are necessary for the service to function.
      </LegalParagraph>
      <LegalSubheading>3.2 Statistics cookies</LegalSubheading>
      <LegalParagraph>
        Where applicable, we use statistics cookies to optimize the website experience for our
        users. We ask your permission before placing statistics cookies.
      </LegalParagraph>

      <LegalHeading>4. Cookies used</LegalHeading>
      <LegalTableWrapper>
        <LegalTableHead labels={["Cookie", "Type", "Purpose"]} />
        <tbody>
          <LegalTableRow
            cells={["NEXT_LOCALE", "Functional", "Remembering the user's preferred language"]}
          />
          <LegalTableRow
            cells={[
              "Session cookies (Supabase Auth)",
              "Functional",
              "Keeping the authenticated user's session active",
            ]}
          />
          <LegalTableRow
            cells={[
              "Stripe cookies",
              "Functional",
              "Secure processing of payments and subscriptions",
            ]}
          />
        </tbody>
      </LegalTableWrapper>

      <LegalHeading>5. Consent</LegalHeading>
      <LegalParagraph>
        When you visit our website for the first time, we will inform you about the use of
        cookies. By continuing to browse, you accept the use of the strictly necessary cookies
        described in this policy.
      </LegalParagraph>

      <LegalHeading>6. Enabling/disabling and deleting cookies</LegalHeading>
      <LegalParagraph>
        You can use your internet browser to automatically or manually delete cookies, or to
        configure it to refuse their installation. Please note that our website may not work
        properly (for example, you may not be able to stay logged in) if technical cookies are
        disabled.
      </LegalParagraph>

      <LegalHeading>7. Your rights regarding personal data</LegalHeading>
      <LegalParagraph>
        You have the right to access, rectify, erase, restrict the processing of, object to,
        and request the portability of your personal data. To exercise these rights, please
        contact us using the contact details below. You also have the right to file a
        complaint with the Spanish Data Protection Agency (Agencia Española de Protección de
        Datos).
      </LegalParagraph>

      <LegalHeading>8. Contact details</LegalHeading>
      <LegalParagraph>
        WelcoKit.com
        <br />
        Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005 Sevilla, Spain
        <br />
        Website:{" "}
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
