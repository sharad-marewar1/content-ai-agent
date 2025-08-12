const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Subscription plans
const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    monthlyLimit: 50,
    features: ['Blog posts', 'Social media content', 'Basic SEO', 'Email support']
  },
  professional: {
    name: 'Professional',
    price: 79,
    monthlyLimit: 200,
    features: ['All Starter features', 'Email campaigns', 'Advanced SEO', 'Priority support', 'Analytics']
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    monthlyLimit: 1000,
    features: ['All Professional features', 'Custom AI training', 'API access', 'Dedicated support', 'White-label']
  }
};

// Get available plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// Create checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} Plan`,
              description: `${plan.monthlyLimit} content generations per month`,
            },
            unit_amount: plan.price * 100, // Stripe expects cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        planId: planId
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSubscriptionCreated(session);
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;
      
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionCancelled(subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle subscription creation
async function handleSubscriptionCreated(session) {
  const { userId, planId } = session.metadata;
  const plan = PLANS[planId];
  
  const user = await User.findById(userId);
  if (!user) return;

  user.subscription = {
    status: 'active',
    planId: planId,
    planName: plan.name,
    monthlyLimit: plan.monthlyLimit,
    stripeSubscriptionId: session.subscription,
    currentPeriodEnd: new Date(session.subscription.current_period_end * 1000),
    features: plan.features
  };

  user.usageCount = 0; // Reset usage for new subscription
  await user.save();

  // Send welcome email
  await sendWelcomeEmail(user.email, plan.name);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': invoice.subscription });
  
  if (user) {
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    user.subscription.status = 'active';
    await user.save();
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': invoice.subscription });
  
  if (user) {
    user.subscription.status = 'past_due';
    await user.save();
    
    // Send payment failure notification
    await sendPaymentFailureEmail(user.email);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
  if (user) {
    user.subscription.status = 'cancelled';
    user.subscription.cancelledAt = new Date();
    await user.save();
    
    // Send cancellation email
    await sendCancellationEmail(user.email);
  }
}

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
    
    user.subscription.status = 'cancelled';
    user.subscription.cancelledAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get current subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      subscription: user.subscription,
      usageCount: user.usageCount,
      plans: PLANS
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Helper functions for emails (implement with your email service)
async function sendWelcomeEmail(email, planName) {
  // Implement with SendGrid, Mailgun, etc.
  console.log(`Welcome email sent to ${email} for ${planName} plan`);
}

async function sendPaymentFailureEmail(email) {
  console.log(`Payment failure notification sent to ${email}`);
}

async function sendCancellationEmail(email) {
  console.log(`Cancellation email sent to ${email}`);
}

module.exports = router;
