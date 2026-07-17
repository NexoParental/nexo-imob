import PDFDocument from 'pdfkit'

interface ContratoParaPDF {
  numero: string
  tipo: string
  status: string
  data_inicio: string
  prazo_meses?: number
  valor: number
  indice_reajuste?: string
  tipo_garantia: string
  garantia_descricao?: string
  imovel?: {
    logradouro: string; numero: string; complemento?: string
    bairro: string; cidade: string; uf: string; cep?: string
    matricula?: string; cartorio?: string
  }
  proprietario?: { nome: string; cpf?: string; cnpj?: string; endereco?: string; email?: string; telefone?: string }
  inquilino?:    { nome: string; cpf?: string; cnpj?: string; endereco?: string; email?: string; telefone?: string }
  fiador?:       { nome: string; cpf?: string; cnpj?: string; endereco?: string }
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}
function tipoLabel(t: string) {
  const m: Record<string, string> = {
    locacao_residencial: 'Locação Residencial',
    locacao_comercial: 'Locação Comercial',
    compra_venda: 'Compra e Venda',
    administracao: 'Administração de Imóvel',
  }
  return m[t] ?? t
}
function garantiaLabel(tipo: string, desc?: string, fiador?: string) {
  if (tipo === 'fiador' && fiador) return `Fiador: ${fiador}`
  if (tipo === 'seguro_fianca') return `Seguro-fiança${desc ? `: ${desc}` : ''}`
  if (tipo === 'caucao') return `Caução em depósito${desc ? `: ${desc}` : ''}`
  if (tipo === 'titulo') return `Título de capitalização${desc ? `: ${desc}` : ''}`
  return 'Sem garantia'
}

