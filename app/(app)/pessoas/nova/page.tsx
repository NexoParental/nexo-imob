import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PessoaForm from '../PessoaForm'

export default async function NovaPessoaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  return <PessoaForm organizationId={profile!.organization_id} />
}
