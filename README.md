# Penny Pursuit

Track every penny.

A modern personal expense tracker with AI-assisted categorization, receipt
scanning, monthly insights, and budgets.

## Features

- **Google sign-in** (OAuth → JWT in httpOnly cookie)
- **Manual expense entry** with AI category suggestion (merchant → category in
  ~300–800 ms via Groq's `llama-3.1-8b-instant`)
- **Receipt scanning** — drop a JPEG/PNG, get merchant + total + date back from
  Tabscanner; category inferred by the same LLM
- **Dashboard** with bento-grid layout: monthly total + delta, daily-spend area
  chart, category donut, top merchants, anomaly count
- **AI monthly insights** — 3 short bullets summarizing your spending, cached
  per user × month
- **Budgets** per category with progress bars and soft alerts at ≥85% / ≥100%
- **Anomaly detection** — rule-based (mean + 2σ over 90 days) flagging of
  unusual expenses
- **CSV export** of filtered transactions
- **Settings page** — light/dark/system theme, export, delete all expenses,
  delete account
- **Dark mode** with system preference support

## Stack

| Layer        | Tech                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------    |
| Frontend     | React 19, Vite, TanStack Query v5, Zustand, react-hook-form + zod, Tailwind v4, Recharts, framer-motion, sonner |
| Backend      | Node + Express, Mongoose, Passport (Google OAuth 2.0), JWT, multer, pino, zod, express-rate-limit               |
| Database     | MongoDB Atlas (free M0)                                                                                         |
| AI / OCR     | Groq `llama-3.1-8b-instant`; Tabscanner for receipt OCR                                                         |
| Auth         | Google OAuth → JWT in httpOnly cookie                                                                           |

## Setup

### Prerequisites

- Node **24++** (recommended 26.1.0)
- A MongoDB Atlas cluster (free M0 works)
- A Google OAuth 2.0 client ID + secret (Google Cloud Console)
- A Groq API key (free; <https://console.groq.com>)
- A Tabscanner API key (free trial; <https://tabscanner.com>)

### Install & run

```bash
git clone https://github.com/ashhalvellani/penny-pursuit.git
cd penny-pursuit

# use node v26.1.0:
nvm use

# --- Server ---
cd server
cp .env.example .env        # fill in real values
npm install
npm run dev                 # → http://localhost:5050

# --- Client (in a second terminal) ---
cd client
cp .env.example .env        # set VITE_API_URL if your server isn't on :5050
npm install
npm run dev                 # → http://localhost:5173
```

Open <http://localhost:5173> and sign in with Google.

### Google OAuth setup

Add the following to your OAuth client's **Authorized redirect URIs** for local setup:

```plaintext
http://localhost:5050/api/auth/google/callback
```

## Project structure

```plaintext
penny-pursuit/
├── client/                React + Vite Frontend
├── server/                Express + Node Backend
```

## Demo

> Screenshots coming soon.

<!--
Drop screenshots here, e.g.:

![Dashboard](docs/screenshots/dashboard.png)
![Receipt scan](docs/screenshots/receipt.png)
![Dark mode](docs/screenshots/dark.png)
-->
