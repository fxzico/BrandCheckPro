# Product Requirements Document (PRD)
## BrandCheck Pro — Version 2.1 (Universal BYOK + Secure Backend Gateway)

---

## 1. Executive Product Vision

BrandCheck Pro is a high-security, zero-data-retention **"Cultural Safety Firewall"** engineered for brand managers, agency leads, creative strategists, and compliance officers. It evaluates ad copy, campaign slogans, and brand communication against deep socio-political, religious, regional, caste, gender, and linguistic sensitivities before publication, specifically tuned to the nuances of the Indian market.

### Core Security Thesis
Large media agencies treat unreleased campaign copy as highly confidential intellectual property. BrandCheck Pro operates on a strict **Zero-Data Retention Architecture**:
- No inputs are stored, logged, or used for training.
- Content is evaluated purely in volatile memory.
- Immediate deletion post-analysis.
- No persistent storage of creative assets.
- Operator-paid API keys are **never** exposed in frontend code.

### API Key Security Model
BrandCheck Pro implements a **dual-key, provider-agnostic architecture**:
1. **BYOK (Bring Your Own Key)**: Users supply any API key from any provider in the world. The frontend auto-detects the provider family from the key prefix and routes directly to that provider's API. If the prefix is unrecognized, the key is attempted as an OpenRouter-compatible key.
2. **Operator-Paid Gateway**: A backend-held default API key is used securely for signed-in users (unlimited) and anonymous first-time visitors (one complimentary run per IP).

---

## 2. Target User Persona & Skepticism Metrics

### The Profile
Senior Brand Managers, Creative Directors, Agency Compliance Officers, startup founders, and media/advertising strategists in the Indian ecosystem.

