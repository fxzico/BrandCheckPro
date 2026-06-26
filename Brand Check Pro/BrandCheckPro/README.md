# BrandCheck Pro — Full-Stack Production Architecture

BrandCheck Pro is an enterprise-grade, low-latency B2B SaaS utility developed as a "Cultural Safety Firewall" for copywriters, brand managers, and corporate communications teams. The platform runs automated, context-aware risk analysis on marketing copy, slogans, taglines, and social media captions before deployment to minimize PR exposure and mitigate viral public backlash.

## 🏗️ System Architecture & Data Flow

```text
       [USER CAPTION / COPY]
                 │
                 ▼
   ┌───────────────────────────┐
   │ Chrome V3 Extension Popup │
   └─────────────┬─────────────┘
                 │ (Secure HTTPS POST)
                 ▼
   ┌───────────────────────────┐
   │    FastAPI Gateway Layer  │ ◄─── [Gatekeeper Middleware] ───► [config.py Toggles]
   └─────────────┬─────────────┘
                 │
                 ├──► [Local Sandbox Engines] ──► Local JSON Heuristic Sub-system
                 │
                 ▼
   ┌───────────────────────────┐
   │   Core Compliance Engine  │ ◄─── [Data Injection] ───► database/backlash_archive.json
   └─────────────┬─────────────┘                            database/double_meaning.json
                 │
                 ▼
   ┌───────────────────────────┐
   │ Google AI Studio Pipeline │ ───► Deterministic Tokenized JSON Analysis Matrix
   └───────────────────────────┘
```

## 🛠️ Tech Stack & Modularity

- **Frontend Core:** Vanilla JavaScript (ES6+ Web Workers), Tailwind CSS, Alpine.js (State Layer for Marketing & SEO Views).
- **Backend Infrastructure:** Python 3.10+ FastAPI, Uvicorn (ASGI web server), Pydantic v2 (Data Validation).
- **Inference Layer:** Google GenAI SDK (Gemini Suite), featuring local keyword and pattern match heuristic fallbacks for offline development execution.

## 🚀 Setup & Installation Instructions

### 1. Backend Service Configuration

Ensure Python 3.10+ is active. Navigate to your backend cluster workspace and spin up dependencies:

```bash
cd G:\Antigravity\BrandCheckPro\backend
pip install -r requirements.txt
```

Create a system `.env` file within `backend/` or export your execution credentials directly:

```
GOOGLE_AI_STUDIO_KEY=your_actual_gemini_api_key_here
PORT=8000
```

Boot the server via Uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

### 2. Sideloading the Chrome V3 Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked** (top-left corner).
4. Direct the folder dialog to the root sandbox repository pathway: `G:\Antigravity\BrandCheckPro`.

## ⚙️ Config Panel Matrix (`backend/config.py`)

The platform's unit monetization and AI intelligence layer are decoupled into a central state machine. Flipping `MONETIZATION_ENABLED = True` instantly moves the engine from open processing into a multi-tier commercial gateway checking API monetization middleware.

## 📊 API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/analyze` | Processes text payloads for context safety. Returns structural scoring arrays. |
| `POST` | `/v1/batch` | Enables parallel bulk scanning operations (up to 50 items) for scheduling desks. |
| `GET` | `/v1/health` | Systems diagnostic check mapping model accessibility states and operational latency bounds. |

## ⚖️ Academic Provenance & Enterprise Statement

BrandCheck Pro originated as a strategic innovation concept at IIMC Dhenkanal within the Corporate Communication & Brand Management division. The architecture has been migrated from an academic case thesis into a robust, scalable, and market-ready full-stack enterprise utility ready for corporate integration or acqui-hire evaluation.
