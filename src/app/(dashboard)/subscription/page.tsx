"use client";

import { useState } from "react";
import { Check, CreditCard, Zap, Crown, Building } from "lucide-react";

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out",
    features: [
      "5 calculations/month",
      "Basic feature recognition",
      "PDF reports only",
      "Up to 2 machines",
      "Community support",
    ],
    notIncluded: [
      "Excel export",
      "Model images",
      "Multiple users",
    ],
    color: "gray",
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 499,
    period: "month",
    description: "For small machine shops",
    features: [
      "25 calculations/month",
      "Advanced feature recognition",
      "Excel + PDF reports",
      "Up to 5 machines",
      "Up to 2 users",
      "Model images",
      "PayPal integration",
      "Email support",
    ],
    notIncluded: [
      "Multi-tenancy",
      "API access",
    ],
    color: "blue",
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: 999,
    period: "month",
    description: "For growing businesses",
    popular: true,
    features: [
      "Unlimited calculations",
      "Advanced feature recognition",
      "Excel + PDF reports",
      "Unlimited machines",
      "Up to 5 users",
      "Model images",
      "All secondary processes",
      "Multi-tenancy",
      "PayPal integration",
      "Priority email support",
    ],
    notIncluded: [
      "Custom branding",
      "API access",
    ],
    color: "indigo",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 2499,
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Unlimited users",
      "API access",
      "Custom branding",
      "SSO integration",
      "Dedicated support",
      "Custom reports",
      "On-premise option",
    ],
    notIncluded: [],
    color: "purple",
  },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan] = useState("FREE");

  const handleSubscribe = async (planId: string) => {
    if (planId === "FREE") return;
    
    setLoading(planId);
    
    try {
      const email = "user@example.com"; // Get from user session
      
      const response = await fetch("/api/paypal/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          email,
          returnUrl: `${window.location.origin}/calculations??subscription=success`,
          cancelUrl: `${window.location.origin}/subscription?cancelled=true`,
        }),
      });

      const data = await response.json();
      
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert("Failed to create subscription. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getColorClasses = (color: string, isPopular: boolean = false) => {
    const colors: Record<string, { bg: string; border: string; button: string; popular: string }> = {
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        button: "bg-gray-600 hover:bg-gray-700",
        popular: "",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700",
        popular: "",
      },
      indigo: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        button: "bg-indigo-600 hover:bg-indigo-700",
        popular: "border-indigo-500 border-2 shadow-lg",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        button: "bg-purple-600 hover:bg-purple-700",
        popular: "",
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core machining
            cost calculator features.
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan !== "FREE" && (
          <div className="text-center mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <Check className="w-4 h-4 mr-1" />
              Current: {plans.find(p => p.id === currentPlan)?.name} Plan
            </span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color, plan.popular);
            const isCurrentPlan = currentPlan === plan.id;
            const isDisabled = isCurrentPlan || loading === plan.id;

            return (
              <div
                key={plan.id}
                className={`
                  relative rounded-2xl ${colors.bg} ${colors.border}
                  ${plan.popular ? getColorClasses("indigo").popular : ""}
                  p-6 flex flex-col
                `}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, index) => (
                    <li key={index} className="flex items-start opacity-50">
                      <span className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-center text-gray-400">-</span>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isDisabled}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-all
                    ${isCurrentPlan 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : isDisabled
                        ? 'bg-gray-400 text-white cursor-wait'
                        : `${colors.button} text-white`
                    }
                  `}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.id === "FREE" ? (
                    'Get Started'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      Subscribe Now
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto text-left space-y-4">
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">Can I change plans anytime?</summary>
              <p className="text-gray-600 mt-2">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </details>
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">What payment methods do you accept?</summary>
              <p className="text-gray-600 mt-2">We accept all major credit cards and PayPal payments.</p>
            </details>
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">Is there a free trial?</summary>
              <p className="text-gray-600 mt-2">Yes! Our Free plan lets you try the basic features. No credit card required.</p>
            </details>
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">What happens if I exceed my limits?</summary>
              <p className="text-gray-600 mt-2">You'll be notified when approaching limits. Upgrade anytime to continue without interruption.</p>
            </details>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>All prices are in Indian Rupees (INR). Prices exclude applicable taxes.</p>
          <p className="mt-2">Need a custom plan? <a href="mailto:support@costinghub.com" className="text-indigo-600 hover:underline">Contact us</a></p>
        </div>
      </div>
    </div>
  );
}
