import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function PoliticaPrivacidadEs() {
  return (
    <article>
      <LegalTitle>Política de privacidad</LegalTitle>

      <LegalParagraph>
        En cumplimiento con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo,
        de 27 de abril de 2016 (RGPD), así como la Ley Orgánica 3/2018, de 5 de diciembre
        (LOPDGDD), se informa a los usuarios de esta web sobre la política de privacidad
        aplicada a la recopilación, tratamiento y protección de sus datos personales.
      </LegalParagraph>

      <LegalHeading>1. Responsable del tratamiento</LegalHeading>
      <LegalList>
        <li>
          <strong>Nombre:</strong> WelcoKit.com
        </li>
        <li>
          <strong>NIF:</strong> 31265006W
        </li>
        <li>
          <strong>Dirección:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D,
          41005 Sevilla
        </li>
        <li>
          <strong>Actividad:</strong> Servicios Digitales
        </li>
      </LegalList>

      <LegalHeading>2. Finalidad del tratamiento de los datos</LegalHeading>
      <LegalParagraph>
        Los datos personales recopilados serán utilizados con los siguientes fines:
      </LegalParagraph>
      <LegalList>
        <li>Gestionar el registro y la cuenta del usuario en la plataforma.</li>
        <li>
          Prestar el servicio contratado (creación y gestión de guías digitales para
          alojamientos).
        </li>
        <li>
          Gestionar las consultas recibidas a través de formularios de contacto o soporte.
        </li>
        <li>Realizar comunicaciones comerciales relacionadas con los servicios ofrecidos.</li>
        <li>Gestionar la facturación y el cobro de suscripciones.</li>
        <li>Cumplir con obligaciones legales aplicables.</li>
      </LegalList>

      <LegalHeading>3. Base legal para el tratamiento de datos</LegalHeading>
      <LegalParagraph>
        El tratamiento de datos personales se realiza sobre la base legal del consentimiento
        explícito del usuario, la ejecución de un contrato o el cumplimiento de obligaciones
        legales aplicables.
      </LegalParagraph>

      <LegalHeading>4. Conservación de los datos</LegalHeading>
      <LegalParagraph>
        Los datos personales proporcionados se conservarán durante el tiempo necesario para
        cumplir con la finalidad para la que fueron recogidos, mientras se mantenga activa la
        relación contractual, o durante el tiempo exigido por las leyes vigentes.
      </LegalParagraph>

      <LegalHeading>5. Comunicación de datos a terceros</LegalHeading>
      <LegalParagraph>
        No se cederán datos personales a terceros, salvo obligación legal o cuando sea
        necesario para la prestación de los servicios contratados (proveedores tecnológicos
        como alojamiento en servidores, procesamiento de pagos, o servicios de inteligencia
        artificial utilizados para generar contenido de las guías).
      </LegalParagraph>

      <LegalHeading>6. Derechos del usuario</LegalHeading>
      <LegalParagraph>Los usuarios tienen derecho a:</LegalParagraph>
      <LegalList>
        <li>Acceder a sus datos personales.</li>
        <li>Solicitar la rectificación de datos inexactos.</li>
        <li>Solicitar la supresión de sus datos cuando ya no sean necesarios.</li>
        <li>Solicitar la limitación del tratamiento de sus datos.</li>
        <li>Oponerse al tratamiento de sus datos.</li>
        <li>Solicitar la portabilidad de los datos.</li>
      </LegalList>
      <LegalParagraph>
        Los usuarios pueden ejercer sus derechos enviando una solicitud por escrito a la
        dirección de correo electrónico:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>

      <LegalHeading>7. Medidas de seguridad</LegalHeading>
      <LegalParagraph>
        WelcoKit.com ha adoptado las medidas técnicas y organizativas necesarias para
        garantizar la seguridad de los datos personales y evitar su pérdida, mal uso,
        alteración o acceso no autorizado.
      </LegalParagraph>

      <LegalHeading>8. Cookies</LegalHeading>
      <LegalParagraph>
        Este sitio web utiliza cookies para mejorar la experiencia del usuario. Puedes
        consultar más detalles en nuestra{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          Política de Cookies
        </a>
        .
      </LegalParagraph>

      <LegalHeading>9. Modificación de la política de privacidad</LegalHeading>
      <LegalParagraph>
        WelcoKit.com se reserva el derecho de modificar esta política de privacidad para
        adaptarla a novedades legislativas o cambios en los servicios ofrecidos. Se recomienda
        a los usuarios revisar periódicamente esta política.
      </LegalParagraph>

      <LegalHeading>10. Legislación aplicable y jurisdicción</LegalHeading>
      <LegalParagraph>
        Esta política de privacidad se rige por la legislación española. Para la resolución de
        cualquier conflicto, las partes se someterán a los Juzgados y Tribunales de Sevilla,
        salvo que la normativa establezca otra cosa.
      </LegalParagraph>

      <hr className="mt-10 border-[#DDD8CC]" />

      <LegalParagraph>
        Si tienes alguna duda sobre esta política de privacidad, no dudes en contactar a
        través del correo electrónico:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
