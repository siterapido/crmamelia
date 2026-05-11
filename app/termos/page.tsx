import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/layout/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Termos de Uso | Amélia Saúde',
  description: 'Termos e condicoes de uso do site e servicos da Amélia Saúde. Leia atentamente antes de utilizar nossos servicos.',
}

export default function TermosPage() {
  return (
    <LegalPageLayout
      title="Termos de Uso"
      subtitle="Documento Legal"
      lastUpdated="Janeiro de 2025"
    >
      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          1. Aceitacao dos Termos
        </h2>
        <p>
          Ao acessar e usar o site da Amélia Saúde (ameliasaude.com.br) e nossos servicos, voce concorda
          em cumprir e estar vinculado a estes Termos de Uso. Se voce nao concordar com qualquer
          parte destes termos, nao devera usar nosso site ou servicos.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          2. Descricao dos Servicos
        </h2>
        <p className="mb-4">
          A Amélia Saúde e uma administradora de beneficios de saude registrada na ANS que oferece:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Intermediacao na contratacao de planos de saude</li>
          <li>Gestao e administracao de beneficios</li>
          <li>Atendimento e suporte ao beneficiario</li>
          <li>Emissao de documentos (boletos, carteirinhas, demonstrativos)</li>
          <li>Aplicativo movel para gestao do plano</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          3. Cadastro e Conta
        </h2>
        <p className="mb-4">
          Para acessar determinados servicos, voce podera precisar criar uma conta. Ao faze-lo, voce se compromete a:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Fornecer informacoes verdadeiras, precisas e completas</li>
          <li>Manter suas credenciais de acesso em sigilo</li>
          <li>Notificar imediatamente qualquer uso nao autorizado de sua conta</li>
          <li>Ser responsavel por todas as atividades realizadas em sua conta</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          4. Uso Permitido
        </h2>
        <p className="mb-4">
          Voce concorda em usar nosso site e servicos apenas para fins legitimos. E proibido:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violar qualquer lei ou regulamento aplicavel</li>
          <li>Transmitir conteudo ilegal, difamatorio ou prejudicial</li>
          <li>Tentar acessar sistemas ou dados sem autorizacao</li>
          <li>Interferir no funcionamento do site ou servicos</li>
          <li>Coletar informacoes de outros usuarios sem consentimento</li>
          <li>Usar robos, scrapers ou outras ferramentas automatizadas</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          5. Propriedade Intelectual
        </h2>
        <p>
          Todo o conteudo do site, incluindo textos, graficos, logos, icones, imagens, clips de audio,
          downloads digitais e compilacoes de dados, e de propriedade da Amélia Saúde ou de seus
          fornecedores de conteudo e e protegido pelas leis brasileiras e internacionais de
          propriedade intelectual.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          6. Limitacao de Responsabilidade
        </h2>
        <p className="mb-4">
          A Amélia Saúde nao sera responsavel por:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Interrupcoes temporarias no acesso ao site</li>
          <li>Danos decorrentes do uso ou incapacidade de uso do site</li>
          <li>Acoes de terceiros, incluindo operadoras e prestadores de saude</li>
          <li>Decisoes tomadas com base em informacoes do site</li>
        </ul>
        <p className="mt-4">
          Os servicos medicos sao prestados diretamente pelas operadoras e rede credenciada,
          sendo estas as responsaveis pela qualidade do atendimento.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          7. Links para Terceiros
        </h2>
        <p>
          Nosso site pode conter links para sites de terceiros. Esses links sao fornecidos apenas
          para sua conveniencia. A Amélia Saúde nao endossa e nao e responsavel pelo conteudo,
          politicas de privacidade ou praticas de sites de terceiros.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          8. Modificacoes dos Termos
        </h2>
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento. As alteracoes
          entraram em vigor imediatamente apos a publicacao no site. O uso continuado do site
          apos tais modificacoes constituira sua aceitacao dos novos termos.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          9. Rescisao
        </h2>
        <p>
          Podemos suspender ou encerrar seu acesso ao site e servicos, sem aviso previo, por
          qualquer motivo, incluindo violacao destes termos. Apos a rescisao, voce deve cessar
          todo uso do site e destruir qualquer material obtido atraves dele.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          10. Lei Aplicavel e Foro
        </h2>
        <p>
          Estes termos serao regidos e interpretados de acordo com as leis da Republica Federativa
          do Brasil. Qualquer disputa sera submetida ao foro da Comarca de Sao Paulo - SP,
          com exclusao de qualquer outro, por mais privilegiado que seja.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          11. Contato
        </h2>
        <p>
          Para duvidas sobre estes termos:
        </p>
        <div className="mt-4 p-4 bg-black-deep rounded-lg border border-white/10">
          <p><strong className="text-white">E-mail:</strong> contato@ameliasaude.com.br</p>
          <p><strong className="text-white">Telefone:</strong> 0800 000 0000</p>
        </div>
      </section>
    </LegalPageLayout>
  )
}
