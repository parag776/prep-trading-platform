# 🧾 Perp Trading Platform

This is a **perpetual trading platform** project consisting of a **backend** and **frontend**. It simulates perpetual trading on a mock asset with key functionalities including authentication, order placement, real-time charting, and position tracking.

---

## 📦 Project Structure

-   `backend/` – Handles APIs, order matching, authentication, and data persistence.
-   `frontend/` – Provides the UI using React with charting and order interface.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/perp-trading-platform.git
cd perp-trading-platform
```

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
npx prisma migrate reset
npm run build
npm start
```

### For Development

```bash
npm run dev
```

> 🔁 **Important Notes**:
>
> -   Always run `npm run build` before starting.
> -   Rebuild (`npm run build`) if Prisma schema is modified.
> -   `npm run dev` skips generation of `src/generated`.

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run build
npm start
```

### For Development

```bash
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=postgresql://postgres:YOUR_SECRET@localhost:5431/postgres
AUTHSECRET=YOUR_SECRET
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:5173
```

### 🔍 What They Mean

-   `DATABASE_URL`: PostgreSQL DB connection string.
-   `AUTHSECRET`: Used to sign/verify JWTs.
-   `GOOGLE_CLIENT_*`: Google OAuth (generate via Google Cloud Console).
-   `GITHUB_CLIENT_*`: GitHub OAuth (generate via GitHub Developer Settings).
-   `FRONTEND_URL`: Base frontend URL. Must match OAuth redirect settings.

> ⚠️ **Never commit real credentials. Always use placeholders like `YOUR_SECRET` in shared/public code.**

> ✅ The frontend does **not** need a `.env` file.

---

## 🌟 Features

### 📉 Chart & Price Feed

-   TradingView advanced chart
-   Simulates live price updates
-   Zoom, pan, hover supported

### 🛒 Orders

-   **Market Orders**: Executed instantly
-   **Limit Orders**: Queued & filled at target price
-   All orders require authentication
-   Validations handled on both frontend & backend

### ❌ Cancel Orders

-   Cancel unfilled limit orders
-   Only the user who placed the order can cancel

### 📊 Positions

-   Created after order match
-   Includes:
    -   Entry Price
    -   Quantity
    -   Direction (Long/Short)
    -   Real-time PnL
-   Option to manually close positions

### 🔁 Order Matching Engine (Mock)

-   Orders stored in DB
-   Market orders matched instantly
-   Limit orders matched FIFO
-   Matching and execution logic handled in backend

### 👤 Auth Flow

-   `/auth/google` → Google OAuth
-   `/auth/github` → GitHub OAuth
-   JWT stored in cookies, valid for 1 hour
-   Protected routes require valid JWT

---

## 📌 Platform Highlights

-   ✅ OAuth & manual login support
-   📄 Place long/short positions with leverage
-   🔁 Cancel unfilled orders
-   💼 Position tracking with real-time PnL
-   📉 TradingView integration for real-time charting
-   💰 Simulated leverage and margin management

### Additional Mechanics

-   ⚡ Funding is charged periodically based on mark price
-   🔌 All systems are connected via WebSockets
-   💥 Liquidation occurs if margin falls below maintenance threshold

---

Enjoy simulating your own perpetual trading engine! 🔂📈
