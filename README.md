# Lost1s Pet Shelter Management System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation and Setup](#installation-and-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Initialization](#database-initialization)
5. [Running the Application](#running-the-application)
6. [Project Description](#project-description)
7. [System Features](#system-features)
8. [Technology Stack](#technology-stack)

---

## Prerequisites

Ensure you have the following installed on your local development environment before proceeding:
*   **Node.js**: Version 18.17.0 or higher.
*   **Package Manager**: `npm` (comes with Node.js), `yarn`, or `pnpm`.
*   **Database**: PostgreSQL server running locally or accessible via a remote connection (e.g., MongoDB Atlas, AWS RDS).

---

## Installation and Setup

Follow these steps to configure the project locally.

1.  **Clone the Repository**
    Navigate to your desired workspace directory and clone the repository.
    ```bash
    git clone <repository_url>
    cd lost1s-project
    ```

2.  **Install Dependencies**
    Install all required Node.js packages using your preferred package manager.
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

---

## Environment Configuration

The application requires specific environment variables to function properly, particularly for database connections and authentication.

1.  Create a `.env` file in the root directory of the project.
2.  Define the required variables. At a minimum, you must configure the database connection string.

Example `.env` configuration:
```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/lost1s_db?schema=public"

# Add other necessary variables (e.g., NextAuth secret, API keys) depending on the configuration
# NEXTAUTH_SECRET="your_secure_secret_hash"
# NEXTAUTH_URL="http://localhost:3000"
```
*Note: Replace `username`, `password`, `localhost:5432`, and `lost1s_db` with your actual Postgres credentials.*

---

## Database Initialization

This project utilizes Prisma ORM to manage the database schema. You must push the schema to your database before running the application.

1.  **Generate Prisma Client**
    This step creates the customized TypeScript client based on `schema.prisma`.
    ```bash
    npx prisma generate
    ```

2.  **Push the Schema**
    This command will apply the schema to your PostgreSQL database, creating all necessary tables (User, Pet, Application, Schedule, Donation, SecurityLog, Admin).
    ```bash
    npx prisma db push
    ```

3.  **Seed the Database (Optional)**
    If a seed script is provided, you can populate the database with initial data (such as an initial admin account).
    ```bash
    npx prisma db seed
    ```

---

## Running the Application

Once the dependencies are installed and the database is configured, you can start the development server.

```bash
npm run dev
# or 
yarn dev
```

The application will be accessible at `http://localhost:3000`.

---

## Project Description

The Lost1s Pet Shelter Management System is a comprehensive web application designed to streamline the operations of an animal rescue and adoption center. It serves multiple user roles, linking shelter staff, potential adopters, and financial donors into a unified, efficient platform. 

The primary objective of the system is to replace fragmented manual processes with a centralized digital solution. By providing distinct portals tailored to the specific needs of different stakeholders, the application facilitates smoother pet adoptions, transparent donation tracking, and robust administrative oversight.

---

## System Features

The application is structured around role-based access control, offering specialized features for different users:

### General Users (Adopters)
*   **Pet Browsing**: View available pets with detailed profiles, images, and medical status.
*   **Adoption Applications**: Submit and track the status of applications to adopt specific animals.
*   **Scheduling**: Request appointments to visit the shelter and meet pets.
*   **Profile Management**: Update personal information and view interaction history.

### Donors
*   *(Note: Users can hold dual roles as both Adopters and Donors)*
*   **Donation Processing**: Submit records for financial contributions.
*   **Donation Tracking**: View history of past donations, filtering by frequency (one-time, monthly) or type.
*   **Leaderboard**: Participate in community recognition for total contributions.

### Shelter Staff
*   **Pet Management**: Add new animal intake records, update statuses (e.g., from 'Available' to 'Adopted'), and maintain medical notes.
*   **Application Review**: Evaluate incoming adoption requests, approving or rejecting them based on shelter criteria.
*   **Schedule Management**: Confirm, modify, or cancel visitation appointments.

### System Administrators
*   **User Management**: Monitor all active user accounts across the platform.
*   **Security Oversight**: Review system security logs, investigate incidents, and apply punitive measures such as account blacklisting.
*   **Platform Analytics**: View summary metrics and system health indicators.

---

## Technology Stack

The project relies on a modern, React-based technology ecosystem:

*   **Frontend**: Next.js (App Router paradigm), React, Tailwind CSS for styling.
*   **Backend**: Next.js API Routes (Serverless functions).
*   **Database**: PostgreSQL for relational data storage.
*   **ORM**: Prisma Client for type-safe database access and schema migrations.
*   **Language**: TypeScript throughout the entire stack for strict typing and improved developer experience.
