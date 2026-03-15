const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET) : null;

const createIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    if (!stripe) {
      // Fallback mock intent
      return res.json({ clientSecret: 'mock_client_secret', mock: true });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { user: req.user?._id?.toString() || 'guest' }
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
};

const handleWebhook = async (req, res) => {
  // For brevity, accept event and log; production should verify signature
  res.json({ received: true });
};

module.exports = { createIntent, handleWebhook };
