# AtDoor API Documentation

Complete REST API documentation for the **AtDoor** Home Services Marketplace platform.

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)

---

## 1. Authentication (`/api/auth`)

### Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth**: Public
- **Request Body**:
```json
{
  "name": "Hasrith Rao",
  "email": "customer@atdoor.com",
  "phone": "+91 98765 43210",
  "password": "Customer@123",
  "role": "CUSTOMER"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "67...",
    "name": "Hasrith Rao",
    "email": "customer@atdoor.com",
    "role": "CUSTOMER"
  }
}
```

### Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "customer@atdoor.com",
  "password": "Customer@123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { ... }
}
```

### Current User (Session Restore)
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth**: Authenticated User
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Hasrith Rao",
    "email": "customer@atdoor.com",
    "role": "CUSTOMER",
    "profile": { ... }
  }
}
```

---

## 2. AI Service Assistant (`/api/requests`)

### AI Service Classification Preview
- **Method**: `POST`
- **Path**: `/api/requests/ai-classify`
- **Auth**: Public
- **Request Body**:
```json
{
  "text": "My AC is leaking water from the indoor unit and not cooling."
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "categoryName": "AC & Cooling",
    "categoryId": "67...",
    "requiredSkills": ["AC Technician", "HVAC Specialist"],
    "possibleIssues": ["Indoor unit water leakage", "Cooling coil condensation"],
    "urgency": "medium",
    "confidence": 96,
    "explanation": "..."
  }
}
```

### Create Service Request
- **Method**: `POST`
- **Path**: `/api/requests`
- **Auth**: Customer
- **Request Body**:
```json
{
  "description": "My AC is leaking water from the indoor unit and not cooling.",
  "preferredDate": "2026-10-01",
  "preferredTime": "10:00 AM",
  "urgency": "medium",
  "address": {
    "addressLine": "Flat 402, Green Glen Layout",
    "area": "Bellandur",
    "city": "Bengaluru"
  }
}
```

---

## 3. Providers & AI Matching (`/api/providers`)

### AI Provider Recommendation
- **Method**: `POST`
- **Path**: `/api/providers/recommended`
- **Auth**: Public
- **Request Body**:
```json
{
  "categoryId": "67...",
  "requiredSkills": ["AC Technician"],
  "area": "Bellandur"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "provider": {
        "id": "...",
        "name": "Suresh Reddy",
        "rating": 4.7,
        "experienceYears": 5,
        "basePrice": 599
      },
      "matchScore": 99,
      "reasons": [
        "Verified specialist with skills in AC Technician",
        "Top-rated professional with 4.7★ rating (923 reviews)",
        "5+ years of hands-on field experience",
        "Directly serves your neighborhood (Bellandur)"
      ]
    }
  ]
}
```

---

## 4. Bookings & Jobs (`/api/bookings`, `/api/jobs`)

### Create Direct Booking
- **Method**: `POST`
- **Path**: `/api/bookings`
- **Auth**: Customer
- **Request Body**:
```json
{
  "providerId": "67...",
  "serviceName": "Tap & Mixer Repair",
  "scheduledDate": "2026-10-01",
  "scheduledTime": "10:00 AM",
  "price": 499,
  "address": {
    "addressLine": "123 Indiranagar 100ft Rd",
    "area": "Indiranagar",
    "city": "Bengaluru"
  }
}
```

### Update Job Status
- **Method**: `PUT`
- **Path**: `/api/jobs/:id/status`
- **Auth**: Provider
- **Transitions**: `ASSIGNED` -> `ON_THE_WAY` -> `STARTED` -> `COMPLETED`
- **Request Body**:
```json
{
  "status": "STARTED"
}
```

### Upload Service Evidence
- **Method**: `POST`
- **Path**: `/api/jobs/:id/evidence`
- **Auth**: Provider
- **Request Body**:
```json
{
  "type": "before",
  "photoUrl": "https://..."
}
```

---

## 5. Reviews & Disputes (`/api/reviews`, `/api/disputes`)

### Submit Review
- **Method**: `POST`
- **Path**: `/api/reviews`
- **Auth**: Customer (Only for COMPLETED bookings; duplicate reviews rejected)
- **Request Body**:
```json
{
  "bookingId": "67...",
  "rating": 5,
  "review": "Quick, courteous, and fixed the leakage completely!"
}
```

### Raise Dispute
- **Method**: `POST`
- **Path**: `/api/disputes`
- **Auth**: Customer
- **Request Body**:
```json
{
  "bookingId": "67...",
  "reason": "Incorrect Charge",
  "description": "Provider charged extra for visit fee."
}
```

---

## 6. Admin & Operations (`/api/users`, `/api/analytics`, `/api/pricing`, `/api/audit-logs`)

### Admin Verification Action
- **Method**: `PUT`
- **Path**: `/api/users/provider/:id/verify`
- **Auth**: Admin (`ADMIN`)
- **Request Body**:
```json
{
  "status": "VERIFIED",
  "reason": "Documents verified."
}
```

### Real Analytics
- **Method**: `GET`
- **Path**: `/api/analytics/admin`
- **Auth**: Admin (`ADMIN`)
- **Response** (`200 OK`): Live MongoDB counts for customers, providers, bookings, revenue, and category distribution.
