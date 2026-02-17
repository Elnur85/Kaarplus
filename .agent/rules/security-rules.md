---
title: Security Rules
description: Mandatory security rules for authentication, authorization, data validation, and protection against common vulnerabilities. Must be followed for all code changes.
triggers:
  - "*.ts"
  - "*.tsx"
  - "*.prisma"
  - "*.env*"
  - "middleware.ts"
  - "auth.ts"
---

# Security Rules

## Authentication Rules

### JWT Handling
- JWT_SECRET must be 32+ characters, cryptographically random
- Tokens expire after 24 hours (configurable)
- Refresh token rotation (future implementation)
- Store in HTTP-only, Secure, SameSite=strict cookies

```typescript
// ✅ CORRECT - HTTP-only cookie
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

// ❌ WRONG - Never store in localStorage
localStorage.setItem('token', jwt);
```

### NextAuth Configuration
- Use JWT strategy (stateless)
- CSRF protection enabled
- Secure session cookies
- Callback URL validation

### Password Security
- bcrypt with salt rounds ≥ 10
- Minimum password length: 8 characters
- Password complexity not enforced (NIST guidelines)
- Never log passwords

## Authorization Rules

### Route Protection
```typescript
// All routes require auth by default
app.use(requireAuth);

// Explicitly mark public routes
app.get('/api/listings', getAllListings); // [Public]

// Role-based protection
app.delete('/api/users/:id', requireRole(UserRole.ADMIN), deleteUser);
```

### Resource-Level Authorization
```typescript
// ALWAYS check ownership
async updateListing(id: string, userId: string, isAdmin: boolean, data) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  
  if (!listing) throw new NotFoundError("Listing not found");
  
  if (!isAdmin && listing.userId !== userId) {
    throw new ForbiddenError("You don't have permission");
  }
  
  // Proceed with update
}
```

### Admin Privileges
- Admin can access all resources
- Support role has limited admin access
- All admin actions logged

## Input Validation

### Zod Schemas (Mandatory)
```typescript
// Every endpoint must validate input
const createListingSchema = z.object({
  make: z.string().min(1).max(100),
  price: z.number().positive().max(10000000),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
});

// In controller
const result = createListingSchema.safeParse(req.body);
if (!result.success) {
  throw new BadRequestError(result.error.issues[0].message);
}
```

### SQL Injection Prevention
- Use Prisma ORM exclusively
- No raw SQL without parameterization
- Never concatenate user input into queries

```typescript
// ✅ CORRECT - Prisma ORM
await prisma.listing.findMany({ where: { make: userInput } });

// ❌ WRONG - Raw SQL concatenation
await prisma.$queryRaw`SELECT * FROM listings WHERE make = '${userInput}'`;
```

### XSS Prevention
- React escapes output by default
- Never use `dangerouslySetInnerHTML` with user input
- Sanitize HTML if rich text is needed (DOMPurify)

```typescript
// ✅ CORRECT - React escapes automatically
<div>{userInput}</div>

// ❌ WRONG - Direct HTML insertion
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

## Data Protection

### GDPR Compliance
```typescript
// Consent logging
await prisma.gdprConsent.create({
  data: {
    userId: user.id,
    marketing: consent.marketing,
    analytics: consent.analytics,
    ipAddress: req.ip, // Log IP for consent
  },
});

// Data export endpoint
app.get('/api/user/gdpr/export', requireAuth, exportUserData);

// Account deletion
app.delete('/api/user/gdpr/delete', requireAuth, deleteUserAccount);
```

### Sensitive Data Handling
- Never log sensitive data (passwords, tokens, credit cards)
- Mask sensitive data in error messages
- Encrypt PII at rest (future: database encryption)

```typescript
// ✅ CORRECT - Mask sensitive data
logger.info(`User login attempt: ${email}`);
// Log: User login attempt: j***@example.com

// ❌ WRONG - Log sensitive data
console.log('User data:', { password, ssn, creditCard });
```

### File Upload Security
```typescript
// Validate file types
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new BadRequestError('Invalid file type');
}

// Validate file size (max 5MB)
const maxSize = 5 * 1024 * 1024;
if (file.size > maxSize) {
  throw new BadRequestError('File too large');
}

// Scan for malware (future: ClamAV integration)
```

## API Security

### Rate Limiting
```typescript
// Apply to all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
});
```

### CORS Configuration
```typescript
// Whitelist specific origins
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Security Headers
```typescript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust as needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## Payment Security (Stripe)

### Webhook Verification
```typescript
// ALWAYS verify webhook signature
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Never trust client-side callbacks
```

### PCI Compliance
- Never store credit card numbers
- Use Stripe Elements for card input
- Tokenize cards client-side

## Environment Variables

### Required Variables
```bash
# Backend
JWT_SECRET=             # Min 32 chars, random
STRIPE_SECRET_KEY=      # Live key in production
STRIPE_WEBHOOK_SECRET=  # Webhook endpoint secret
AWS_ACCESS_KEY_ID=      # S3 access
AWS_SECRET_ACCESS_KEY=  # S3 secret
SENDGRID_API_KEY=       # Email service

# Frontend
NEXTAUTH_SECRET=        # NextAuth secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable
```

### Security Checklist
- [ ] No secrets in code
- [ ] .env files in .gitignore
- [ ] Different secrets for dev/staging/prod
- [ ] Secrets rotated regularly
- [ ] No default/weak secrets

## Security Audit Checklist

### Code Review Security Items
- [ ] Input validation on all endpoints
- [ ] Authorization checks on all routes
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No sensitive data logging
- [ ] Proper error handling (no info leakage)
- [ ] Rate limiting applied
- [ ] CORS properly configured

### Dependency Security
```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

## Incident Response

### Security Breach Response
1. Immediately revoke affected tokens
2. Rotate compromised secrets
3. Audit access logs
4. Notify affected users (GDPR requirement)
5. Document incident

### Reporting Security Issues
- Internal: Create high-priority ticket
- External: security@kaarplus.ee
- Never disclose publicly until fixed
