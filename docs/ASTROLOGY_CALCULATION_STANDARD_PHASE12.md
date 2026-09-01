# Astrology Calculation Methodology & Standard (Phase 12)

## 1. Specification Overview
- **Calculation Standard Version**: `2.0`
- **Ephemeris Engine**: AstronomyEngine v2.1.19 (VSOP87 planetary theory & ELP2000-82 lunar theory)
- **Ayanamsa**: Chitra Paksha (True Lahiri)
- **Zodiac**: Sidereal (Nirayana) with 12 equal 30° Rashis
- **House System**: Whole Sign House System (1st house = Lagna Rashi)
- **Time Representation**: Standard UTC converted from local civil birth time with precise timezone offset and Julian Day Number calculation

---

## 2. Mathematical Standards & Formulas

### 2.1 Coordinate Normalization
- All celestial longitudes $\lambda$ are bounded strictly in $[0, 360)^\circ$:
  $$\lambda_{\text{normalized}} = ((\lambda \bmod 360) + 360) \bmod 360$$
- Sign Index $S \in \{1, \dots, 12\}$:
  $$S = \lfloor \lambda_{\text{sidereal}} / 30 \rfloor + 1$$
- Degree within sign $D_{\text{sign}} \in [0, 30)^\circ$:
  $$D_{\text{sign}} = \lambda_{\text{sidereal}} \bmod 30$$

### 2.2 True Lahiri Ayanamsa
$$\text{Ayanamsa}(JD) = 23.85 + 0.01396 \times \frac{JD - 2451545.0}{365.25}$$

### 2.3 Nakshatra & Pada Mapping
- Total Nakshatras: 27, each spanning $13^\circ 20' = 13.333333^\circ$.
- Total Padas: 108, each spanning $3^\circ 20' = 3.333333^\circ$.
$$\text{Nakshatra Number} = \lfloor \lambda_{\text{sidereal}} / 13.333333 \rfloor + 1$$
$$\text{Pada Number} = \lfloor (\lambda_{\text{sidereal}} \bmod 13.333333) / 3.333333 \rfloor + 1$$

---

## 3. Data Flow & Layered Processing
1. **Layer 1 (Raw Astronomical Positions)**: Geocentric coordinates of 7 physical planets + 2 lunar nodes (Rahu, Ketu) + Ascendant.
2. **Layer 2 (Derived Mathematical Vargas & Cycles)**:
   - 16 Divisional Charts (D1 through D60).
   - Vimshottari (120y), Yogini (36y), and Ashtottari (108y) Dashas.
   - 8-Fold Bhinnashtakavarga and 337-Bindu Sarvashtakavarga.
   - 6-Fold Shadbala Strength in Virupas and Rupas.
3. **Layer 3 (Deterministic Astrological Rules)**:
   - Yoga detection matrix (50+ classical combinations).
   - Gochar transit impacts, Sade Sati phases, Kantaka Shani, Jupiter transits.
   - 36-Point Ashtakoota Guna Milan and Kuja Dosha analysis.
4. **Layer 4 (Insight & Narrative Explanation)**:
   - Structured JSON response models for UI presentation and optional AI contextual narration.
