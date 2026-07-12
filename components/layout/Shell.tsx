'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard, Building2, Users, FileText,
  Scale, Menu, X, LogOut, CalendarDays
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_GESTOR = [
  { label: 'Partes',             href: '/pessoas',           icon: Users,          section: 'Cadastros' },
  { label: 'Imóveis',            href: '/imoveis',           icon: Building2 },
  { label: 'Contratos',          href: '/contratos',         icon: FileText },
  { label: 'Demandas jurídicas', href: '/dashboard',         icon: LayoutDashboard, section: 'Jurídico' },
  { label: 'Calendário',         href: '/calendario',        icon: CalendarDays },
  { label: 'Parcerias',          href: '/admin/parcerias',   icon: Scale,           section: 'Admin' },
  { label: 'Usuários',           href: '/admin/usuarios',    icon: Users },
  { label: 'Planos',             href: '/planos',            icon: LayoutDashboard },
]

const NAV_ADVOGADO = [
  { label: 'Fila de demandas', href: '/dashboard', icon: Scale },
]

const NAV_CORRETOR = [
  { label: 'Meus imóveis', href: '/dashboard', icon: Building2 },
]

function getNav(role: string) {
  if (role === 'advogado') return NAV_ADVOGADO
  if (role === 'corretor') return NAV_CORRETOR
  return NAV_GESTOR
}

export default function Shell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = getNav(profile.role)

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  const orgLabel = profile.organization?.type === 'juridico'
    ? profile.organization.name
    : 'Haroldo Lopes'

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-[#0A1628] text-white flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[13px] tracking-widest uppercase">
            Nexo<span className="text-accent">Imob</span>
          </span>
          <span className="hidden sm:block text-[10px] text-white/30 uppercase tracking-widest pl-4 border-l border-white/10">
            {orgLabel}
          </span>
        </div>
        <button className="sm:hidden p-1 text-white/60 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden sm:flex flex-col w-48 bg-surface border-r border-line fixed top-12 bottom-0 left-0 overflow-y-auto z-40">
        <div className="flex-1 py-4 px-2">
          <SideNav nav={nav} pathname={pathname} />
        </div>
        <div className="border-t border-line px-3 py-3">
          <div className="text-[11px] text-ink-soft mb-1 font-semibold truncate">{profile.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] text-ink-faint hover:text-ink transition-colors">
            <LogOut size={11} /> Sair
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside className="w-56 h-full bg-surface border-r border-line pt-14 px-2" onClick={e => e.stopPropagation()}>
            <SideNav nav={nav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="sm:ml-48 mt-12 flex-1 p-5 sm:p-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}

function SideNav({ nav, pathname, onNavigate }: {
  nav: typeof NAV_GESTOR
  pathname: string
  onNavigate?: () => void
}) {
  let lastSection = ''
  return (
    <nav className="flex flex-col gap-px">
      {nav.map(item => {
        const showSection = item.section && item.section !== lastSection
        if (showSection) lastSection = item.section!
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <div key={item.href}>
            {showSection && (
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-faint px-3 pt-5 pb-1">{item.section}</div>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors rounded-sm',
                active
                  ? 'bg-accent/8 text-ink font-semibold'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
              )}
            >
              <Icon size={14} className={active ? 'text-accent' : 'text-ink-faint'} />
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
