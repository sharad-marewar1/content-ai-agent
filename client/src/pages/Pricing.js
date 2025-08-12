import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Pricing = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      description: 'Perfect for individuals and small businesses',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      features: [
        '50 content generations per month',
        'Blog posts & social media content',
        'Basic SEO optimization',
        'Email support',
        'Content history',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      description: 'Ideal for growing businesses and teams',
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      features: [
        '200 content generations per month',
        'All Starter features',
        'Email campaigns & newsletters',
        'Advanced SEO with meta tags',
        'Priority support',
        'Detailed analytics & insights',
        'Team collaboration',
        'Custom templates'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations with advanced needs',
      icon: Crown,
      color: 'from-orange-500 to-orange-600',
      features: [
        '1000 content generations per month',
        'All Professional features',
        'Custom AI model training',
        'API access & webhooks',
        'Dedicated account manager',
        'White-label solutions',
        'Advanced integrations',
        'Custom workflows',
        'SLA guarantees'
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (planId) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (subscription?.status === 'active') {
      toast.error('You already have an active subscription');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/subscriptions/create-checkout-session', {
        planId
      });

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (error) {
        toast.error('Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return plans.find(plan => plan.id === subscription.planId);
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-6"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Start generating professional content today. All plans include our AI-powered writing assistant, 
            SEO optimization, and content analytics.
          </motion.p>
        </div>

        {/* Current Plan Banner */}
        {currentPlan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-1">
                  Current Plan: {currentPlan.name}
                </h3>
                <p className="text-green-200 text-sm">
                  You're currently on the {currentPlan.name} plan at ${currentPlan.price}/month
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-300 text-sm">Next billing:</p>
                <p className="text-green-200 text-sm">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${
                plan.popular 
                  ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20 scale-105' 
                  : 'border-white/10'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading || (currentPlan && currentPlan.id === plan.id)}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  currentPlan && currentPlan.id === plan.id
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                }`}
              >
                {isLoading ? (
                  'Processing...'
                ) : currentPlan && currentPlan.id === plan.id ? (
                  'Current Plan'
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated."
              },
              {
                question: "What happens if I reach my monthly limit?",
                answer: "You'll receive a notification when you're close to your limit. Once reached, you can either upgrade your plan or wait until the next billing cycle."
              },
              {
                question: "Is there a free trial?",
                answer: "We offer a 7-day free trial for all plans. No credit card required to start your trial."
              },
              {
                question: "Can I cancel my subscription?",
                answer: "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact us for a full refund."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses already using AI to create engaging, SEO-optimized content.
            </p>
            <button
              onClick={() => handleSubscribe('professional')}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-400 text-sm mt-4">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
