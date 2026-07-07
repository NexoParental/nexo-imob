import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })
}
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PLANO_POR_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
  [process.env.STRIPE_PRICE_PROFESSIONAL ?? '']: 'professional',
  [process.env.STRIPE_PRICE_ENTERPRISE ?? '']: 'enterprise',
}

async function atualizarOrg(orgId: string, updates: Record<string, unknown>) {
  await admin.from('organizations').update(updates).eq('id', orgId)
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook inválido: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.organization_id
      const plano = session.metadata?.plano
      if (orgId && plano) {
        await atualizarOrg(orgId, {
          plano,
          plano_status: 'active',
          stripe_subscription_id: session.subscription as string,
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = (sub.metadata?.organization_id) ?? null
      if (!orgId) break
      const priceId = sub.items.data[0]?.price.id ?? ''
      const plano = PLANO_POR_PRICE[priceId] ?? 'starter'
      await atualizarOrg(orgId, { plano, plano_status: sub.status })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.organization_id
      if (orgId) await atualizarOrg(orgId, { plano: 'trial', plano_status: 'canceled' })
      break
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      const customerId = inv.customer as string
      const { data: orgs } = await admin.from('organizations').select('id').eq('stripe_customer_id', customerId)
      if (orgs?.[0]) await atualizarOrg(orgs[0].id, { plano_status: 'past_due' })
      break
    }
  }

  return NextResponse.json({ ok: true })
}
