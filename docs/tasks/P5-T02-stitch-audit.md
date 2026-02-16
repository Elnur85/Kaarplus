# P5-T02: Stitch Design Fidelity Audit & Fixes

> **Phase:** 5 — Production Readiness
> **Status:** ⬜ Not Started
> **Dependencies:** Phase 1
> **Estimated Time:** 4 hours

## Problem Statement

8 stitch design references exist in `stitch/` but no systematic comparison was done to verify that the implemented components match the intended design. The previous agent never opened or compared stitch screenshots.

## Stitch References

| Stitch Folder | Maps To | Component Files |
|---------------|---------|-----------------|
| `kaarplus_home_landing_page/` | `/` Landing page | `components/landing/*` |
| `login_and_registration_modals/` | `/login`, `/register` | `components/auth/*` |
| `navigation_and_cookie_consent_components/` | Header, Footer, Cookie banner | `components/layout/*`, `components/gdpr/*` |
| `sell_your_car_step-by-step_wizard/` | `/sell` Sell wizard | `components/sell/*` |
| `user_dashboard_and_management/` | `/dashboard` Dashboard pages | `components/dashboard/*` |
| `vehicle_detail_and_specification_page/` | `/listings/[id]` Car detail | `components/car-detail/*` |
| `vehicle_listings_grid_and_list_view/` | `/listings` Listings page | `components/listings/*` |
| `vehicle_side-by-side_comparison/` | `/compare` Comparison page | `components/comparison/*` |

## Implementation Steps

### For Each Stitch Reference:
1. **View** `stitch/<folder>/screen.png` — understand intended design
2. **Read** `stitch/<folder>/code.html` — extract exact colors, spacing, layout
3. **Run** the app and navigate to the matching page
4. **Compare** visually: layout, spacing, colors, typography, icon usage
5. **Document** gaps in a checklist
6. **Fix** CSS/layout issues to match stitch reference

### Key Areas to Compare:
- [ ] Brand colors match `--primary: #10b77f`
- [ ] Card border radius, shadows, padding match stitch
- [ ] Typography scale matches DESIGN_SYSTEM.md
- [ ] Icon usage follows Lucide mapping (no Material Icons)
- [ ] Grid layouts match (columns, gaps)
- [ ] Responsive behavior matches stitch intent
- [ ] Empty states and loading states are styled

## Acceptance Criteria

- [ ] Each stitch reference has been visually compared side-by-side
- [ ] All identified layout/color/spacing gaps have been fixed
- [ ] No Material Icons used anywhere (all Lucide)
- [ ] Cards, buttons, inputs follow Shadcn/ui conventions throughout
