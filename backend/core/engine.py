"""
BrandCheck Pro — Core Compliance and Inference Engine.
Architected to support scalable model updates and predictable semantic outputs.
Supports Google AI Studio, OpenRouter, OpenAI, and Anthropic BYOK keys,
plus a default key for complimentary first-use-per-IP analysis.
"""
import json
import logging
from typing import Dict, Any, List
import httpx
import re

from config import BrandCheckConfig
from core.central_prompt import inject_market_context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BrandCheckEngine")

class BrandCheckEngine:
    def __init__(self):
        self.config = BrandCheckConfig()

    def analyze_copy(self, text: str, market: str = "IN-NAT", api_key: str = None) -> Dict[str, Any]:
        """Orchestrates comprehensive copy risk profiling."""
        if not text.strip():
            return self._generate_empty_response()

        active_key = api_key or self.config.GOOGLE_AI_STUDIO_KEY
        provider = self.config.detect_provider(active_key)

        if provider == "LOCAL_MOCK" or not active_key:
            logger.warning("Executing local fallback heuristic compliance framework.")
            return self._execute_heuristic_fallback(text, market)

        system_instruction = inject_market_context(market)
        combined_prompt = f"{system_instruction}\n\nAnalyze the following copy:\n\"{text}\""

        try:
            if provider == "GOOGLE_AI_STUDIO":
                return self._call_google(active_key, combined_prompt)
            if provider == "OPENROUTER":
                return self._call_openrouter(active_key, combined_prompt)
            if provider == "OPENAI":
                return self._call_openai(active_key, combined_prompt)
            if provider == "ANTHROPIC":
                return self._call_anthropic(active_key, combined_prompt)

            logger.warning(f"Unknown provider for key prefix; falling back to heuristics.")
            return self._execute_heuristic_fallback(text, market)
        except Exception as e:
            logger.error(f"Upstream inference interface error: {str(e)}")
            return self._execute_heuristic_fallback(text, market)

    def _extract_json(self, text: str) -> Dict[str, Any]:
        clean = text.replace("```json", "").replace("```", "").strip()
        try:
            return json.loads(clean)
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", clean)
            if match:
                return json.loads(match.group(0))
            raise

    def _call_google(self, api_key: str, prompt: str) -> Dict[str, Any]:
        models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(url, json=payload)
            if resp.status_code == 200:
                raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                return self._extract_json(raw)
            if resp.status_code != 404:
                logger.error(f"Gemini API Error {resp.status_code}: {resp.text}")
                break
        raise RuntimeError("Google AI Studio models unavailable")

    def _call_openrouter(self, api_key: str, prompt: str) -> Dict[str, Any]:
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
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=body, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"OpenRouter API Error {resp.status_code}: {resp.text}")
        raw = resp.json()["choices"][0]["message"]["content"]
        return self._extract_json(raw)

    def _call_openai(self, api_key: str, prompt: str) -> Dict[str, Any]:
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
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=body, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"OpenAI API Error {resp.status_code}: {resp.text}")
        raw = resp.json()["choices"][0]["message"]["content"]
        return self._extract_json(raw)

    def _call_anthropic(self, api_key: str, prompt: str) -> Dict[str, Any]:
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
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=body, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"Anthropic API Error {resp.status_code}: {resp.text}")
        raw = resp.json()["content"][0]["text"]
        return self._extract_json(raw)

    def _execute_heuristic_fallback(self, text: str, market: str = "IN-NAT") -> Dict[str, Any]:
        """Deterministic safety algorithm for execution security when offline."""
        normalized_text = text.lower()
        flagged = []
        score_deductions = 0

        rules = [
            ("sacred", "Religious Sensitivity", "Commercial use of sacred terminology risks religious backlash.", 18),
            ("mandir", "Religious Sensitivity", "Direct temple references carry significant religious sensitivity risk.", 20),
            ("cheap", "Gender & Social Tone", "Risk of classist or exploitative brand connotations.", 15),
            ("maid", "Gender & Social Tone", "Referencing domestic help roles can reinforce classist hierarchies.", 20),
            ("fairness", "Gender & Social Tone", "Skin-tone fairness claims carry legal and reputational risk.", 28),
            ("whitening", "Gender & Social Tone", "Explicit skin-whitening claims are banned under ASCI/DTCP.", 40),
            ("lower caste", "Caste & Community Risk", "Direct caste references are legally sensitive.", 50),
            ("dalit", "Caste & Community Risk", "Using community identity terms commercially is exploitative and risky.", 45),
            ("fuck", "Profanity", "Explicit profanity guarantees severe PR damage.", 80),
            ("bitch", "Profanity", "Derogatory slurs violate brand safety guidelines.", 70),
        ]

        for keyword, category, rationale, deduction in rules:
            if keyword in normalized_text:
                flagged.append({
                    "phrase": keyword,
                    "category": category,
                    "rationale": f"[HEURISTIC EVALUATION] {rationale}"
                })
                score_deductions += deduction

        final_score = max(100 - score_deductions, 10)
        risk_level = "Safe" if final_score >= 85 else "Caution" if final_score >= 65 else "High Risk" if final_score >= 40 else "Critical"

        return {
            "overall_score": final_score,
            "risk_level": risk_level,
            "summary": f"Heuristic fallback processing returned {len(flagged)} risk signal(s). Connect a Live AI key for deeper contextual analysis.",
            "flagged_issues": flagged,
            "engine": "Local Heuristic Engine"
        }

    def _generate_empty_response(self) -> Dict[str, Any]:
        return {
            "overall_score": 100,
            "risk_level": "Safe",
            "summary": "Zero content provided for analysis.",
            "flagged_issues": []
        }
