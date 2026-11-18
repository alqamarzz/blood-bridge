# BloodBridge — Full-Stack Blood Donation Matching Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791)](https://postgis.net/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC)](https://tailwindcss.com/)
[![Meta WhatsApp](https://img.shields.io/badge/WhatsApp-Cloud%20API-25D366)](https://developers.facebook.com/docs/whatsapp/cloud-api)

BloodBridge is an emergency-grade, full-stack blood donation matching platform connecting individuals who urgently need blood with nearby verified volunteer donors in real-time. Initial target market: Kolkata, West Bengal, India.

---

## 🩸 Core Features

1. **Dual-Role User Model**: A single authenticated user can act seamlessly as both a blood requester and a registered volunteer donor.
2. **Geospatial Donor Matching**: 
   - Progressive search radius expansion (5 km, 10 km, 20 km).
   - Location Privacy: Exact coordinates are never shared; requesters only see approximate distance rings (e.g., *"About 2-5 km away"*).
   - City and locality fallbacks if GPS is denied.
3. **Emergency WhatsApp Cloud API Integration**:
   - Automated notification dispatched to requester immediately when a donor volunteers.
   - Provider abstraction with working development mock and zero-overhead fallback.
   - Secure links for review without exposing patient or donor phone numbers in message text.
4. **Transaction-Safe Response Workflow**:
   - Single-click *"I'm willing to donate"* with optimistic UI updates.
   - Database transactions prevent race conditions and duplicate volunteer offers.
   - Requester can Accept or Ignore donors. Accepting unlocks coordination contact details and updates fulfillment counts.
5. **Real-Time In-App Notification Center**:
   - Unread badges, mark as read, direct deep-links to active requests.
6. **Administrative Console**:
   - KPIs: total users, active requests, fulfilled requests, abuse reports.
   - User suspension/reactivation, request moderation, and report investigation.
7. **Clinical Integrity & Statutory Disclaimer**:
   - Embedded medical notices clarifying that all transfusions require hospital blood bank lab testing and crossmatching.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & custom design system tokens
- **Database & ORM**: PostgreSQL with PostGIS extensions & Prisma ORM
- **Authentication**: Auth.js with credentials provider & OTP phone verification
- **Validation**: Zod with React Hook Form
- **Messaging**: Meta WhatsApp Cloud API (with local mock provider)
- **Testing**: Jest / Vitest & Playwright E2E

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database (with PostGIS extension enabled)

### 2. Clone & Install
```bash
git clone <repo-url> blood-bridge
cd blood-bridge
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bloodbridge"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/bloodbridge"
AUTH_SECRET="your-auth-secret-here-generate-with-openssl"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: WhatsApp Cloud API (Falls back to development mock if omitted)
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
```

### 4. Database Setup
Generate Prisma Client and push schema:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

```bash
# Run unit & validation tests
npm test

# Run Playwright E2E tests
npx playwright test
```

---

## ⚖️ Medical Disclaimer

> **BloodBridge connects blood requesters with potential donors. It is not a blood bank or medical service. Donor eligibility, blood compatibility, testing, and transfusion decisions must be determined by qualified medical professionals and licensed blood banks.**

---

## 📄 License
MIT License. Built for human survival and community resilience.
