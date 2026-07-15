<div align="center">

# 🌱 EcoTrackr

### Track your lifestyle. Reduce your footprint. Save the planet.

A full-stack carbon footprint tracking platform that helps users log daily activities — travel, food, purchases, and energy use — and turns that data into actionable, gamified insights for a more sustainable life.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-ISC-blue)](#license)

</div>

---

## 📖 Overview

**EcoTrackr** is a personal sustainability companion that quantifies the environmental impact of everyday choices. Users log their travel, meals, purchases, and energy consumption, and the app calculates real CO₂e emissions using category-specific emission factors stored in a MySQL database. A gamification layer (badges, streaks, savings goals) and an AI-powered coach keep users engaged, while live environmental data (AQI, global CO₂ ppm) connects personal habits to the bigger picture.

## ✨ Features

### 📊 Emissions Tracking
| Module | Description |
|---|---|
| 🚗 **Travel Log** | Logs car/motorcycle trips by category and fuel type, converting distance into kg CO₂e using vehicle-specific emission factors. |
| 🍔 **Food Log** | Tracks dietary emissions per food item (meat, dairy, produce, etc.) based on kg CO₂e/kg factors. |
| 🛍️ **Purchase Log** | Calculates embodied carbon for manufactured goods (electronics, clothing, etc.). |
| ⚡ **Energy Log** | Supports both appliance-level tracking (device + usage duration) and monthly utility bill entry, using region-specific grid emission factors. |

### 🌍 Environmental Awareness
- **Live AQI Dashboard** — real-time Air Quality Index lookup for the user's city or any searched location (WAQI API), with smart 3-hour caching and request de-duplication to avoid API rate limits.
- **Global CO₂ Monitor** — displays the current atmospheric CO₂ concentration (Mauna Loa data via global-warming.org), with historical context (pre-industrial vs. safe vs. critical levels).
- **National Comparison** — benchmarks a user's monthly emissions against country-level averages.

### 🏆 Gamification & Motivation
- **Eco-Action Logging** — users log sustainable actions (planting trees, biking instead of driving, etc.) and see estimated CO₂ savings in real time.
- **Automated Badge Engine** — a rules-based server-side engine evaluates milestones after every log: cumulative savings tiers (Bronze → Green Hero), daily streaks (Weekly Warrior, Monthly Master), category diversity (Eco Explorer), and specialty achievements (Tree Planter, Net Zero Hero).
- **Badges & Achievements Page** — a visual trophy case showing earned vs. locked badges.

### 🤖 AI Sustainability Coach
- Conversational assistant scoped strictly to sustainability topics.
- **Data-driven tips**: pulls the user's real emissions breakdown (hotspots, high-impact logs) to personalize advice.
- **Compensatory action planning**: given an emissions amount, calls a backend tool to suggest a real, database-backed offsetting plan (e.g., "plant 3 trees to offset 66kg CO₂e").

### 📈 Dashboard & Insights
- Today's and monthly emissions totals, category breakdown (pie chart), and 6-month trend (bar chart) via Recharts.
- Monthly carbon saved vs. monthly emitted.
- Automatic hotspot detection (which category is driving your footprint).
- High-impact logs and low-carbon wins, surfaced automatically.

### 🔐 Accounts
- JWT-based authentication with bcrypt password hashing.
- Signup collects location (country/state/city) to personalize grid emission factors and national comparisons.

---

## 🏗️ Tech Stack

**Frontend**
- [React 19](https://react.dev/) + [Vite 7](https://vite.dev/) — fast dev/build tooling
- [React Router v7](https://reactrouter.com/) — client-side routing
- [Tailwind CSS 3](https://tailwindcss.com/) — utility-first styling
- [Framer Motion](https://www.framer.com/motion/) — page/element animations
- [Recharts](https://recharts.org/) — data visualization (pie & bar charts)
- [Axios](https://axios-http.com/) — HTTP client with interceptors for auth & session handling
- Font Awesome — iconography

**Backend**
- [Express 5](https://expressjs.com/) — REST API server
- [MySQL2](https://github.com/sidorares/node-mysql2) — database driver (callback + promise APIs)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — auth tokens
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing
- [node-fetch](https://github.com/node-fetch/node-fetch) — server-side HTTP calls to external APIs
- [dotenv](https://github.com/motdotla/dotenv) + [cors](https://github.com/expressjs/cors)

**External APIs**
- [World Air Quality Index (WAQI)](https://waqi.info/) — real-time AQI data
- [global-warming.org](https://global-warming.org/) — NOAA/Mauna Loa CO₂ data
- Google Gemini (generative language API) — AI Coach conversational engine

**Database**
- MySQL schema with dedicated emission-factor reference tables (`vehicle_emission_factors`, `food_emission_factors`, `item_embodied_factors`, `device_consumption_factors`, `grid_emission_factors`, `carbon_savings_factors`) and per-category log tables, plus `badges` / `user_badges` for gamification and caching tables (`aqi_cache`, `global_stats_cache`).

---

## 📁 Project Structure

```
carbon-tracker/
├── src/                        # Frontend (React)
│   ├── api/
│   │   └── axiosconfig.js      # Axios instance with auth + 401 interceptors
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx / Signup.jsx
│   │   ├── Dashboard.jsx       # Main hub — charts, snapshots, navigation
│   │   ├── TravelLog.jsx
│   │   ├── FoodLog.jsx
│   │   ├── PurchaseLog.jsx
│   │   ├── EnergyLog.jsx
│   │   ├── EcoActionLog.jsx    # Eco-actions + badge unlock modal
│   │   ├── AI.jsx              # AI Coach chat interface
│   │   ├── AQIDashboard.jsx
│   │   ├── GlobalCO2.jsx
│   │   ├── BadgesPage.jsx
│   │   └── Profile.jsx
│   ├── components/
│   │   └── Modal.jsx
│   ├── App.jsx / main.jsx
│   └── index.css
├── backend/                     # Backend (Express)
│   ├── server.js                # App entrypoint & route mounting
│   ├── db.js                    # MySQL connection
│   ├── middleware/
│   │   └── checkAuth.js         # JWT verification middleware
│   └── routes/
│       ├── auth.js              # Signup / Login
│       ├── travel.js
│       ├── food.js
│       ├── purchase.js
│       ├── energy.js
│       ├── device.js
│       ├── ecoAction.js         # Eco-action logging + badge engine
│       ├── dashboard.js         # Aggregated dashboard data
│       ├── coach.js             # AI coach "facts engine" + savings tool
│       ├── environment.js       # AQI + global CO2 endpoints (with caching)
│       └── gamification.js      # Badge listing
├── public/
├── index.html
├── tailwind.config.js / postcss.config.js
├── vite.config.js
└── package.json
```

---

## 🗄️ Database Schema

EcoTrackr runs on a normalized **MySQL** schema of **17 tables**, split into four groups: user identity, per-category activity logs, scientific emission-factor reference data, and supporting cache/gamification tables. The full DDL lives in [`database/schema.sql`](./database/schema.sql).

### Tables (`SHOW TABLES`)

```
aqi_cache                     eco_action_logs               monthly_energy_logs
badges                        food_emission_factors         purchase_logs
carbon_savings_factors        food_logs                     travel_logs
device_consumption_factors    global_stats_cache            user_badges
device_usage_logs             grid_emission_factors         users
                               item_embodied_factors         vehicle_emission_factors
```

| Group | Tables | Purpose |
|---|---|---|
| **Identity** | `users` | Account data + location, used for grid/AQI lookups |
| **Activity logs** | `travel_logs`, `food_logs`, `purchase_logs`, `device_usage_logs`, `monthly_energy_logs`, `eco_action_logs` | One row per logged action, each FK'd to its emission-factor table |
| **Emission factors** | `vehicle_emission_factors`, `food_emission_factors`, `item_embodied_factors`, `device_consumption_factors`, `grid_emission_factors`, `carbon_savings_factors` | IPCC/FAO/Climatiq-sourced factors used in the calculation formula above |
| **Gamification** | `badges`, `user_badges` | Badge catalog + per-user earned badges |
| **Caching** | `aqi_cache`, `global_stats_cache` | Backs the AQI/CO₂ smart-caching described above (3-hour TTL) |

### Confirmed table structure (`DESC`)

**`users`**

| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| user_id | int | NO | PRI | NULL | auto_increment |
| username | varchar(50) | NO | UNI | NULL | |
| email | varchar(255) | NO | UNI | NULL | |
| password_hash | varchar(255) | NO | | NULL | |
| country_code | varchar(10) | NO | | NULL | |
| state_code | varchar(10) | NO | | NULL | |
| city | varchar(100) | YES | | NULL | |
| created_at | timestamp | YES | | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**`travel_logs`**

| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| log_id | int | NO | PRI | NULL | auto_increment |
| user_id | int | NO | MUL | NULL | |
| vehicle_factor_id | int | NO | MUL | NULL | |
| distance | decimal(10,2) | NO | | NULL | |
| total_emissions | decimal(10,4) | NO | | NULL | |
| log_date | datetime | NO | | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**`food_logs`**

| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| log_id | int | NO | PRI | NULL | auto_increment |
| user_id | int | NO | MUL | NULL | |
| food_factor_id | int | NO | MUL | NULL | |
| quantity | decimal(10,1) | NO | | NULL | |
| total_emissions | decimal(10,4) | NO | | NULL | |
| log_date | datetime | NO | | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

**`device_usage_logs`**

| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| log_id | int | NO | PRI | NULL | auto_increment |
| user_id | int | NO | MUL | NULL | |
| device_factor_id | int | NO | MUL | NULL | |
| usage_duration | decimal(10,2) | NO | | NULL | |
| total_emissions | decimal(10,4) | NO | | NULL | |
| log_date | datetime | NO | | CURRENT_TIMESTAMP | DEFAULT_GENERATED |

*The remaining tables (`purchase_logs`, `monthly_energy_logs`, `eco_action_logs`, `badges`, `user_badges`, and all `*_factors`/`*_cache` tables) follow the same `log_id / user_id / factor_id / quantity / total_emissions / log_date` convention and are fully defined — including foreign keys and indexes — in [`database/schema.sql`](./database/schema.sql).*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A running MySQL server

### 1. Clone & install dependencies

```bash
git clone <your-repo-url>
cd carbon-tracker

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure the database

Create a MySQL database (e.g. `carbon_tracker`) and set up the required tables — including `users`, per-category `*_logs` tables, `*_emission_factors` / `*_consumption_factors` reference tables, `grid_emission_factors`, `carbon_savings_factors`, `eco_action_logs`, `badges`, `user_badges`, `aqi_cache`, and `global_stats_cache`.

Update `backend/db.js` with your local MySQL credentials:

```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "<your-password>",
  database: "carbon_tracker"
});
```

> ⚠️ For production, move these credentials into environment variables instead of hardcoding them.

### 3. Configure environment variables

Create `backend/.env`:

```env
JWT_SECRET=your_jwt_secret_here
AQI_API_KEY=your_waqi_api_token_here
GEMINI_API_KEY=your_Google Gemini_api_key_here
```

Get a free WAQI token at [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/).

### 4. Run the app

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
node server.js

# Terminal 2 — frontend (http://localhost:5173)
npm run dev
```

Visit `http://localhost:5173` to get started.

---

## 🔌 Key API Endpoints

All authenticated routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user, returns JWT |
| `POST` | `/api/auth/login` | Authenticate, returns JWT |
| `POST` | `/api/travel/log` | Log a travel activity |
| `POST` | `/api/food/log` | Log a food item |
| `GET/POST` | `/api/purchase/items` / `/api/purchase/log` | List purchasable items / log a purchase |
| `GET/POST` | `/api/device/devices` / `/api/device/log` | List devices / log device usage |
| `POST` | `/api/energy/log` | Log a monthly energy bill |
| `GET` | `/api/dashboard/data` | Aggregated dashboard metrics (today, monthly, trend, hotspot, comparisons) |
| `GET/POST` | `/api/eco-actions/factors` / `/api/eco-actions/log` | List eco-actions / log one (triggers badge engine) |
| `GET` | `/api/gamification/badges` | Full badge list with earned status |
| `GET` | `/api/coach/insights` | Personalized facts for the AI Coach |
| `GET` | `/api/coach/find-savings` | Suggests eco-actions to offset a given kg CO₂e amount |
| `GET` | `/api/environment/aqi` | Cached AQI lookup by city (defaults to user profile city) |
| `GET` | `/api/environment/global-co2` | Cached global atmospheric CO₂ ppm |

---

## 🧠 How Emissions Are Calculated

Each activity type is matched against a reference "emission factor" table:

```
total_emissions = activity_quantity × emission_factor
```

- **Travel**: `distance (km) × category/fuel-specific gCO₂e/km factor`
- **Food**: `quantity (kg) × food-specific kgCO₂e/kg factor`
- **Purchases**: `quantity × item-specific embodied kgCO₂e factor`
- **Energy (device)**: `duration (hrs) × device consumption rate (kWh/hr) × regional grid factor (kgCO₂e/kWh)`
- **Energy (bill)**: `kWh consumed × regional grid factor`

This keeps calculations transparent, data-driven, and easy to extend with new factors.

---

## 🗺️ Roadmap Ideas

- [ ] Machine-learning based emissions forecasting
- [ ] Social leaderboard / friend comparisons
- [ ] Mobile app (React Native)
- [ ] Export reports (PDF/CSV)
- [ ] More granular location-based grid emission data

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the **ISC License**.

---

