# UrbanRoute — Last-Mile Delivery Optimization Platform

## Overview

UrbanRoute is an intelligent last-mile delivery optimization system designed for urban logistics operations in Chennai, India. It provides dispatchers with a real-time control center to monitor drivers, manage fleet operations, optimize delivery routes, and handle administrative approvals — all with full English and Tamil language support.

---

## Core Ideology

Last-mile delivery accounts for **40% of total delivery costs** and is the most complex segment of the supply chain. Urban challenges like heavy traffic, narrow streets, tight delivery windows, and manual route planning lead to failed deliveries, wasted fuel, and frustrated customers.

UrbanRoute solves this by providing:

- **AI-driven route optimization** that considers distance, traffic, vehicle capacity, driver hours, and delivery windows
- **Real-time fleet visibility** with live GPS tracking on an interactive map
- **Smart driver matching** for urgent orders based on proximity, capacity, and availability
- **Home-based driver allocation** — drivers are assigned routes near their home locality, reducing commute and increasing area familiarity
- **Rule breach monitoring** — automatic detection of overtime violations, route deviations, late deliveries, and vehicle issues

---

## Key Features

### 1. Dispatcher Control Center (`/dashboard`)

- **KPI Bar** — Real-time metrics: on-time rate, drops per route, total distance, fuel & CO₂ savings
- **Fleet List** — All vehicles with status (en-route, idle, maintenance), driver assignments, and current areas
- **Live Map** — Interactive Leaflet map centered on Chennai with real-time vehicle markers
- **Driver Sidebar** — Click any driver to see detailed profile, delivery progress, and route information
- **Notifications Drawer** — Rule breach alerts (late deliveries, overtime, route deviations, vehicle issues) with acknowledge functionality
- **Route Re-assignment Modal** — Drag-and-drop interface to reassign delivery stops between drivers in real time

### 2. Urgent Order Insertion (`/urgent-order`)

- Select a warehouse location (Central, North, South, East, or West hub)
- Enter order details: description, delivery area, address, package weight, required delivery time
- **Smart Driver Matching** — System scans the entire fleet and ranks the top 5 drivers by:
  - Distance to warehouse
  - Remaining vehicle capacity
  - Available working hours
  - Current pending stops
  - Driver rating
- Shows estimated pickup and delivery times, plus impact on existing route ETAs
- One-click assignment with instant route update

### 3. Admin Approval Center (`/admin-approvals`)

Four tabs for managing driver requests:

| Tab                  | What It Handles                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Leave Requests**   | Sick leave, casual leave, emergency, personal — with reason and date range                                                                       |
| **Overtime Requests**| Extra hours requests with 1.5-hour threshold warning system. Requests exceeding the limit are flagged with visual alerts                         |
| **Fuel Bills**       | Receipt photo verification with amounts, litres, station name, and fuel type. Includes image lightbox viewer                                     |
| **Proof of Delivery**| Contactless delivery photo verification with customer name, address, and timestamps. Includes image lightbox viewer                              |

Each tab shows pending count badges, and admins can approve or reject with one click.

### 4. Landing Page (`/`)

- Hero section with platform value proposition
- Problem statistics (industry data on last-mile delivery challenges)
- Platform capabilities overview
- Feature cards for all six core features
- Driver app section
- Call-to-action

### 5. Admin Login (`/login`)

- Simple credential-based login
  - Username: `admin`
  - Passcode: `1029`
- Session stored in browser sessionStorage

---

## Bilingual Support (English & Tamil)

The entire application supports **complete Tamil translation** — not just UI labels, but also:

- Driver names (e.g., "Murugan Selvam" → "முருகன் செல்வம்")
- Chennai area names (e.g., "T. Nagar" → "தி. நகர்")
- Street addresses, station names, customer names
- Leave reasons, overtime explanations
- Vehicle types, fuel types
- Every button, label, badge, toast message, and placeholder

