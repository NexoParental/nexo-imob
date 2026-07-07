'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

function AceitarConteudo() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''
  const [status, setStatus] = useState<'verificando' | 'login' | 'pronto' | 'aceitando' | 'ok' | 'erro'>('verificando')
  const [msg, setMsg] = useState('')
  const [parceiro, setParceiro] = useState('')

  useEffect(() => {
    if (!token) { setStatus('erro'); setMsg('Link inválido.'); return }
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setStatus('pronto')
      else setStatus('login')
    })
  }, [token])

  async function aceitar() {
    setStatus('aceitando')
    const res = await fetch('/api/admin/aceitar-parceria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (data.error === 'login_required') { setStatus('login'); return }
    if (data.error) { setStatus('erro'); setMsg(data.error); return }
    setParceiro(data.parceiro)
    setStatus('ok')
  }

  return (
    <>
      {status === 'verificando' && <p className="text-sm text-ink-soft">Verificando convite…</p>}

      {status === 'login' && (
        <>
          <p className="text-sm text-ink-soft">
            Faça login para aceitar o convite de parceria. Após entrar, volte a este link.
          </p>
          <Button variant="accent" className="w-full justify-center"
            onClick={() => router.push(`/login?next=/aceitar-parceria%3Ftoken%3D${token}`)}>
            Fazer login
          </Button>
        </>
      )}

      {status === 'pronto' && (
        <>
          <p className="text-sm text-ink-soft">
            Você recebeu um convite de parceria. Ao aceitar, sua organização poderá visualizar
            contratos e demandas da imobiliária parceira.
          </p>
          <Button variant="accent" className="w-full justify-center" onClick={aceitar}>
            Aceitar parceria
          </Button>
        </>
      )}

      {status === 'aceitando' && <p className="text-sm text-ink-soft">Ativando parceria…</p>}

      {status === 'ok' && (
        <>
          <p className="text-xl text-success font-bold">✓</p>
          <p className="text-sm font-semibold">Parceria com <strong>{parceiro}</strong> ativada!</p>
          <p className="text-xs text-ink-soft">Você agora pode visualizar os dados compartilhados.</p>
          <Button variant="accent" className="w-full justify-center" onClick={() => router.push('/dashboard')}>
            Ir para o painel
          </Button>
        </>
      )}

      {status === 'erro' && (
        <p className="text-sm text-urgent">{msg || 'Ocorreu um erro. Peça um novo convite.'}</p>
      )}
    </>
  )
}

export default function AceitarParceriaPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-line p-8 flex flex-col items-center gap-5 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-accent flex items-center justify-center text-accent font-bold text-lg">N</div>
        <h1 className="text-xl font-bold tracking-tight">Nexo Imob</h1>
        <Suspense fallback={<p className="text-sm text-ink-soft">Carregando…</p>}>
          <AceitarConteudo />
        </Suspense>
      </div>
    </div>
  )
}
