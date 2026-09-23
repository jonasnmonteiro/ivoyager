# iVoyager

> **Offline-First Multi-Currency Financial Suite, VET Engine & Geospatial Travel Companion**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: Angular](https://img.shields.io/badge/Angular-18%2B-DD0031.svg)](https://angular.dev/)
[![Reactivity: Signals](https://img.shields.io/badge/Reactivity-Signals-FF4081.svg)](https://angular.dev/guide/signals)
[![Storage: IndexedDB](https://img.shields.io/badge/Storage-IndexedDB%20(Dexie.js)-2563EB.svg)](https://dexie.org/)
[![Mobile: Capacitor](https://img.shields.io/badge/Mobile-Capacitor-119EFF.svg)](https://capacitorjs.com/)
[![Geospatial: OpenStreetMap](https://img.shields.io/badge/Maps-OpenStreetMap%20(Free)-7EBC6F.svg)](https://www.openstreetmap.org/)
[![AI: MCP Protocol](https://img.shields.io/badge/AI-Model%20Context%20Protocol-8B5CF6.svg)](https://modelcontextprotocol.io/)

---

## 1. Overview

**iVoyager** is an offline-first financial intelligence suite engineered for international travelers, global contractors, and cross-border shoppers.

Unlike conventional currency converters that function as simple nominal rate multipliers, iVoyager is built to solve real-world international spending challenges:

* **Effective Total Value (VET) Simulation:** Real-time calculation of actual foreign transaction costs, evaluating IOF taxes (1.10% vs 4.38%), issuer exchange spreads (1.0% to 5.5%), and fixed fees across Physical Cash, Traditional International Credit Cards, and Global Digital Accounts (Nomad, Wise, C6 Global).
* **Dual & Tourism Exchange Rates (Blue, MEP, Tarjeta):** Native support for parallel, financial, and tourist exchange rates across Latin America and Argentina, preventing significant purchasing power losses.
* **Multi-Currency Smart Cart:** Fast item entry in local foreign currency (ARS, CLP, EUR, PYG, USD) with simultaneous real-time conversion into the user's primary wallet currency (BRL) and reference currency (USD).
* **Trip Expense Manager & Split Calculation:** Group expenses by travel event, assign payers, compute optimal debt-settlement matrices, and export structured CSV and PDF reports.
* **Zero-Cost Geospatial Radar (OpenStreetMap):** Discover authorized exchange bureaus, ATM networks, and remittance spots (Western Union) using native GPS hardware and the OpenStreetMap Overpass API rendered via Leaflet.js, requiring zero Google Maps API costs.
* **100% Offline-First Architecture:** Full functionality in airplane mode or areas without cellular roaming, persisting exchange history, trips, and shopping carts directly in the device's IndexedDB.
* **AI Agent Integration via Model Context Protocol (MCP):** A native TypeScript MCP server enabling LLMs (Claude, Gemini, Cursor) to directly query live rates, audit trip budgets, and simulate tax scenarios through natural language.

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------+
|                                iVoyager App                                 |
+-----------------------------------------------------------------------------+
|  Presentation Layer & UI                                                    |
|  - Angular (Signals, Standalone Components, Control Flow @if/@for)          |
|  - Ionic UI Components (Native Mobile Ergonomics)                           |
|  - Tokenized Modular CSS (No Tailwind, OKLCH / HSL Design Tokens)           |
+-----------------------------------------------------------------------------+
|  Business Layer & Calculation Engines                                       |
|  - Currency Engine (Cross-Rates & Fixed-Point Decimal Math via Decimal.js) |
|  - VET & Tax Calculator (IOF 1.1% vs 4.38%, Spreads, Cashback)              |
|  - Cart & Expense Aggregator (Multi-Currency, Local Splitwise)              |
|  - OCR & Voice Parser (Tesseract.js / Web Speech API)                       |
+-----------------------------------------------------------------------------+
|  Data Layer & Local-First Persistence                                       |
|  - IndexedDB via Dexie.js (Strict TypeScript Schema)                        |
|  - Service Worker (Asset & Rate Cache with Strict TTL)                      |
+-----------------------------------------------------------------------------+
|  Geospatial & Hardware Layer                                                |
|  - Native GPS (navigator.geolocation / Capacitor Geolocation)               |
|  - OpenStreetMap + Overpass API (Bounding Radius Exchange POIs)             |
|  - Leaflet.js (On-Demand Vector Tile Rendering)                             |
+-----------------------------------------------------------------------------+
|  Distribution & Integration Layer                                           |
|  - Capacitor Bridge (Native iOS IPA & Android AAB Generation)               |
|  - Model Context Protocol (TypeScript MCP Server for Autonomous AI Agents)  |
+-----------------------------------------------------------------------------+
```

---

## 3. Core Modules

### 3.1. VET Calculator & Payment Method Comparator
Computes the complete Effective Total Value equation:
$$\text{VET} = (\text{BaseRate} \times (1 + \text{Spread})) \times (1 + \text{IOF}) + \text{FixedFees}$$
Instantly shows the net cost comparison between physical cash, bank credit cards, and global debit cards.

### 3.2. Multi-Currency Smart Cart
Split-screen interface designed for fast overseas shopping in grocery markets, electronics retail, and local fairs:
* Fast keypad input in local tag currency.
* Real-time converted subtotals and totals.
* Custom rate locking for cash transactions.

### 3.3. Trip Expense Manager & Debt Settlement
* Folder-based trip categorization (e.g., *Bariloche Trip 2026*, *Ciudad del Este Tech*).
* Dynamic debt-settlement matrix based on historical rates recorded on the transaction date.
* Export to CSV, JSON, and formatted PDF.

### 3.4. Decentralized Exchange Radar (OpenStreetMap)
* Discover authorized physical exchange houses within a 1km to 5km radius.
* Data retrieved via OpenStreetMap Overpass API (`amenity=bureau_de_change`).
* Offline city data packs cached directly in IndexedDB.

### 3.5. Model Context Protocol (MCP) Server
Pre-built tools for autonomous AI agents:
* `ivoyager_get_rates`: Multi-source exchange rates (Official, Blue, MEP, Crypto).
* `ivoyager_calculate_vet`: Payment method tax and spread simulations.
* `ivoyager_convert`: High-precision cross-rate arithmetic.
* `ivoyager_trip_summary`: Trip expense and balance aggregation.
* `ivoyager_find_exchange_spots`: Geospatial search for nearby exchange bureaus.

---

## 4. Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Core** | Angular 18+ (Standalone + Signals) | Reactive state management and dependency injection. |
| **UI Components** | Ionic UI Framework | Touch-optimized mobile UI components. |
| **Styling** | Tokenized CSS / SCSS | Custom design system using OKLCH/HSL tokens (Zero Tailwind). |
| **Persistence** | IndexedDB via Dexie.js | Embedded transactional NoSQL storage. |
| **Mobile Distribution** | Capacitor | Native iOS (Swift) and Android (Kotlin) build bridge. |
| **Geospatial** | Native GPS + OpenStreetMap | Hardware location and Overpass POI queries. |
| **Map Rendering** | Leaflet.js | Lightweight on-demand map tile rendering. |
| **Precision Math** | Decimal.js | Fixed-point arithmetic avoiding IEEE-754 floating point errors. |
| **AI Protocol** | @modelcontextprotocol/sdk | Native TypeScript Model Context Protocol server. |

---

## 5. Repository Structure

```
ivoyager/
├── .github/                  # CI/CD pipelines for linting, testing, and builds
├── capacitor.config.ts       # Capacitor native bridge configuration
├── angular.json              # Angular workspace configuration
├── package.json              # Project dependencies
├── tsconfig.json             # Strict TypeScript configuration
├── src/
│   ├── index.html            # Main HTML entrypoint
│   ├── main.ts               # Application bootstrap
│   ├── styles/               # Design tokens (tokens.css, typography.css)
│   ├── app/
│   │   ├── core/             # Models, services, fixed-point math, and IndexedDB
│   │   ├── features/         # Functional modules (converter, VET, cart, trips, radar)
│   │   └── shared/           # Reusable UI elements, modals, and currency pipes
│   └── assets/               # Clean SVG assets and offline city datasets
├── mcp-server/               # TypeScript Model Context Protocol server
├── LICENSE                   # MIT License
└── README.md                 # Technical documentation
```

---

## 6. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
