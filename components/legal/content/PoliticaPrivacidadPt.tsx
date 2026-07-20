import {
  LegalTitle,
  LegalHeading,
  LegalParagraph,
  LegalList,
} from "@/components/legal/LegalTypography";

export function PoliticaPrivacidadPt() {
  return (
    <article>
      <LegalTitle>Política de privacidade</LegalTitle>

      <LegalParagraph>
        Em cumprimento do Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho, de 27
        de abril de 2016 (RGPD), bem como da Lei Orgânica espanhola 3/2018, de 5 de dezembro
        (LOPDGDD, legislação espanhola), informam-se os utilizadores deste site sobre a
        política de privacidade aplicada à recolha, tratamento e proteção dos seus dados
        pessoais.
      </LegalParagraph>

      <LegalHeading>1. Responsável pelo tratamento</LegalHeading>
      <LegalList>
        <li>
          <strong>Nome:</strong> WelcoKit.com
        </li>
        <li>
          <strong>NIF (identificador fiscal espanhol):</strong> 31265006W
        </li>
        <li>
          <strong>Morada:</strong> Avenida Ramón y Cajal, 2, Esc. 1, Planta 2, Pta. D, 41005
          Sevilha, Espanha
        </li>
        <li>
          <strong>Atividade:</strong> Serviços Digitais
        </li>
      </LegalList>

      <LegalHeading>2. Finalidade do tratamento dos dados</LegalHeading>
      <LegalParagraph>
        Os dados pessoais recolhidos serão utilizados para os seguintes fins:
      </LegalParagraph>
      <LegalList>
        <li>Gerir o registo e a conta do utilizador na plataforma.</li>
        <li>
          Prestar o serviço contratado (criação e gestão de guias digitais para alojamentos).
        </li>
        <li>Gerir os pedidos recebidos através de formulários de contacto ou suporte.</li>
        <li>Realizar comunicações comerciais relacionadas com os serviços oferecidos.</li>
        <li>Gerir a faturação e o pagamento de subscrições.</li>
        <li>Cumprir as obrigações legais aplicáveis.</li>
      </LegalList>

      <LegalHeading>3. Fundamento jurídico para o tratamento de dados</LegalHeading>
      <LegalParagraph>
        O tratamento de dados pessoais é realizado com base no consentimento explícito do
        utilizador, na execução de um contrato ou no cumprimento de obrigações legais
        aplicáveis.
      </LegalParagraph>

      <LegalHeading>4. Conservação dos dados</LegalHeading>
      <LegalParagraph>
        Os dados pessoais fornecidos serão conservados durante o tempo necessário para
        cumprir a finalidade para a qual foram recolhidos, enquanto se mantiver ativa a
        relação contratual, ou durante o período exigido pela legislação em vigor.
      </LegalParagraph>

      <LegalHeading>5. Comunicação de dados a terceiros</LegalHeading>
      <LegalParagraph>
        Não serão cedidos dados pessoais a terceiros, salvo obrigação legal ou quando tal seja
        necessário para a prestação dos serviços contratados (fornecedores tecnológicos como
        alojamento em servidores, processamento de pagamentos, ou serviços de inteligência
        artificial utilizados para gerar o conteúdo dos guias).
      </LegalParagraph>

      <LegalHeading>6. Direitos do utilizador</LegalHeading>
      <LegalParagraph>Os utilizadores têm direito a:</LegalParagraph>
      <LegalList>
        <li>Aceder aos seus dados pessoais.</li>
        <li>Solicitar a retificação de dados inexatos.</li>
        <li>Solicitar o apagamento dos seus dados quando já não sejam necessários.</li>
        <li>Solicitar a limitação do tratamento dos seus dados.</li>
        <li>Opor-se ao tratamento dos seus dados.</li>
        <li>Solicitar a portabilidade dos seus dados.</li>
      </LegalList>
      <LegalParagraph>
        Os utilizadores podem exercer os seus direitos enviando um pedido por escrito para o
        seguinte endereço de correio eletrónico:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>

      <LegalHeading>7. Medidas de segurança</LegalHeading>
      <LegalParagraph>
        A WelcoKit.com adotou as medidas técnicas e organizativas necessárias para garantir a
        segurança dos dados pessoais e evitar a sua perda, uso indevido, alteração ou acesso
        não autorizado.
      </LegalParagraph>

      <LegalHeading>8. Cookies</LegalHeading>
      <LegalParagraph>
        Este site utiliza cookies para melhorar a experiência do utilizador. Podes consultar
        mais detalhes na nossa{" "}
        <a href="/politica-de-cookies" className="text-[#1B4F72] underline">
          Política de Cookies
        </a>
        .
      </LegalParagraph>

      <LegalHeading>9. Alteração da política de privacidade</LegalHeading>
      <LegalParagraph>
        A WelcoKit.com reserva-se o direito de alterar esta política de privacidade para a
        adaptar a novidades legislativas ou a alterações nos serviços oferecidos. Recomenda-se
        aos utilizadores que revejam periodicamente esta política.
      </LegalParagraph>

      <LegalHeading>10. Legislação aplicável e jurisdição</LegalHeading>
      <LegalParagraph>
        Esta política de privacidade rege-se pela legislação espanhola. Para a resolução de
        qualquer conflito, as partes submeter-se-ão aos Tribunais de Sevilha, salvo disposição
        legal em contrário.
      </LegalParagraph>

      <hr className="mt-10 border-[#DDD8CC]" />

      <LegalParagraph>
        Se tiveres alguma dúvida sobre esta política de privacidade, contacta-nos através do
        correio eletrónico:{" "}
        <a href="mailto:info@welcokit.com" className="text-[#1B4F72] underline">
          info@welcokit.com
        </a>
      </LegalParagraph>
    </article>
  );
}
