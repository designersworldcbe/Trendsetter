/**
 * PayPal Integration for Trendsetter
 * Using PayPal REST API for subscriptions
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalSubscriptionResponse {
  id: string;
  status: string;
  start_time: string;
  billing_info?: {
    next_billing_time?: string;
  };
}

/**
 * Get PayPal Access Token
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PayPal token: ${error}`);
  }

  const data: PayPalTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal subscription
 */
export async function createSubscription(
  planId: string,
  customerEmail: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ approvalUrl: string; subscriptionId: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: {
        email_address: customerEmail,
      },
      application_context: {
        brand_name: 'Trendsetter',
        locale: 'en-IN',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subscription: ${error}`);
  }

  const subscription: PayPalSubscriptionResponse & { links: Array<{ rel: string; href: string }> } = await response.json();
  
  const approvalLink = subscription.links.find(link => link.rel === 'approve');
  if (!approvalLink) {
    throw new Error('No approval URL in subscription response');
  }

  return {
    approvalUrl: approvalLink.href,
    subscriptionId: subscription.id,
  };
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get subscription: ${error}`);
  }

  return response.json();
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, reason?: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: reason || 'Customer requested cancellation',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to cancel subscription: ${error}`);
  }

  return { success: true };
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const accessToken = await getAccessToken();
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    throw new Error('PayPal webhook ID not configured');
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.verification_status === 'SUCCESS';
}

// PayPal Plan IDs (from PayPal Dashboard - LIVE)
export const PAYPAL_PLANS = {
  STARTER: {
    id: process.env.PAYPAL_PLAN_STARTER || 'P-9X279748U0723413DNJS5LWI',
    name: 'Trendsetter Starter',
    price: '499.00',
    currency: 'INR',
    description: '25 calculations/month',
  },
  PROFESSIONAL: {
    id: process.env.PAYPAL_PLAN_PROFESSIONAL || 'P-69544072LW9580120NJS5MRA',
    name: 'Trendsetter Professional',
    price: '999.00',
    currency: 'INR',
    description: 'Unlimited calculations',
  },
  ENTERPRISE: {
    id: process.env.PAYPAL_PLAN_ENTERPRISE || 'P-3S360357G5696312UNJS5NCA',
    name: 'Trendsetter Enterprise',
    price: '2499.00',
    currency: 'INR',
    description: 'Enterprise features',
  },
};

export default {
  createSubscription,
  getSubscription,
  cancelSubscription,
  verifyWebhookSignature,
  PAYPAL_PLANS,
};
