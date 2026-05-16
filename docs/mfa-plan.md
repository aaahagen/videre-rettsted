# MFA Implementation Plan: VIDERE RettSted

## 1. Objective
To enhance the security of the VIDERE RettSted platform by implementing Multi-Factor Authentication (MFA), specifically targeting administrative roles that have access to sensitive organizational and personnel data.

## 2. Target Roles
- **Super Admin:** Highest priority.
- **Owner & Admin:** Required for organizational integrity.
- **HMS Responsible & Salesman:** Recommended.
- **Drivers:** Optional (low sensitivity data).

## 3. Technology Stack
- **Provider:** Firebase Authentication (via Google Cloud Identity Platform).
- **Primary Method:** SMS-based verification (e.g., Phone Number MFA).
- **Secondary Method (Future):** TOTP (Google Authenticator, Authy) if migrating to advanced Identity Platform features.

## 4. Implementation Phases

### Phase A: Foundation & Voluntary Enrollment
1.  **Enable Identity Platform:** Upgrade Firebase project to use Google Cloud Identity Platform (required for MFA).
2.  **Security Settings UI:** Add a "Sikkerhet" (Security) section to the user profile page (`/dashboard/profile`).
3.  **MFA Enrollment Flow:**
    *   User enters phone number.
    *   Firebase sends verification code via SMS.
    *   User enters code to verify and enable MFA.
4.  **Session Management:** Ensure that `signInWithEmailAndPassword` correctly handles the `auth/multi-factor-auth-required` error and triggers the second factor challenge.

### Phase B: Enforced MFA for High-Privilege Roles
1.  **Middleware Check:** Implement a check in `AuthProvider` or a dedicated Higher-Order Component (HOC) to verify if a user has MFA enabled.
2.  **Enforcement Logic:** If `role` is `super_admin`, `owner`, or `admin` AND MFA is not enabled:
    *   Restrict access to all dashboard features.
    *   Redirect to `/dashboard/security/setup-mfa`.
3.  **Grace Period:** Optionally allow a 7-day grace period for new admins to set up MFA.

### Phase C: Recovery & Support
1.  **Recovery Codes:** Explore generating and storing one-time recovery codes.
2.  **Admin Reset:** Allow Super Admins to "reset" MFA for a user if they lose access to their device (requiring manual identity verification).

## 5. UI/UX Considerations
- **Clear Instructions:** Explain *why* MFA is required (GDPR, security).
- **Success Feedback:** Clear confirmation when MFA is active.
- **Login Flow:** Smooth transition from password entry to MFA code entry.

## 6. Next Steps
- [ ] Evaluate costs associated with Google Cloud Identity Platform and SMS segments.
- [ ] Implement Phase A enrollment UI.
- [ ] Update `firebaseAuth.signIn` to handle MFA challenges.
