"""
BrandCheck Pro — Production ASGI Gateway Layer.
Implements data validation boundaries and runtime paywall interceptors.
"""
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time

from config import BrandCheckConfig
from core.engine import BrandCheckEngine

app = FastAPI(
    title="BrandCheck Pro Core API",
    version="1.0.0",
    description="Enterprise API Infrastructure for Pre-Crisis Validation Processing."
)

# Enforce secure CORS parameters allowing extension cross-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific Chrome extension IDs in direct production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = BrandCheckEngine()

# --- PYDANTIC SCHEMAS ---
class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Target marketing copy input.")
    market: Optional[str] = Field("IN-NAT", description="Target geo-cultural market code.")

class IssueDetail(BaseModel):
    phrase: str
    category: str
    rationale: str

class AnalysisResponse(BaseModel):
    overall_score: int
    risk_level: str
    summary: str
    flagged_issues: List[IssueDetail]

class BatchAnalysisRequest(BaseModel):
    payloads: List[AnalysisRequest] = Field(..., max_length=50)

# --- MONETIZATION GATEWAY MIDDLEWARE ---
@app.middleware("http")
async def verify_entitlement_clearance(request: Request, call_next):
    """Intercepts execution frames to check software licensing states."""
    if request.url.path in ["/v1/analyze", "/v1/batch"] and BrandCheckConfig.is_paid_gate_active():
        # Read simulation access configurations or platform headers
        client_tier = request.headers.get("X-BrandCheck-Tier", "Free")
        if client_tier != "EnterprisePaid":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Analysis usage bounds exhausted. Upgrade to BrandCheck Pro Enterprise to proceed."
            )
    return await call_next(request)

# --- ENDPOINTS ---
@app.get("/v1/health")
async def get_system_health():
    """Returns infrastructure health parameters."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "provider_routing": BrandCheckConfig.ACTIVE_LLM_PROVIDER,
        "monetization_gate_active": BrandCheckConfig.is_paid_gate_active()
    }

@app.post("/v1/analyze", response_model=AnalysisResponse)
async def analyze_single_copy(payload: AnalysisRequest, request: Request):
    """Evaluates single tracking instances for pre-crisis exposure."""
    try:
        auth_header = request.headers.get("Authorization")
        client_key = auth_header.replace("Bearer ", "").strip() if auth_header else None
        
        result = engine.analyze_copy(payload.text, payload.market, api_key=client_key)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Core execution exception encountered: {str(e)}"
        )

@app.post("/v1/batch")
async def analyze_batch_copy(payload: BatchAnalysisRequest, request: Request):
    """Processes array vectors in parallel for automated pipeline operations."""
    auth_header = request.headers.get("Authorization")
    client_key = auth_header.replace("Bearer ", "").strip() if auth_header else None
    
    batch_results = []
    for item in payload.payloads:
        start_time = time.time()
        analysis = engine.analyze_copy(item.text, item.market, api_key=client_key)
        batch_results.append({
            "text_preview": item.text[:30] + "...",
            "analysis": analysis,
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        })
    return {"batch_size": len(payload.payloads), "results": batch_results}

@app.get("/v1/markets")
async def get_supported_markets():
    """Returns explicit mapping arrays of cultural risk modules."""
    return {
        "supported_regions": [
            {"code": "IN-NAT", "label": "India (National Balance Layer)"},
            {"code": "IN-HN", "label": "Hindi-Belt Metropolitan Markets"},
            {"code": "IN-SO", "label": "Southern Peninsular Consumer Base"},
            {"code": "GCC-CR", "label": "MENA Crossover Demographics"}
        ]
    }
