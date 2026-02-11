import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { CreateCheckoutSessionSchema } from '@/lib/validators';
import { getStripeClient } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 'checkout-create-session', { limit: 10, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
    }

    try {
        const payload = await request.json();
        const parsed = CreateCheckoutSessionSchema.safeParse(payload);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const priceId = process.env.STRIPE_DEEP_DIVE_PRICE_ID;
        if (!priceId) {
            return NextResponse.json(
                { error: 'Missing STRIPE_DEEP_DIVE_PRICE_ID' },
                { status: 500 }
            );
        }

        const stripe = getStripeClient();
        const { sessionId, email, firstName, mode, language } = parsed.data;

        const checkout = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/checkout/cancel`,
            customer_email: email,
            metadata: {
                session_id: sessionId || '',
                first_name: firstName || '',
                mode,
                language,
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({
            url: checkout.url,
            checkoutSessionId: checkout.id,
        });
    } catch (error) {
        console.error('[Checkout/CreateSession] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
