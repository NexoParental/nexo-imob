import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })
}

// Price IDs por plano — preencher após criar os produtos no Stripe Dashboard
const PRICE_IDS: Record<string, string> = {
  starter:      process.env.STRIPE_PRICE_STARTER ?? '',
  professional: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
  enterprise:   process.env.STRIPE_PRICE_ENTERPRISE ?? '',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const stripe = getStripe()
  const { plano, organization_id } = await req.json()
  if (!plano || !PRICE_IDS[plano]) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  // Só permite assinar/alterar a própria organização — nunca uma organização parceira
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.organization_id !== organization_id) {
    return NextResponse.json({ error: 'Organização inválida' }, { status: 403 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .eq('id', organization_id)
    .single()

  if (!org) return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 })

  let customerId = org.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { organization_id: org.id, user_id: user.id },
    })
    customerId = customer.id
    const { error: updateErr } = await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', org.id)
    if (updateErr) {
      return NextResponse.json({ error: 'Falha ao salvar cliente Stripe: ' + updateErr.message }, { status: 500 })
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_IDS[plano], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?plano=sucesso`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
    metadata: { organization_id: org.id, plano },
    locale: 'pt-BR',
  })

  return NextResponse.json({ url: session.url })
}
