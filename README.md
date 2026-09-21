# Farmer App (Direct Farm-to-Consumer Platform)

A modern, responsive web application designed to **completely eliminate middlemen and brokers from agriculture**, connecting farmers directly with consumers so farmers receive 100% of the sale value directly into their bank accounts / UPI.

---

## 🚀 How to Run the App

### Option 1: Direct Double-Click (Zero Setup!)
Simply navigate to `C:\Users\Winner\Desktop\project_1` in Windows File Explorer and **double-click `index.html`**. It will open instantly in your default web browser (Chrome, Edge, Firefox, Brave).

### Option 2: Run with a Local Web Server
You can also serve it locally using `npx`:
```powershell
cd C:\Users\Winner\Desktop\project_1
npx serve .
```
Then open `http://localhost:3000` (or the port indicated in terminal).

---

## 🌟 Key Features

### 1. 0% Middlemen & Direct Farmer Payment
- **Direct Payout Routing**: Payments route directly to the farmer's registered UPI ID (e.g. `ramesh.patel@okaxis`) or Bank Account.
- **Zero Commission**: The platform takes ₹0 fees.
- **Instant Settlement**: Simulated UPI QR code generation and direct transfer receipt.

### 2. Dual Perspective Switcher (One-Click Toggle)
- **🛒 Consumer Market**:
  - Discover fresh produce harvested today (Vegetables, Fruits, Grains, Organic, Honey).
  - Inspect farmer profiles, farm location, and agricultural certifications.
  - Transparent price tag comparison: Shows retail markup vs direct farmer rate.
  - Direct shopping cart and checkout.
- **🌾 Farmer Portal**:
  - Direct financial overview: Total earnings, commission saved by bypassing brokers.
  - Set and update receiving UPI ID and Bank Account.
  - Add new harvest listings (pricing, quantity, harvest time, photos).
  - Manage live inventory and update incoming consumer orders (`Confirmed`, `Dispatched`, `Delivered`).

### 3. Interactive Middleman Elimination Calculator
- Move the harvest slider (e.g. 50 kg to 250 kg) to dynamically calculate:
  - How much brokers take in the traditional mandi supply chain (~55-70%).
  - How much extra profit the farmer keeps directly (+60% to +100%).
  - Consumer savings (25% to 35% less than supermarkets).

### 4. Zero External Dependencies
- Built with standard HTML5, CSS3 (Tailwind styling), and modular JavaScript.
- All additions, updates, and orders persist automatically using browser `localStorage`.

---

## 📁 Project Architecture
```
C:\Users\Winner\Desktop\project_1\
├── index.html                 # Complete single-page application UI
├── css/
│   └── styles.css             # Agricultural theme, glassmorphism, animations
├── js/
│   ├── data.js                # Initial seed data: farmers, produce, orders
│   ├── calculator.js          # Interactive Middleman vs Direct Price visualizer
│   ├── marketplace.js         # Consumer marketplace, search, filters & cards
│   ├── farmer.js              # Farmer portal, harvest creator & order fulfillments
│   └── app.js                 # App state, role switcher, cart & direct checkout
└── README.md                  # Project documentation & guide
```
