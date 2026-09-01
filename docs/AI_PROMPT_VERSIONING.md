# AI Prompt Architecture & Versioning Strategy

## Overview
The AI Consultation Layer formalizes system prompts into explicit, version-controlled builder modules (`server/src/ai/prompts/systemPrompts.ts`). This ensures prompt changes are traceable, testable, and backwards-compatible with existing chat sessions.

---

## 1. Active Prompt Version: `v2.0`

### Key Guardrails in `v2.0`
1. **Authoritative Context Binding**: Explicit instruction prohibiting the AI from calculating or hallucinating planetary longitudes or dasha dates; all planetary facts originate from the backend calculation engine.
2. **Ayurvedic Energetic Framing**: Medical questions are constrained to classical Ayurvedic dosha balance (Vata/Pitta/Kapha) with mandatory clinical disclaimers.
3. **Purushartha Over Fatalism**: Classical philosophical doctrine that planetary alignments indicate karmic inclinations (Prarabdha), while conscious human effort (Purushartha) and spiritual discernment shape the outcome.
4. **Bilingual Support**: Native English and Hindi prompt archetypes.

---

## 2. Session Context Metadata

When messages are saved to the `ChatMessage` collection, the prompt version is persisted in the message metadata:
```json
{
  "role": "assistant",
  "content": "...",
  "metadata": {
    "model": "gpt-4o-mini",
    "promptVersion": "2.0",
    "responseTimeMs": 640
  }
}
```
This enables regression tracking and quality benchmarking over time without breaking historical chat logs.
