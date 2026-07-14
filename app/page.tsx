import Link from 'next/link'

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: '#0A1628' }}
    >
      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-6 max-w-7xl mx-auto">
        <span
          className="text-[13px] font-bold tracking-[0.2em] uppercase"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', letterSpacing: '0.18em' }}
        >
          Nexo<span style={{ color: '#D4471E' }}>Imob</span>
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[13px] text-white/50 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-[13px] font-medium px-5 py-2.5 transition-colors"
            style={{ background: '#D4471E', color: 'white' }}
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 pt-20 pb-32">
        <div className="max-w-3xl">
          <p
            className="text-[11px] font-medium tracking-[0.25em] uppercase mb-10"
            style={{ color: '#D4471E', fontFamily: 'var(--font-sans)' }}
          >
            Plataforma jurídico-imobiliária
          </p>
          <h1
            className="leading-[1.0] mb-8 font-normal"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(52px, 8vw, 96px)',
              letterSpacing: '-0.02em',
            }}
          >
            Da imobiliária<br />
            ao escritório.<br />
            <span style={{ color: '#D4471E', fontStyle: 'italic' }}>Sem ruído.</span>
          </h1>
          <p
            className="text-[17px] leading-relaxed mb-12 max-w-xl"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Gerencie demandas jurídicas, contratos e prazos numa plataforma única.
            IA integrada, alertas automáticos, comunicação centralizada.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 text-[13px] font-semibold px-7 py-3.5 transition-colors"
              style={{ background: '#D4471E', color: 'white' }}
            >
              Criar conta — 14 dias grátis
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[13px] transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Já tenho conta →
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIVISOR ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      {/* ── FEATURES ── */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {[
            {
              label: 'Demandas',
              title: 'Fila jurídica organizada',
              body: 'Protocolo automático, timeline de comunicação e acompanhamento CNJ via DataJud — tudo no mesmo lugar.',
            },
            {
              label: 'Inteligência artificial',
              title: 'Análise de contrato em segundos',
              body: 'A IA lê os dados do contrato e aponta cláusulas de risco, prazos críticos e obrigações de cada parte.',
            },
            {
              label: 'Alertas',
              title: 'D-7, D-3, D-1 por e-mail',
              body: 'O escritório recebe alertas automáticos antes de cada prazo vencer. Zero surpresas, zero WhatsApp.',
            },
            {
              label: 'Documentos',
              title: 'Gerador de minutas com IA',
              body: 'Notificações extrajudiciais, cartas de cobrança e distratos gerados em um clique a partir do caso.',
            },
            {
              label: 'Visibilidade',
              title: 'Dashboard executivo',
              body: 'KPIs da carteira, taxa de inadimplência, tempo médio de resolução e prazos vencendo — tudo em tempo real.',
            },
            {
              label: 'Acesso',
              title: 'Parceria imobiliária',
              body: 'Convide o escritório parceiro. Cada lado vê exatamente o que precisa ver, sem acesso indevido.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-8"
              style={{ background: '#0A1628' }}
            >
              <div
                className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4"
                style={{ color: '#D4471E' }}
              >
                {f.label}
              </div>
              <h3
                className="text-[22px] font-normal mb-3 leading-snug"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVISOR ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      {/* ── PREÇOS ── */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-24">
        <div className="mb-14">
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: '#D4471E' }}>
            Planos
          </p>
          <h2
            className="font-normal leading-tight"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(36px, 4vw, 54px)', letterSpacing: '-0.01em' }}
          >
            Simples, transparente,<br />sem fidelidade.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {[
            {
              nome: 'Starter',
              preco: 'R$ 297',
              descricao: 'Para imobiliárias pequenas',
              recursos: [
                'Até 50 contratos ativos',
                '2 usuários incluídos',
                'Demandas jurídicas ilimitadas',
                'Análise de contratos com IA',
                'Gerador de minutas',
                'Exportação CSV',
              ],
              destaque: false,
            },
            {
              nome: 'Professional',
              preco: 'R$ 697',
              descricao: 'Para imobiliárias em crescimento',
              recursos: [
                'Contratos ilimitados',
                '5 usuários incluídos',
                'Tudo do Starter',
                'Assinatura eletrônica Clicksign',
                'Acompanhamento CNJ automático',
                'Calendário de prazos',
                'Dashboard com KPIs e gráficos',
                'Exportação Excel e PDF',
              ],
              destaque: true,
            },
            {
              nome: 'Enterprise',
              preco: 'R$ 1.497',
              descricao: 'Para operações de grande porte',
              recursos: [
                'Tudo do Professional',
                'Usuários ilimitados',
                'Multi-escritório (parcerias)',
                'Suporte prioritário com SLA',
                'Onboarding dedicado',
                'API de integração',
              ],
              destaque: false,
            },
          ].map((p) => (
            <div
              key={p.nome}
              className="flex flex-col p-8 gap-6"
              style={{
                background: p.destaque ? '#112240' : '#0A1628',
                outline: p.destaque ? '1px solid rgba(212,71,30,0.35)' : undefined,
              }}
            >
              {p.destaque && (
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: '#D4471E' }}>
                  Mais popular
                </div>
              )}
              <div>
                <div
                  className="text-[28px] font-normal mb-1"
                  style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
                >
                  {p.nome}
                </div>
                <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.descricao}</div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[40px] font-bold tracking-tight">{p.preco}</span>
                <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>/mês</span>
              </div>
              <ul className="flex-1 space-y-2.5">
                {p.recursos.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-[13px]">
                    <span className="mt-0.5 shrink-0" style={{ color: '#D4471E' }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{r}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro"
                className="block text-center text-[13px] font-semibold py-3 transition-colors"
                style={p.destaque
                  ? { background: '#D4471E', color: 'white' }
                  : { border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
              >
                Começar grátis
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[12px] mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Pagamento via Stripe · Cancele quando quiser · 14 dias grátis em todos os planos
        </p>
      </section>

      {/* ── DIVISOR ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      {/* ── CTA FINAL ── */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-28 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <h2
          className="font-normal leading-tight"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(36px, 5vw, 62px)',
            letterSpacing: '-0.01em',
          }}
        >
          Pronto para organizar<br />
          o jurídico da sua<br />
          <span style={{ color: '#D4471E', fontStyle: 'italic' }}>imobiliária?</span>
        </h2>
        <div className="shrink-0">
          <Link
            href="/cadastro"
            className="block text-[13px] font-semibold px-8 py-4 mb-3 transition-colors"
            style={{ background: '#D4471E', color: 'white' }}
          >
            Criar conta grátis
          </Link>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Sem cartão. Configurado em 5 minutos.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-6 flex justify-between items-center">
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
            © {new Date().getFullYear()} Nexo Imob
          </span>
          <div className="flex gap-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <Link href="/privacidade" className="text-[11px] hover:text-white/50 transition-colors" style={{ letterSpacing: '0.06em' }}>Privacidade</Link>
            <Link href="/termos" className="text-[11px] hover:text-white/50 transition-colors" style={{ letterSpacing: '0.06em' }}>Termos de Uso</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
