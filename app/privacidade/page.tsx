import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/layout/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Politica de Privacidade | Amélia Saúde',
  description: 'Saiba como a Amélia Saúde coleta, usa e protege seus dados pessoais. Transparencia e seguranca em primeiro lugar.',
}

export default function PrivacidadePage() {
  return (
    <LegalPageLayout
      title="Politica de Privacidade"
      subtitle="Documento Legal"
      lastUpdated="Janeiro de 2025"
    >
      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          1. Introducao
        </h2>
        <p>
          A Amélia Saúde Administradora de Beneficios (&quot;Amélia Saúde&quot;, &quot;nos&quot; ou &quot;nosso&quot;) esta
          comprometida em proteger a privacidade e os dados pessoais de nossos clientes, parceiros
          e visitantes do site. Esta Politica de Privacidade descreve como coletamos, usamos,
          armazenamos e protegemos suas informacoes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          2. Dados que Coletamos
        </h2>
        <p className="mb-4">Podemos coletar os seguintes tipos de informacoes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Dados de identificacao:</strong> nome completo, CPF, RG,
            data de nascimento, genero.
          </li>
          <li>
            <strong className="text-white">Dados de contato:</strong> endereco, telefone, e-mail.
          </li>
          <li>
            <strong className="text-white">Dados de saude:</strong> informacoes medicas necessarias
            para a gestao do plano de saude, conforme autorizacao previa.
          </li>
          <li>
            <strong className="text-white">Dados de navegacao:</strong> endereco IP, tipo de navegador,
            paginas visitadas, tempo de permanencia.
          </li>
          <li>
            <strong className="text-white">Dados financeiros:</strong> informacoes para processamento
            de pagamentos e emissao de boletos.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          3. Como Usamos seus Dados
        </h2>
        <p className="mb-4">Utilizamos seus dados para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Prestacao dos servicos de administracao de beneficios de saude</li>
          <li>Comunicacao sobre seu plano, pagamentos e atualizacoes</li>
          <li>Atendimento ao cliente e suporte tecnico</li>
          <li>Cumprimento de obrigacoes legais e regulatorias</li>
          <li>Melhoria de nossos servicos e experiencia do usuario</li>
          <li>Envio de comunicacoes de marketing (com seu consentimento)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          4. Compartilhamento de Dados
        </h2>
        <p className="mb-4">
          Podemos compartilhar seus dados com:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Operadoras de planos de saude parceiras</li>
          <li>Prestadores de servicos de saude da rede credenciada</li>
          <li>Orgaos reguladores (ANS) quando exigido por lei</li>
          <li>Prestadores de servicos de tecnologia e processamento de pagamentos</li>
        </ul>
        <p className="mt-4">
          Nunca vendemos seus dados pessoais a terceiros.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          5. Seguranca dos Dados
        </h2>
        <p>
          Implementamos medidas de seguranca tecnicas e organizacionais para proteger seus dados,
          incluindo criptografia SSL/TLS, controles de acesso, monitoramento continuo e backups
          regulares. Nossos sistemas sao auditados periodicamente para garantir conformidade com
          as melhores praticas de seguranca.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          6. Seus Direitos
        </h2>
        <p className="mb-4">
          De acordo com a LGPD, voce tem direito a:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Confirmar a existencia de tratamento de seus dados</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos ou desatualizados</li>
          <li>Solicitar a anonimizacao ou eliminacao de dados desnecessarios</li>
          <li>Solicitar a portabilidade de seus dados</li>
          <li>Revogar consentimentos previamente fornecidos</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          7. Cookies
        </h2>
        <p>
          Utilizamos cookies e tecnologias similares para melhorar sua experiencia em nosso site.
          Voce pode gerenciar suas preferencias de cookies atraves das configuracoes do seu navegador.
          Para mais detalhes, consulte nossa Politica de Cookies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          8. Retencao de Dados
        </h2>
        <p>
          Mantemos seus dados pessoais pelo tempo necessario para cumprir as finalidades descritas
          nesta politica, bem como para atender obrigacoes legais, resolver disputas e fazer cumprir
          nossos acordos. Dados de saude sao mantidos conforme exigencias da ANS e legislacao vigente.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          9. Contato
        </h2>
        <p>
          Para exercer seus direitos ou esclarecer duvidas sobre esta politica, entre em contato
          com nosso Encarregado de Protecao de Dados (DPO):
        </p>
        <div className="mt-4 p-4 bg-black-deep rounded-lg border border-white/10">
          <p><strong className="text-white">E-mail:</strong> privacidade@ameliasaude.com.br</p>
          <p><strong className="text-white">Telefone:</strong> 0800 000 0000</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          10. Alteracoes nesta Politica
        </h2>
        <p>
          Esta politica pode ser atualizada periodicamente. Recomendamos que voce revise esta
          pagina regularmente. Alteracoes significativas serao comunicadas por e-mail ou aviso
          em nosso site.
        </p>
      </section>
    </LegalPageLayout>
  )
}
