# SYSTEM ARCHITECTURE (FULL & SCALE-READY)

## Overview
Arsitektur ini dirancang untuk:
- Hybrid fulfillment (auto / semi / manual)
- Mobile-first (web + future app)
- High reliability (payment, delivery, logging)
- Scalable (modular, siap dipisah service)

---

## High-Level Components

### 1. Frontend Layer
- Next.js (Web App)
  - Public pages (Home, Catalog, Product, Checkout)
  - User Dashboard
  - Admin Panel (initially in same app, role-based)
- Expo React Native (Future Mobile App)

### 2. API Layer (Backend)
- NestJS (Core API)
  Modules:
  - Auth
  - Users
  - Products
  - Orders
  - Payments
  - Fulfillment
  - Tickets
  - Claims
  - Notifications
  - Promo
  - Reviews
  - Admin

### 3. Database Layer
- PostgreSQL
- Relational schema (normalized + flexible fields for product types)

### 4. Cache & Queue
- Redis
  - Queue (BullMQ / equivalent)
  - Caching (session, frequently accessed data)

### 5. Storage
- S3-compatible / Supabase Storage
  - Product images
  - Proof uploads
  - Claim attachments

### 6. External Services
- Payment: Midtrans
- Email: SMTP / Email service
- WhatsApp API
- Monitoring: Sentry
- CDN (optional)

---

## Core Flows

### 1. Order Flow
User → Checkout → Payment → Webhook → Order Update → Fulfillment → Delivery → Notification

### 2. Fulfillment Flow
- AUTO → direct delivery
- SEMI → queue → admin approve → delivery
- MANUAL → admin process → delivery

### 3. Notification Flow
Event → Queue → Send (Email/WA/In-app)

---

## Deployment

### Environment
- Dev
- Staging
- Production

### Infra
- Dockerized services
- VPS / Cloud VM
- Reverse proxy (NGINX)

---

## Security Layer
- JWT / session auth
- RBAC (role-based access)
- Input validation
- Rate limiting
- Payment webhook verification
- Audit logging

---

## Scalability Plan
- Start monolith (NestJS modular)
- Split services later:
  - Payment service
  - Fulfillment service
  - Notification service

---

## Key Design Decisions
- Hybrid system (NOT full auto)
- Modular backend
- Strong logging & audit
- Mobile-first UX

---

END
