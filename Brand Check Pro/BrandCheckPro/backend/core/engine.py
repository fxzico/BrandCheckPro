"""
BrandCheck Pro — Core Compliance and Inference Engine.
Architected to support scalable model updates and predictable semantic outputs.
"""
import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai

from config import BrandCheckConfig
from core.central_prompt import inject_market_context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BrandCheckEngine")

class BrandCheckEngine:
    def __init__(self):
        self.config = BrandCheckConfig()
        if self.config.ACTIVE_LLM_PROVIDER == "GOOGLE_AI_STUDIO" and self.config.GOOGLE_AI_STUDIO_KEY:
            genai.configure(api_key=self.config.GOOGLE_AI_STUDIO_KEY)
            
    def analyze_copy(self, text: str, market: str = "IN-NAT") -> Dict[str, Any]:
        """Orchestrates comprehensive copy risk profiling."""
        if not text.strip():
            return self._generate_empty_response()
            
        # Check deployment routing configurations
        if self.config.ACTIVE_LLM_PROVIDER == "LOCAL_MOCK" or not self.config.GOOGLE_AI_STUDIO_KEY:
            logger.warning("Executing local fallback heuristic compliance framework.")
            return self._execute_heuristic_fallback(text, market)
            
        try:
            system_instruction = inject_market_context(market)
            model = genai.GenerativeModel(
                model_name=self.config.get_selected_model(),
                generation_config={"response_mime_type": "application/json"}
            )
            
            combined_prompt = f"{system_instruction}\n\nAnalyze the following copy:\n\"{text}\""
            response = model.generate_content(combined_prompt)
            
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Upstream inference interface error: {str(e)}")
            return self._execute_heuristic_fallback(text, market)

    def _execute_heuristic_fallback(self, text: str, market: str) -> Dict[str, Any]:
        """Deterministic safety algorithm for execution security when offline."""
        normalized_text = text.lower()
        flagged = []
        score_deductions = 0
        
        # Local structural keyword checks matching double_meaning schemas
        rules = [
            ("bang", "Political/Social Tone", "Contextual risk associated with regional noise constraints and celebrations.", 15),
            ("maid", "Gender & Social Tone", "Classist risk vector if framing domestic support structures as commodified transactional units.", 20),
            ("cheap", "Gender & Social Tone", "Risk associated with demographic marginalization or exploitative branding semantics.", 15)
        ]
        
        for keyword, category, rationale, deduction in rules:
            if keyword in normalized_text:
                flagged.append({
                    "phrase": keyword,
                    "category": category,
                    "rationale": f"[HEURISTIC EVALUATION] {rationale}"
                })
                score_deductions += deduction
                
        final_score = max(100 - score_deductions, 30)
        risk_level = "Safe" if final_score >= 90 else "Caution" if final_score >= 70 else "High Risk"
        
        return {
            "overall_score": final_score,
            "risk_level": risk_level,
            "summary": "Heuristic fallback processing executed successfully. Validate your local API keys for AI Studio parsing.",
            "flagged_issues": flagged
        }

    def _generate_empty_response(self) -> Dict[str, Any]:
        return {
            "overall_score": 100,
            "risk_level": "Safe",
            "summary": "Zero content provided for analysis.",
            "flagged_issues": []
        }
