# VIDERE RettSted

**Finn frem på første forsøk. Hver gang.**

VIDERE RettSted is a comprehensive logistics and workforce management platform designed to solve the "last meter" delivery problem. It bridges the gap between the terminal and the customer's door by providing a rich visual database of precise delivery locations, alongside integrated tools for route execution, load manifesting, fleet compliance, and workforce management.

---

## 📚 The Documentation Pyramid

We maintain a strict separation of documentation to keep our architecture clean and understandable. If you are developing on this project, please refer to the following pillars:

1. **[Strategy & Roadmap (`docs/strategy.md`)](docs/strategy.md)** 
   *Read this to understand the "Why" and the "When".* It covers the product vision, target audience, what we *won't* build, and our phased release roadmap.
2. **[Domain & Business Logic (`docs/domain.md`)](docs/domain.md)** 
   *Read this to understand the "What".* It covers Role-Based Access Control (RBAC), multi-tenancy rules, constraint-based routing logic, and manifest workflows.
3. **[Engineering & QA (`docs/engineering.md`)](docs/engineering.md)** 
   *Read this to understand the "How".* It covers our technical stack, database abstraction rules, UI/UX philosophy (Tailwind/shadcn), and our manual QA testing loops.
4. **[API Reference (`docs/api/README.md`)](docs/api/README.md)** 
   *Read this for code structure.* Auto-generated documentation of our internal TypeScript interfaces, models, and database functions.
5. **[Changelog (`docs/CHANGELOG.md`)](docs/CHANGELOG.md)** 
   The absolute ground truth of what has been built, fixed, or is planned for the future.

---

## 🛠 Tech Stack

*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React 19
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
*   **State:** React Context, [Zustand](https://github.com/pmndrs/zustand)
*   **Backend/BaaS:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage, Cloud Functions, App Hosting)
*   **Testing:** Jest, Playwright

---

## 🚀 Quick Start

### Prerequisites
Make sure you have Node.js (v18+) installed. You will also need access to the Firebase project.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory. You will need the Firebase client configuration keys.
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 3. Run the Development Server
```bash
npm run dev
```
The application will be available at [http://localhost:9002](http://localhost:9002).

### 4. Running Tests & Docs
*   **Type Checking:** `npm run typecheck`
*   **Unit Tests:** `npm test`
*   **E2E Tests:** `npm run test:e2e` (Ensure the dev server is running or configure Playwright accordingly).
*   **Generate API Docs:** `npm run docs` (Updates the `docs/api` folder using TypeDoc).

---

## 🤖 AI Assistant Note
If you are an AI assistant analyzing this repository, **DO NOT** use this file as your primary instruction set. Please navigate immediately to `docs/blueprint.md` for your core system prompts and behavioral rules.