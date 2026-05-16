# Stripe Integration Plan: VIDERE RettSted

## 1. Objective
Transform VIDERE RettSted into a modular SaaS platform by integrating Stripe for automated billing, subscription management, and feature gating.

## 2. Subscription Tiers (Proposed)

| Tier | Key Modules Included | Billing Basis |
| :--- | :--- | :--- |
| **Free** | RettSted (Places), Logistics (Basic) | 0 NOK / month |
| **Pro** | Everything in Free + Fleet, Workforce, Messages | Per active driver/month |
| **Enterprise** | Everything in Pro + Analytics, API Access, LMS | Flat fee + Per driver |

## 3. Technology Stack
- **Provider:** Stripe.
- **Integration:** [Run Payments with Stripe](https://extensions.dev/extensions/stripe/firestore-stripe-payments) Firebase Extension.
- **Frontend:** Stripe Checkout (Hosted) and Stripe Customer Portal.

## 4. Implementation Steps

### Step 1: Stripe Dashboard Setup
1.  Create Products for "VIDERE Pro" and "VIDERE Enterprise".
2.  Define Prices (Monthly/Yearly).
3.  Configure Webhook endpoints to point to the Firebase Extension.

### Step 2: Firebase Extension Configuration
1.  Install the extension in the Firebase Console.
2.  Configure the `customers` and `subscriptions` collection paths.
3.  Set up sync for `Organization.plan` based on Stripe metadata.

### Step 3: Subscription Lifecycle (Backend)
1.  **Subscription Created/Updated:** A Cloud Function (or the extension) updates the `organizations/{orgId}` document with the new `plan` and `status`.
2.  **Subscription Canceled:** Status is set to `suspended` or `trial_expired`.
3.  **Module Gating:** Create a utility `isModuleEnabled(org, moduleName)` that checks both the `plan` and manual toggles.

### Step 4: Owner Dashboard Integration
1.  **Upgrade Button:** Trigger a `checkout_sessions` creation in Firestore.
2.  **Manage Billing:** Redirect to the Stripe-hosted Customer Portal for card updates and invoices.
3.  **Plan Status:** Clear visual indicator of current tier and next billing date.

### Step 5: Global Enforcement
1.  **Dashboard Middleware:** If an organization status is `suspended`, redirect all non-owner users to a "Service Temporarily Unavailable" page.
2.  **Sidebar Filtering:** Hide navigation links for modules not included in the current plan.

## 5. Security & Multi-Tenancy
- Only users with the `owner` role can access the billing portal.
- Subscriptions must be strictly tied to the `orgId` to prevent cross-tenant billing issues.

## 6. Next Steps (Actionable)
- [ ] Create Stripe test account.
- [ ] Map Stripe Price IDs to internal `Organization.plan` constants.
- [ ] Install Extension in a test environment.
