# P3-T01: Stripe Payment Integration

> **Phase:** 3 — Monetization
> **Status:** ✅ Complete
> **Dependencies:** P1-T05, P1-T07
> **Estimated Time:** 5 hours

## Objective

Implement secure payment processing using Stripe to allow buyers to purchase vehicles directly through the platform. This involves creating payment intents, handling webhooks, and providing a seamless checkout experience.

## Scope

### 1. Backend Implementation (apps/api)

- **Stripe Utility:** Create `apps/api/src/utils/stripe.ts` to initialize and export the Stripe client.
- **Payment Controller:** Create `apps/api/src/controllers/paymentController.ts`.
  - `createPaymentIntent`: Verifies listing availability, calculates total, and returns client secret.
- **Webhook Controller:** Create `apps/api/src/controllers/webhookController.ts`.
  - `handleStripeWebhook`: Verifies signature and handles `payment_intent.succeeded`.
- **Routes:** 
  - `apps/api/src/routes/payment.ts` for intent creation (authenticated).
  - `apps/api/src/routes/webhook.ts` for Stripe notifications (public).
- **Service Updates:**
  - Update `listingService.ts` to support status transitions to `SOLD`.

### 2. Frontend Implementation (apps/web)

- **Stripe Provider:** Setup `@stripe/react-stripe-js` and `@stripe/stripe-js` in `apps/web`.
- **Checkout Component:** Create `apps/web/src/components/checkout/checkout-form.tsx`.
- **Payment Page:** Create `apps/web/src/app/(public)/listings/[id]/purchase/page.tsx`.
- **Success/Failure Pages:** Create confirmation and error routes.

### 3. Business Logic

- When payment succeeds:
  1. Update listing status to `SOLD`.
  2. Create a `Transaction` record in the database.
  3. Send "Sold" email to seller.
  4. Send "Purchase Confirmation" email to buyer.

## Acceptance Criteria

- [ ] Users can initiate a purchase from the vehicle detail page.
- [ ] Payment UI correctly handles Card, Apple Pay, and Google Pay.
- [ ] Backend validates listing price and availability before intent creation.
- [ ] Webhook correctly handles successful payments and updates DB.
- [ ] Webhook signature is strictly verified.
- [ ] Both parties receive transactional emails upon success.
- [ ] Sold vehicles are no longer available for purchase but remain visible in history.
- [ ] Proper error handling for declined cards or expired sessions.
