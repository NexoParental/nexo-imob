import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Shell from '@/components/layout/Shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return <Shell profile={profile}>{children}</Shell>
}
