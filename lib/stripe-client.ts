import { loadStripe } from '@stripe/stripe-js'

// Singleton per il client Stripe (lato browser)
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