### The Core Pain Point
Accidental multi-million dollar PR crises, viral boycotts (#Boycott campaigns), and brand equity damage caused by tone-deaf phrases, regional double entendres, casteist undertones, or politically charged language.

### The Barrier to Adoption
- Extreme skepticism toward generic AI wrappers.
- Strict enterprise IT security bans on third-party tools that log internal creative assets.
- Concern about API key exposure in client-side code.
- Need to support any LLM provider the enterprise already pays for.

### The Solution
An ultra-secure, terminal-style utility with **backend gateway protection** for operator-paid keys, **universal BYOK support**, and deterministic offline fallback heuristics — ensuring complete privacy and provider flexibility.

---

## 3. System Architecture

### 3.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  index.html  │  │  sandbox.js  │  │   auth.js    │  │  custom.css  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
           BYOK Key │        No BYOK   │          No BYOK │
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
        │ Direct Provider  │  │ Backend Gateway  │  │   Offline    │
        │     APIs         │  │   (FastAPI)      │  │  Heuristic   │
        └──────────────────┘  └──────────────────┘  └──────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
           Signed-in│                  │     Anonymous    │
                    ▼                  ▼                  ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ AUTH_API_KEY or  │  │ DEFAULT_API_KEY  │
        │ DEFAULT_API_KEY  │  │ (1x per IP)      │
        │ (unlimited uses) │  │                  │
        └──────────────────┘  └──────────────────┘
```

### 3.2 Key Resolution Algorithm

```
1. BYOK key present in localStorage (BC_LIVE_CORE_KEY)?
   └─ YES: detectProvider(key)
      ├─ known prefix  → call that provider's native chat/completions API
      └─ unknown prefix → attempt OpenRouter-compatible endpoint

2. No BYOK key + BACKEND_URL configured?
   └─ POST /v1/analyze to backend
      ├─ If user is signed in → pass X-BrandCheck-Auth header
      │   └─ backend uses AUTH_API_KEY, falling back to DEFAULT_API_KEY
      └─ If anonymous → backend checks first-use-per-IP in _first_use_ips
          ├─ First use → DEFAULT_API_KEY
          └─ Not first use → return 402 (if monetization on) or heuristic fallback

3. No BYOK key + no backend configured (BACKEND_URL === "")?
   └─ Run offline heuristic engine locally in browser
```

### 3.3 Provider Detection Matrix

| Key Prefix | Provider | Endpoint Used |
|---|---|---|
| `sk-or-*` | OpenRouter | `https://openrouter.ai/api/v1/chat/completions` |
| `AIza*` | Google AI Studio (Gemini) | `https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent` |
| `sk-ant-*` | Anthropic | `https://api.anthropic.com/v1/messages` |
| `sk-*`, `sk-proj-*`, `sk_live_*`, `sk_test_*` | OpenAI | `https://api.openai.com/v1/chat/completions` |
| any other string | Custom / Unknown | Attempted as OpenRouter-compatible fallback |

---

## 4. File Structure

```
BrandCheckPro/
├── index.html                      # Main SPA (Alpine.js + Tailwind)
├── origin.html                     # Origin / about page
├── pricing.html                    # Pricing tiers
├── api-connector.html              # API/MCP connector documentation page
├── blog.html                       # Blog index
├── blog/                           # Case-study blog posts (HTML)
│   ├── fabindia-urdu-phrasing-2021.html
│   ├── tanishq-ekatvam-campaign-controversy-2020.html
│   ├── manyavar-kanyamaan-campaign-controversy-2021.html
│   ├── vim-failed-satire-controversy-2022.html
│   ├── layers-shot-rape-controversy-2022.html
│   ├── swiggy-holi-advertisement-2023.html
│   ├── zomato-kachra-campaign-controversy-2023.html
│   ├── yesmadam-faked-layoffs-2024.html
│   ├── zomato-acronym-controversy-2017.html
│   ├── sabyasachi-mangalsutra-ad-controversy-2021.html
│   ├── dabur-fem-same-sex-karwa-chauth-2021.html
│   ├── mohey-ritual-subversion-2021.html
│   ├── kent-ro-classism-controversy-2020.html
│   ├── dabur-geopolitical-opportunism-2025.html
│   ├── oyo-spiritual-misappropriation-2025.html
│   ├── prada-kolhapuri-appropriation-2024.html
│   ├── hauterfly-unethical-deception-2024.html
│   ├── zomato-pure-veg-fleet-2024.html
│   ├── fenty-beauty-localization-failure-2025.html
│   ├── patanjali-legal-denigration-2025.html
│   ├── star-sports-rivalry-mockery-2026.html
│   └── post-mortem-01.html
│
├── assets/
│   ├── css/
│   │   └── custom.css             # Global styles + dark/light themes + glassmorphism
│   │
│   └── js/
│       ├── sandbox.js             # Core analysis engine (BYOK routing + heuristics)
│       ├── auth.js                # Google OAuth JWT decoder/storage
│       └── landing.js             # Landing page animations (if used)
│
├── backend/                        # FastAPI Gateway (Python)
│   ├── main.py                    # ASGI app, routes, middleware, key resolution
│   ├── config.py                  # Environment configuration + provider detection
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # API keys (NEVER COMMIT)
│   ├── .env.example               # Template for .env
│   └── core/
│       ├── engine.py              # Provider routing + heuristics
│       └── central_prompt.py      # System prompt templates
│
├── frontend/                       # Chrome extension (work in progress)
│   ├── popup.html
│   ├── popup.js
│   └── content_script.js
│
├── .gitignore                     # Excludes .env, __pycache__, venv
└── PRD.md                         # This document
```

---

## 5. Frontend Specifications

### 5.1 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Styling | Tailwind CSS (CDN) | Utility-first responsive design |
| State Management | Alpine.js (CDN) | Reactive UI without React overhead |
| Icons | Lucide (CDN) | Consistent iconography |
| Fonts | Inter, Outfit, JetBrains Mono (Google Fonts) | Clean, professional typography |
| Auth | Google Identity Services | OAuth 2.0 sign-in |

### 5.2 Global Constants

Both `index.html` and `assets/js/sandbox.js` define:

```javascript
// Backend Gateway Configuration
const BACKEND_URL = "";  // "http://localhost:8000" or "https://api.brandcheckpro.in"

// Model constants
const OR_MODEL = "qwen/qwen-2.5-72b-instruct:free";
const GEMINI_MODEL = "gemini-2.0-flash";
const OPENAI_MODEL = "gpt-4o-mini";
const ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";

// BYOK Provider Detection (universal)
function detectProvider(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return 'unknown';
  const key = apiKey.trim();
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('AIza')) return 'google';
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-proj-') || key.startsWith('sk-') || key.startsWith('sk_live_') || key.startsWith('sk_test_')) return 'openai';
  return 'unknown';  // attempted as OpenRouter-compatible fallback
}

function providerLabel(apiKey) {
  const map = {
    openrouter: 'OpenRouter BYOK',
    google: 'Google AI Studio BYOK',
    openai: 'OpenAI BYOK',
    anthropic: 'Anthropic BYOK',
    unknown: 'Custom BYOK'
  };
  return map[detectProvider(apiKey)] || 'Live AI Pipeline';
}
```

### 5.3 LocalStorage Keys

| Key | Purpose | TTL |
|---|---|---|
| `BC_LIVE_CORE_KEY` | User's BYOK API key | Persistent |
| `BC_AUTH_USER` | Google OAuth profile + raw JWT credential | Persistent |
| `BC_FIRST_USE_DEFAULT_CONSUMED` | Tracks if anonymous user used complimentary run | Persistent (frontend hint only) |
| `theme` | User's theme preference (`dark` / `light`) | Persistent |

### 5.4 UI Components

#### Input-Output Triad

| Field | ID | Validation | Placeholder |
|---|---|---|---|
| Brand Context | `brandContext` | Required | "Premium ethnic wear brand..." |
| Target Demographics | `demographics` | Required | "Tier-2 North India markets..." |
| Campaign Copy | `campaignCopy` | Required, max 5000 chars | "Your text goes here..." |
| Sensitivity Level | `sensitivity` | Optional | "Standard" / "Maximum" / "Low" |

#### Analysis Results Display
- **Overall Score**: 0-100 progress bar
  - Green ≥85: Safe
  - Yellow 65-84: Caution
  - Red 40-64: High Risk
  - Dark Red <40: Critical
- **Risk Level Badge**: Safe / Caution / High Risk / Critical
- **Summary**: Board-ready threat evaluation paragraph
- **Flagged Issues Table**: Phrase | Category | Rationale
- **Engine Label**: e.g., "OpenRouter BYOK", "Google AI Studio BYOK", "Backend Gateway", "Local Heuristic Engine"

### 5.5 Theme System

```javascript
// Theme pre-load in <head> to prevent flash
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();
```

Tailwind config:
```javascript
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brandBgDark: '#0B0F19',
        brandSurfaceDark: '#1E293B',
        brandBgLight: '#F8FAFC',
        brandSurfaceLight: '#FFFFFF',
        brandNeon: '#38BDF8',
        brandBlue: '#2563EB',
      }
    }
  }
}
```

CSS classes:
- Dark: `body.dark { background-color: #0B0F19; color: #F1F5F9; }`
- Light: `body:not(.dark) { background-color: #F8FAFC; color: #1E293B; }`
- Glass cards: `.glass-card` with backdrop blur and semi-transparent background

---

## 6. Backend Specifications

### 6.1 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | Latest |
| Server | Uvicorn | ASGI |
| HTTP Client | HTTPX | Async/sync |
| Validation | Pydantic | v2 |
| Environment | python-dotenv | Config management |

### 6.2 Environment Variables (backend/.env)

```bash
# Active provider when backend uses its own key pool
# Options: GOOGLE_AI_STUDIO, OPENAI, ANTHROPIC, LOCAL_MOCK
BRANDCHECK_PROVIDER=GOOGLE_AI_STUDIO

# Operator-paid API key used for anonymous first-use-per-IP and signed-in users
DEFAULT_API_KEY=""

# Optional separate key for authenticated users only
AUTH_API_KEY=""

# Provider-specific overrides (used by backend engine when ACTIVE_LLM_PROVIDER points here)
GOOGLE_AI_STUDIO_KEY=""
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
OPENROUTER_API_KEY=""

# Monetization toggle
MONETIZATION_ENABLED=False

# Free tier allowance (used when monetization is enabled)
FREE_TIER_MONTHLY_SCANS=10
```

### 6.3 API Endpoints

#### POST /v1/analyze
Analyze single copy instance.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <BYOK_KEY>          # Optional: user brings their own key
X-BrandCheck-Auth: <Google JWT credential> # Optional: signed-in user
```

**Request Body:**
```json
{
  "text": "Campaign copy to analyze",
  "market": "IN-NAT"
}
```

**Response (JSON):**
```json
{
  "overall_score": 85,
  "risk_level": "Caution",
  "summary": "Board-ready threat evaluation...",
  "flagged_issues": [
    {
      "phrase": "sacred",
      "category": "Religious Sensitivity",
      "rationale": "Commercial use of sacred terminology..."
    }
  ]
}
```

#### POST /v1/batch
Process up to 50 copies in parallel.

**Request Body:**
```json
{
  "payloads": [
    {"text": "Copy 1", "market": "IN-NAT"},
    {"text": "Copy 2", "market": "IN-SO"}
  ]
}
```

**Response:**
```json
{
  "batch_size": 2,
  "results": [
    {
      "text_preview": "Copy 1...",
      "analysis": { ...AnalysisResponse... },
      "latency_ms": 420.50
    }
  ]
}
```

#### GET /v1/health
System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "provider_routing": "GOOGLE_AI_STUDIO",
  "monetization_gate_active": false
}
```

#### GET /v1/markets
Supported market codes.

**Response:**
```json
{
  "supported_regions": [
    {"code": "IN-NAT", "label": "India (National Balance Layer)"},
    {"code": "IN-HN", "label": "Hindi-Belt Metropolitan Markets"},
    {"code": "IN-SO", "label": "Southern Peninsular Consumer Base"},
    {"code": "GCC-CR", "label": "MENA Crossover Demographics"}
  ]
}
```

### 6.4 Backend Key Resolution Logic

```python
def _resolve_api_key(request: Request) -> str:
    """Returns the BYOK from Authorization header, the AUTH_API_KEY
    for signed-in users, or DEFAULT_API_KEY for first-time anonymous request."""
    auth_header = request.headers.get("Authorization")
    byok = auth_header.replace("Bearer ", "").strip() if auth_header else ""
    if byok:
        return byok

    signed_in_header = request.headers.get("X-BrandCheck-Auth")
    if signed_in_header and signed_in_header.strip():
        paid_key = BrandCheckConfig.AUTH_API_KEY or BrandCheckConfig.DEFAULT_API_KEY
        if paid_key:
            return paid_key

    client_ip = _resolve_client_ip(request)
    if client_ip not in _first_use_ips and BrandCheckConfig.DEFAULT_API_KEY:
        _first_use_ips.add(client_ip)
        return BrandCheckConfig.DEFAULT_API_KEY

    return ""
```

### 6.5 Backend Provider Detection

```python
def detect_provider(cls, api_key: str) -> str:
    if not api_key:
        return "LOCAL_MOCK"
    if api_key.startswith("sk-or-"):
        return "OPENROUTER"
    if api_key.startswith("AIza"):
        return "GOOGLE_AI_STUDIO"
    if api_key.startswith("sk-ant-"):
        return "ANTHROPIC"
    if api_key.startswith("sk-"):
        return "OPENAI"
    return "UNKNOWN"  # Falls back to heuristic; production can extend here
```

---

## 7. Analysis Engine

### 7.1 System Prompt (backend/core/central_prompt.py)

```python
COMPLIANCE_SYSTEM_PROMPT = """You are the core analytical engine for BrandCheck Pro, an enterprise-grade PR and brand safety tool. Your objective is to analyze marketing copy, slogans, taglines, and social media posts to identify potential cultural, political, religious, and social risks before publication. Your analysis is strictly focused on the Indian cultural and socio-political context.

You must deeply analyze the text for explicit risks, hidden nuances, double entendres, and sarcasm that could lead to public backlash, boycotts, or PR crises.

EVALUATION PARAMETERS:
1. Religious Sensitivity: Does the text mix sacred terms with commercial slang? Does it mock or misrepresent religious practices, deities, or sentiments?
2. Political Neutrality: Does the copy use politically charged phrases, dog whistles, or align a brand with polarizing political movements or figures?
3. Gender & Social Tone: Does the text rely on gender stereotypes, casteist undertones, classism, or insensitive social generalizations?
4. Sarcasm & Double Meaning: Is there a sarcastic tone or a double entendre that could be misconstrued? Does the joke rely on context that a specific demographic might find offensive?

OUTPUT FORMAT:
You must return your analysis strictly as a JSON object. Do not include any conversational text, introductions, or markdown formatting outside of the JSON block.

The JSON structure must exactly match this schema:
{
  "overall_score": 85,
  "risk_level": "Caution",
  "summary": "Example metric summarization string.",
  "flagged_issues": [
    {
      "phrase": "targeted risk token",
      "category": "Religious Sensitivity",
      "rationale": "Objective explanatory analysis outlining localized market backlash triggers."
    }
  ]
}
"""
```

Market context injection:
```python
def inject_market_context(market_code: str) -> str:
    market_rules = {
        "IN-HN": "Accentuate vetting for linguistic double-entendres across northern Hindi-belt consumer sectors.",
        "IN-SO": "Heighten sensitivity assessments regarding regional representation and linguistic regionalism in southern markets.",
        "GCC-CR": "Enforce rigorous screening for cross-over terminology intersecting traditional values or dietary code standards."
    }
    context_addon = market_rules.get(market_code, "Apply standard all-market Indian socio-cultural risk profiles.")
    return f"{COMPLIANCE_SYSTEM_PROMPT}\n\nCURRENT INFERENCE FOCUS RULE: {context_addon}"
```

### 7.2 Provider API Implementations

#### Google AI Studio
```python
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
payload = {"contents": [{"parts": [{"text": prompt}]}]}
# Models tried in order: gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro, gemini-pro
```

#### OpenRouter
```python
url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://brandcheckpro.vercel.app",
    "X-Title": "BrandCheck Pro"
}
body = {
    "model": "qwen/qwen-2.5-72b-instruct:free",
    "messages": [
        {"role": "system", "content": "Return only strict JSON. No markdown."},
        {"role": "user", "content": prompt}
    ],
    "temperature": 0.2
}
```

#### OpenAI
```python
url = "https://api.openai.com/v1/chat/completions"
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
body = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "system", "content": "Return only strict JSON. No markdown."},
        {"role": "user", "content": prompt}
    ],
    "response_format": {"type": "json_object"},
    "temperature": 0.2
}
```

#### Anthropic
```python
url = "https://api.anthropic.com/v1/messages"
headers = {
    "x-api-key": api_key,
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01"
}
body = {
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 1024,
    "system": "Return only strict JSON. No markdown.",
    "messages": [{"role": "user", "content": prompt}],
    "temperature": 0.2
}
```

### 7.3 Backend Offline Heuristic Engine

If no API key is resolvable, the backend runs deterministic rules:

| Keyword | Category | Deduction | Rationale |
|---|---|---|---|
| sacred | Religious Sensitivity | 18 | Commercial use of sacred terminology |
| mandir | Religious Sensitivity | 20 | Direct temple references |
| cheap | Gender & Social Tone | 15 | Risk of classist connotations |
| maid | Gender & Social Tone | 20 | Reinforces classist hierarchies |
| fairness | Gender & Social Tone | 28 | Skin-tone claims (ASCI risk) |
| whitening | Gender & Social Tone | 40 | Banned under ASCI/DTCP |
| lower caste | Caste & Community Risk | 50 | Legally sensitive |
| dalit | Caste & Community Risk | 45 | Using community identity terms commercially |
| fuck | Profanity | 80 | Explicit profanity |
| bitch | Profanity | 70 | Derogatory slurs |

Scoring algorithm:
```python
final_score = max(100 - sum(deductions), 10)
risk_level = "Safe" if final_score >= 85 else "Caution" if final_score >= 65 else "High Risk" if final_score >= 40 else "Critical"
```

### 7.4 Frontend Offline Heuristic Engine

The browser carries an expanded rule set. Example rules:

```javascript
const rules = [
  { kw: 'sacred', cat: 'Religious Sensitivity', reason: 'Mixing sacred/religious terminology with commercial messaging risks backlash.', score: 18 },
  { kw: 'mandir', cat: 'Religious Sensitivity', reason: 'Direct temple references in marketing carry significant religious sensitivity risk.', score: 20 },
  { kw: 'jihad', cat: 'Religious Sensitivity', reason: 'Highly charged religious/political term with extreme polarisation potential.', score: 40 },
  { kw: 'kafir', cat: 'Religious Sensitivity', reason: 'Religiously derogatory slur — severe PR and legal exposure.', score: 50 },
  { kw: 'nationalist', cat: 'Political Neutrality', reason: 'Brand alignment with political ideology risks alienating segments.', score: 22 },
  { kw: 'freedom', cat: 'Political Neutrality', reason: 'Can carry political dog-whistle connotations in polarised India.', score: 10 },
  { kw: 'revolution', cat: 'Political Neutrality', reason: 'Revolutionary language can be read as politically provocative.', score: 14 },
  { kw: 'cheap', cat: 'Gender & Social Tone', reason: 'Risk of classist or exploitative brand connotations.', score: 15 },
  { kw: 'maid', cat: 'Gender & Social Tone', reason: 'Referencing domestic help roles can reinforce classist hierarchies.', score: 20 },
  { kw: 'fairness', cat: 'Gender & Social Tone', reason: 'Skin-tone fairness claims carry legal and reputational risk.', score: 28 },
  { kw: 'whitening', cat: 'Gender & Social Tone', reason: 'Explicit skin-whitening claims are banned under ASCI/DTCP.', score: 40 },
  { kw: 'bang', cat: 'Sarcasm & Double Meaning', reason: 'Regional double-entendre connotations.', score: 15 },
  { kw: 'naked', cat: 'Sarcasm & Double Meaning', reason: 'Sexually suggestive language.', score: 25 },
  { kw: 'lower caste', cat: 'Caste & Community Risk', reason: 'Direct caste-referencing is legally sensitive.', score: 50 },
  { kw: 'dalit', cat: 'Caste & Community Risk', reason: 'Using community identity terms commercially is exploitative.', score: 45 },
  { kw: 'brahmin', cat: 'Caste & Community Risk', reason: 'Caste identity references polarise audiences.', score: 40 },
  { kw: 'fuck', cat: 'Profanity & Offensive Language', reason: 'Explicit profanity guarantees severe PR damage.', score: 80 },
  { kw: 'cunt', cat: 'Profanity & Offensive Language', reason: 'Extreme profanity will result in immediate platform bans.', score: 90 }
];
```

Sensitivity multiplier:
- Maximum: 1.4×
- Standard: 1.0×
- Low: 0.6×

### 7.5 Frontend Critical Term Guard

Before rendering any offline result, the frontend checks for severe terms and hard-caps scores:

| Term | Score Cap | Risk Level |
|---|---|---|
| `mutthi` / `mutthi maro` | 5 | High Risk |
| `chut` | 5 | High Risk |
| `nude` / `nude search` | 12 | High Risk |
| `sexy` / `adult` | 45 | Caution / High Risk |
| `fuck`, `shit`, `bastard`, `asshole`, `bitch`, `crap`, `vulgar` | 12 | High Risk |

### 7.6 JSON Extraction

Both frontend and backend normalize model outputs:

```javascript
function extractJsonPayload(rawText) {
  const clean = String(rawText || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(clean);
  } catch (_) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('The AI response did not contain valid JSON.');
    return JSON.parse(match[0]);
  }
}
```

```python
def _extract_json(self, text: str) -> Dict[str, Any]:
    clean = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", clean)
        if match:
            return json.loads(match.group(0))
        raise
```

---

## 8. Authentication System

### 8.1 Google OAuth Flow

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleGoogleAuthCallback"
     data-auto_prompt="false">
</div>
```

### 8.2 Auth Module (assets/js/auth.js)

```javascript
function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

function getAuthUser() {
  const userStr = localStorage.getItem('BC_AUTH_USER');
  return userStr ? JSON.parse(userStr) : null;
}

function signOutUser() {
  localStorage.removeItem('BC_AUTH_USER');
  window.dispatchEvent(new CustomEvent('gauth:logout'));
}

window.handleGoogleAuthCallback = function(response) {
  if (response && response.credential) {
    const user = decodeJWT(response.credential);
    if (user) {
      user.credential = response.credential;  // raw JWT for backend
      localStorage.setItem('BC_AUTH_USER', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('gauth:login', { detail: user }));
    }
  }
};
```

### 8.3 Auth User Schema

```json
{
  "sub": "123456789",
  "name": "User Name",
  "given_name": "User",
  "family_name": "Name",
  "picture": "https://lh3.googleusercontent.com/...",
  "email": "user@example.com",
  "credential": "eyJhbG...NiIs..."
}
```

### 8.4 Sending Auth to Backend

```javascript
const headers = { 'Content-Type': 'application/json' };
const authUser = getAuthUser();
if (authUser && authUser.credential) {
  headers['X-BrandCheck-Auth'] = authUser.credential;
}

const res = await fetch(`${BACKEND_URL}/v1/analyze`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ text: campaignCopy, market: 'IN-NAT' })
});
```

### 8.5 Production JWT Verification

```python
import jwt
from jwt import PyJWKClient

