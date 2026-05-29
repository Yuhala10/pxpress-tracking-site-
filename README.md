# P XPRESS — Premium Logistics & Live Tracking Platform

**Fast. Secure. Reliable.** — Enterprise-grade shipment tracking with **admin-controlled live map movement**. Customers see the package move or stop in real time; only you control it from the admin panel.

---

## What You Get

| Feature | Description |
|--------|-------------|
| **14+ pages** | Home, Track, Services, About, Contact, Pricing, FAQ, Terms, Testimonials, Login, Dashboard, Admin, Live, History |
| **Live map tracking** | Leaflet map with route, truck icon, LIVE badge when moving |
| **Admin live control** | Start / Pause / Stop movement, set speed (10–500 km/h), scrub route progress |
| **Real-time sync** | Socket.io — trackers see updates instantly, no refresh |
| **Bilingual** | English ↔ French (header toggle) |
| **Dark mode** | Toggle in header |
| **MongoDB** | Shipments, users, quotes, analytics |
| **JWT auth** | Admin, Staff, Customer roles |

---

## Folder Structure (copy entire folder to VS Code)

```
Tracking site/
├── backend/          ← Node.js + Express + MongoDB + Socket.io
├── frontend/         ← Next.js 14 + React + Tailwind + Framer Motion
└── README.md         ← This file
```

---

## Requirements

1. **Node.js 18+** — [https://nodejs.org](https://nodejs.org)
2. **MongoDB** — Local install OR free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## Step-by-Step Setup (Windows)

### 1. Open project in VS Code

Copy the whole `Tracking site` folder to your PC, then:

`File → Open Folder → Tracking site`

### 2. Install MongoDB (if not installed)

- Download MongoDB Community Server, install, and start the service  
- OR use Atlas: create cluster → Connect → copy connection string → paste in `backend/.env` as `MONGODB_URI`

### 3. Backend setup

Open terminal in VS Code (`Terminal → New Terminal`):

```powershell
cd backend
npm install
npm run seed
npm run dev
```

You should see: `P XPRESS API running on port 5000`

### 4. Frontend setup (new terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## Admin Login (seeded)

| Field | Value |
|-------|--------|
| **Email** | `pxpress@gmail.com` |
| **Password** | `xpress12345` |

> If you typed `pxpressgmail.com` — use **`pxpress@gmail.com`** (valid email format). Password is exactly `xpress12345`.

---

## How to Control Package Movement (IMPORTANT)

This is the core feature: **you control the map; customers only watch.**

### A. Create or pick a shipment

1. Login → **Admin Dashboard** (`/admin`)
2. Click **Generate Tracking #** or use demo: `PX992381CM`
3. **Create Shipment** or select existing row

### B. Share tracking link

Copy link shown in admin panel, e.g.:

`http://localhost:3000/track/PX992381CM`

Send this to your customer. They open it — **no login needed**.

### C. Control movement (invisible to customer)

In **Live Map Control** panel on `/admin`:

| Button | Effect |
|--------|--------|
| **Start Movement** | Package moves along route on map |
| **Pause** | Stops instantly on map |
| **Stop** | Full stop |
| **Resume** | Continues moving |
| **Speed slider** | 10–500 km/h |
| **Route Progress** | Jump package to % along route |

Customer page shows **LIVE** green dot when moving. They **cannot** see admin controls.

### D. Test yourself

1. Open `/admin` in Chrome — login as admin  
2. Open `/track/PX992381CM` in Edge/Incognito (customer view)  
3. Click **Start Movement** in admin  
4. Watch truck move on customer window in real time  
5. Click **Pause** — truck stops on both screens

---

## Demo Tracking Numbers

| Number | Route |
|--------|--------|
| `PX992381CM` | Dubai → Yaoundé (via Paris) |
| `PX4839201CM` | Shanghai → Douala |
| `PXP992018US` | Los Angeles → Berlin |
| `PX772918EU` | Paris → London |

---

## Contact Info (built-in everywhere)

- **Phone:** 681731512  
- **Email:** yuhala24@gmail.com  

---

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion, Leaflet, Socket.io-client, Recharts  
- **Backend:** Express, MongoDB/Mongoose, JWT, Socket.io, bcrypt, rate limiting  
- **Maps:** Leaflet + OpenStreetMap (no API key required)

---

## Push to GitHub

From the project folder:

```powershell
cd "Tracking site"
gh auth login
gh repo create pxpress-tracking-site --public --source=. --remote=origin --push
```

If you prefer the website: create a new repo at [github.com/new](https://github.com/new), then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/pxpress-tracking-site.git
git push -u origin main
```

> `.env` files are gitignored. Only `.env.example` files are committed.

---

## Deploy & launch live

### 1. MongoDB Atlas (database)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → create user + password
3. Network Access → allow `0.0.0.0/0` (or Railway/Vercel IPs)
4. Connect → copy connection string → replace `<password>`

### 2. Backend (Railway or Render)

1. Import your GitHub repo
2. Set **Root Directory** to `backend`
3. **Start command:** `npm start`
4. Add environment variables:

| Variable | Value |
|----------|--------|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Long random secret string |
| `FRONTEND_URL` | Your Vercel URL (e.g. `https://pxpress.vercel.app`) |
| `PORT` | `5000` (Railway sets this automatically) |

5. After deploy, run **one-time seed** in Railway shell: `npm run seed`
6. Copy your backend URL (e.g. `https://pxpress-api.up.railway.app`)

### 3. Frontend (Vercel)

1. Import the same GitHub repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variables:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-URL/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://YOUR-BACKEND-URL` |

4. Deploy → your site is live at `https://your-project.vercel.app`

### 4. Post-deploy checklist

- [ ] Backend health: `https://YOUR-BACKEND-URL/api/health` returns `{ "status": "ok" }`
- [ ] Login works with admin credentials after seed
- [ ] Track page loads map and live updates
- [ ] `FRONTEND_URL` on backend matches exact Vercel URL (no trailing slash)

---

## Deploy (quick reference)

| Part | Platform |
|------|----------|
| Frontend | [Vercel](https://vercel.com) — set env `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` |
| Backend | [Railway](https://railway.app) or [Render](https://render.com) |
| Database | MongoDB Atlas |

Update `FRONTEND_URL` in backend `.env` to your Vercel URL for CORS.

---

## Email notifications (optional)

Edit `backend/.env`:

```
SMTP_USER=yuhala24@gmail.com
SMTP_PASS=your_gmail_app_password
```

Quote requests will email admin at `yuhala24@gmail.com`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Shipment not found` | Run `npm run seed` in backend |
| Map not updating live | Ensure backend is running; check `NEXT_PUBLIC_SOCKET_URL` |
| Login fails | Use `pxpress@gmail.com` / `xpress12345` after seed |
| MongoDB error | Start MongoDB service or fix Atlas URI in `.env` |
| CORS error | Match `FRONTEND_URL` in backend `.env` to your frontend URL |

---

## French / English

Click **FR / EN** in the top bar. Translations cover navigation, hero, tracking, and admin live controls.

---

© P XPRESS Logistics — Production-ready platform for worldwide shipping & live tracking.
