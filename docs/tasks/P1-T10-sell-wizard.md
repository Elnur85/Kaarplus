# P1-T10: Sell Vehicle Wizard (Multi-Step Form)

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T05, P1-T07
> **Estimated Time:** 5 hours

## Objective

Build the multi-step sell vehicle wizard at `/sell` with 4 steps: vehicle type selection, vehicle data form, photo upload, and confirmation.

## Scope

### Authentication Requirement

- Must be logged in as INDIVIDUAL_SELLER or DEALERSHIP
- Redirect to login if unauthenticated
- Check listing limit for individual sellers (max 5 active)

### Step 1: Vehicle Type Selection

- Body type selection with illustrated icons/images
- Checkboxes with visual cards (Micro, Sedan, Hatchback, Family, Sport, SUV, Truck, Van)
- Next button (disabled until selection made)

### Step 2: Vehicle Data Form

Organized into collapsible sections with React Hook Form + Zod:

**Contact Information:**

- Name, Email, Phone (pre-filled from auth)

**Vehicle Data:**

- Make dropdown (from API)
- Model dropdown (dependent on make)
- Sub-model/Variant text input
- Year dropdown (current year down to 1990)
- VIN number (optional, validated format)
- First registration (month/year)
- Mileage (number input, km)
- Price (number input, EUR)
- VAT included toggle
- Body type (pre-filled from step 1)
- Color exterior (dropdown or color swatches)
- Color interior (optional dropdown)
- Fuel type (dropdown: Petrol, Diesel, Hybrid, Electric, CNG, LPG)
- Transmission (Manual, Automatic)
- Power (kW input, with HP conversion display)
- Drive type (FWD, RWD, AWD, 4WD)
- Number of doors (2, 3, 4, 5)
- Number of seats (2-9)
- Condition (New, Used, Like New, Damaged)
- Description (textarea, max 5000 chars)

**Equipment Checkboxes (grouped):**

- Comfort & Convenience (A/C, climate control, cruise, heated seats, sunroof, etc.)
- Safety (ABS, ESP, airbags, parking sensors, lane assist, etc.)
- Technology (GPS, Bluetooth, Apple CarPlay, Android Auto, USB, etc.)
- Exterior (alloy wheels, roof rails, LED lights, tinted windows, etc.)
- Interior (leather seats, electric seats, steering wheel buttons, etc.)
- Other (service history, warranty, non-smoking, etc.)

### Step 3: Photo Upload

- Drag-and-drop zone with click fallback
- Photo guidelines badge
- Client-side validation:
  - File types: JPEG, PNG, WebP
  - Max size: 10MB per image
  - Min: 3 photos, Max: 30 photos
- Preview thumbnails with remove button
- Reorder by drag
- Upload progress indicators
- Note: "Your photos will be manually verified before publishing"

### Step 4: Confirmation / Success

- Thank you message with success icon
- Listing ID and status (PENDING)
- "What happens next" explanation
- "Add another vehicle" button
- "View my listings" button → `/dashboard/listings`
- "Return to homepage" link

### Progress Indicator

- Step indicator bar at top (1/4, 2/4, 3/4, 4/4)
- Back button on each step
- Form state preserved between steps

## Acceptance Criteria

- [ ] All 4 steps functional with forward/back navigation
- [ ] Form validation shows inline errors
- [ ] Equipment checkboxes stored as JSONB features
- [ ] Photos can be uploaded, previewed, removed, and reordered
- [ ] Listing created with status PENDING on submission
- [ ] Individual sellers cannot exceed 5 active listings
- [ ] Success page shows correct information
- [ ] Form state not lost on step navigation

## Components to Create

```
components/sell/
├── sell-wizard.tsx (orchestrator)
├── step-indicator.tsx
├── step-1-vehicle-type.tsx
├── step-2-vehicle-data.tsx
├── step-3-photo-upload.tsx
├── step-4-confirmation.tsx
├── equipment-checkboxes.tsx
├── photo-dropzone.tsx
└── photo-preview.tsx
```
