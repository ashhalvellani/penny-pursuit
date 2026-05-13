# Setting up Penny Pursuit on Windows — zero prior programming experience

## Context

A complete beginner on a fresh Windows PC wants to run Penny Pursuit locally. The existing [README.md](README.md) has a setup section but assumes the reader already has Node, Git, and `nvm` installed and knows what `cp`, `npm install`, and "open a second terminal" mean. This plan is a step-by-step walkthrough that fills in all of those gaps.

**What they'll end up with:** the Penny Pursuit web app running at `http://localhost:5173` in their browser, talking to a local Express server at `http://localhost:5050`, backed by a free cloud MongoDB cluster, with Google sign-in, AI categorization, and receipt scanning all working.

**Total time:** ~45–60 minutes (most of it spent on cloud signups, not the code).

**Required stack (verified from the repo):**
- Node.js **v26.1.0** (pinned in [.nvmrc](.nvmrc))
- npm (ships with Node — confirmed by `package-lock.json` files in both [client/](client/) and [server/](server/))
- Git
- A modern browser (Chrome/Edge/Firefox)
- 4 free-tier cloud accounts: MongoDB Atlas, Google Cloud (OAuth), Groq, Tabscanner

---

## Part 1 — Install the tools on your PC

You need three pieces of software on the machine itself. Install them in this order.

### 1a. Git for Windows
1. Go to <https://git-scm.com/download/win>. The installer downloads automatically.
2. Run the `.exe`. **Click Next through every screen — the defaults are fine.** The one screen that matters: when it asks about the default editor, just leave it on "Vim" or pick "Notepad" — you won't use it.
3. To verify: open **Start menu → type "Command Prompt" → Enter**, then type `git --version` and press Enter. You should see something like `git version 2.x.x`. If you see "not recognized", restart your PC and try again.

### 1b. nvm-windows (Node Version Manager)
Penny Pursuit needs a specific Node version (26.1.0). nvm-windows lets you install and switch Node versions cleanly.

1. Go to <https://github.com/coreybutler/nvm-windows/releases>.
2. Under the latest release, download **`nvm-setup.exe`** (not the zip).
3. Run the installer. Click Next through everything — accept the default install location.
4. **Close any open Command Prompt windows** (nvm only works in terminals opened *after* install).
5. Open a fresh Command Prompt and run `nvm version`. You should see a version number.

### 1c. Node.js v26.1.0
In Command Prompt (run as Administrator — right-click the Start menu, pick "Terminal (Admin)" or "Command Prompt (Admin)"):

```
nvm install 26.1.0
nvm use 26.1.0
```

Verify:
```
node --version
```
Should print `v26.1.0`. If you get `'node' is not recognized`, close and reopen the terminal.

> **Why Admin?** nvm-windows creates a symlink to switch versions; that requires admin rights once per `nvm use`.

---

## Part 2 — Download the project code

Option A (easier for non-programmers): **Download as ZIP**
1. Go to <https://github.com/ashhalvellani/penny-pursuit>
2. Green **Code** button → **Download ZIP**
3. Extract to a simple path, e.g. `C:\penny-pursuit` (avoid OneDrive folders — they can lock files and break `npm install`)

Option B: **Clone with Git** (recommended — easier to pull updates later)
```
cd C:\
git clone https://github.com/ashhalvellani/penny-pursuit.git
```
You now have `C:\penny-pursuit\`.

---

## Part 3 — Sign up for the four cloud services

All four are free for what we need. Do them in this order; each step gives you a value you'll paste into a config file in Part 4.

### 3a. MongoDB Atlas (database)
1. Go to <https://cloud.mongodb.com> → Sign up (Google sign-in is fastest).
2. Pick **"Build a database"** → **M0 (Free)** tier → any region → name it `penny-pursuit` → **Create**.
3. **Database Access** (left sidebar) → **Add New Database User**. Pick "Password" auth. Give it a username (e.g. `penny`) and click **Autogenerate Secure Password** — **copy the password to a sticky note now**, you won't see it again. **Create User**.
4. **Network Access** (left sidebar) → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`). Fine for local dev. Confirm.
5. **Database** (left sidebar) → wait for your cluster to finish provisioning (~3 min) → click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://penny:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Save this string** — you'll edit two things into it: replace `<password>` with the password from step 3, and insert `/penny-pursuit` right before the `?`. Final shape:
   ```
   mongodb+srv://penny:YOUR_PASSWORD@cluster0.abcde.mongodb.net/penny-pursuit?retryWrites=true&w=majority
   ```

### 3b. Google OAuth (sign-in)
1. Go to <https://console.cloud.google.com>. Accept the terms.
2. Top bar → project dropdown → **New Project** → name it `Penny Pursuit` → **Create**.
3. Once the project is selected, left sidebar → **APIs & Services → OAuth consent screen**. Pick **External** → **Create**. Fill: App name = `Penny Pursuit`, support email = your email, developer contact = your email. **Save and continue** through scopes (leave blank) and test users (add your own Gmail address as a test user). Back to dashboard.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type: **Web application** → name: `Penny Pursuit local`.
5. Under **Authorized redirect URIs**, add exactly:
   ```
   http://localhost:5050/api/auth/google/callback
   ```
6. **Create**. A dialog shows your **Client ID** and **Client Secret** — copy both to a sticky note.

