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

export function PoliticaCookiesPt() {
  return (
    <article>
      <LegalTitle>Política de cookies</LegalTitle>
      <LegalLead>
        Esta política de cookies aplica-se aos cidadãos e residentes legais permanentes do
        Espaço Económico Europeu e da Suíça.
      </LegalLead>

      <LegalHeading>1. Introdução</LegalHeading>
      <LegalParagraph>
        O nosso site,{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>{" "}
        (doravante: «o site») utiliza cookies e outras tecnologias relacionadas. No documento
        seguinte informamos-te sobre a utilização de cookies no nosso site.
      </LegalParagraph>

      <LegalHeading>2. O que são cookies?</LegalHeading>
      <LegalParagraph>
        Um cookie é um pequeno ficheiro enviado juntamente com as páginas deste site e que o
        teu navegador armazena no teu dispositivo. A informação armazenada pode ser devolvida
        aos nossos servidores ou aos servidores de terceiros relevantes numa visita
        posterior.
      </LegalParagraph>

      <LegalHeading>3. Cookies</LegalHeading>
      <LegalSubheading>3.1 Cookies técnicos ou funcionais</LegalSubheading>
      <LegalParagraph>
        Alguns cookies garantem que determinadas partes do site funcionem corretamente, como
        manter a tua sessão iniciada ou recordar a tua preferência de idioma. Podemos colocar
        estes cookies sem o teu consentimento, uma vez que são necessários para o
        funcionamento do serviço.
      </LegalParagraph>
      <LegalSubheading>3.2 Cookies de estatísticas</LegalSubheading>
      <LegalParagraph>
        Quando aplicável, utilizamos cookies de estatísticas para otimizar a experiência do
        site para os nossos utilizadores. Pedimos a tua autorização antes de colocar cookies
        de estatísticas.
      </LegalParagraph>

      <LegalHeading>4. Cookies utilizados</LegalHeading>
      <LegalTableWrapper>
        <LegalTableHead labels={["Cookie", "Tipo", "Finalidade"]} />
        <tbody>
          <LegalTableRow
            cells={["NEXT_LOCALE", "Funcional", "Recordar o idioma preferido do utilizador"]}
          />
          <LegalTableRow
            cells={[
              "Cookies de sessão (Supabase Auth)",
              "Funcional",
              "Manter a sessão do utilizador autenticado",
            ]}
          />
          <LegalTableRow
            cells={[
              "Cookies do Stripe",
              "Funcional",
              "Processamento seguro de pagamentos e subscrições",
            ]}
          />
        </tbody>
      </LegalTableWrapper>

      <LegalHeading>5. Consentimento</LegalHeading>
      <LegalParagraph>
        Quando visitares o nosso site pela primeira vez, informar-te-emos sobre a utilização
        de cookies. Ao continuares a navegar, aceitas a utilização dos cookies estritamente
        necessários descritos nesta política.
      </LegalParagraph>

      <LegalHeading>6. Ativação/desativação e eliminação de cookies</LegalHeading>
      <LegalParagraph>
        Podes utilizar o teu navegador de internet para eliminar cookies de forma automática
        ou manual, ou para o configurar de modo a recusar a sua instalação. Tem em conta que o
        nosso site pode não funcionar corretamente (por exemplo, poderás não conseguir manter
        a sessão iniciada) se os cookies técnicos estiverem desativados.
      </LegalParagraph>

      <LegalHeading>7. Os teus direitos em relação aos dados pessoais</LegalHeading>
      <LegalParagraph>
        Tens o direito de aceder, retificar, apagar, limitar o tratamento, opor-te e solicitar
        a portabilidade dos teus dados pessoais. Para exercer estes direitos, contacta-nos
        através dos dados de contacto indicados abaixo. Tens também o direito de apresentar
        uma reclamação junto da Agência Espanhola de Proteção de Dados (Agencia Española de
        Protección de Datos).
      </LegalParagraph>

      <LegalHeading>8. Dados de contacto</LegalHeading>
      <LegalParagraph>
        WelcoKit.com
        <br />
        Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005 Sevilha, Espanha
        <br />
        Site:{" "}
        <a href="/" className="text-[#1B4F72] underline">
          https://welcokit.com
        </a>
        <br />
        Correio eletrónico:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
