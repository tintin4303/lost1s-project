# Lost1s - Pet Shelter Management System

A comprehensive web platform for digitizing pet adoption workflows, inventory management, and donation tracking with three user roles: Adopters, Staff/Admin, and Donors.

## Confirmed Choices

- ✅ **ORM**: Prisma with PostgreSQL
- ✅ **Authentication**: NextAuth.js with Google OAuth + Credentials Provider
- ✅ **Database**: Neon PostgreSQL (cloud)
- ✅ **Frontend Framework**: Next.js (App Router)
- ✅ **Styling**: Tailwind CSS
- ✅ **Deployment**: Vercel
- ✅ **Backend Framework**: Next.js (API Routes)/ Typescript

---

## Proposed Changes

### Project Structure

```
lost1s/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (portal)/
│   │   │   ├── adopter/
│   │   │   │   ├── discover/
│   │   │   │   ├── apply/
│   │   │   │   └── appointments/
│   │   │   ├── staff/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── pets/
│   │   │   │   ├── applications/
│   │   │   │   └── security/
│   │   │   └── donor/
│   │   │       ├── sponsor/
│   │   │       └── leaderboard/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── pets/
│   │   │   ├── applications/
│   │   │   ├── appointments/
│   │   │   └── donations/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── pets/               # Pet-related components
│   ├── forms/              # Form components
│   └── layout/             # Layout components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Utilities
└── styles/
    └── globals.css         # Tailwind + custom styles
```

---

### Database Schema (Prisma)

#### schema.prisma

```prisma
// Core entities with relationships

model Pet {
  id          String   @id @default(cuid())
  name        String
  species     Species
  breed       String?
  age         AgeGroup
  vaccinated  Boolean  @default(false)
  spayed      Boolean  @default(false)
  status      PetStatus @default(AVAILABLE)
  intakeDate  DateTime @default(now())
  imageUrl    String?
  description String?
  applications Application[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  password      String
  role          UserRole @default(ADOPTER)
  isBlacklisted Boolean  @default(false)
  applications  Application[]
  donations     Donation[]
  securityLogs  SecurityLog[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Application {
  id            String   @id @default(cuid())
  pet           Pet      @relation(fields: [petId], references: [id])
  petId         String
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  housingType   String
  hasYard       Boolean
  lifestyle     String
  annualIncome  Float
  status        ApplicationStatus @default(REVIEW)
  appointments  Appointment[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Appointment {
  id            String   @id @default(cuid())
  application   Application @relation(fields: [applicationId], references: [id])
  applicationId String
  date          DateTime
  timeSlot      String
  location      String
  createdAt     DateTime @default(now())

  @@unique([date, timeSlot, location]) // Prevent double bookings
}

model Donation {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  amount     Float
  frequency  DonationFrequency
  type       DonationType
  createdAt  DateTime @default(now())
}

model SecurityLog {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  incident  String
  action    String
  createdAt DateTime @default(now())
}

// Enums
enum Species { DOG, CAT, OTHER }
enum AgeGroup { PUPPY, ADULT, SENIOR }
enum PetStatus { AVAILABLE, PENDING, ADOPTED }
enum UserRole { ADOPTER, STAFF, DONOR }
enum ApplicationStatus { REVIEW, INTERVIEW, FINALIZED }
enum DonationFrequency { ONE_TIME, WEEKLY, MONTHLY }
enum DonationType { FOOD, MEDICAL, GENERAL }
```

---

### UI Design System

#### Color Palette (Warm "Pawsome" Theme)

| Token | Value | Usage |
|-------|-------|-------|
| primary | `#D97706` (Amber-600) | CTAs, accents |
| secondary | `#78350F` (Amber-900) | Headers |
| background | `#FFFBEB` (Amber-50) | Page backgrounds |
| cream | `#FEF3C7` (Amber-100) | Card backgrounds |
| paw-brown | `#92400E` | Borders, icons |
