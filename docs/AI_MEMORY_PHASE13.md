# AI Long-Term Memory & Conflict Resolution (Phase 13)

## 1. Overview
The Memory System maintains persistent user preferences, goals, and contextual facts with confidence ranking and deterministic conflict resolution.

---

## 2. Confidence Hierarchy

| Confidence Level | Score Range | Source | Conflict Precedence |
|---|---|---|---|
| **VERIFIED** | 1.00 | User explicit confirmation / profile fact | Highest precedence; cannot be overwritten by inferences |
| **HIGH** | 0.80 - 0.95 | Explicit user statement in chat | Supersedes previous values; creates revision timestamp |
| **MEDIUM** | 0.50 - 0.70 | Session summary / strong inference | Updates matching inferences; yield to explicit statements |
| **LOW** | 0.20 - 0.40 | Tentative AI deduction | Easily decayed; overridden by any higher tier |

---

## 3. Conflict Resolution Engine
- When a new memory shares a key with an existing memory for the user:
  - If the new statement is `user_explicit`, it automatically overwrites the old memory.
  - If the old statement is `user_explicit` and the new is `inferred`, the explicit statement is preserved.
  - Contradictory facts are never silently merged.
