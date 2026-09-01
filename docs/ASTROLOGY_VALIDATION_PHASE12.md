# Astrology Calculation Validation & Golden Reference (Phase 12)

## 1. Overview
All mathematical routines across ephemeris, divisional charts, dashas, yogas, ashtakavarga, shadbala, transits, and compatibility are deterministically validated against mathematical standards.

---

## 2. Validation Test Matrix

| Validation Area | Test Suite | Validation Criteria | Status |
|---|---|---|---|
| **Astronomical Accuracy** | `phase12Accuracy.test.ts` | 0°/360° wrapping, leap-year midnight, retrograde planetary states | **VERIFIED** |
| **Shodashavarga (16 Vargas)** | `divisionalCharts.test.ts` | All 16 divisional charts (D1 to D60) with accurate mathematical mappings | **VERIFIED** |
| **Multi-Dasha Systems** | `dashas.test.ts` | Vimshottari (120y), Yogini (36y), Ashtottari (108y) balance & transitions | **VERIFIED** |
| **Yoga Detection** | `yogas.test.ts` | Parashari classical combinations, Raja/Dhana/Mahapurusha/Vipareeta Yogas | **VERIFIED** |
| **Ashtakavarga** | `ashtakavarga.test.ts` | Classical BAV planetary bindus, SAV exact 337 total bindus | **VERIFIED** |
| **Shadbala Strength** | `shadbala.test.ts` | 6-fold virupa/rupa breakdown, required benchmarks, relative rankings | **VERIFIED** |
| **Advanced Transits** | `transits.test.ts` | Gochar houses from Lagna/Moon, Sade Sati 3 phases, Kantaka Shani | **VERIFIED** |
| **Ashtakoota Milan** | `compatibility.test.ts` | 36-point Guna Milan, 8 Kootas, Kuja (Mangal) Dosha cancellation | **VERIFIED** |
| **Golden Reference Dataset** | `phase12Regression.test.ts` | 5 benchmark reference profiles across distinct geographical/temporal zones | **VERIFIED** |
