import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ContratoForm from '../ContratoForm'

export default async function NovoContratoPage({ searchParams }: { searchParams: Promise<{imovel?: string}> }) {
  const { imovel: imovelId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  const orgId = profile!.organization_id
  const [{ data: imoveis }, { data: pessoas }] = await Promise.all([
    supabase.from('imoveis').select('id, logradouro, numero, bairro').eq('organization_id', orgId),
    supabase.from('pessoas').select('id, nome, papel_principal').eq('organization_id', orgId),
  ])
  return <ContratoForm imoveis={imoveis ?? []} pessoas={pessoas ?? []} organizationId={orgId} defaultImovelId={imovelId} />
}
