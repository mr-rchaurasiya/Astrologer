# Astronomical Transit Events Specification

## 1. Overview

The **Transit Timeline Engine** calculates significant astronomical milestones for slow and medium-moving planets (**Jupiter, Saturn, Rahu, Ketu, Mars**) against the native's verified birth chart coordinates.

---

## 2. Event Types & Detection Rules

1. **Sign Ingress (`ingress`)**:
   - Detected when a planet crosses from sign $S_n$ to sign $S_{n+1}$ (e.g. Jupiter enters Gemini).
   - High significance for major transit lords (Jupiter, Saturn, Rahu, Ketu).
2. **Retrograde Station (`retrograde`)**:
   - Detected when a planet's apparent sidereal speed changes from positive to negative.
   - Traditional interpretation: Period of reflection, reassessment, and internalization of the planet's karaka significations.
3. **Direct Station (`direct`)**:
   - Detected when a planet resumes forward direct motion.
   - Traditional interpretation: Restoration of forward momentum.
4. **Natal Conjunctions (`natal_conjunction` / `sade_sati`)**:
   - **Saturn over Natal Moon**: Marks the central peak of the 7.5-year *Sade Sati* cycle.
   - **Jupiter over Natal Moon**: Forms Gochara *Gajakesari* influence, supporting mental clarity, peace, and spiritual growth.
   - **Transits over 1st House (Lagna)**: Direct impact on physical vitality, self-expression, and personal direction.

---

## 3. Endpoints

* `GET /api/v1/astrology/transits/timeline?profileId=<id>&daysAhead=365`
* `GET /api/v1/astrology/transits/daily?profileId=<id>&date=YYYY-MM-DD`
