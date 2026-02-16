# P4-T01: i18n Setup (Estonian + Russian + English)

> **Phase:** 4 — Polish & Scale
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T06
> **Estimated Time:** 5 hours

## Objective

Implement internationalization (i18n) support for the Kaarplus platform with three languages: Estonian (primary), Russian, and English. This includes setting up the infrastructure, translating all UI strings, and implementing language switching functionality.

## Context

The Estonian car market serves a diverse audience:
- **Estonian speakers** (primary audience)
- **Russian speakers** (significant minority, especially in Tallinn and Narva)
- **English speakers** (international buyers/sellers, expats)

Providing multilingual support will significantly improve accessibility and user experience.

## Requirements

### 1. i18n Library Setup

- Install and configure `next-intl` for Next.js app
- Set up routing strategy (subdirectory: `/et`, `/ru`, `/en`)
- Configure language detection and fallback logic
- Set Estonian (`et`) as the default language

### 2. Translation Files Structure

Create organized translation files:

```
apps/web/messages/
  ├── en/
  │   ├── common.json
  │   ├── home.json
  │   ├── listings.json
  │   ├── auth.json
  │   ├── dashboard.json
  │   ├── admin.json
  │   └── errors.json
  ├── et/
  │   └── (same structure)
  └── ru/
      └── (same structure)
```

### 3. Translations Coverage

Translate all user-facing strings in:

**Public Pages:**
- Landing page (hero, features, CTAs)
- Listings page (filters, sorting, pagination)
- Car detail page (specifications, labels, buttons)
- Search and filtering UI

**Authentication:**
- Login/Register forms
- Password reset
- Email verification

**User Dashboard:**
- My listings
- Favorites
- Messages
- Profile settings

**Admin Panel:**
- Listing queue
- Analytics dashboard
- User management

**Common UI:**
- Navigation menu
- Footer
- Error messages
- Success/info toasts
- Form validation messages

### 4. Language Switcher Component

Create a language switcher UI component:
- Dropdown in header/footer
- Shows current language
- Preserves current route when switching
- Stores preference in cookie/localStorage

### 5. Dynamic Content Handling

- **Database content** (listings, messages, user profiles) remains in original language
- **UI chrome** and **labels** are translated
- **Currency** stays EUR (no conversion)
- **Date formatting** adapts to locale (et-EE, ru-RU, en-US)

### 6. SEO Considerations

- Implement `hreflang` tags for each language version
- Update sitemap.xml to include all language variants
- Set correct `lang` attribute in HTML tag
- Ensure proper meta tags per language

## Technical Approach

### Installation

```bash
npm install next-intl --workspace=apps/web
```

### Configuration

**apps/web/src/i18n.ts:**
```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}/common.json`)).default
}));
```

**apps/web/src/middleware.ts:**
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['et', 'ru', 'en'],
  defaultLocale: 'et'
});

export const config = {
  matcher: ['/', '/(et|ru|en)/:path*']
};
```

### Usage in Components

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

## Acceptance Criteria

- [ ] next-intl is configured with Estonian, Russian, and English
- [ ] All UI strings are extracted into translation JSON files
- [ ] Language switcher component works in header/footer
- [ ] URL routing includes language prefix (`/et/`, `/ru/`, `/en/`)
- [ ] Language preference persists across sessions
- [ ] All existing pages render correctly in all 3 languages
- [ ] SEO tags include proper `hreflang` and `lang` attributes
- [ ] Date/number formatting adapts to user's locale
- [ ] No hardcoded strings remain in UI components

## Testing Checklist

- [ ] Visit `/et/`, `/ru/`, `/en/` — all load correctly
- [ ] Switch languages via dropdown — UI updates immediately
- [ ] Refresh page — language preference is maintained
- [ ] Check listings page filters — labels are translated
- [ ] Submit a form with errors — validation messages show in correct language
- [ ] View admin panel in each language — all strings translated
- [ ] Inspect HTML source — `hreflang` tags present
- [ ] Check sitemap — includes all language variants

## Implementation Notes

### Translation Priority

1. **High Priority** (most visible):
   - Landing page
   - Navigation
   - Listings page
   - Car detail page

2. **Medium Priority**:
   - Authentication flows
   - Dashboard
   - Search filters

3. **Lower Priority**:
   - Admin panel
   - Email templates
   - Error pages

### Estonian Translation Guidelines

- Use formal tone ("Teie" instead of "Sa")
- Automotive terminology: follow local conventions
- Currency: "eurot" or "€"
- Example phrases:
  - "Otsi autot" = "Search for a car"
  - "Müü oma auto" = "Sell your car"
  - "Uued kuulutused" = "New listings"

### Russian Translation Guidelines

- Use formal tone ("Вы" instead of "Ты")
- Maintain clarity and professionalism
- Example phrases:
  - "Искать автомобиль" = "Search for a car"
  - "Продать автомобиль" = "Sell your car"
  - "Новые объявления" = "New listings"

## Related Documentation

- `docs/DESIGN_SYSTEM.md` — UI component guidelines
- `docs/ARCHITECTURE.md` — App structure
- Next-intl docs: https://next-intl-docs.vercel.app/

## Deliverables

1. Configured `next-intl` with 3 locales
2. Complete translation files for et/ru/en
3. Language switcher component
4. Updated routing with locale prefixes
5. SEO improvements (hreflang tags)
6. Documentation updates
