# Parkside Brochure Tracker

A web/mobile app that automatically scrapes **Lidl** and **Kaufland** Bulgaria brochures and shows only the pages containing **Parkside** tools.

🔗 **Live**: [tools-promo.vercel.app](https://tools-promo.vercel.app/)

## How It Works

1. **Backend scraper** fetches the brochure listing pages from Lidl and Kaufland Bulgaria
2. Parses the HTML to extract flyer identifiers
3. Calls the leaflets API to get page-level data with keywords and links
4. Detects Parkside pages by searching keywords and links
5. Stores results in a local **SQLite** database with in-memory response caching
6. A **cron job** re-scrapes daily to pick up new brochures
7. The **app** displays Parkside pages with tab navigation (Lidl/Kaufland) and date-based brochure picker

## Project Structure

```
parkside-brochure/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server + cron scheduler
│   │   ├── scraper.js         # Lidl + Kaufland scraping logic
│   │   ├── db.js              # SQLite database layer
│   │   ├── routes/
│   │   │   └── brochures.js   # REST API endpoints
│   │   └── scrape-once.js     # Standalone scrape test script
│   ├── data/                  # SQLite database (auto-created)
│   ├── .env                   # Configuration
│   └── package.json
└── mobile/
    ├── App.js                 # Entry point
    ├── assets/                # Lidl & Kaufland logos
    ├── src/
    │   ├── api/
    │   │   └── client.js      # Backend API client
    │   ├── screens/
    │   │   └── HomeScreen.js  # Tab nav + date picker + grid
    │   └── components/
    │       ├── BrochurePage.js # Grid tile component
    │       └── ImageViewer.js  # Fullscreen pinch-to-zoom viewer
    ├── app.json
    └── package.json
```

## API Endpoints

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/pages`              | All Parkside pages (flat list)       |
| GET    | `/api/brochures`          | Brochures that have Parkside pages   |
| GET    | `/api/brochures/:id/pages`| Parkside pages for a specific brochure|
| POST   | `/api/scrape`             | Trigger a manual scrape              |
| GET    | `/health`                 | Health check                         |

## Setup

### Prerequisites

- **Node.js 20+**
- npm

### Backend

```bash
cd backend
npm install 
npm run start
```

The server starts on `http://localhost:3000` and runs an initial scrape on startup.

### Mobile

```bash
cd mobile
npm install 
npm run start
```

Opens Expo dev server. Scan the QR code with Expo Go or press `w` for web.

## Configuration

Backend environment variables (`.env`):

| Variable              | Description                    |
|-----------------------|--------------------------------|
| `PORT`                | Server port                    |
| `BROCHURE_URL`        | Lidl brochure listing page     |
| `KAUFLAND_URL`        | Kaufland brochure listing page |
| `FLYER_API`           | Schwarz leaflets API URL       |
| `CRON_SCHEDULE`       | Scrape frequency (cron syntax) |
| `DB_PATH`             | SQLite database path           |
| `MAX_BROCHURE_AGE_DAYS`| Auto-cleanup old brochures   |

Mobile environment variables (`.env`):

| Variable              | Description                    |
|-----------------------|--------------------------------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL           |


## Tech Stack

- **Backend**: Node.js, Express, cheerio, better-sqlite3, node-cron
- **Frontend**: React Native (Expo SDK 52), react-native-web
- **Data source**: Schwarz Group leaflets API
