# Razorpay Payment Integration Implementation Guide

This document outlines how the payment system using Razorpay has been integrated into the LaymanDB application.

## Overview

The payment system follows a "first 10 free, then pay" model:
- Every user gets 10 free schema generations
- After free trials are used, users can purchase:
  - Basic Plan: ₹30 for 100 schema generations
  - Premium Plan: ₹50 for 200 schema generations

## Implementation Details

### Backend API Routes

1. `/api/user/status` - Fetches the user's subscription status
2. `/api/schema-generation` - Checks usage limits before generating a schema
3. `/api/payment` - Creates a Razorpay order
4. `/api/payment/verify` - Verifies payment and updates user metadata

### User Metadata in Clerk

We store the following in Clerk's privateMetadata:
- `freeTrialCount`: Number of free trials used
- `isPro`: Whether the user has paid
- `paidSchemaCredits`: Number of paid generations remaining
- `subscriptionPlan`: The plan the user purchased (basic/premium)
- `paymentHistory`: Record of past payments

### Frontend Components

1. `SubscriptionStatus.js` - Shows remaining trials/credits in the UI
2. `PaywallNotice.js` - Displayed when user has no trials left
3. `/subscribe/page.js` - Subscription page with payment options
4. `SchemaContext.js` - Updated with subscription management logic

### Pages

1. `/subscribe` - Payment plans page
2. `/billing/success` - Payment success page
3. `/billing/cancel` - Payment cancellation page

## How to Complete Setup

1. Create a Razorpay account and get your API keys
2. Add the keys to your `.env.local` file (see sample.env.local)
3. Install the Razorpay CLI for local testing:
   ```
   npm install -g razorpay-cli
   ```

4. Test webhook forwarding in development:
   ```
   razorpay webhook-forward --key_id=rzp_test_your_key_id --key_secret=your_key_secret --endpoint=http://localhost:3000/api/payment/verify
   ```

## Usage Flow

1. User signs up with Clerk authentication
2. User gets 10 free schema generations
3. After 10 uses, they see the paywall and are prompted to upgrade
4. User selects a plan and pays through Razorpay
5. On successful payment, user gets additional schema credits
6. Credits are deducted on each schema generation

## Environment Variables

Make sure to set these in your `.env.local` file:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Razorpay Payment Integration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```
