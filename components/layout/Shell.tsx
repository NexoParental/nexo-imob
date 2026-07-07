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
    <div className="flex min-h-screen">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#2B2B2B] text-white flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border border-accent flex items-center justify-center text-accent font-bold text-sm">N</div>
          <span className="font-bold text-base tracking-tight">Nexo Imob</span>
          <span className="text-[10px] text-[#aaa] uppercase tracking-widest ml-2 pl-2 border-l border-[#555] hidden sm:block">
            {orgLabel}
          </span>
        </div>
        <button className="sm:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden sm:flex flex-col w-52 bg-surface-alt border-r border-line fixed top-14 bottom-0 left-0 p-3 overflow-y-auto z-40">
        <SideNav nav={nav} pathname={pathname} />
        <div className="mt-auto pt-3 border-t border-line">
          <div className="px-2.5 py-2 text-xs text-ink-soft">
            <span className="block font-semibold text-ink text-sm">{profile.name}</span>
            <span className="capitalize">{profile.role}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-2.5 py-2 text-xs text-ink-faint hover:text-urgent transition-colors">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full bg-surface-alt border-r border-line p-3 pt-16" onClick={e => e.stopPropagation()}>
            <SideNav nav={nav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="sm:ml-52 mt-14 flex-1 p-6 sm:p-8 max-w-5xl">
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
    <nav className="flex flex-col gap-0.5">
      {nav.map(item => {
        const showSection = item.section && item.section !== lastSection
        if (showSection) lastSection = item.section!
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <div key={item.href}>
            {showSection && (
              <div className="text-[10px] uppercase tracking-widest text-ink-faint px-2.5 pt-4 pb-1.5">{item.section}</div>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-surface text-ink border border-line font-semibold'
                  : 'text-ink-soft hover:bg-surface'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-accent' : 'bg-ink-faint')} />
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
