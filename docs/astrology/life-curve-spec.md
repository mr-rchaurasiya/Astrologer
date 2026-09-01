# Vedic Astrology Life Curve Specification

## 1. Overview & Conceptual Grounding

The **Life Curve Engine** is an application-defined analytical and visualization tool based on classical **Parashari Vedic Astrology (Jyotish)**. It synthesizes:
1. **120-Year Vimshottari Dasha Progression** (Mahadasha, Antardasha, and Pratyantardasha periods derived from the natal Moon's Nakshatra degree).
2. **Slow-Moving Planetary Transits (Gochar)**: Real-time VSOP87 astronomical positions of Saturn, Jupiter, Rahu, and Ketu.
3. **Natal Placements & Dignities**: Whole sign houses (12 Bhavas), planetary dignities (exalted, own, friendly, debilitated), and house lordships.

---

## 2. Interpretive Dimensions (0–100 Scores)

All scores are normalized within the range of **10 to 95** to provide headroom and emphasize that these are interpretive indices, not fatalistic measurements:

1. **Overall**: General synthesized trajectory balancing worldly prosperity, spiritual expansion, and vitality.
2. **Career (Karma)**: Influenced by the 10th house, 10th lord, Sun, Saturn, Mars, and Jupiter.
3. **Finance (Artha)**: Governed by the 2nd and 11th houses, Jupiter, Venus, and Mercury.
4. **Relationships (Kama)**: Evaluated through the 7th and 5th houses, Venus, Jupiter, and Moon.
5. **Learning (Vidya)**: Anchored in the 4th and 5th houses, Mercury, and Jupiter.
6. **Health Awareness (Vitality)**: Strictly astrological vitality indicators based on the 1st/6th houses, Lagna lord, and Sun (*strictly non-medical*).
7. **Spirituality (Moksha)**: Evaluated via the 9th and 12th houses, Jupiter, Ketu, and Saturn.

---

## 3. Scoring Formulas & Modifiers

### 3.1 Dasha Shift
$$\Delta_{\text{Dasha}} = \left(0.65 \cdot W_{\text{Maha}} \cdot D_{\text{Maha}} + 0.35 \cdot W_{\text{Antar}} \cdot D_{\text{Antar}} - 1.0\right) \times 28$$
Where:
* $W$ is the natural benefic/malefic weight (Jupiter: 1.3, Venus: 1.25, Mercury: 1.1, Moon: 1.15, Sun: 1.0, Mars: 0.9, Saturn: 0.85, Rahu: 0.8, Ketu: 0.85).
* $D$ is the natal dignity multiplier (Exalted: 1.3, Moolatrikona: 1.2, Own: 1.15, Neutral: 1.0, Enemy: 0.9, Debilitated: 0.7).

### 3.2 Transit Modifiers
* **Saturn Sade Sati**:
  - Rising Phase (12th from Moon): $-6$ overall, $+8$ spirituality, $-5$ finance.
  - Peak Phase (over Moon): $-8$ overall, $+10$ spirituality, $-5$ vitality awareness.
  - Setting Phase (2nd from Moon): $-4$ overall, $+2$ finance.
* **Saturn Upachaya Transits** (3rd, 6th, 11th from Moon): $+6$ overall, $+8$ career, $+6$ finance.
* **Jupiter Auspicious Gochara** (2nd, 5th, 7th, 9th, 11th from Moon): $+8$ overall, $+8$ finance, $+8$ education, $+10$ spirituality.
* **Rahu Upachaya Transits** (3rd, 6th, 10th, 11th from Moon): $+4$ overall, $+6$ career.

---

## 4. Mandatory Disclaimer

> Life Curve scores (0–100) are application-defined visualization metrics synthesized from classical Parashari Dasha progressions and major planetary transits. They are intended for self-reflection and philosophical insight, not deterministic guarantees or medical advice.
