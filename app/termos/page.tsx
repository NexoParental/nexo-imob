import Link from 'next/link'

export const metadata = { title: 'Termos de Uso — Nexo Imob' }

export default function TermosPage() {
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Termos de Uso</h1>
          <p className="text-sm text-ink-soft">Última atualização: {updated}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-ink">

          <section>
            <h2 className="text-base font-bold mb-3">1. Aceitação</h2>
            <p>Ao criar uma conta ou utilizar a plataforma <strong>Nexo Imob</strong>, você declara ter lido, compreendido e concordado com estes Termos de Uso. Se você representa uma empresa, declara ter poderes para vinculá-la a este contrato. Caso não concorde com algum ponto, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">2. O serviço</h2>
            <p className="mb-2">A Nexo Imob é uma plataforma SaaS que permite:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Gestão de contratos e demandas jurídico-imobiliárias',
                'Comunicação centralizada entre imobiliárias e escritórios jurídicos parceiros',
                'Análise de contratos e geração de documentos com assistência de inteligência artificial',
                'Acompanhamento de processos judiciais via CNJ/DataJud',
                'Alertas automáticos de prazos e vencimentos',
              ].map(i => <li key={i} className="flex gap-2"><span className="text-accent shrink-0">—</span><span>{i}</span></li>)}
            </ul>
            <p className="mt-3">O serviço é fornecido "como está", sujeito a melhorias contínuas. Reservamo-nos o direito de alterar, suspender ou descontinuar funcionalidades com aviso prévio razoável.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">3. Conta e acesso</h2>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Você é responsável pela confidencialidade das credenciais de acesso e por todas as atividades realizadas sob sua conta.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>É vedado compartilhar credenciais entre usuários distintos. Cada usuário deve ter seu próprio acesso.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Notifique-nos imediatamente em caso de acesso não autorizado: <strong>suporte@nexo-imob.com.br</strong>.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Contas inativas por mais de 180 dias consecutivos podem ser suspensas após notificação.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">4. Planos e pagamento</h2>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>O período de teste gratuito é de <strong>14 dias</strong>, sem exigência de cartão de crédito.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Após o período de teste, o acesso requer assinatura de um plano pago, cobrado mensalmente via Stripe.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>O cancelamento pode ser feito a qualquer momento pelo painel de planos. Não há reembolso de períodos já faturados, exceto nos casos previstos pelo CDC.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Em caso de inadimplência, o acesso será suspenso após 5 dias corridos e os dados mantidos por 30 dias para regularização.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Os preços podem ser reajustados com aviso prévio de 30 dias por e-mail.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">5. Uso aceitável</h2>
            <p className="mb-2">É expressamente proibido:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Utilizar a plataforma para fins ilícitos ou contrários à legislação brasileira',
                'Inserir dados de terceiros sem amparo legal ou sem a devida autorização dos titulares',
                'Tentar acessar sistemas ou dados de outras organizações',
                'Realizar engenharia reversa, decompilar ou modificar qualquer parte do software',
                'Usar a plataforma para envio de spam ou comunicações não solicitadas',
                'Revender ou sublicenciar o acesso à plataforma a terceiros',
              ].map(i => <li key={i} className="flex gap-2"><span className="text-accent shrink-0">—</span><span>{i}</span></li>)}
            </ul>
            <p className="mt-3">O descumprimento dessas regras pode resultar na suspensão imediata da conta, sem direito a reembolso.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">6. Conteúdo e dados inseridos</h2>
            <p>Você mantém a titularidade de todos os dados inseridos na plataforma. Ao utilizá-la, concede à Nexo Imob uma licença limitada, não exclusiva e revogável para processar esses dados exclusivamente com a finalidade de prestar o serviço contratado. Não utilizamos seus dados para treinar modelos de inteligência artificial.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">7. Inteligência artificial</h2>
            <p className="mb-2">Os recursos de IA (análise de contratos, geração de minutas) são fornecidos como <strong>assistência</strong>, não como aconselhamento jurídico. Especificamente:</p>
            <ul className="space-y-1.5 pl-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>Os resultados gerados pela IA devem ser revisados por profissional habilitado antes de qualquer uso formal.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>A Nexo Imob não se responsabiliza por decisões tomadas com base exclusiva em saídas de IA.</span></li>
              <li className="flex gap-2"><span className="text-accent shrink-0">—</span><span>A precisão dos resultados depende da qualidade e completude dos dados fornecidos.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">8. Disponibilidade e SLA</h2>
            <p>Buscamos disponibilidade de <strong>99,5% ao mês</strong>. Manutenções programadas são comunicadas com antecedência mínima de 24 horas. Não nos responsabilizamos por indisponibilidades causadas por falhas em serviços de terceiros (Supabase, Vercel, Stripe) ou por eventos de força maior.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">9. Limitação de responsabilidade</h2>
            <p>Na máxima extensão permitida pela lei, a responsabilidade total da Nexo Imob perante você, por qualquer causa, fica limitada ao valor pago nos <strong>3 meses anteriores</strong> ao evento que originou o dano. Em nenhuma hipótese respondemos por lucros cessantes, danos indiretos ou perda de dados decorrente de uso inadequado da plataforma.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">10. Propriedade intelectual</h2>
            <p>Todos os direitos sobre o software, design, marca e tecnologia da Nexo Imob pertencem exclusivamente à Nexo Imob. Nenhum direito de propriedade intelectual é transferido ao usuário pela assinatura do serviço.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">11. Rescisão</h2>
            <p>Qualquer das partes pode encerrar a relação contratual a qualquer momento. Você pode cancelar pelo painel ou por e-mail. Podemos suspender ou encerrar sua conta em caso de violação destes termos, com notificação prévia sempre que possível. Após o encerramento, seus dados ficam disponíveis por 90 dias para exportação, sendo então excluídos.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">12. Alterações nos termos</h2>
            <p>Podemos atualizar estes termos. Alterações materiais serão comunicadas com pelo menos <strong>15 dias de antecedência</strong> por e-mail. O uso continuado da plataforma após esse prazo implica aceitação das novas condições.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">13. Lei aplicável e foro</h2>
            <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de <strong>São Paulo/SP</strong> para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </section>

          <section>
            <h2 className="text-base font-bold mb-3">14. Contato</h2>
            <p>Para dúvidas sobre estes termos: <strong>juridico@nexo-imob.com.br</strong></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-line flex flex-wrap gap-4 text-sm">
          <Link href="/privacidade" className="text-accent hover:underline">Política de Privacidade →</Link>
          <Link href="/" className="text-ink-soft hover:text-ink transition-colors">← Voltar ao início</Link>
        </div>
      </main>

      <footer className="border-t border-line px-8 py-5 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Nexo Imob · <Link href="/privacidade" className="hover:text-ink-soft">Privacidade</Link> · <Link href="/termos" className="hover:text-ink-soft">Termos</Link>
      </footer>
    </div>
  )
}