def verify_google_token(token: str) -> dict:
    jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
    jwks_client = PyJWKClient(jwks_url)
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=GOOGLE_CLIENT_ID,
        issuer="https://accounts.google.com"
    )
```

---

## 9. Deployment Guide

### 9.1 Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your DEFAULT_API_KEY

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
# From project root
python -m http.server 8080
```

Configure `BACKEND_URL` in both `index.html` and `assets/js/sandbox.js`:
```javascript
const BACKEND_URL = "http://localhost:8000";
```

### 9.2 Production Deployment

**Backend Options:**

| Platform | Command | Notes |
|---|---|---|
| Vercel | `vercel --prod` | Serverless, auto-scaling |
| Render | Git push | Persistent, good for caching |
| Railway | `railway up` | Easy env var management |
| Fly.io | `fly deploy` | Edge deployment |

**Frontend:**
- Vercel: Connect GitHub repo
- Netlify: Drag-and-drop or Git
- Cloudflare Pages: Native integration

**CORS Configuration:**
Update `backend/main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://brandcheckpro.in", "https://www.brandcheckpro.in"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
```

### 9.3 Setting the Operator-Paid Key

1. Obtain an API key from any supported provider (OpenRouter, Google AI Studio, OpenAI, Anthropic, or another OpenRouter-compatible service).
2. Open `backend/.env`.
3. Paste it into **only** this line:
   ```bash
   DEFAULT_API_KEY="your-key-here"
   ```
