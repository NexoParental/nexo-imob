import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'csv'

  const { data: demandas } = await supabase
    .from('demandas')
    .select(`
      protocolo, tipo, status, urgencia, prazo, created_at, updated_at,
      contrato:contratos(numero, imovel:imoveis(logradouro, numero, bairro, cidade, uf), inquilino:pessoas!contratos_inquilino_id_fkey(nome))
    `)
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  const rows = (demandas ?? []).map((d: any) => ({
    Protocolo: d.protocolo ?? '',
    Tipo: d.tipo ?? '',
    Status: d.status ?? '',
    Urgência: d.urgencia ?? '',
    Prazo: d.prazo ? new Date(d.prazo).toLocaleDateString('pt-BR') : '',
    Contrato: d.contrato?.numero ?? '',
    Inquilino: d.contrato?.inquilino?.nome ?? '',
    Imóvel: d.contrato?.imovel
      ? `${d.contrato.imovel.logradouro}, ${d.contrato.imovel.numero} — ${d.contrato.imovel.bairro}, ${d.contrato.imovel.cidade}/${d.contrato.imovel.uf}`
      : '',
    'Aberto em': new Date(d.created_at).toLocaleDateString('pt-BR'),
    'Atualizado em': new Date(d.updated_at).toLocaleDateString('pt-BR'),
  }))

  if (format === 'excel') {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Demandas')

    if (rows.length > 0) {
      const cols = Object.keys(rows[0])
      ws.columns = cols.map(k => ({ header: k, key: k, width: Math.max(k.length + 4, 18) }))
      // Cabeçalho em negrito
      ws.getRow(1).font = { bold: true }
      rows.forEach(r => ws.addRow(r))
    }

    const buf = await wb.xlsx.writeBuffer()
    return new NextResponse(buf as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="demandas_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    })
  }

  // CSV (padrão)
  if (rows.length === 0) {
    return new NextResponse('Protocolo,Tipo,Status\n', {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="demandas.csv"',
      },
    })
  }

  const headers = Object.keys(rows[0])
  const csvLines = [
    headers.join(';'),
    ...rows.map(r => headers.map(h => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(';')),
  ]
  const csv = '﻿' + csvLines.join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="demandas_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
