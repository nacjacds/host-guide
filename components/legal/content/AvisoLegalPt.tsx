import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function AvisoLegalPt() {
  return (
    <article>
      <LegalTitle>Aviso legal e condições de utilização</LegalTitle>

      <LegalHeading>1. Dados do titular do site</LegalHeading>
      <LegalParagraph>
        Em cumprimento do dever de informação estabelecido pela Lei espanhola 34/2002, de 11
        de julho, de Serviços da Sociedade da Informação e Comércio Eletrónico (LSSI-CE,
        legislação espanhola), informa-se que o titular deste site é:
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Nome:</strong> WelcoKit.com
        </li>
        <li>
          <strong>Titular:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>NIF (identificador fiscal espanhol):</strong> 31265006W
        </li>
        <li>
          <strong>Morada:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005
          Sevilha, Espanha
        </li>
        <li>
          <strong>Correio eletrónico:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
        <li>
          <strong>Atividade:</strong> Serviços Digitais
        </li>
      </LegalList>

      <LegalHeading>2. Objeto do site</LegalHeading>
      <LegalParagraph>
        Este site tem como objetivo oferecer uma plataforma SaaS para que anfitriões de
        alojamentos de curta duração criem guias digitais multilingues para os seus hóspedes,
        incluindo informação de WiFi, check-in/check-out, regras da casa e recomendações
        locais geradas com inteligência artificial.
      </LegalParagraph>

      <LegalHeading>3. Propriedade intelectual e industrial</LegalHeading>
      <LegalParagraph>
        Todos os conteúdos deste site (textos, imagens, vídeos, logótipos, designs, código
        fonte, etc.) são propriedade da WelcoKit.com ou estão sujeitos às licenças necessárias
        para a sua utilização. É proibida a reprodução, distribuição ou modificação de
        qualquer conteúdo sem o consentimento expresso do titular.
      </LegalParagraph>

      <LegalHeading>4. Responsabilidade pelo conteúdo</LegalHeading>
      <LegalParagraph>
        A WelcoKit.com não se responsabiliza pelos danos ou prejuízos que possam resultar do
        uso indevido da informação publicada neste site. Também não se responsabiliza pela
        indisponibilidade do site por motivos técnicos ou de manutenção.
      </LegalParagraph>

      <LegalHeading>5. Proteção de dados pessoais</LegalHeading>
      <LegalParagraph>
        De acordo com o Regulamento Geral sobre a Proteção de Dados (UE) 2016/679 (RGPD) e a
        Lei Orgânica espanhola 3/2018, de 5 de dezembro (LOPDGDD, legislação espanhola),
        informam-se os utilizadores de que os dados pessoais fornecidos serão tratados de
        forma confidencial com o objetivo de gerir a relação com os utilizadores e prestar os
        serviços contratados.
      </LegalParagraph>
      <LegalList>
        <li>
          <strong>Responsável pelo tratamento:</strong> Jacquot Joaquin Ignacio
        </li>
        <li>
          <strong>Finalidade:</strong> Gestão da plataforma WelcoKit, prestação do serviço
          contratado, pedidos de informação e comunicações comerciais.
        </li>
        <li>
          <strong>Fundamento jurídico:</strong> Consentimento do titular dos dados e execução
          do contrato de serviço.
        </li>
        <li>
          <strong>Direitos:</strong> Acesso, retificação, apagamento e oposição, bem como
          outros direitos previstos na legislação em vigor.
        </li>
        <li>
          <strong>Contacto para exercer os direitos:</strong>{" "}
          <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
            info@welcokit.com
          </a>
        </li>
      </LegalList>

      <LegalHeading>6. Utilização de cookies</LegalHeading>
      <LegalParagraph>
        Este site utiliza cookies para melhorar a experiência do utilizador. Ao navegar neste
        site, o utilizador aceita a utilização de cookies de acordo com a nossa{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          política de cookies
        </a>
        .
      </LegalParagraph>

      <LegalHeading>7. Ligações externas</LegalHeading>
      <LegalParagraph>
        O site pode conter ligações para páginas de terceiros. A WelcoKit.com não se
        responsabiliza pelo conteúdo nem pelas políticas de privacidade desses sites.
      </LegalParagraph>

      <LegalHeading>8. Legislação aplicável e jurisdição</LegalHeading>
      <LegalParagraph>
        A legislação aplicável é a espanhola. Para qualquer litígio que possa surgir em
        relação ao site, as partes submetem-se expressamente à jurisdição dos Tribunais de
        Sevilha, salvo disposição legal em contrário.
      </LegalParagraph>

      <LegalHeading>9. Alterações a este aviso legal</LegalHeading>
      <LegalParagraph>
        Ignacio Jacquot reserva-se o direito de alterar este aviso legal a qualquer momento,
        em função de alterações legais ou da natureza dos serviços oferecidos.
      </LegalParagraph>
    </article>
  );
}
