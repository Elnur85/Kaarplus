# Kaarplus System Use Cases & Logic Flows

This document outlines the exact, implemented logic flows in the Kaarplus application as of the current build. It details the step-by-step path of data from the frontend UI to the backend Prisma database, including which features are fully functional and which rely on placeholders.

---

## 1. Publishing a Listing (Sell Wizard)

**Scenario:** A user wants to sell their vehicle and fills out the 4-step `/sell` wizard.

### Logic Flow
```mermaid
sequenceDiagram
    participant User
    participant SellWizard (Next.js)
    participant API (Express)
    participant AWS/Local
    participant Database (PostgreSQL)

    User->>SellWizard: Fills Step 1 & 2 (Vehicle Data)
    User->>SellWizard: Clicks "Publish Listing"
    SellWizard->>API: POST /api/v1/listings (Data without images)
    API->>Database: Creates Listing (status: "PENDING")
    Database-->>API: Returns new listingId
    API-->>SellWizard: Success + listingId

    Note over SellWizard,AWS/Local: Image Upload Phase
    
    rect rgb(230, 243, 255)
        alt is Production (AWS S3)
            SellWizard->>API: POST /uploads/presign (Request AWS URL)
            API-->>SellWizard: Returns secure S3 URL
            SellWizard->>AWS/Local: PUT image to AWS S3 Bucket
        else is Development (Local)
            SellWizard->>API: POST /uploads (FormData with file)
            API->>AWS/Local: Saves to local /uploads/ directory via Multer
            API-->>SellWizard: Returns local publicUrl
        end
    end

    SellWizard->>API: POST /api/v1/listings/:id/images (Attach URLs)
    API->>Database: Creates Image records linked to listingId
    API-->>SellWizard: Success!
    SellWizard->>User: Shows Confirmation UI (Step 4)
```

### Implementation Status
> [!NOTE]
> **Fully Implemented**: Validation (Zod), Authentication protection throughout the wizard, the duplicate ID collision avoidance mechanism, and dual-environment uploads (S3 vs local static).
> 
> **Placeholder / Not Implemented**: 
> - **Payment Gateways:** The `Stripe` integration for paid listings is mentioned in architecture but not currently enforced in the creation pipeline.
> - **Immediate Active State:** Listings default to `PENDING` waiting for admin approval, but the Admin Gateway to trigger this approval is rudimentary.

---

## 2. Contacting a Seller (Messaging)

**Scenario:** A buyer views a car at `/listings/:id` and clicks "Contact Seller" to send an inquiry.

### Logic Flow
```mermaid
sequenceDiagram
    participant Buyer
    participant UI (Next.js)
    participant AuthMiddleware (Express)
    participant MessageService (Express)
    participant EmailService (SendGrid)
    participant Database

    Buyer->>UI: Types message and clicks Send
    UI->>AuthMiddleware: POST /api/v1/listings/:id/contact (with JWT if logged in)
    AuthMiddleware->>MessageService: optionalAuth parses token or allows Guest
    
    MessageService->>Database: Fetch Listing & Owner Details
    
    alt is Authenticated User
        MessageService->>Database: Create Message {senderId, recipientId, content}
        Note over MessageService,Database: Appears in both users' /dashboard/messages
    else is Guest User
        Note over MessageService,Database: No DB row created (Cannot track sender)
    end

    MessageService->>EmailService: sendNewMessageEmail()
    
    alt SENDGRID_API_KEY Missing
        EmailService-->>Console: console.log("Email logged")
    else SENDGRID_API_KEY Provided
        EmailService->>SendGrid: Fires actual Email API
    end

    MessageService-->>UI: 200 OK
    UI->>Buyer: Shows Success Toast
```

### Implementation Status
> [!IMPORTANT]
> **Fully Implemented**: `optionalAuth` middleware correctly separates guests from logged-in users. Authenticated messages persist in Prisma under `Message` models for the dashboard.
> 
> **Placeholder / Not Implemented**: 
> - **SendGrid Configuration:** In development, standard emails are just logged to the Node console (`[Email] Email logged`). You must supply `SENDGRID_API_KEY` to actually ping user inboxes.
> - **Real-time WebSockets:** Socket.io is configured in `app.ts`, but the client-side chat UI relies mostly on HTTP polling/refreshes currently.

---

## 3. Dashboard & My Listings

**Scenario:** A seller visits `/dashboard/listings` to see their posted cars.

### Logic Flow
```mermaid
flowchart TD
    A[User visits /dashboard/listings] --> B(MyListingsTable Component)
    B --> C{Fetch api/v1/user/listings}
    C --> D[dashboardController.ts]
    D --> E[(Database)]
    E -.->|Returns ALL statuses: ACTIVE, PENDING, DRAFT| D
    D -.->|JSON Array| B
    B --> F[React Maps Listing Rows]
```

### Implementation Status
> [!NOTE]
> **Fully Implemented**: The dashboard leverages the correct authenticated route `dashboardService.getUserListings` which bypasses the public visibility blocks, ensuring authors see their `PENDING` cars.
> 
> **Placeholder / Not Implemented**: 
> - **Admin Approval Pipeline**: While sellers can see their `PENDING` items, the formal UI for an Admin to click "Approve" (flipping the status to `ACTIVE`) isn't widely visible, requiring raw API calls or manual DB edits to launch a car publicly.

---

## 4. Favorites System

**Scenario:** A user clicks the Heart icon on a car card on the homepage.

### Logic Flow
```mermaid
sequenceDiagram
    participant User
    participant VehicleCard (Zustand)
    participant API
    participant Database

    User->>VehicleCard: Clicks heart icon
    VehicleCard->>Zustand: toggleFavorite(id)
    
    alt Not Logged In
        Zustand->>User: Redirects to /login
    else Logged In
        Zustand->>API: POST /api/v1/user/favorites/:id
        API->>Database: Creates Favorite row {userId, listingId}
        Database-->>API: 201 Created
        API-->>Zustand: Success
        Zustand->>VehicleCard: Heart turns solid red
    end
```

### Implementation Status
> [!TIP]
> **Fully Implemented**: The global `Zustand` store accurately manages client-state, while the backend protects dead favorites. The favorite state is pre-calculated via SSR when navigating to `/dashboard/favorites`.

---

## 5. Security and Quality Checks

1. **Authentication:** The `requireAuth` and `optionalAuth` pipelines using JWT algorithms are fully robust.
2. **Translation (i18n):** Multi-language structures are strictly mapped to `react-i18next` interpolations (`{{variable}}`), preventing UI key leakage.
3. **Data Integrity:** Forms enforce Zod schema compliance prior to ever hitting the backend.

### What needs to be built next? (Roadmap)
- [ ] Connect the **Stripe Account** to enforce paid VIP listing tiers.
- [ ] Finalize the **Admin Dashboard** (`/admin`) for 1-click `PENDING` to `ACTIVE` vehicle approvals.
- [ ] Link genuine SendGrid keys to escape the `console.log` email sandbox.
- [ ] Ensure the **Socket.io** event emitters broadcast new messages directly to the chat bubbles without requiring a page reload.
