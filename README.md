# YouTube Analytics Dashboard 📊

A full-stack web application designed for comprehensive YouTube Channel performance and engagement analysis. Built with FastAPI, React, and Tailwind CSS.

## Features ✨
- **Deep Channel Insights**: Fetch total subscribers, views, video counts, and engagement rates by querying any channel ID.
- **Top Videos Tracker**: Automatically pull the top performing videos to discover successful trends relative to engagement.
- **Filter & Search Grid**: Extensively filter historic channel video performance across Date Ranges, Duration lengths, string match Queries, and Engagement levels. 
- **Report Builder Engine**: Mix and match insights modules to build curated PDF / CSV performance reports for external stakeholders.
- **Side-by-side Comparisons**: Weigh metrics across 2 or more channels in concurrent bar charts and tables.

## Tech Stack 🛠️
- **Backend Framework**: Python / FastAPI / SQLAlchemy / SQLite
- **Frontend App**: React / Vite / TailwindCSS / Framer Motion / Recharts
- **External Integration**: YouTube Data API (v3)
- **Formatting & Tests**: Flake8, Black, Pytest

## Setup & Run Instructions 🚀

### 1. Requirements
- Node.js (v18+)
- Python (3.9+)

### 2. Set Up the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux
pip install -r requirements.txt
```

**Environment Variables**: Create a `.gitenv` file at the repository root and place your YouTube API parameters:
```env
YOUTUBE_API_KEY=AI...your_api_key_here
```

**Serve the Backend API**:
```bash
python -m uvicorn main:app --port 8001 --reload
```
*Note: Ensure the backend is explicitly running on port 8001 as bounded by frontend configurations.*

### 3. Set Up the Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the dashboard!

## Testing Infrastructure 🧪
Automated tests are driven by `pytest` and utilize `unittest.mock` to avoid consuming live YouTube API Quota during evaluation.

Run unit and integration test suite:
```bash
cd backend 
.\venv\Scripts\python -m pytest tests/ -v
```

Ensure formatting strictness against PEP-8 policies:
```bash
.\venv\Scripts\python -m flake8 main.py api services config models schemas
```

## Known Issues & Future Enhancements 🔮
- **OAuth Expansion**: Currently extracting metric statistics utilizing broad Channel Data API reads. Future phases should include user OAuth2 login grants to aggregate deep YouTube Studio (Avg View Duration / Geography Metrics) exclusively held under protected endpoints.
- **Background Cron Syncing**: Cached endpoints are purely TTL active. Eventually implementing Celery/Redis background task queues to incrementally ingest large video backlogs in the dark is preferable to single-threaded synchronous HTTP blocks.