### 3c. Groq (AI categorization + insights)
1. <https://console.groq.com> → sign up (Google login works).
2. Left sidebar → **API Keys** → **Create API Key** → give it any name → **Submit**.
3. Copy the key (starts with `gsk_...`). You won't see it again.

### 3d. Tabscanner (receipt OCR)
1. <https://tabscanner.com> → **Sign up** → confirm email.
2. Dashboard → **API Key** section → copy your key.

You should now have 6 values saved somewhere: MongoDB connection string, Google Client ID, Google Client Secret, Groq API key, Tabscanner API key, and you'll generate one more (JWT secret) in the next step.

---

## Part 4 — Configure the project

You'll create two `.env` files (one for the server, one for the client). These are plain text files that hold secrets and config.

### 4a. Server `.env`
1. Open File Explorer → navigate to `C:\penny-pursuit\server\`.
2. You'll see `.env.example`. **Copy** it (Ctrl+C, Ctrl+V in the same folder) → rename the copy to exactly `.env` (no extension after the dot). Windows might warn about changing extensions — say yes.
3. Right-click `.env` → **Open with → Notepad**.
4. Replace placeholder values:
   - `MONGO_URI=` → paste your full Atlas connection string from 3a
   - `JWT_SECRET=` → generate one: in a Command Prompt, run:
     ```
     node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
     ```
     copy the printed string and paste it after `JWT_SECRET=`.
   - `GOOGLE_CLIENT_ID=` → from 3b
   - `GOOGLE_CLIENT_SECRET=` → from 3b
   - `GROQ_API_KEY=` → from 3c
   - `TABSCANNER_API_KEY=` → from 3d
   - Leave `NODE_ENV`, `PORT`, and `CLIENT_URL` at their defaults.
5. Save and close.

> **Important:** Values go after `=` with no quotes and no spaces, e.g. `JWT_SECRET=abc123xyz`.

### 4b. Client `.env`
1. Navigate to `C:\penny-pursuit\client\`.
2. Same routine — copy `.env.example` → rename to `.env`. The default value (`VITE_API_URL=http://localhost:5050`) is already correct; no edits needed.

---

## Part 5 — Install dependencies and run

You need **two terminal windows** open at the same time — one for the backend, one for the frontend.

### Terminal 1 — backend
Open Command Prompt and run:
```
cd C:\penny-pursuit\server
npm install
npm run dev
```
First run of `npm install` takes 2–5 minutes. When it finishes, `npm run dev` should print something like `Server listening on http://localhost:5050`. Leave this window open.

### Terminal 2 — frontend
Open a **second** Command Prompt (don't close the first one):
```
cd C:\penny-pursuit\client
npm install
npm run dev
```
When it's done it'll print a URL — typically `http://localhost:5173`. Leave this window open too.

---

## Part 6 — Use the app

1. Open Chrome/Edge/Firefox → go to <http://localhost:5173>.
2. Click **Sign in with Google** → log in with the Gmail address you registered as a test user in step 3b.
3. You're in. Add an expense, scan a receipt, set a budget.

To stop the app later: press **Ctrl+C** in each terminal window. To restart, just run `npm run dev` in each — no need to reinstall.

---

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `'node' is not recognized` | Open a fresh Command Prompt; if still failing, re-run `nvm use 26.1.0` in an Admin terminal |
| `'npm install' failed with EPERM` or hangs | Project is in OneDrive — move it to a plain folder like `C:\penny-pursuit` |
| Backend exits with `MongoServerError: bad auth` | `MONGO_URI` password is wrong, or `<password>` placeholder still in it |
| Backend exits with `MongooseServerSelectionError` | Atlas Network Access doesn't include your IP — go back to 3a step 4 |
| Browser shows "Error 400: redirect_uri_mismatch" after Google login | The redirect URI in 3b step 5 must be **exactly** `http://localhost:5050/api/auth/google/callback` (no trailing slash, http not https) |
| Frontend says "Network error" / can't reach backend | Backend terminal crashed — scroll up in Terminal 1 for the actual error |
| Port 5050 or 5173 already in use | Another app is using it. Change `PORT=` in `server/.env` and `VITE_API_URL=` in `client/.env` to match (e.g. 5051) |
| "AI suggest" button does nothing | `GROQ_API_KEY` missing or invalid in `server/.env` |
| Receipt upload returns an error | `TABSCANNER_API_KEY` missing/expired |

---

## Files this plan would touch if we publish it

This walkthrough is markdown-ready. If you want it shipped with the repo, the cleanest options are:
- **Add a new file `SETUP_WINDOWS.md`** at the repo root and link to it from a new "Windows quick-start" line in [README.md:37](README.md#L37) — keeps the main README terse for experienced devs.
- **Or expand the existing `## Setup` section** of [README.md](README.md) with an OS-by-OS subsection.

No code changes — this is documentation only.

## Verification

Once written, the guide is "verified" by walking through it on a clean Windows machine (or a fresh Windows VM / Parallels guest). End-to-end check:
1. Follow Parts 1–5 verbatim.
2. Confirm both terminals stay running without errors.
3. Hit <http://localhost:5173>, sign in with Google, and add one manual expense — confirm it appears on the Dashboard.
4. Upload a receipt JPEG — confirm merchant + total auto-fill.
5. Set a budget on the Budgets page — confirm the dashboard's Budgets card shows progress.
