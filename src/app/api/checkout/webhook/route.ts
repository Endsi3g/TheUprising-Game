import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripeClient();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error('[Checkout/Webhook] Signature verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const supabase = createServiceClient();

            await supabase.from('checkout_events').insert({
                stripe_event_id: event.id,
                checkout_session_id: session.id,
                event_type: event.type,
                payment_status: session.payment_status || 'unpaid',
                amount_total: session.amount_total || 0,
                currency: session.currency || 'cad',
                customer_email: session.customer_details?.email || null,
                metadata: session.metadata || {},
                received_at: new Date().toISOString(),
            });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Checkout/Webhook] Error handling event:', error);
        return NextResponse.json({ error: 'Webhook handler failure' }, { status: 500 });
    }
}
