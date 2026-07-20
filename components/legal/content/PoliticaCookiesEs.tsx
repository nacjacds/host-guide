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

export function PoliticaCookiesEs() {
  return (
    <article>
      <LegalTitle>Política de cookies</LegalTitle>
      <LegalLead>
        Esta política de cookies se aplica a los ciudadanos y residentes legales permanentes
        del Espacio Económico Europeo y Suiza.
      </LegalLead>

      <LegalHeading>1. Introducción</LegalHeading>
      <LegalParagraph>
        Nuestra web,{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>{" "}
        (en adelante: «la web») utiliza cookies y otras tecnologías relacionadas. En el
        siguiente documento te informamos sobre el uso de cookies en nuestra web.
      </LegalParagraph>

      <LegalHeading>2. ¿Qué son las cookies?</LegalHeading>
      <LegalParagraph>
        Una cookie es un pequeño archivo que se envía junto con las páginas de esta web y que
        tu navegador almacena en tu dispositivo. La información almacenada puede ser devuelta
        a nuestros servidores o a los servidores de terceros apropiados durante una visita
        posterior.
      </LegalParagraph>

      <LegalHeading>3. Cookies</LegalHeading>
      <LegalSubheading>3.1 Cookies técnicas o funcionales</LegalSubheading>
      <LegalParagraph>
        Algunas cookies aseguran que ciertas partes de la web funcionen correctamente, como
        mantener tu sesión iniciada o recordar tu preferencia de idioma. Podemos colocar estas
        cookies sin tu consentimiento, ya que son necesarias para el funcionamiento del
        servicio.
      </LegalParagraph>
      <LegalSubheading>3.2 Cookies de estadísticas</LegalSubheading>
      <LegalParagraph>
        Utilizamos, si procede, cookies estadísticas para optimizar la experiencia de la web
        para nuestros usuarios. Te pedimos tu permiso para colocar cookies de estadísticas.
      </LegalParagraph>

      <LegalHeading>4. Cookies usadas</LegalHeading>
      <LegalTableWrapper>
        <LegalTableHead labels={["Cookie", "Tipo", "Finalidad"]} />
        <tbody>
          <LegalTableRow
            cells={["NEXT_LOCALE", "Funcional", "Recordar el idioma preferido del usuario"]}
          />
          <LegalTableRow
            cells={[
              "Cookies de sesión (Supabase Auth)",
              "Funcional",
              "Mantener la sesión del usuario autenticado",
            ]}
          />
          <LegalTableRow
            cells={[
              "Cookies de Stripe",
              "Funcional",
              "Procesamiento seguro de pagos y suscripciones",
            ]}
          />
        </tbody>
      </LegalTableWrapper>

      <LegalHeading>5. Consentimiento</LegalHeading>
      <LegalParagraph>
        Cuando visites nuestra web por primera vez, te informaremos sobre el uso de cookies.
        Al continuar navegando, aceptas el uso de las cookies estrictamente necesarias
        descritas en esta política.
      </LegalParagraph>

      <LegalHeading>6. Activación/desactivación y borrado de cookies</LegalHeading>
      <LegalParagraph>
        Puedes utilizar tu navegador de Internet para eliminar las cookies de forma automática
        o manual, o para configurarlo de forma que rechace su instalación. Ten en cuenta que
        nuestra web puede no funcionar correctamente (por ejemplo, no podrás mantener tu
        sesión iniciada) si las cookies técnicas están desactivadas.
      </LegalParagraph>

      <LegalHeading>7. Tus derechos con respecto a los datos personales</LegalHeading>
      <LegalParagraph>
        Tienes derecho a acceder, rectificar, suprimir, limitar el tratamiento, oponerte y
        solicitar la portabilidad de tus datos personales. Para ejercer estos derechos,
        contacta con nosotros usando los datos de contacto indicados a continuación. También
        tienes derecho a presentar una reclamación ante la Agencia Española de Protección de
        Datos.
      </LegalParagraph>

      <LegalHeading>8. Datos de contacto</LegalHeading>
      <LegalParagraph>
        WelcoKit.com
        <br />
        Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005 Sevilla
        <br />
        Web:{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>
        <br />
        Correo electrónico:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
