/**
 * PayPal Subscription API Route
 * POST /api/paypal/subscription - Create new subscription
 */

import { NextRequest, NextResponse } from "next/server";
import { createSubscription, PAYPAL_PLANS } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, email, returnUrl, cancelUrl } = body;

    if (!plan || !['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const planDetails = PAYPAL_PLANS[plan as keyof typeof PAYPAL_PLANS];
    
    const result = await createSubscription(
      planDetails.id,
      email,
      returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?subscription=cancelled`
    );

    return NextResponse.json({
      success: true,
      approvalUrl: result.approvalUrl,
      subscriptionId: result.subscriptionId,
      plan: planDetails.name,
    });

  } catch (error) {
    console.error('PayPal subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
