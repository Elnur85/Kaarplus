---
name: security-audit
description: Performs comprehensive security audits on code changes, API endpoints, and frontend components. Checks for vulnerabilities including injection attacks, authentication bypasses, insecure data exposure, and OWASP Top 10 risks.
triggers:
  - "Security audit"
  - "Security check"
  - "Security review"
  - "Check security"
  - "Audit for vulnerabilities"
  - "Security scan"
---

# Security Audit Skill

## Goal
Perform comprehensive security audits to identify and remediate vulnerabilities in code.

## Audit Scope

### 1. Input Validation
- SQL Injection
- XSS (Cross-Site Scripting)
- Command Injection
- Path Traversal
- NoSQL Injection

### 2. Authentication & Authorization
- JWT handling
- Session management
- Role-based access control
- Resource-level permissions

### 3. Data Protection
- Sensitive data exposure
- Encryption at rest/transit
- Secure cookie settings
- PII handling

### 4. API Security
- Rate limiting
- CORS configuration
- Error information leakage
- Mass assignment

### 5. Frontend Security
- XSS prevention
- CSRF protection
- Secure dependencies
- Content Security Policy

## Step-by-Step Instructions

### Step 1: Input Validation Audit

**Check all input points:**
- API request bodies
- Query parameters
- URL parameters
- File uploads
- Headers

**SQL Injection Check:**
```typescript
// ❌ VULNERABLE - String concatenation
const query = `SELECT * FROM listings WHERE make = '${req.query.make}'`;

// ✅ SAFE - Parameterized query (Prisma)
await prisma.listing.findMany({
  where: { make: req.query.make },
});
```

**XSS Check:**
```typescript
// ❌ VULNERABLE - Direct HTML insertion
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - React escapes by default
<div>{userInput}</div>

// ✅ SAFE - Sanitized HTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Command Injection Check:**
```typescript
// ❌ VULNERABLE
exec(`convert ${req.query.filename} output.jpg`);

// ✅ SAFE - No user input in commands
// Use libraries with safe APIs
```

### Step 2: Authentication Audit

**JWT Verification:**
```typescript
// ❌ VULNERABLE - No verification
const decoded = jwt.decode(token);

// ✅ SAFE - Proper verification
const decoded = jwt.verify(token, JWT_SECRET);

// ✅ SAFE - With expiration check
try {
  const decoded = jwt.verify(token, JWT_SECRET);
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    throw new AuthError('Token expired');
  }
  throw new AuthError('Invalid token');
}
```

**Password Storage:**
```typescript
// ❌ VULNERABLE - Plain text or weak hash
const hash = md5(password);

// ✅ SAFE - bcrypt with salt
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);
```

### Step 3: Authorization Audit

**Resource Access Control:**
```typescript
// ❌ VULNERABLE - No ownership check
app.delete('/api/listings/:id', requireAuth, async (req, res) => {
  await prisma.listing.delete({ where: { id: req.params.id } });
});

// ✅ SAFE - Verify ownership
app.delete('/api/listings/:id', requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
  });
  
  if (!listing) throw new NotFoundError();
  
  if (listing.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Not authorized');
  }
  
  await prisma.listing.delete({ where: { id: req.params.id } });
});
```

### Step 4: Data Exposure Audit

**Sensitive Data in Responses:**
```typescript
// ❌ VULNERABLE - Exposes sensitive data
res.json({
  user: {
    ...user,
    passwordHash: user.passwordHash, // NEVER!
    ssn: user.ssn,
  },
});

// ✅ SAFE - Select only needed fields
res.json({
  data: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
```

**Error Information Leakage:**
```typescript
// ❌ VULNERABLE - Exposes internals
} catch (error) {
  res.status(500).json({
    error: error.message,  // May expose SQL queries, paths, etc.
    stack: error.stack,
  });
}

// ✅ SAFE - Generic error in production
} catch (error) {
  logger.error(error);  // Log details internally
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
  });
}
```

### Step 5: API Security Audit

**Rate Limiting:**
```typescript
// ❌ VULNERABLE - No rate limiting
app.post('/api/auth/login', loginHandler);

// ✅ SAFE - Rate limited
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts',
});

app.post('/api/auth/login', loginLimiter, loginHandler);
```

**Mass Assignment Protection:**
```typescript
// ❌ VULNERABLE - Accepts any fields
app.post('/api/users', async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
});

