import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NovaDemandaForm from './NovaDemandaForm'

export default async function NovaDemandaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: contratos } = await supabase
    .from('contratos')
    .select(`
      id, numero, tipo, valor, status,
      imovel:imoveis(logradouro, numero, complemento, bairro),
      proprietario:pessoas!contratos_proprietario_id_fkey(nome),
      inquilino:pessoas!contratos_inquilino_id_fkey(nome),
      fiador:pessoas!contratos_fiador_id_fkey(nome),
      tipo_garantia, garantia_descricao
    `)
    .eq('organization_id', profile.organization_id)
    .neq('status', 'encerrado')

  return <NovaDemandaForm contratos={contratos ?? []} userId={user.id} organizationId={profile.organization_id} />
}
