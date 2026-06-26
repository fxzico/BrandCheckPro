"""
BrandCheck Pro — Central Configuration Control Panel.
Decoupled environment architectures for acqui-hire audit compliance.
"""
import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

class BrandCheckConfig:
    # --- AI INFERENCE ENGINE ROUTING ---
    # Options: "GOOGLE_AI_STUDIO", "OPENAI", "ANTHROPIC", "LOCAL_MOCK"
    ACTIVE_LLM_PROVIDER: str = os.getenv("BRANDCHECK_PROVIDER", "GOOGLE_AI_STUDIO")
    
    MODEL_VARIANTS: Dict[str, str] = {
        "GOOGLE_AI_STUDIO": "gemini-1.5-flash",
        "OPENAI": "gpt-4o-mini",
        "ANTHROPIC": "claude-3-5-haiku",
        "LOCAL_MOCK": "heuristic-engine-v1"
    }
    
    # --- COMMERCIAL GATEWAY AND PAYWALL OVERRIDES ---
    MONETIZATION_ENABLED: bool = False  # Set TRUE to trigger paywall middleware checks
    FREE_TIER_MONTHLY_SCANS: int = 10
    
    # --- SECURITY KEYS AND CREDENTIALS ---
    GOOGLE_AI_STUDIO_KEY: str = os.getenv("GOOGLE_AI_STUDIO_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    @classmethod
    def get_selected_model(cls) -> str:
        """Resolves active string mapping for target LLM inference client."""
        return cls.MODEL_VARIANTS.get(cls.ACTIVE_LLM_PROVIDER, "gemini-1.5-flash")
    
    @classmethod
    def is_paid_gate_active(cls) -> bool:
        """Determines if structural monetized validation protocols must execute."""
        return cls.MONETIZATION_ENABLED