// ✅ SAFE - Whitelist allowed fields
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  // role is NOT included - prevents privilege escalation
});

app.post('/api/users', validate(createUserSchema), async (req, res) => {
  const user = await prisma.user.create({
    data: { ...req.body, role: 'BUYER' }, // Set default role
  });
});
```

### Step 6: Frontend Security Audit

**CSRF Protection:**
```typescript
// ✅ SAFE - SameSite cookies
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Prevents CSRF
});
```

**Content Security Policy:**
```typescript
// ✅ SAFE - CSP headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}));
```

## Security Checklist

### Input Validation
- [ ] All user inputs validated with Zod
- [ ] No raw SQL concatenation
- [ ] File uploads validated (type, size)
- [ ] URL parameters sanitized

### Authentication
- [ ] JWT properly verified
- [ ] Tokens have expiration
- [ ] Passwords hashed with bcrypt
- [ ] Session management secure

### Authorization
- [ ] Resource ownership verified
- [ ] Role checks implemented
- [ ] No horizontal privilege escalation
- [ ] No vertical privilege escalation

### Data Protection
- [ ] Sensitive data not logged
- [ ] PII handled according to GDPR
- [ ] Encryption in transit (HTTPS)
- [ ] Secure cookie settings

### API Security
- [ ] Rate limiting applied
- [ ] CORS properly configured
- [ ] Error messages don't leak info
- [ ] Mass assignment prevented

### Frontend Security
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure dependencies
- [ ] CSP headers

## Common Vulnerabilities

### OWASP Top 10 for 2024

1. **Broken Access Control**
   - Missing authorization checks
   - IDOR (Insecure Direct Object Reference)
   - CORS misconfiguration

2. **Cryptographic Failures**
   - Weak encryption
   - Hardcoded secrets
   - Insecure transmission

3. **Injection**
   - SQL injection
   - NoSQL injection
   - Command injection
   - LDAP injection

4. **Insecure Design**
   - Missing security controls
   - Business logic flaws
   - Race conditions

5. **Security Misconfiguration**
   - Default credentials
   - Unnecessary features enabled
   - Verbose error messages

6. **Vulnerable Components**
   - Outdated dependencies
   - Known CVEs
   - Unmaintained libraries

7. **Authentication Failures**
   - Weak password policy
   - Brute force possible
   - Session fixation

8. **Software and Data Integrity**
   - Unsigned updates
   - Insecure deserialization
   - CI/CD pipeline security

9. **Security Logging Failures**
   - Insufficient logging
   - No monitoring
   - Logs not protected

10. **Server-Side Request Forgery**
    - SSRF vulnerabilities
    - Internal resource access

## Security Audit Report Template

```markdown
# Security Audit Report

## Summary
- **Date:** [Date]
- **Scope:** [Files/Features audited]
- **Risk Level:** [Critical/High/Medium/Low]

## Findings

### 🔴 Critical
1. **[Vulnerability Name]**
   - **Location:** [File:Line]
   - **Description:** [What was found]
   - **Impact:** [Potential damage]
   - **Remediation:** [How to fix]

### 🟠 High
...

### 🟡 Medium
...

### 🟢 Low
...

## Recommendations
1. [General security improvements]
2. [Process improvements]

## Verification
- [ ] All critical issues fixed
- [ ] All high issues fixed
- [ ] Regression testing completed
```

## Tools

### Automated Scanners
```bash
# Dependency vulnerabilities
npm audit

# Snyk scan
npx snyk test

# ESLint security plugin
npm install eslint-plugin-security
```

### Manual Testing
```bash
# SQL injection test
curl "http://localhost:4000/api/listings?q=' OR '1'='1"

# XSS test
curl -X POST http://localhost:4000/api/listings \
  -H "Content-Type: application/json" \
  -d '{"description": "<script>alert(1)</script>"}'
```

## Constraints

### DO
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Implement proper auth checks
- [ ] Log security events
- [ ] Use security headers
- [ ] Keep dependencies updated

### DON'T
- [ ] Don't trust user input
- [ ] Don't expose sensitive data
- [ ] Don't disable security for convenience
- [ ] Don't ignore security warnings
- [ ] Don't hardcode secrets
