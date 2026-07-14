'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function CadastroForm() {
  const [nome, setNome] = useState('')
  const [imobiliaria, setImobiliaria] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const sb = createClient()

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
    setLoading(true)
    setErro('')

    // 1. Criar organização via API
    const resOrg = await fetch('/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome_imobiliaria: imobiliaria, nome_usuario: nome, email, senha }),
    })
    const dataOrg = await resOrg.json()
    if (!resOrg.ok) {
      setErro(dataOrg.error ?? 'Erro ao criar conta')
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
      <Input label="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} placeholder="Maria Silva" autoFocus />
      <Input label="Nome da imobiliária" value={imobiliaria} onChange={e => setImobiliaria(e.target.value)} placeholder="Imobiliária Santos" />
      <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="maria@imobiliariasantos.com.br" />
      <Input label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" />
      {erro && <p className="text-urgent text-xs">{erro}</p>}
      <Button type="submit" variant="accent" className="w-full" loading={loading}>
        Criar conta grátis
      </Button>
      <p className="text-center text-[11px] text-ink-faint">
        Ao criar uma conta você concorda com os{' '}
        <Link href="/termos" className="underline hover:text-ink-soft" target="_blank">Termos de Uso</Link>
        {' '}e a{' '}
        <Link href="/privacidade" className="underline hover:text-ink-soft" target="_blank">Política de Privacidade</Link>.
      </p>
      <p className="text-center text-xs text-ink-soft">
        Já tem conta? <Link href="/login" className="text-accent underline">Entrar</Link>
      </p>
    </form>
  )
}
