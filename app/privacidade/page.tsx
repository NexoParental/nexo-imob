import Link from 'next/link'

export const metadata = { title: 'Política de Privacidade — Nexo Imob' }

export default function PrivacidadePage() {
  const updated = '13 de julho de 2025'
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-[#0A1628] text-white px-8 py-5 flex items-center justify-between">
        <Link href="/" className="text-[13px] font-bold tracking-[0.18em] uppercase">
          Nexo<span className="text-accent">Imob</span>
        </Link>
        <Link href="/login" className="text-[13px] text-white/50 hover:text-white transition-colors">
          Entrar →
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-3">Legal</p>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Política de Privacidade</h1>
          <p className="text-sm text-ink-soft">Última atualização: {updated}</p>
        </div>

        <div className="prose-nexo space-y-8 text-sm leading-relaxed text-ink">

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">1. Quem somos</h2>
            <p>A <strong>Nexo Imob</strong> é uma plataforma SaaS de comunicação e gestão jurídico-imobiliária, desenvolvida e operada no Brasil. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">2. Dados que coletamos</h2>
            <p className="mb-3">Coletamos os seguintes dados durante o uso da plataforma:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Dados de cadastro:</strong> nome completo, e-mail e nome da imobiliária fornecidos no momento da criação da conta.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Dados de terceiros inseridos por você:</strong> informações de proprietários, inquilinos, fiadores e outros envolvidos em contratos (nome, CPF/CNPJ, contato). Você é o controlador desses dados; a Nexo Imob atua como operadora.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Dados de uso:</strong> logs de acesso, endereço IP, navegador e interações com a plataforma, coletados automaticamente para fins de segurança e melhoria do serviço.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Dados de pagamento:</strong> processados exclusivamente pelo Stripe; a Nexo Imob não armazena dados de cartão de crédito.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">3. Finalidade e base legal do tratamento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-alt">
                    <th className="text-left p-3 border border-line font-semibold">Finalidade</th>
                    <th className="text-left p-3 border border-line font-semibold">Base legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prestação do serviço contratado', 'Execução de contrato (art. 7º, V)'],
                    ['Autenticação e segurança da conta', 'Legítimo interesse (art. 7º, IX)'],
                    ['Envio de e-mails transacionais e alertas de prazo', 'Execução de contrato (art. 7º, V)'],
                    ['Análise de uso para melhoria do produto', 'Legítimo interesse (art. 7º, IX)'],
                    ['Cumprimento de obrigações legais e fiscais', 'Cumprimento de obrigação legal (art. 7º, II)'],
                    ['Envio de comunicações de marketing (opt-in)', 'Consentimento (art. 7º, I)'],
                  ].map(([f, b]) => (
                    <tr key={f} className="border-b border-line">
                      <td className="p-3 border border-line">{f}</td>
                      <td className="p-3 border border-line text-ink-soft">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">4. Compartilhamento de dados</h2>
            <p className="mb-3">Não vendemos seus dados. Compartilhamos apenas com:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Supabase</strong> — banco de dados e autenticação, hospedado em servidores com padrão SOC 2.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Vercel</strong> — infraestrutura de hospedagem e CDN.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Resend</strong> — envio de e-mails transacionais.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Stripe</strong> — processamento de pagamentos (PCI DSS nível 1).</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span><strong>Anthropic</strong> — processamento de IA para análise de contratos e geração de documentos. Dados enviados não são usados para treinar modelos.</span></li>
            </ul>
            <p className="mt-3">Todos os fornecedores operam sob contratos de processamento de dados compatíveis com a LGPD e o GDPR.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">5. Retenção de dados</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, os dados são mantidos por <strong>90 dias</strong> para eventual recuperação, sendo então excluídos definitivamente, salvo obrigação legal que exija retenção por prazo maior.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">6. Seus direitos como titular (LGPD, art. 18)</h2>
            <p className="mb-3">Você tem direito a:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Confirmar a existência de tratamento dos seus dados',
                'Acessar seus dados',
                'Corrigir dados incompletos, inexatos ou desatualizados',
                'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários',
                'Solicitar a portabilidade dos seus dados',
                'Revogar consentimento a qualquer momento',
                'Opor-se ao tratamento e ser informado sobre suas consequências',
              ].map(r => (
                <li key={r} className="flex gap-2"><span className="text-accent shrink-0">—</span><span>{r}</span></li>
              ))}
            </ul>
            <p className="mt-3">Para exercer seus direitos, entre em contato pelo e-mail <strong>privacidade@nexo-imob.com.br</strong>. Respondemos em até <strong>15 dias úteis</strong>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">7. Segurança</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia em trânsito (TLS 1.2+), criptografia em repouso, controle de acesso por papel (RBAC), Row Level Security no banco de dados e autenticação segura via Supabase Auth.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">8. Cookies</h2>
            <p>Utilizamos apenas cookies estritamente necessários para manter sua sessão autenticada. Não utilizamos cookies de rastreamento ou publicidade de terceiros.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">9. Encarregado de Dados (DPO)</h2>
            <p>Nosso Encarregado de Proteção de Dados pode ser contactado pelo e-mail <strong>privacidade@nexo-imob.com.br</strong>.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">10. Alterações nesta política</h2>
            <p>Podemos atualizar esta política periodicamente. Em caso de mudanças relevantes, notificaremos por e-mail ou por aviso dentro da plataforma com no mínimo 15 dias de antecedência.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3 text-ink">11. Foro</h2>
            <p>Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes desta política, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-line flex flex-wrap gap-4 text-sm">
          <Link href="/termos" className="text-accent hover:underline">Termos de Uso →</Link>
          <Link href="/" className="text-ink-soft hover:text-ink transition-colors">← Voltar ao início</Link>
        </div>
      </main>

      <footer className="border-t border-line px-8 py-5 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Nexo Imob · <Link href="/privacidade" className="hover:text-ink-soft">Privacidade</Link> · <Link href="/termos" className="hover:text-ink-soft">Termos</Link>
      </footer>
    </div>
  )
}