Toggle between English and Tamil using the language switch button available in the header of every page. Preference is saved in localStorage.

---

## Data & Geography

- All data uses **Tamil names** and **Chennai neighborhoods** (T. Nagar, Anna Nagar, Adyar, Velachery, Tambaram, Guindy, Porur, Perambur, Chromepet, Kilpauk, etc.)
- 10 drivers with realistic profiles, vehicle assignments, delivery routes, and working hours
- 5 warehouse hubs across Chennai
- Realistic delivery addresses with GPS coordinates
- Auto-generated notifications every 2 minutes simulating live operations

---

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Frontend         | React 18, TypeScript, Vite                          |
| Routing          | Wouter                                              |
| State Management | TanStack React Query v5                             |
| UI Components    | shadcn/ui + Radix UI + Tailwind CSS                 |
| Icons            | Lucide React                                        |
| Map              | Leaflet (OpenStreetMap tiles)                       |
| Drag & Drop      | @hello-pangea/dnd                                   |
| Backend          | Node.js, Express 5, TypeScript                      |
| Data             | In-memory storage (database-ready via Drizzle ORM)  |
| i18n             | Custom React context (`client/src/lib/i18n.tsx`)    |

---

## Local Installation

### Prerequisites

- **Node.js** v20 or later — [download here](https://nodejs.org)
- **npm** (comes with Node.js)

### Steps

1. **Download or clone the project**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Create a `.env` file in the project root:

   ```env
   SESSION_SECRET=any-random-secret-string
   ```

   No database setup is needed — all data runs in memory.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   ```
   http://localhost:5000
   ```

6. **Login credentials**

   - Username: `admin`
   - Passcode: `1029`

---

## Project Structure

```
├── client/src/
│   ├── pages/              # Landing, Login, Dashboard, Admin Approvals, Urgent Order
│   ├── components/         # KPI Bar, Fleet List, Driver Sidebar, Detail View,
│   │                       #   Notifications Drawer, Route Override Modal, Live Map
│   ├── lib/
│   │   ├── i18n.tsx        # Translation system (300+ keys, 100+ data mappings)
│   │   └── queryClient.ts
│   └── hooks/
├── server/
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # In-memory data store with seed data
│   └── index.ts            # Express server entry
├── shared/
│   └── schema.ts           # Zod schemas shared between client and server
└── public/images/          # Receipt photos, delivery proof photos
```

---

## API Endpoints

| Method | Endpoint                              | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| GET    | `/api/kpis`                           | Dashboard KPI metrics                |
| GET    | `/api/drivers`                        | All drivers with delivery points     |
| GET    | `/api/fleet`                          | Fleet vehicle list                   |
| GET    | `/api/notifications`                  | Operational alerts                   |
| GET    | `/api/markers`                        | Map markers for live map             |
| POST   | `/api/notifications/:id/acknowledge`  | Acknowledge an alert                 |
| POST   | `/api/drivers/:id/reassign`           | Reassign driver to new route         |
| POST   | `/api/delivery-points/transfer`       | Transfer stop between drivers        |
| POST   | `/api/urgent-order/find-drivers`      | Find matching drivers for urgent order |
| POST   | `/api/urgent-order/assign`            | Assign urgent order to driver        |
| GET    | `/api/approvals/leave`                | Leave requests                       |
| GET    | `/api/approvals/overtime`             | Overtime requests                    |
| GET    | `/api/approvals/fuel`                 | Fuel bill submissions                |
| GET    | `/api/approvals/pod`                  | Proof of delivery items              |
| POST   | `/api/approvals/:type/:id/:action`    | Approve or reject a request          |
------------------------------------------------------------------------------------------
## Future Enhancements

-   Database integration
-   ML traffic prediction
-   Mobile driver app
-   Cloud deployment

------------------------------------------------------------------------

## License

Academic and demonstration purposes.


Google API - AIzaSyAirzsb0jCkTzq8-gHPM5rbR_wknqLmUEg