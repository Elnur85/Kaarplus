# API Reference

## Base URL

- Development: `http://localhost:4000`
- Production: `https://api.kaarplus.ee`

## Authentication

JWT in HTTP-only cookies. All endpoints require authentication unless marked `[Public]`.

## Response Format

### Success

```json
{
  "data": { ... },
  "meta": { "page": 1, "pageSize": 20, "total": 150 }
}
```

### Error

```json
{
  "error": "Human-readable error message",
  "details": { ... }
}
```

## Endpoints

### Auth

| Method | Path                        | Auth     | Description            |
| ------ | --------------------------- | -------- | ---------------------- |
| POST   | `/api/auth/register`        | [Public] | Create account         |
| POST   | `/api/auth/login`           | [Public] | Login                  |
| POST   | `/api/auth/logout`          | Required | Logout                 |
| GET    | `/api/auth/session`         | Required | Get current session    |
| POST   | `/api/auth/forgot-password` | [Public] | Request password reset |
| POST   | `/api/auth/reset-password`  | [Public] | Reset password         |

### Listings

| Method | Path                        | Auth        | Description                  |
| ------ | --------------------------- | ----------- | ---------------------------- |
| GET    | `/api/listings`             | [Public]    | List with filters/pagination |
| GET    | `/api/listings/:id`         | [Public]    | Single listing details       |
| POST   | `/api/listings`             | Seller+     | Create listing               |
| PATCH  | `/api/listings/:id`         | Owner/Admin | Update listing               |
| DELETE | `/api/listings/:id`         | Owner/Admin | Delete listing               |
| GET    | `/api/listings/:id/similar` | [Public]    | Similar cars                 |
| POST   | `/api/listings/:id/contact` | [Public]    | Contact seller               |

#### GET /api/listings Query Parameters

| Param          | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `page`         | number | Page number (default: 1)                      |
| `pageSize`     | number | Items per page (default: 20, max: 50)         |
| `sort`         | string | `newest`, `oldest`, `price_asc`, `price_desc` |
| `make`         | string | Filter by make                                |
| `model`        | string | Filter by model                               |
| `yearMin`      | number | Minimum year                                  |
| `yearMax`      | number | Maximum year                                  |
| `priceMin`     | number | Minimum price (EUR)                           |
| `priceMax`     | number | Maximum price (EUR)                           |
| `fuelType`     | string | Comma-separated fuel types                    |
| `transmission` | string | `manual`, `automatic`                         |
| `bodyType`     | string | Body type filter                              |
| `color`        | string | Exterior color                                |
| `q`            | string | Full-text search query                        |

### Search

| Method | Path                  | Auth     | Description        |
| ------ | --------------------- | -------- | ------------------ |
| GET    | `/api/search`         | [Public] | Advanced search    |
| GET    | `/api/search/makes`   | [Public] | Available makes    |
| GET    | `/api/search/models`  | [Public] | Models for a make  |
| GET    | `/api/search/filters` | [Public] | All filter options |

### User

| Method | Path                             | Auth     | Description      |
| ------ | -------------------------------- | -------- | ---------------- |
| GET    | `/api/user/profile`              | Required | Get profile      |
| PATCH  | `/api/user/profile`              | Required | Update profile   |
| GET    | `/api/user/listings`             | Seller+  | My listings      |
| GET    | `/api/user/favorites`            | Required | Get favorites    |
| POST   | `/api/user/favorites/:listingId` | Required | Add favorite     |
| DELETE | `/api/user/favorites/:listingId` | Required | Remove favorite  |
| GET    | `/api/user/messages`             | Required | Get messages     |
| POST   | `/api/user/messages`             | Required | Send message     |
| GET    | `/api/user/gdpr/export`          | Required | GDPR data export |
| DELETE | `/api/user/gdpr/delete`          | Required | Account deletion |

### Payments

| Method | Path                          | Auth     | Description                         |
| ------ | ----------------------------- | -------- | ----------------------------------- |
| POST   | `/api/payments/create-intent` | Required | Create Stripe PaymentIntent         |
| POST   | `/api/payments/confirm`       | Required | Confirm payment                     |
| POST   | `/api/webhooks/stripe`        | [Public] | Stripe webhook (signature verified) |

### Admin

| Method | Path                             | Auth  | Description            |
| ------ | -------------------------------- | ----- | ---------------------- |
| GET    | `/api/admin/listings/pending`    | Admin | Pending verification   |
| PATCH  | `/api/admin/listings/:id/verify` | Admin | Approve/reject listing |
| GET    | `/api/admin/users`               | Admin | List users             |
| GET    | `/api/admin/analytics`           | Admin | Platform analytics     |

## Rate Limits

| Endpoint Pattern       | Limit                 |
| ---------------------- | --------------------- |
| `/api/auth/*`          | 10 req/min per IP     |
| `/api/listings` (GET)  | 60 req/min per IP     |
| `/api/listings` (POST) | 10 req/min per user   |
| `/api/webhooks/*`      | No limit (Stripe IPs) |
| All other              | 30 req/min per user   |
