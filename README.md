# SkillLink SL 🚀

Welcome to **SkillLink SL**, a modern, full-stack, world-class job portal and recruitment platform designed for job seekers, employers, and administrators. 

SkillLink SL features a premium, responsive UI built with Next.js, a robust backend powered by Prisma and PostgreSQL, and secure authentication via NextAuth.

## Table of Contents
1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup & Seeding](#database-setup--seeding)
6. [Running the Application](#running-the-application)
7. [Default Test Accounts](#default-test-accounts)

---

## Features
- **Role-Based Dashboards:** Unique, secure dashboard experiences for `Admin`, `Employer`, and `Seeker`.
- **Admin Activity Logging:** Real-time platform activity log tracking new sign-ups, job postings, and applications.
- **Company Verification:** Admins must verify companies before they can post jobs, ensuring a high-quality, scam-free environment.
- **Job Posting & Moderation:** Employers can manage their listings, and Admins can moderate all listings platform-wide.
- **Application Tracking:** Seamless application process for seekers, with real-time status updates (Pending, Accepted, Rejected) managed by employers.
- **Seeker Profiles & CV Uploads:** Seekers can build robust profiles and securely upload CVs (PDF, DOC) restricted by strong security rules.
- **Enterprise Security:** Enforced password complexity, rate-limited auth routes, protected CV file endpoints, and strict Content-Security-Policy headers.
- **Premium Responsive UI/UX:** A stunning "Peach/Amber" theme built with Tailwind CSS, featuring glassmorphism, micro-animations, and a dedicated mobile-bottom navigation bar for seamless smartphone usability.

---

## Prerequisites
Before you begin, ensure you have the following installed on your computer:
1. **Node.js** (v18.17 or higher recommended) - [Download Here](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download Here](https://www.postgresql.org/download/)
3. **Git** (optional, for cloning the repository)

---

## Installation & Setup

**Step 1:** Extract the project files from the flash drive (or clone the repository) into a directory of your choice.

**Step 2:** Open a terminal (Command Prompt, PowerShell, or Git Bash) and navigate to the project directory:
```bash
cd path/to/skilllink-sl
```

**Step 3:** Install all required Node.js dependencies:
```bash
npm install
```

---

## Environment Variables

**Step 4:** In the root directory of the project, locate the `.env` file (or create one if it doesn't exist). Ensure it contains the following variables. 

*Note: Update the `DATABASE_URL` with your actual PostgreSQL credentials. For example, if your username is `postgres` and password is `password`, it would look like below:*

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/skilllink?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_key_change_in_production"
```

---

## Database Setup & Seeding

**Step 5:** Push the Prisma schema to your local PostgreSQL database to create the required tables:
```bash
npx prisma db push
```

**Step 6:** Seed the database with initial data (this creates the default Admin account and some sample categories):
```bash
npm run db:seed
```
*(If the seed script is not set up in `package.json`, you can run `npx tsx prisma/seed.ts` instead).*

---

## Running the Application

**Step 7:** Start the Next.js development server:
```bash
npm run dev
```

**Step 8:** Open your web browser and navigate to:
[http://localhost:3000](http://localhost:3000)

---

## Default Test Accounts
After seeding the database, you can log in immediately using the pre-configured test accounts:

### Admin
- **Email:** `admin@skilllink.sl`
- **Password:** `Admin@123`
*(Can verify companies, moderate jobs, view analytics, and see activity logs)*

### Employer
- **Email:** `hr@freetowntech.sl`
- **Password:** `Employer@123`
*(Can update company profile, post jobs, and manage incoming applications)*

### Job Seeker
- **Email:** `john@example.com`
- **Password:** `Seeker@123`
*(Can search jobs, apply, upload CV, and manage their seeker profile)*

Enjoy exploring SkillLink SL! 🎉
