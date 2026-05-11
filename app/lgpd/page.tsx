import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/layout/LegalPageLayout'

export const metadata: Metadata = {
  title: 'LGPD - Lei Geral de Protecao de Dados | Amélia Saúde',
  description: 'Saiba como a Amélia Saúde esta em conformidade com a Lei Geral de Protecao de Dados (LGPD) e como exercer seus direitos.',
}

export default function LGPDPage() {
  return (
    <LegalPageLayout
      title="LGPD"
      subtitle="Lei Geral de Protecao de Dados"
      lastUpdated="Janeiro de 2025"
    >
      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          O que e a LGPD?
        </h2>
        <p>
          A Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018) e a legislacao brasileira
          que regula as atividades de tratamento de dados pessoais. Ela estabelece regras sobre
          coleta, armazenamento, tratamento e compartilhamento de dados pessoais, garantindo
          mais protecao e transparencia para os cidadaos.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Compromisso da Amélia Saúde
        </h2>
        <p>
          A Amélia Saúde esta comprometida com a protecao dos dados pessoais de seus clientes,
          colaboradores e parceiros. Implementamos medidas tecnicas e organizacionais para
          garantir a seguranca e privacidade das informacoes, em total conformidade com a LGPD.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Seus Direitos como Titular de Dados
        </h2>
        <p className="mb-4">
          A LGPD garante a voce, como titular de dados, os seguintes direitos:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Confirmacao e Acesso</h3>
            <p className="text-sm">
              Voce pode solicitar a confirmacao da existencia de tratamento e ter acesso aos
              seus dados pessoais.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Correcao</h3>
            <p className="text-sm">
              Voce pode solicitar a correcao de dados incompletos, inexatos ou desatualizados.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Anonimizacao, Bloqueio ou Eliminacao</h3>
            <p className="text-sm">
              Voce pode solicitar a anonimizacao, bloqueio ou eliminacao de dados desnecessarios,
              excessivos ou tratados em desconformidade com a lei.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Portabilidade</h3>
            <p className="text-sm">
              Voce pode solicitar a portabilidade dos dados a outro fornecedor de servico ou produto.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Eliminacao</h3>
            <p className="text-sm">
              Voce pode solicitar a eliminacao dos dados tratados com seu consentimento, exceto
              nas hipoteses previstas em lei.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Informacao sobre Compartilhamento</h3>
            <p className="text-sm">
              Voce pode solicitar informacoes sobre as entidades publicas e privadas com as quais
              compartilhamos seus dados.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="font-semibold text-gold-signature mb-2">Revogacao do Consentimento</h3>
            <p className="text-sm">
              Voce pode revogar o consentimento a qualquer momento, mediante manifestacao expressa.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Como Exercer seus Direitos
        </h2>
        <p className="mb-4">
          Para exercer qualquer um dos direitos acima, voce pode:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Enviar um e-mail para nosso DPO (Encarregado de Protecao de Dados)</li>
          <li>Utilizar nosso formulario de solicitacao online</li>
          <li>Entrar em contato pelo nosso canal de atendimento</li>
        </ul>
        <p>
          Responderemos sua solicitacao em ate 15 dias uteis, conforme previsto na legislacao.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Bases Legais para Tratamento
        </h2>
        <p className="mb-4">
          A Amélia Saúde trata seus dados pessoais com base nas seguintes hipoteses legais:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Execucao de contrato:</strong> para prestacao dos servicos
            de administracao de beneficios.
          </li>
          <li>
            <strong className="text-white">Cumprimento de obrigacao legal:</strong> para atender
            exigencias da ANS e outros orgaos reguladores.
          </li>
          <li>
            <strong className="text-white">Protecao da vida:</strong> em situacoes de emergencia
            medica.
          </li>
          <li>
            <strong className="text-white">Tutela da saude:</strong> para procedimentos realizados
            por profissionais de saude.
          </li>
          <li>
            <strong className="text-white">Consentimento:</strong> para finalidades especificas,
            como marketing.
          </li>
          <li>
            <strong className="text-white">Legitimo interesse:</strong> para melhoria de servicos
            e prevencao a fraudes.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Dados Sensiveis
        </h2>
        <p>
          Por atuar no setor de saude, a Amélia Saúde pode tratar dados pessoais sensiveis,
          como informacoes de saude. Esses dados recebem protecao reforçada e sao tratados
          apenas para as finalidades especificas e necessarias a prestacao dos servicos,
          sempre em conformidade com a legislacao aplicavel e com as melhores praticas de
          seguranca da informacao.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Encarregado de Protecao de Dados (DPO)
        </h2>
        <p className="mb-4">
          A Amélia Saúde nomeou um Encarregado de Protecao de Dados (DPO) para atuar como
          canal de comunicacao entre a empresa, os titulares de dados e a Autoridade Nacional
          de Protecao de Dados (ANPD).
        </p>
        <div className="p-4 bg-black-deep rounded-lg border border-white/10">
          <p><strong className="text-white">DPO:</strong> Departamento de Privacidade Amélia Saúde</p>
          <p><strong className="text-white">E-mail:</strong> dpo@ameliasaude.com.br</p>
          <p><strong className="text-white">Telefone:</strong> 0800 000 0000</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Seguranca da Informacao
        </h2>
        <p className="mb-4">
          Adotamos medidas de seguranca tecnicas e administrativas aptas a proteger os dados
          pessoais de acessos nao autorizados e de situacoes acidentais ou ilicitas. Entre as
          medidas adotadas estao:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Criptografia de dados em transito e em repouso</li>
          <li>Controles de acesso baseados em funcao</li>
          <li>Monitoramento continuo de sistemas</li>
          <li>Treinamento de colaboradores em privacidade</li>
          <li>Auditorias periodicas de seguranca</li>
          <li>Plano de resposta a incidentes</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          Duvidas e Reclamacoes
        </h2>
        <p className="mb-4">
          Se voce tiver duvidas sobre como tratamos seus dados ou desejar fazer uma reclamacao,
          entre em contato conosco. Se nao ficar satisfeito com nossa resposta, voce tem o direito
          de apresentar uma reclamacao a Autoridade Nacional de Protecao de Dados (ANPD).
        </p>
        <div className="p-4 bg-black-deep rounded-lg border border-white/10">
          <p><strong className="text-white">ANPD:</strong> www.gov.br/anpd</p>
        </div>
      </section>
    </LegalPageLayout>
  )
}
