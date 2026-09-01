# AI Multi-Stage Reasoning Pipeline & Fact Grounding (Phase 13)

## 1. Multi-Stage Pipeline Workflow

```
User Query
  ↓
[Stage 1: Intent Classification] (Deterministic keyword + pattern matching)
  ↓
[Stage 2: Context Selection] (Selects D1..D60, Dasha, Yogas, Transits)
  ↓
[Stage 3: Deterministic Retrieval] (Calculated ephemeris data + Ground Truth facts)
  ↓
[Stage 4: Memory & History Retrieval] (Token-budgeted compression)
  ↓
[Stage 5: LLM Synthesis] (Controlled system prompt grounded in Parashari Jyotish)
  ↓
[Stage 6: Fact Grounding Validation] (AstrologyFactValidator cross-checks signs/houses)
  ↓
[Stage 7: Safety & Remedy Filtering] (AIResponseValidator scans medical/legal/harm)
  ↓
Final Verified Output (Delivered via SSE Stream or JSON REST)
```
