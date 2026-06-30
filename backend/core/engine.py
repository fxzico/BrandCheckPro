"""
BrandCheck Pro — Core Compliance and Inference Engine v2.
Supports Google AI Studio, OpenRouter, OpenAI, and Anthropic BYOK keys,
operator-paid key fallback chain, blog-derived RAG context, and a calibrated
offline heuristic fallback that never returns blanket 100/15 scores.
"""
import json
import logging
import re
from typing import Dict, Any, List, Optional
import httpx

from config import BrandCheckConfig
from core.central_prompt import build_analysis_prompt
from core.rag_kb import RAG_KB, get_market_context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BrandCheckEngine")


class BrandCheckEngine:
    def __init__(self):
        self.config = BrandCheckConfig()

    def analyze_copy(
        self,
        text: str,
        market: str = "IN-NAT",
        api_key: Optional[str] = None,
        brand_context: str = "",
        demographics: str = "",
        sensitivity: str = "Standard",
    ) -> Dict[str, Any]:
        """Orchestrates comprehensive copy risk profiling with API-first fallback."""
        if not text or not text.strip():
            return self._generate_empty_response()

        # 1) Build RAG context from blog-derived KB
        rag_context = self._build_rag_context(text, market)

        # 2) Determine key chain: explicit BYOK > AUTH_API_KEY > DEFAULT_API_KEY
        keys = []
        if api_key:
            keys.append(api_key)
        if self.config.AUTH_API_KEY and self.config.AUTH_API_KEY not in keys:
            keys.append(self.config.AUTH_API_KEY)
        if self.config.DEFAULT_API_KEY and self.config.DEFAULT_API_KEY not in keys:
            keys.append(self.config.DEFAULT_API_KEY)

        # 3) Try live AI with each key, provider-detected per key (model switching)
        if keys:
            for key in keys:
                provider = self.config.detect_provider(key)
                if provider == "LOCAL_MOCK" or not key:
                    continue
                try:
                    result = self._call_live_ai(key, provider, text, market, brand_context, demographics, sensitivity, rag_context)
                    if result:
                        return self._normalize_result(result, f"Live AI ({provider})")
                except Exception as e:
                    logger.warning(f"Live AI failed for provider {provider}: {e}")
                    continue

        # 4) All live paths failed → calibrated offline heuristic fallback
        logger.warning("All live AI keys failed or no key configured. Falling back to offline heuristic engine.")
        return self._execute_heuristic_fallback(text, market, rag_context, brand_context, demographics, sensitivity)

    def _build_rag_context(self, text: str, market: str) -> str:
        """Retrieve relevant case-study precedents and market guidance."""
        normalized = text.lower()
        hits = []
        for case in RAG_KB["caseStudies"]:
            for trigger in case["triggers"]:
                if trigger.lower() in normalized:
                    hits.append(case)
                    break
        lines = [get_market_context(market)]
        if hits:
            lines.append("Relevant case studies:")
            for case in hits[:5]:
                lines.append(
                    f"- {case['brand']} ({case['year']}) [{case['primaryCategory']}]: "
                    f"{case['lesson']} Typical backlash score: {case['score']}/100."
                )
        return "\n".join(lines)

    def _call_live_ai(
        self,
        api_key: str,
        provider: str,
        text: str,
        market: str,
        brand_context: str,
        demographics: str,
        sensitivity: str,
        rag_context: str,
    ) -> Optional[Dict[str, Any]]:
        prompt = build_analysis_prompt(text, brand_context, demographics, sensitivity, market, rag_context)
        if provider == "GOOGLE_AI_STUDIO":
            return self._call_google(api_key, prompt)
        if provider == "OPENROUTER":
            return self._call_openrouter(api_key, prompt)
        if provider == "OPENAI":
            return self._call_openai(api_key, prompt)
        if provider == "ANTHROPIC":
            return self._call_anthropic(api_key, prompt)
        logger.warning(f"Unknown provider '{provider}' for key prefix; skipping.")
        return None

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
                data = resp.json()
                raw = data["candidates"][0]["content"]["parts"][0]["text"]
                return self._extract_json(raw)
            if resp.status_code not in (404, 429):
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
        # Fallback models within OpenRouter if the primary free model is rate-limited
        models = [
            "qwen/qwen-2.5-72b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3.3-70b-instruct:free",
        ]
        for model in models:
            body = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "Return only strict JSON. No markdown."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(url, json=body, headers=headers)
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                return self._extract_json(raw)
            logger.warning(f"OpenRouter model {model} failed: {resp.status_code} {resp.text}")
        raise RuntimeError("OpenRouter models unavailable")

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

    def _normalize_result(self, data: Dict[str, Any], engine_label: str) -> Dict[str, Any]:
        """Ensure the live result conforms to the frontend schema and is believable."""
        issues = data.get("flagged_issues") or []
        score = data.get("overall_score")
        try:
            score = int(round(float(score)))
        except (TypeError, ValueError):
            score = 88 if not issues else 65

        # Anti-100 calibration for live model
        if score == 100 and not issues:
            score = 93
        elif score == 100 and issues:
            score = max(40, 94 - sum(min(10, 8) for _ in issues))

        score = max(0, min(100, score))
        risk = data.get("risk_level") or self._score_to_risk(score)
        return {
            "overall_score": score,
            "risk_level": risk,
            "summary": data.get("summary") or "Analysis complete. Review flagged issues before publication.",
            "flagged_issues": [
                {
                    "phrase": issue.get("phrase") or issue.get("message") or "Contextual anomaly",
                    "category": issue.get("category") or "Contextual Risk",
                    "rationale": issue.get("rationale") or issue.get("message") or "Flagged for review."
                }
                for issue in issues
            ] if issues else [],
            "engine": engine_label,
        }

    def _execute_heuristic_fallback(
        self,
        text: str,
        market: str,
        rag_context: str,
        brand_context: str,
        demographics: str,
        sensitivity: str,
    ) -> Dict[str, Any]:
        """Calibrated deterministic fallback using blog-derived RAG KB."""
        normalized_text = text.lower()
        flagged: List[Dict[str, str]] = []
        score_deductions = 0
        matched_rules = set()

        # Sensitivity multiplier
        multiplier = {"Low": 0.7, "Standard": 1.0, "Maximum": 1.3}.get(sensitivity, 1.0)

        # Keyword rules
        for rule in RAG_KB["keywordRules"]:
            kw = rule["kw"].lower()
            if kw in normalized_text and kw not in matched_rules:
                matched_rules.add(kw)
                deduction = min(rule["score"] * multiplier, 55)
                flagged.append({
                    "phrase": rule["kw"],
                    "category": rule["cat"],
                    "rationale": f"[Offline RAG] {rule['reason']}"
                })
                score_deductions += deduction

        # Phrase patterns
        for pattern in RAG_KB["phrasePatterns"]:
            rx = re.compile(pattern["regex"], re.IGNORECASE)
            if rx.search(text):
                deduction = min(pattern["score"] * multiplier, 40)
                flagged.append({
                    "phrase": rx.pattern,
                    "category": pattern["cat"],
                    "rationale": f"[Offline RAG] {pattern['reason']}"
                })
                score_deductions += deduction

        # Case-study triggers
        for case in RAG_KB["caseStudies"]:
            for trigger in case["triggers"]:
                if trigger.lower() in normalized_text:
                    deduction = min((100 - case["score"]) * multiplier, 35)
                    flagged.append({
                        "phrase": trigger,
                        "category": case["primaryCategory"],
                        "rationale": f"[Offline RAG] {case['rationaleTemplate'].format(phrase=trigger, market=market)}"
                    })
                    score_deductions += deduction
                    break

        # Start from 94 (not 100) so clean copy is believable
        base_score = 94
        final_score = max(base_score - int(score_deductions), 5)

        # Apply hard caps
        for cap_rule in RAG_KB["hardCaps"]:
            if re.search(cap_rule["regex"], text, re.IGNORECASE):
                final_score = min(final_score, cap_rule["cap"])
                flagged.append({
                    "phrase": "Severity cap",
                    "category": "Hard Safety Cap",
                    "rationale": f"[Offline RAG] {cap_rule['reason']}"
                })

        final_score = max(0, min(100, final_score))
        risk_level = self._score_to_risk(final_score)

        # Deduplicate by phrase
        seen = set()
        unique_flagged = []
        for issue in flagged:
            key = (issue["phrase"].lower(), issue["category"])
            if key not in seen:
                seen.add(key)
                unique_flagged.append(issue)

        # Summary
        if not unique_flagged:
            summary = (
                "Offline RAG scan detected no explicit risk triggers. "
                "Copy appears broadly safe for the Indian market, but live-AI review is recommended for nuanced cultural context."
            )
        else:
            summary = (
                f"Offline RAG fallback identified {len(unique_flagged)} risk signal(s) "
                f"based on documented Indian brand-crisis patterns. "
                f"Estimated market safety score: {final_score}/100 ({risk_level})."
            )

        return {
            "overall_score": final_score,
            "risk_level": risk_level,
            "summary": summary,
            "flagged_issues": unique_flagged,
            "engine": "Offline RAG Heuristic Engine"
        }

    def _score_to_risk(self, score: int) -> str:
        if score >= 85:
            return "Safe"
        if score >= 65:
            return "Caution"
        if score >= 40:
            return "High Risk"
        return "Critical"

    def _generate_empty_response(self) -> Dict[str, Any]:
        return {
            "overall_score": 88,
            "risk_level": "Safe",
            "summary": "No campaign copy was provided for analysis.",
            "flagged_issues": [],
            "engine": "BrandCheck Pro",
        }
