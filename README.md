# Parkside Brochure Tracker

A mobile app that automatically scrapes **Lidl** and **Kaufland** Bulgaria brochures and shows only the pages containing **Parkside** tools.

## How It Works

1. **Backend scraper** fetches the brochure listing pages from Lidl and Kaufland Bulgaria
2. Parses the HTML to extract flyer identifiers
3. Calls the leaflets API to get page-level data with keywords and links
4. Detects Parkside pages by searching keywords and links
5. Stores results in a local **SQLite** database
6. A **cron job** re-scrapes every 6 hours to pick up new brochures
7. The **mobile app** displays Parkside pages with tab navigation (Lidl/Kaufland) and date-based brochure picker

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

- **Node.js 20+** (v18 will not work due to `undici` compatibility)
- npm

### Backend

```bash
cd backend
npm install --registry https://registry.npmjs.org
npm run start
```

The server starts on `http://localhost:3000` and runs an initial scrape on startup.

### Mobile

```bash
cd mobile
npm install --registry https://registry.npmjs.org
npm run start
```

Opens Expo dev server. Scan the QR code with Expo Go or press `w` for web.

## Configuration

Backend environment variables (`.env`):

| Variable              | Default                                              | Description                    |
|-----------------------|------------------------------------------------------|--------------------------------|
| `PORT`                | `3000`                                               | Server port                    |
| `BROCHURE_URL`        | *(set in .env)*                                      | Lidl brochure listing page     |
| `KAUFLAND_URL`        | *(set in .env)*                                      | Kaufland brochure listing page |
| `CRON_SCHEDULE`       | `0 */6 * * *`                                        | Scrape frequency (every 6h)    |
| `DB_PATH`             | `./data/brochures.db`                                | SQLite database path           |
| `MAX_BROCHURE_AGE_DAYS`| `30`                                                | Auto-cleanup old brochures     |

## Tech Stack

- **Backend**: Node.js, Express, cheerio, better-sqlite3, node-cron
- **Mobile**: React Native (Expo SDK 52)
- **Data source**: Schwarz Group leaflets API
