import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/layout/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Politica de Cookies | Amélia Saúde',
  description: 'Saiba como a Amélia Saúde utiliza cookies e tecnologias similares para melhorar sua experiencia em nosso site.',
}

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Politica de Cookies"
      subtitle="Documento Legal"
      lastUpdated="Janeiro de 2025"
    >
      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          1. O que sao Cookies?
        </h2>
        <p>
          Cookies sao pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet
          ou smartphone) quando voce visita um site. Eles permitem que o site reconheca seu dispositivo
          e armazene informacoes sobre suas preferencias ou acoes anteriores, proporcionando uma
          experiencia mais personalizada e eficiente.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          2. Por que Utilizamos Cookies?
        </h2>
        <p className="mb-4">A Amélia Saúde utiliza cookies para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Garantir o funcionamento adequado do site</li>
          <li>Lembrar suas preferencias e configuracoes</li>
          <li>Melhorar a velocidade e seguranca do site</li>
          <li>Analisar como voce utiliza nosso site para aprimora-lo</li>
          <li>Personalizar sua experiencia de navegacao</li>
          <li>Medir a eficacia de nossas campanhas de marketing</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          3. Tipos de Cookies que Utilizamos
        </h2>

        <div className="space-y-6">
          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-gold-signature mb-2">
              Cookies Estritamente Necessarios
            </h3>
            <p>
              Essenciais para o funcionamento do site. Permitem navegacao basica e acesso a areas
              seguras. Sem estes cookies, o site nao funciona corretamente. Nao requerem consentimento.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-gold-signature mb-2">
              Cookies de Desempenho
            </h3>
            <p>
              Coletam informacoes anonimas sobre como os visitantes usam o site, como paginas mais
              visitadas e mensagens de erro. Ajudam a melhorar o funcionamento do site.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-gold-signature mb-2">
              Cookies de Funcionalidade
            </h3>
            <p>
              Permitem que o site lembre escolhas feitas por voce (como idioma, regiao ou nome de
              usuario) e forneca recursos aprimorados e mais personalizados.
            </p>
          </div>

          <div className="p-4 bg-black-deep rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-gold-signature mb-2">
              Cookies de Marketing/Publicidade
            </h3>
            <p>
              Utilizados para exibir anuncios mais relevantes para voce e seus interesses. Tambem
              limitam o numero de vezes que voce ve um anuncio e ajudam a medir a eficacia das
              campanhas publicitarias.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          4. Cookies de Terceiros
        </h2>
        <p className="mb-4">
          Alguns cookies sao colocados por servicos de terceiros que aparecem em nossas paginas.
          Utilizamos os seguintes servicos:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Google Analytics:</strong> para analise de trafego e
            comportamento dos usuarios no site
          </li>
          <li>
            <strong className="text-white">Google Tag Manager:</strong> para gerenciamento de tags
            e scripts do site
          </li>
          <li>
            <strong className="text-white">Meta Pixel (Facebook):</strong> para medicao de
            campanhas publicitarias nas redes sociais
          </li>
          <li>
            <strong className="text-white">Hotjar:</strong> para analise de experiencia do usuario
            atraves de mapas de calor e gravacoes de sessao
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          5. Duracao dos Cookies
        </h2>
        <p className="mb-4">Os cookies podem ter diferentes duracoes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Cookies de Sessao:</strong> sao temporarios e apagados
            quando voce fecha o navegador
          </li>
          <li>
            <strong className="text-white">Cookies Persistentes:</strong> permanecem no seu
            dispositivo por um periodo determinado ou ate serem excluidos manualmente
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          6. Como Gerenciar Cookies
        </h2>
        <p className="mb-4">
          Voce pode controlar e gerenciar cookies de diversas formas:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Configuracoes do Navegador
            </h3>
            <p className="mb-2">
              A maioria dos navegadores permite que voce recuse ou aceite cookies, exclua cookies
              existentes e defina preferencias para determinados sites. Veja como configurar:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong className="text-white">Chrome:</strong> Configuracoes &gt; Privacidade e
                seguranca &gt; Cookies
              </li>
              <li>
                <strong className="text-white">Firefox:</strong> Opcoes &gt; Privacidade e
                Seguranca &gt; Cookies
              </li>
              <li>
                <strong className="text-white">Safari:</strong> Preferencias &gt; Privacidade &gt;
                Cookies
              </li>
              <li>
                <strong className="text-white">Edge:</strong> Configuracoes &gt; Privacidade &gt;
                Cookies
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gold-primary/10 rounded-lg border border-gold-primary/20">
            <p className="text-gold-light">
              <strong>Atencao:</strong> Desativar cookies pode afetar a funcionalidade do site e
              impedir que alguns recursos funcionem corretamente.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          7. Tecnologias Similares
        </h2>
        <p className="mb-4">
          Alem de cookies, podemos utilizar outras tecnologias de rastreamento:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Web Beacons:</strong> pequenas imagens transparentes
            usadas para rastrear comportamento do usuario
          </li>
          <li>
            <strong className="text-white">Local Storage:</strong> armazenamento de dados no
            navegador para melhorar a performance
          </li>
          <li>
            <strong className="text-white">Pixels de Rastreamento:</strong> usados para medir a
            eficacia de campanhas de marketing
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          8. Consentimento
        </h2>
        <p>
          Ao continuar navegando em nosso site, voce concorda com o uso de cookies conforme descrito
          nesta politica. Voce pode retirar seu consentimento a qualquer momento alterando as
          configuracoes do seu navegador ou utilizando as opcoes de gerenciamento de cookies
          disponibilizadas em nosso site.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          9. Atualizacoes desta Politica
        </h2>
        <p>
          Esta Politica de Cookies pode ser atualizada periodicamente para refletir mudancas em
          nossas praticas ou por motivos operacionais, legais ou regulatorios. Recomendamos que
          voce consulte esta pagina regularmente para se manter informado sobre o uso de cookies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">
          10. Contato
        </h2>
        <p>
          Se voce tiver duvidas sobre nossa Politica de Cookies ou sobre como utilizamos cookies
          em nosso site, entre em contato conosco:
        </p>
        <div className="mt-4 p-4 bg-black-deep rounded-lg border border-white/10">
          <p><strong className="text-white">E-mail:</strong> privacidade@ameliasaude.com.br</p>
          <p><strong className="text-white">Telefone:</strong> 0800 000 0000</p>
        </div>
      </section>
    </LegalPageLayout>
  )
}