export async function gerarPDFContrato(contrato: ContratoParaPDF): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60, info: { Title: `Contrato nº ${contrato.numero}` } })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 120

    // ── Cabeçalho ───────────────────────────────────────
    doc.fontSize(18).font('Helvetica-Bold').text('NEXO IMOB', { align: 'center' })
    doc.fontSize(11).font('Helvetica').text(tipoLabel(contrato.tipo).toUpperCase(), { align: 'center' })
    doc.fontSize(10).fillColor('#666').text(`Contrato nº ${contrato.numero}  ·  Emitido em ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' })
    doc.fillColor('#000')
    doc.moveDown(0.5)
    doc.moveTo(60, doc.y).lineTo(60 + W, doc.y).strokeColor('#ccc').lineWidth(1).stroke()
    doc.moveDown(0.8)

    function section(title: string) {
      doc.moveDown(0.5)
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#444').text(title.toUpperCase())
      doc.fillColor('#000')
      doc.moveDown(0.3)
    }

    function row(label: string, value: string) {
      doc.fontSize(10).font('Helvetica-Bold').text(`${label}: `, { continued: true })
      doc.font('Helvetica').text(value || '—')
    }

    // ── Imóvel ──────────────────────────────────────────
    const im = contrato.imovel
    if (im) {
      section('Imóvel')
      row('Endereço', `${im.logradouro}, ${im.numero}${im.complemento ? `, ${im.complemento}` : ''}`)
      row('Bairro / Cidade', `${im.bairro} — ${im.cidade}/${im.uf}${im.cep ? ` — CEP ${im.cep}` : ''}`)
      if (im.matricula) row('Matrícula', im.matricula)
      if (im.cartorio)  row('Cartório',  im.cartorio)
    }

    // ── Partes ──────────────────────────────────────────
    section('Partes')
    const prop = contrato.proprietario
    if (prop) {
      row('Proprietário', prop.nome)
      if (prop.cpf)      row('CPF', prop.cpf)
      if (prop.cnpj)     row('CNPJ', prop.cnpj)
      if (prop.endereco) row('Endereço', prop.endereco)
      if (prop.email)    row('E-mail', prop.email)
      if (prop.telefone) row('Telefone', prop.telefone)
      doc.moveDown(0.3)
    }
    const inq = contrato.inquilino
    if (inq) {
      row('Inquilino / Comprador', inq.nome)
      if (inq.cpf)      row('CPF', inq.cpf)
      if (inq.cnpj)     row('CNPJ', inq.cnpj)
      if (inq.endereco) row('Endereço', inq.endereco)
      if (inq.email)    row('E-mail', inq.email)
      if (inq.telefone) row('Telefone', inq.telefone)
      doc.moveDown(0.3)
    }
    const fiad = contrato.fiador
    if (fiad) {
      row('Fiador', fiad.nome)
      if (fiad.cpf)      row('CPF', fiad.cpf)
      if (fiad.cnpj)     row('CNPJ', fiad.cnpj)
      if (fiad.endereco) row('Endereço', fiad.endereco)
    }

    // ── Condições ───────────────────────────────────────
    section('Condições Financeiras')
    row('Início', fmtDate(contrato.data_inicio))
    row('Prazo',  contrato.prazo_meses ? `${contrato.prazo_meses} meses` : 'Indeterminado')
    row('Valor mensal', fmt(contrato.valor))
    if (contrato.indice_reajuste) row('Índice de reajuste', contrato.indice_reajuste)
    row('Garantia', garantiaLabel(contrato.tipo_garantia, contrato.garantia_descricao, fiad?.nome))

    // ── Cláusulas ───────────────────────────────────────
    section('Cláusulas')
    doc.fontSize(10).font('Helvetica')
    doc.text('1. O locatário se obriga a pagar pontualmente o aluguel na data acordada.')
    doc.moveDown(0.2)
    doc.text('2. É vedada a sublocação ou cessão do imóvel sem autorização expressa do locador.')
    doc.moveDown(0.2)
    doc.text('3. O imóvel deve ser restituído no estado em que foi recebido, salvo desgaste natural.')
    doc.moveDown(0.2)
    doc.text('4. O reajuste anual será aplicado conforme índice acordado acima.')
    doc.moveDown(0.2)
    doc.text('5. O presente contrato rege-se pela Lei nº 8.245/91 (Lei do Inquilinato).')

    // ── Assinaturas ─────────────────────────────────────
    doc.moveDown(2)
    const sigY = doc.y
    const col1 = 60
    const col2 = 60 + W / 2 + 10
    const lineLen = W / 2 - 20

    doc.moveTo(col1, sigY).lineTo(col1 + lineLen, sigY).strokeColor('#000').lineWidth(0.5).stroke()
    doc.moveTo(col2, sigY).lineTo(col2 + lineLen, sigY).stroke()

    doc.fontSize(9).font('Helvetica').fillColor('#000')
    doc.text(prop?.nome ?? 'Proprietário', col1, sigY + 4, { width: lineLen, align: 'center' })
    doc.text('Proprietário', col1, sigY + 16, { width: lineLen, align: 'center' })

    doc.text(inq?.nome ?? 'Inquilino', col2, sigY + 4, { width: lineLen, align: 'center' })
    doc.text('Inquilino / Comprador', col2, sigY + 16, { width: lineLen, align: 'center' })

    if (fiad) {
      doc.moveDown(3)
      const sigY2 = doc.y
      doc.moveTo(col1, sigY2).lineTo(col1 + lineLen, sigY2).stroke()
      doc.text(fiad.nome, col1, sigY2 + 4, { width: lineLen, align: 'center' })
      doc.text('Fiador', col1, sigY2 + 16, { width: lineLen, align: 'center' })
    }

    // ── Rodapé ──────────────────────────────────────────
    doc.moveDown(3)
    doc.fontSize(8).fillColor('#888').text(
      `Nexo Imob  ·  Contrato nº ${contrato.numero}  ·  ${new Date().toLocaleDateString('pt-BR')}`,
      { align: 'center' }
    )

    doc.end()
  })
}
