import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(s: unknown): string {
  return String(s ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Disparar alertas D-7, D-3 e D-1 para demandas com prazo próximo
// Chamar via cron job ou manualmente: GET /api/notificacoes/alertas-prazo
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const diasAlerta = [7, 3, 1]
  let enviados = 0
  let erros = 0

  for (const dias of diasAlerta) {
    const alvo = new Date(hoje)
    alvo.setDate(alvo.getDate() + dias)
    const alvoStr = alvo.toISOString().slice(0, 10)

    const { data: demandas } = await admin
      .from('demandas')
      .select(`
        id, protocolo, tipo, urgencia, prazo, organization_id,
        contrato:contratos(numero, imovel:imoveis(logradouro, numero, bairro, cidade), inquilino:pessoas!contratos_inquilino_id_fkey(nome))
      `)
      .eq('status', 'em_andamento')
      .gte('prazo', `${alvoStr}T00:00:00`)
      .lt('prazo', `${alvoStr}T23:59:59`)

    if (!demandas) continue

    for (const d of demandas) {
      const contrato = d.contrato as any
      const imovel = contrato?.imovel as any

      // Buscar e-mails dos gestores da organização
      const { data: profiles } = await admin
        .from('profiles')
        .select('email, name')
        .eq('organization_id', d.organization_id)
        .in('role', ['gestor', 'administrativo'])

      if (!profiles?.length) continue

      const emails = profiles.map(p => p.email).filter(Boolean)
      if (!emails.length) continue

      const tipo_label: Record<string, string> = {
        cobranca: 'Cobrança', notificacao: 'Notificação', despejo: 'Despejo',
        contratual: 'Contratual', condominial: 'Condominial', distrato: 'Distrato',
      }

      const tipoLabel = esc(tipo_label[d.tipo] ?? d.tipo)
      const assunto = `⚠️ Prazo em ${dias} dia${dias > 1 ? 's' : ''} — ${tipoLabel} · ${esc(d.protocolo)}`
      const corpo = `
        <h2 style="color:#EF4444">Prazo em ${dias} dia${dias > 1 ? 's' : ''}!</h2>
        <p><strong>Protocolo:</strong> ${esc(d.protocolo)}</p>
        <p><strong>Tipo:</strong> ${tipoLabel}</p>
        <p><strong>Imóvel:</strong> ${esc(imovel?.logradouro)}, ${esc(imovel?.numero)} — ${esc(imovel?.bairro)}, ${esc(imovel?.cidade)}</p>
        <p><strong>Inquilino:</strong> ${esc(contrato?.inquilino?.nome)}</p>
        <p><strong>Prazo:</strong> ${esc(new Date(d.prazo).toLocaleDateString('pt-BR'))}</p>
        <p style="margin-top:16px">
          <a href="${esc(process.env.NEXT_PUBLIC_APP_URL)}/demandas/${esc(d.id)}" style="background:#D4471E;color:white;padding:8px 16px;text-decoration:none;">
            Ver demanda →
          </a>
        </p>
      `

      try {
        await resend.emails.send({
          from: 'Nexo Imob <alertas@nexo-imob.vercel.app>',
          to: emails,
          subject: assunto,
          html: corpo,
        })

        // Registrar notificação enviada
        await admin.from('notificacoes_enviadas').insert({
          organization_id: d.organization_id,
          tipo: `alerta_prazo_d${dias}`,
          destinatarios: emails,
          referencia_id: d.id,
          referencia_tipo: 'demanda',
        })

        enviados++
      } catch {
        erros++
      }
    }
  }

  return NextResponse.json({ ok: true, enviados, erros })
}
