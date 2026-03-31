# 🚀 Product Requirements Document (PRD)

## Project: Stellar Simple Payment dApp (White Belt Level)

---

## 1. 🎯 Objective

Build a minimal, production-ready Stellar dApp on Testnet that allows users to:

* Connect their Freighter wallet
* View their XLM balance
* Send XLM to another wallet
* Receive real-time transaction feedback

The app must be deployable and meet all Stellar White Belt submission requirements.

---

## 2. ⚡ Core Features

### 2.1 Wallet Integration

* Connect Freighter wallet
* Disconnect wallet
* Detect if Freighter is installed
* Show connected wallet address (truncate format: GABC...XYZ)

---

### 2.2 Balance Display

* Fetch XLM balance using Stellar Horizon Testnet
* Display balance in UI
* Auto-refresh after transaction

---

### 2.3 Transaction Flow

* Input field: Recipient Address
* Input field: Amount (XLM)
* Send XLM transaction via Stellar Testnet
* Sign transaction using Freighter

---

### 2.4 Transaction Feedback

* Loading state during transaction
* Success state:

  * Show confirmation message
  * Display transaction hash
* Error state:

  * Show error message clearly

---

## 3. 🧱 Tech Stack (MANDATORY)

Frontend:

* Next.js (App Router)
* Tailwind CSS

Blockchain:

* @stellar/stellar-sdk
* @stellar/freighter-api

Network:

* Stellar Testnet (Horizon)

---

## 4. 🧩 Functional Requirements

### Wallet

* Use Freighter API:

  * `isConnected()`
  * `requestAccess()`
  * `getPublicKey()`

### Balance Fetch

* Use Horizon endpoint:

  * https://horizon-testnet.stellar.org
* Fetch account details
* Extract XLM balance

### Transaction

* Build transaction using Stellar SDK:

  * Operation: Payment
  * Asset: XLM (native)
* Sign with Freighter
* Submit to network

---

## 5. 🖥️ UI Requirements

### Layout (Single Page)

Sections:

1. Header

   * App name: "Stellar Pay"
2. Wallet Section

   * Connect / Disconnect button
   * Wallet address display
3. Balance Section

   * "Balance: X.X XLM"
4. Payment Form

   * Recipient address input
   * Amount input
   * Send button
5. Status Section

   * Loading spinner
   * Success message + hash
   * Error message

---

## 6. 🔁 User Flow

1. User opens app
2. Clicks "Connect Wallet"
3. Wallet connects via Freighter
4. Address + balance displayed
5. User enters:

   * recipient address
   * amount
6. Clicks "Send"
7. Transaction is signed + submitted
8. UI shows:

   * loading → success/error
9. Balance refreshes

---

## 7. ⚠️ Error Handling

Handle:

* Wallet not installed
* Wallet not connected
* Invalid address
* Insufficient balance
* Network failure
* Transaction rejection

All errors must be shown in UI.

---

## 8. 📦 File Structure

/app
/page.tsx
/components
WalletConnect.tsx
BalanceCard.tsx
SendForm.tsx
/lib
stellar.ts
/styles
globals.css

---

## 9. 🔐 Environment

No backend required.

Use:

* Horizon Testnet (public)

---

## 10. ✅ Submission Requirements Mapping

| Requirement               | Implementation |
| ------------------------- | -------------- |
| Wallet Setup              | Freighter      |
| Wallet Connect/Disconnect | Buttons        |
| Balance Display           | Horizon fetch  |
| Send Transaction          | Payment op     |
| Feedback                  | UI state       |
| Deployment                | Vercel         |
| GitHub                    | Public repo    |

---

## 11. 🎨 Design Guidelines

* Minimal UI (dark mode preferred)
* Centered layout
* Rounded cards
* Clean typography
* Tailwind utility-based styling

---

## 12. 🚀 Deployment

* Platform: Vercel
* Environment: Production build
* Ensure Freighter works in deployed environment

---

## 13. 🧪 Testing Checklist

* [ ] Wallet connects
* [ ] Balance loads
* [ ] Transaction succeeds
* [ ] Error states handled
* [ ] Works on testnet
* [ ] UI responsive

---

## 14. 📸 README Assets Required

You must capture:

* Wallet connected screenshot
* Balance display screenshot
* Successful transaction screenshot
* Transaction hash shown in UI

---

## 15. ⏱️ Build Strategy (IMPORTANT)

Priority order:

1. Wallet connect
2. Balance fetch
3. Send transaction
4. UI polish

Skip anything non-essential.

---

## 16. 🔥 Success Criteria

The app is successful if:

* A user can connect wallet
* See balance
* Send XLM on testnet
* See transaction confirmation

---

END OF DOCUMENT
