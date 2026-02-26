# FleetDrive - Urban Logistics Driver App

A production-ready mobile-first driver application for urban logistics, built with **Expo (React Native)** and **Express.js**. FleetDrive helps delivery drivers manage routes, track deliveries, capture proof, report exceptions, log fuel stops, and handle HR operations — all from a single, polished mobile interface.

## Key Points 

| Welcome & Login | Home Dashboard | Map Navigation |
|---|---|---|
| Gradient welcome screen with "Get Started" | Order list with En Route (LIVE), Upcoming, Completed sections | Interactive Leaflet map with markers, slide-up order details |

| Delivery Proof | Fuel Log | Profile |
|---|---|---|
| Upload photo proof or report exception with category | Upload fuel receipt or report complaint | Vehicle info, attendance calendar, overtime, pay stats |

## Features

### Authentication
- Login / Sign Up flow with backend validation
- Session persistence via AsyncStorage
- Test credentials: username `nive`, password `102938`
- Pre-seeded driver profile based in Chennai, Tamil Nadu

### Home Dashboard
- Categorized order list: **En Route** (with LIVE badge), **Upcoming**, **Past Completed**
- Expandable order cards with delivery details (ETA, package ID, weight, time window)
- Fuel and break request toggle icons with animated toast notifications
- Driver name and status display

### Map View
- Interactive **Leaflet map** rendered via WebView (native) / iframe (web) with OpenStreetMap tiles
- Custom markers: blue (driver), red (en route orders), yellow (upcoming), orange (fuel stops)
- Animated route polyline visualization across Chennai
- Slide-up bottom sheet with current order details, "Arrived" button, and fuel stop access
- Sidebar menu with profile, settings, and logout

### Delivery Proof & Exception Reporting
- Upload delivery proof photo via device camera/gallery
- Report exceptions with selectable categories (Customer Unavailable, Wrong Address, Damaged Package, Access Denied, Other)
- Notes/description text field
- Animated confirmation popup showing submission summary (type, category, photo status, notes)
- Auto-redirect to home after submission

### Fuel Log & Complaints
- Upload fuel receipt or meter reading photo
- Report fuel station complaints
- Notes field for additional details
- Animated confirmation popup with submission details
- Auto-redirect to home after submission

### Notifications
- Swipeable notification cards (acknowledge / dismiss)
- Color-coded notification types (order update, system alert, dispatch)

### HR & Operations Forms
- **Leave Application**: date selection, reason category dropdown, notes
- **Overtime Request**: time input, reason, notes

### Profile
- Driver and vehicle information (name, employee ID, vehicle number, type, fuel, capacity)
- Collapsible attendance calendar with color-coded status dots
- Overtime hours with visual progress bars
- Break history log
- Weekly pay summary

### Real-Time Interactions (Simulated)
- **Voice Bot FAB**: floating action button simulating voice-based dispatch communication
- **Urgent Order Overlay**: auto-triggered overlay demonstrating real-time urgent dispatch notifications

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Expo SDK 54 | React Native framework |
| expo-router | File-based navigation |
| React Context | Global state management |
| TanStack React Query | Server state / data fetching |
| react-native-reanimated | Animations (pulse, slide, shimmer) |
| react-native-gesture-handler | Swipe gestures |
| Leaflet + OpenStreetMap | Interactive map (via WebView/iframe) |
| expo-image-picker | Camera/gallery photo capture |
| expo-haptics | Tactile feedback |
| @expo/vector-icons | Feather & Ionicons icon sets |
| Inter font family | Typography (400, 500, 600, 700 weights) |

### Backend
| Technology | Purpose |
|---|---|
| Express 5 | HTTP server |
| TypeScript | Type-safe server code |
| Drizzle ORM | Database queries & schema |
| PostgreSQL | Data persistence |
| Zod | Runtime validation |

## Project Structure

```
fleetdrive/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with auth guards & providers
│   ├── welcome.tsx               # Welcome / landing screen
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Sign up screen
│   ├── delivery-proof.tsx        # Delivery proof & exception screen
│   ├── fuel-log.tsx              # Fuel log & complaint screen
│   ├── profile.tsx               # Driver profile screen
│   ├── settings.tsx              # Settings screen
│   ├── urgent-order.tsx          # Urgent order details
│   ├── exception.tsx             # Exception reporting
│   └── (tabs)/                   # Tab navigation
│       ├── _layout.tsx           # Tab bar configuration
│       ├── index.tsx             # Home - order dashboard
│       ├── map.tsx               # Map view with bottom sheet
│       ├── notifications.tsx     # Notification center
│       └── forms.tsx             # HR forms (leave/overtime)
├── components/                   # Reusable components
│   ├── LeafletMap.tsx            # Leaflet map component
│   ├── VoiceBotFAB.tsx           # Voice bot floating button
│   ├── UrgentOverlay.tsx         # Urgent order overlay
│   ├── OrderCard.tsx             # Order card component
│   ├── ErrorBoundary.tsx         # Error boundary wrapper
│   ├── ErrorFallback.tsx         # Error fallback UI
│   └── KeyboardAwareScrollViewCompat.tsx
├── lib/                          # Utilities & state
│   ├── app-context.tsx           # Global app state (orders, notifications)
│   ├── auth-context.tsx          # Authentication state & API calls
│   ├── mock-data.ts              # Chennai-specific mock data
│   └── query-client.ts           # React Query client & API helpers
├── constants/
│   └── colors.ts                 # Design system colors
├── shared/
│   └── schema.ts                 # Drizzle ORM schema (shared types)
├── server/                       # Express backend
│   ├── index.ts                  # Server entry point
│   ├── routes.ts                 # API route definitions
│   ├── storage.ts                # Database storage layer
│   ├── db.ts                     # Database connection
│   └── templates/
│       └── landing-page.html     # Static landing page
├── app.json                      # Expo configuration
├── package.json                  # Dependencies & scripts
├── drizzle.config.ts             # Drizzle ORM config
└── tsconfig.json                 # TypeScript config
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Expo Go app (for mobile testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fleetdrive
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-session-secret
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the backend server:
```bash
npm run server:dev
```

6. Start the Expo development server (in a separate terminal):
```bash
npm run expo:dev
```

### Testing the App

- **Web**: Open `http://localhost:8081` in your browser
- **Mobile**: Scan the QR code from the Expo dev server using the Expo Go app
- **Login**: Use username `nive` and password `102938`


## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate user with username/password |
| POST | `/api/auth/signup` | Register new driver account |



## License

for academic and project purposes
