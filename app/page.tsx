import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 max-w-6xl mx-auto">
        <span className="font-sans font-bold tracking-widest text-sm uppercase text-white">
          Nexo<span className="text-[#D4471E]">Imob</span>
        </span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm bg-[#D4471E] hover:bg-[#B03615] text-white px-4 py-2 transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-block text-xs font-mono uppercase tracking-widest text-[#D4471E] border border-[#D4471E]/40 px-3 py-1 mb-8">
          Imobiliária × Jurídico
        </div>
        <h1
          className="text-5xl md:text-7xl font-normal leading-tight mb-6 text-white"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          A ponte entre sua<br />
          <span className="italic text-[#D4471E]">imobiliária</span> e o<br />
          escritório jurídico
        </h1>
        <p className="text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
          Gerencie demandas, contratos e prazos num único lugar.
          IA integrada, alertas automáticos e colaboração em tempo real.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cadastro"
            className="inline-block bg-[#D4471E] hover:bg-[#B03615] text-white px-8 py-3.5 text-sm font-semibold transition-colors"
          >
            Criar conta grátis — 14 dias
          </Link>
          <Link
            href="/login"
            className="inline-block border border-white/20 hover:border-white/40 text-white/80 hover:text-white px-8 py-3.5 text-sm transition-colors"
          >
            Já tenho conta →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '⚖️',
            title: 'Demandas jurídicas',
            desc: 'Protocolo automático, timeline de mensagens e acompanhamento CNJ integrado via DataJud.',
          },
          {
            icon: '🤖',
            title: 'Análise com IA',
            desc: 'A IA lê seus contratos e aponta cláusulas de risco, prazos e obrigações das partes em segundos.',
          },
          {
            icon: '📅',
            title: 'Alertas D-7, D-3, D-1',
            desc: 'Receba e-mails automáticos antes de cada prazo vencer. Zero surpresas para o seu escritório.',
          },
          {
            icon: '📄',
            title: 'Gerador de minutas',
            desc: 'Crie notificações extrajudiciais, cartas de cobrança e distratos com um clique.',
          },
          {
            icon: '📊',
            title: 'Dashboard executivo',
            desc: 'KPIs da carteira, taxa de inadimplência, tempo médio de resolução e gráficos em tempo real.',
          },
          {
            icon: '🔗',
            title: 'Parceria imobiliária',
            desc: 'Convide seu escritório jurídico parceiro. Cada lado vê apenas o que precisa ver.',
          },
        ].map((f) => (
          <div key={f.title} className="border border-white/10 p-6 hover:border-[#D4471E]/40 transition-colors">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3
              className="text-xl font-medium mb-2"
              style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
            >
              {f.title}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-20 text-center px-8">
        <h2
          className="text-4xl md:text-5xl font-normal mb-4 text-white"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          Pronto para começar?
        </h2>
        <p className="text-white/50 mb-8 text-sm">Sem cartão de crédito. Configure em menos de 5 minutos.</p>
        <Link
          href="/cadastro"
          className="inline-block bg-[#D4471E] hover:bg-[#B03615] text-white px-10 py-4 text-sm font-semibold transition-colors"
        >
          Criar conta grátis
        </Link>
      </section>

      <footer className="border-t border-white/10 px-8 py-6 text-center text-xs text-white/30 max-w-6xl mx-auto">
        © {new Date().getFullYear()} Nexo Imob · Todos os direitos reservados
      </footer>
    </div>
  )
}
