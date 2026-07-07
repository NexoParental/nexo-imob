import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ImovelForm from '../ImovelForm'

export default async function NovoImovelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  const { data: pessoas } = await supabase.from('pessoas').select('id, nome, papel_principal').eq('organization_id', profile!.organization_id).in('papel_principal', ['proprietario'])
  return <ImovelForm pessoas={pessoas ?? []} organizationId={profile!.organization_id} />
}
