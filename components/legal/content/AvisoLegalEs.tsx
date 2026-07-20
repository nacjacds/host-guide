import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function AvisoLegalEs() {
  return (
    <article>
      <LegalTitle>Aviso legal y condiciones de uso</LegalTitle>

      <LegalHeading>1. Datos del titular del sitio web</LegalHeading>
      <LegalParagraph>
        En cumplimiento con el deber de información establecido en la Ley 34/2002, de 11 de
        julio, de Servicios de la Sociedad de la Información y Comercio Electrónico
        (LSSI-CE), se informa que el titular de este sitio web es:
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Nombre:</strong> WelcoKit.com
        </li>
        <li>
          <strong>Titular:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>NIF:</strong> 31265006W
        </li>
        <li>
          <strong>Dirección:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D,
          41005 Sevilla
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
        <li>
          <strong>Actividad:</strong> Servicios Digitales
        </li>
      </LegalList>

      <LegalHeading>2. Objeto del sitio web</LegalHeading>
      <LegalParagraph>
        El presente sitio web tiene como objetivo ofrecer una plataforma SaaS para que
        anfitriones de alojamientos turísticos creen guías digitales multilingües para sus
        huéspedes, incluyendo información de WiFi, check-in/check-out, normas de la casa y
        recomendaciones locales generadas con inteligencia artificial.
      </LegalParagraph>

      <LegalHeading>3. Propiedad intelectual e industrial</LegalHeading>
      <LegalParagraph>
        Todos los contenidos de este sitio web (textos, imágenes, vídeos, logotipos, diseños,
        código fuente, etc.) son propiedad de WelcoKit.com o cuentan con las licencias
        necesarias para su uso. Queda prohibida la reproducción, distribución, o modificación
        de cualquier contenido sin el consentimiento expreso del titular.
      </LegalParagraph>

      <LegalHeading>4. Responsabilidad del contenido</LegalHeading>
      <LegalParagraph>
        WelcoKit.com no se responsabiliza de los daños o perjuicios que puedan derivarse del
        mal uso de la información publicada en este sitio web. Tampoco se hace responsable de
        la falta de disponibilidad del sitio web por causas técnicas o de mantenimiento.
      </LegalParagraph>

      <LegalHeading>5. Protección de datos personales</LegalHeading>
      <LegalParagraph>
        De acuerdo con el Reglamento General de Protección de Datos (UE) 2016/679 (RGPD) y la
        Ley Orgánica 3/2018, de 5 de diciembre (LOPDGDD), se informa a los usuarios de que los
        datos personales facilitados serán tratados de forma confidencial con el fin de
        gestionar la relación con los usuarios y prestar los servicios contratados.
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Responsable del tratamiento:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>Finalidad:</strong> Gestión de la plataforma WelcoKit, prestación del
          servicio contratado, consultas y comunicaciones comerciales.
        </li>
        <li>
          <strong>Legitimación:</strong> Consentimiento del interesado y ejecución del
          contrato de servicio.
        </li>
        <li>
          <strong>Derechos:</strong> Acceso, rectificación, cancelación y oposición, así como
          otros derechos conforme a la legislación vigente.
        </li>
        <li>
          <strong>Contacto para ejercer derechos:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
      </LegalList>

      <LegalHeading>6. Uso de cookies</LegalHeading>
      <LegalParagraph>
        Este sitio web utiliza cookies para mejorar la experiencia del usuario. Al navegar
        por este sitio, el usuario acepta el uso de cookies según nuestra{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          política de cookies
        </a>
        .
      </LegalParagraph>

      <LegalHeading>7. Enlaces externos</LegalHeading>
      <LegalParagraph>
        El sitio web puede contener enlaces a páginas de terceros. WelcoKit.com no se hace
        responsable del contenido ni de las políticas de privacidad de dichos sitios.
      </LegalParagraph>

      <LegalHeading>8. Legislación aplicable y jurisdicción</LegalHeading>
      <LegalParagraph>
        La legislación aplicable es la española. Para cualquier controversia que pudiera
        surgir en relación con el sitio web, las partes se someten expresamente a la
        jurisdicción de los Juzgados y Tribunales de Sevilla, salvo que la normativa
        establezca lo contrario.
      </LegalParagraph>

      <LegalHeading>9. Modificaciones del aviso legal</LegalHeading>
      <LegalParagraph>
        Ignacio Jacquot se reserva el derecho de modificar este aviso legal en cualquier
        momento, según cambios legales o por la naturaleza de los servicios ofrecidos.
      </LegalParagraph>
    </article>
  );
}
