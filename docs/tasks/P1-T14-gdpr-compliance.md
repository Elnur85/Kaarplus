# P1-T14: GDPR Compliance

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T05
> **Estimated Time:** 3 hours

## Objective

Implement GDPR-compliant consent management, privacy policy pages, user data export, and account deletion.

## Scope

### Cookie Consent Banner

- Shows on first visit (no cookie set)
- Three categories: Essential (always on), Analytics, Marketing
- Accept All / Reject All / Customize buttons
- Saves consent to `GdprConsent` table and localStorage
- Re-accessible from footer "Cookie Settings" link

### Privacy & Legal Pages

- `/privacy` — Privacy policy (Estonian + English toggle)
- `/terms` — Terms of service
- `/cookies` — Cookie policy
- `/faq` — General FAQ

### User Data Export

- `GET /api/user/gdpr/export` — Returns JSON with all user data:
  - Profile information
  - Listings
  - Favorites
  - Messages
  - Consent records
  - Payment history

### Account Deletion

- `DELETE /api/user/gdpr/delete`
  - Soft-delete user data
  - Anonymize listings (keep for historical data)
  - Remove favorites, messages
  - Clear personal information
  - Send confirmation email
  - 30-day grace period before permanent deletion

### Consent Backend

- `POST /api/user/gdpr/consent` — Save consent preferences
  - Input: `{ marketing: boolean, analytics: boolean }`
  - Logs: timestamp, IP address, consent version

## Acceptance Criteria

- [ ] Cookie banner appears on first visit
- [ ] Consent choices are saved and respected
- [ ] Privacy policy page is accessible
- [ ] Authenticated users can export their data as JSON
- [ ] Authenticated users can delete their account
- [ ] Consent is logged with timestamp and IP
- [ ] Banner doesn't show again after consent given (until cleared)

## Components to Create

```
components/gdpr/
├── cookie-banner.tsx
├── cookie-settings-modal.tsx
└── consent-toggle.tsx

app/(legal)/
├── privacy/page.tsx
├── terms/page.tsx
├── cookies/page.tsx
└── faq/page.tsx
```