4. Ensure `backend/.env` is listed in `.gitignore`.
5. Set `BACKEND_URL` in `index.html` and `assets/js/sandbox.js` to your deployed backend host.

---

## 10. Security Checklist

- [x] `.env` file added to `.gitignore`
- [x] `DEFAULT_API_KEY` never appears in frontend code
- [x] Backend CORS restricted to production domains before launch
- [x] Google OAuth client ID restricted to production origins
- [x] HTTPS enforced in production (HSTS)
- [ ] Rate limiting implemented on backend
- [ ] JWT verification enabled for production
- [x] Input sanitization on all text fields (XSS prevention)
- [ ] API key rotation schedule established
- [ ] Backend IP tracking moved from in-memory set to Redis/database for multi-instance deployments

---

## 11. Feature Roadmap

| Version | Feature | Status |
|---|---|---|
| 1.0 | Basic heuristic analysis | ✅ Complete |
| 1.1 | BYOK support | ✅ Complete |
| 2.0 | Backend gateway | ✅ Complete |
| 2.1 | Universal BYOK (any provider key) | ✅ Complete |
| 2.2 | Multi-language support (Hindi, Tamil, Telugu) | 🚧 Planned |
| 2.3 | Batch analysis UI | 🚧 Planned |
| 3.0 | Chrome extension | 🚧 Planned |
| 3.1 | Team workspaces | 🚧 Planned |
| 4.0 | Custom rule engine | 🚧 Planned |

