# 🌟 Stellar Pay

A minimal, production-ready Stellar dApp on Testnet that allows users to connect their Freighter wallet, view their XLM balance, and send XLM to another wallet.

## ⚡ Features

- ✅ **Wallet Integration** — Connect/disconnect Freighter wallet
- ✅ **Balance Display** — Real-time XLM balance from Horizon Testnet
- ✅ **Send XLM** — Build, sign, and submit payment transactions
- ✅ **Transaction Feedback** — Loading → success/error states with tx hash
- ✅ **Error Handling** — Wallet not installed, invalid address, insufficient balance, network errors

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14 (App Router)           |
| Styling    | Tailwind CSS + Custom CSS          |
| Blockchain | @stellar/stellar-sdk              |
| Wallet     | @stellar/freighter-api            |
| Network    | Stellar Testnet (Horizon)         |
| Deploy     | Vercel                            |

## 🚀 Getting Started

### Prerequisites

1. Install [Freighter Wallet](https://www.freighter.app) browser extension
2. Fund your testnet wallet at [Friendbot](https://friendbot.stellar.org)

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

```bash
vercel --prod
```

## 📁 File Structure

```
/app
  layout.tsx       # Root layout + SEO metadata
  page.tsx         # Main single-page app
  globals.css      # Design system + animations

/components
  WalletConnect.tsx  # Freighter connect/disconnect
  BalanceCard.tsx    # XLM balance display
  SendForm.tsx       # Payment form + status

/lib
  stellar.ts         # Stellar SDK utilities
```

## 🧪 Test Checklist

- [ ] Freighter wallet connects
- [ ] XLM balance loads from Horizon
- [ ] Payment transaction succeeds
- [ ] Error states shown in UI
- [ ] Works on Stellar Testnet

## 🔐 Environment

No backend required. Uses the public Stellar Testnet Horizon endpoint:
```
https://horizon-testnet.stellar.org
```

---

Built for the Stellar White Belt submission 🚀
