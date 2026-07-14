'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button, Input } from '@/components/ui'

export default function CadastroForm() {
  const [nome, setNome] = useState('')
  const [imobiliaria, setImobiliaria] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [aceite, setAceite] = useState(false)
  const [hp, setHp] = useState('') // honeypot — nunca deve ser preenchido
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || !imobiliaria || !email || !senha) {
      setErro('Preencha todos os campos.')
      return
    }
    if (senha.length < 8) {
      setErro('Senha deve ter ao menos 8 caracteres.')
      return
    }
    if (!aceite) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
      return
    }
    setLoading(true)
    setErro('')

    const res = await fetch('/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_imobiliaria: imobiliaria, nome_usuario: nome, email, senha, _hp: hp }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErro(data.error ?? 'Erro ao criar conta')
      setLoading(false)
      return
    }

    setSucesso(true)
    setLoading(false)
  }

  if (sucesso) {
    return (
      <div className="text-center space-y-4 p-6 border border-line">
        <div className="text-4xl">✓</div>
        <h2 className="text-xl font-bold">Conta criada!</h2>
        <p className="text-sm text-ink-soft">Verifique seu e-mail para confirmar o cadastro e acessar o sistema.</p>
        <Link href="/login" className="block text-accent underline text-sm">Ir para o login</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-line p-6">
      {/* Honeypot — oculto via CSS, nunca visível ao usuário */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', tabIndex: -1 } as React.CSSProperties}>
        <label htmlFor="_hp">Não preencha este campo</label>
        <input id="_hp" name="_hp" type="text" autoComplete="off" tabIndex={-1} value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      <Input label="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} placeholder="Maria Silva" autoFocus />
      <Input label="Nome da imobiliária" value={imobiliaria} onChange={e => setImobiliaria(e.target.value)} placeholder="Imobiliária Santos" />
      <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="maria@imobiliariasantos.com.br" />
      <Input label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" />

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={aceite}
          onChange={e => setAceite(e.target.checked)}
          className="mt-0.5 shrink-0 accent-accent"
          required
        />
        <span className="text-[12px] text-ink-soft leading-relaxed">
          Li e aceito os{' '}
          <Link href="/termos" className="text-accent underline" target="_blank">Termos de Uso</Link>
          {' '}e a{' '}
          <Link href="/privacidade" className="text-accent underline" target="_blank">Política de Privacidade</Link>,
          incluindo o tratamento dos meus dados conforme a LGPD.
        </span>
      </label>

      {erro && <p className="text-urgent text-xs">{erro}</p>}
      <Button type="submit" variant="accent" className="w-full" loading={loading}>
        Criar conta grátis
      </Button>
      <p className="text-center text-xs text-ink-soft">
        Já tem conta? <Link href="/login" className="text-accent underline">Entrar</Link>
      </p>
    </form>
  )
}