---

## 12. IIMC Footer Attribution

All pages must display the following footer:

```html
<footer class="iimc-footer">
  <p>BrandCheck Pro is a thesis project for IIMC (Indian Institute of Mass Communication).</p>
  <p>
    <a href="https://iimc.gov.in/" target="_blank" rel="noopener">IIMC Official Website</a> |
    <a href="https://www.iimcalumni.in/" target="_blank" rel="noopener">IIMC Alumni Portal</a> |
    <a href="https://www.iimcalumni.in/awards" target="_blank" rel="noopener">IIMCAA Awards</a>
  </p>
</footer>
```

---

## Appendix A: Provider API References

### OpenRouter
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `qwen/qwen-2.5-72b-instruct:free`
- Headers: `Authorization: Bearer <KEY>`

### Google AI Studio
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent`
- Models: `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`
- Auth: Query param `?key=AIza...`

### OpenAI
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini`
- Headers: `Authorization: Bearer <KEY>`

### Anthropic
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-3-5-haiku-20241022`
- Headers: `x-api-key: <KEY>`

### Custom / Unknown Provider
- If the key prefix does not match the table in Section 3.3, the frontend and backend attempt to call it as an OpenRouter-compatible chat/completions endpoint.
- Users may need to provide a custom base URL in future versions.

---

*Document Version: 2.1*  
*Last Updated: 2026-06-30*  
*Author: BrandCheck Pro Engineering Team*
