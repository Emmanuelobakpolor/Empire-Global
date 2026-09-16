# Empire Global — Financial Services Platform (Frontend)

A complete, production-quality **React frontend** for Empire Global, a financial services platform covering **Savings, Thrift, Investments, Loans and Hire Purchase**.

> ⚠️ **This is a FRONTEND-ONLY project.** There is no backend, database, API, or real payment integration. All data is mocked and all interactions (login, registration, payments, receipt upload, approvals) are simulated entirely in the browser using React state and `localStorage`.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Demo Credentials

**Customer Portal** (`/login`)
- Email: `customer@example.com`
- Password: `password123`
- (Any other email/password combination will also log you in as a generic mock customer.)

**Admin Portal** (`/admin/login`)
- Email: `admin@empireglobal.com`
- Password: `admin123`

## Core Flow to Try

1. Log in as the demo customer.
2. Go to **Products** → pick a plan → **View Details** → **Start This Plan**.
3. Walk through **Create Transaction** (select product → amount → plan → review → generate reference).
4. On **Payment Instructions**, click **I Have Made Payment**.
5. Upload any file on **Upload Receipt** → **Submit Receipt** (status becomes *Pending*).
6. Open a second tab/log in as **Admin** → **Payments** → open the new pending payment → **Approve** or **Reject**.
7. Back on the customer side, refresh **Transactions** — the status and notification update instantly (shared mock data store, persisted to `localStorage`).

## Tech Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS
- lucide-react (icons)
- recharts (admin dashboard/report charts)

No backend, ORM, database, or payment SDK is used anywhere in this codebase.

## Project Structure

```
src/
├── data/          # Mock seed data (customers, products, transactions, etc.)
├── context/       # AuthContext, AdminAuthContext, DataStoreContext (mock DB), ToastContext
├── components/    # ui/ (primitives), customer/, admin/
├── pages/         # public/, customer/, admin/
├── routes/        # Route guards
└── utils/         # formatCurrency, formatDate, generateReference
```
