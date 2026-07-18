import PDFDocument from 'pdfkit'

interface LinhaRelatorio {
  Protocolo: string
  Tipo: string
  Status: string
  Urgência: string
  Prazo: string
  Contrato: string
  Inquilino: string
  Imóvel: string
  'Aberto em': string
  'Atualizado em': string
}

export async function gerarPDFRelatorio(rows: LinhaRelatorio[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape', info: { Title: 'Relatório de Demandas — Nexo Imob' } })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(16).font('Helvetica-Bold').text('Nexo Imob — Relatório de Demandas', { align: 'center' })
    doc.fontSize(9).font('Helvetica').fillColor('#666')
      .text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}  ·  ${rows.length} registro(s)`, { align: 'center' })
    doc.fillColor('#000')
    doc.moveDown(1)

    const cols: { key: keyof LinhaRelatorio; label: string; width: number }[] = [
      { key: 'Protocolo', label: 'Protocolo', width: 75 },
      { key: 'Tipo', label: 'Tipo', width: 70 },
      { key: 'Status', label: 'Status', width: 65 },
      { key: 'Urgência', label: 'Urg.', width: 40 },
      { key: 'Prazo', label: 'Prazo', width: 55 },
      { key: 'Contrato', label: 'Contrato', width: 55 },
      { key: 'Inquilino', label: 'Inquilino', width: 90 },
      { key: 'Imóvel', label: 'Imóvel', width: 200 },
      { key: 'Aberto em', label: 'Aberto em', width: 55 },
    ]

    const startX = 40
    let y = doc.y

    function header() {
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff')
      doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), 18).fill('#2B2B2B')
      let x = startX
      cols.forEach(c => {
        doc.fillColor('#fff').text(c.label, x + 4, y + 5, { width: c.width - 6 })
        x += c.width
      })
      doc.fillColor('#000')
      y += 18
    }

    header()
    doc.font('Helvetica').fontSize(7.5)

    rows.forEach((r, i) => {
      if (y > doc.page.height - 50) {
        doc.addPage()
        y = 40
        header()
        doc.font('Helvetica').fontSize(7.5)
      }
      if (i % 2 === 1) {
        doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), 16).fill('#F7F7F5')
        doc.fillColor('#000')
      }
      let x = startX
      cols.forEach(c => {
        const val = String(r[c.key] ?? '')
        doc.text(val.length > 40 ? val.slice(0, 38) + '…' : val, x + 4, y + 4, { width: c.width - 6, height: 14, ellipsis: true })
        x += c.width
      })
      y += 16
    })

    doc.end()
  })
}
