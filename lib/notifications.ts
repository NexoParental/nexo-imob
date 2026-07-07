import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Nexo Imob <notificacoes@nexoimob.com.br>'

export async function notificarNovaDemanda({
  paraEmail, paraNome, protocolo, tipo, imóvel, abertoBy,
}: {
  paraEmail: string; paraNome: string; protocolo: string; tipo: string; imóvel: string; abertoBy: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: paraEmail,
    subject: `[Nexo Imob] Nova demanda ${protocolo} — ${tipo}`,
    html: `
      <p>Olá, ${paraNome}.</p>
      <p>Uma nova demanda foi aberta pela <strong>Haroldo Lopes</strong>:</p>
      <ul>
        <li><strong>Protocolo:</strong> ${protocolo}</li>
        <li><strong>Tipo:</strong> ${tipo}</li>
        <li><strong>Imóvel:</strong> ${imóvel}</li>
        <li><strong>Aberta por:</strong> ${abertoBy}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Acessar a fila de demandas →</a></p>
      <hr/><p style="font-size:11px;color:#999">Nexo Imob — Plataforma imobiliária × jurídico</p>
    `,
  })
}

export async function notificarRespostaAdvogado({
  paraEmail, paraNome, protocolo, tipo, mensagem, advogado,
}: {
  paraEmail: string; paraNome: string; protocolo: string; tipo: string; mensagem: string; advogado: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: paraEmail,
    subject: `[Nexo Imob] Atualização no caso ${protocolo}`,
    html: `
      <p>Olá, ${paraNome}.</p>
      <p>O <strong>${advogado}</strong> enviou uma atualização no caso <strong>${protocolo}</strong> (${tipo}):</p>
      <blockquote style="border-left:3px solid #D4471E;padding-left:12px;margin:12px 0;color:#555">${mensagem}</blockquote>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/demandas">Ver o caso →</a></p>
      <hr/><p style="font-size:11px;color:#999">Nexo Imob</p>
    `,
  })
}

export async function notificarPrazoProximo({
  paraEmail, paraNome, protocolo, tipo, prazo, diasRestantes,
}: {
  paraEmail: string; paraNome: string; protocolo: string; tipo: string; prazo: string; diasRestantes: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: paraEmail,
    subject: `[Nexo Imob] ⚠️ Prazo em ${diasRestantes} dias — caso ${protocolo}`,
    html: `
      <p>Olá, ${paraNome}.</p>
      <p>O caso <strong>${protocolo}</strong> (${tipo}) vence em <strong>${diasRestantes} dias</strong> (${prazo}).</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Ver o caso →</a></p>
      <hr/><p style="font-size:11px;color:#999">Nexo Imob</p>
    `,
  })
}

export async function notificarConviteUsuario({
  paraEmail, paraNome, organizacaoNome, linkConvite,
}: {
  paraEmail: string; paraNome: string; organizacaoNome: string; linkConvite: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: paraEmail,
    subject: `Você foi convidado para o Nexo Imob — ${organizacaoNome}`,
    html: `
      <p>Olá, ${paraNome}.</p>
      <p>Você foi convidado para acessar o <strong>Nexo Imob</strong> pela <strong>${organizacaoNome}</strong>.</p>
      <p><a href="${linkConvite}" style="background:#D4471E;color:#fff;padding:10px 20px;text-decoration:none;border-radius:2px;display:inline-block;margin-top:8px">Criar minha senha →</a></p>
      <hr/><p style="font-size:11px;color:#999">Nexo Imob — Plataforma imobiliária × jurídico</p>
    `,
  })
}
