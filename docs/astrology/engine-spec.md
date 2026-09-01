# Vedic Astrology Calculation Engine Specification (Phase 3)

## 1. Astronomical Foundation & Ephemeris

* **Library:** `astronomy-engine` (v2.1.19)
* **Ephemeris Method:** VSOP87 planetary theory & NASA JPL DE405 lunar / planetary models.
* **Precision:** Sub-arcsecond geocentric celestial coordinates for historical and modern epochs (1800–2200 CE).
* **Execution Environment:** 100% pure TypeScript / JavaScript with zero native binary C++ dependencies (runs identically across Linux, Windows, and macOS).
* **Julian Day Conversion:** Standard Gregorian astronomical Julian Day algorithm with fractional UTC time.

---

## 2. Ayanamsa & Zodiac System

* **Zodiac:** Sidereal Zodiac ($0^\circ \le \lambda < 360^\circ$).
* **Ayanamsa System:** Chitra Paksha / Lahiri Ayanamsa.
* **Epoch Value:** J2000.0 ($JD = 2451545.0$): $23^\circ 51' 25.532" = 23.85709222^\circ$.
* **Precession Model:** IAU standard mean precession rate ($50.290966" / \text{Julian year} \approx 1.3969713^\circ / \text{century}$).
* **Transformation Formula:**
  $$\lambda_{\text{sidereal}} = (\lambda_{\text{tropical}} - \text{Ayanamsa}) \pmod{360^\circ}$$

---

## 3. Ascendant (Lagna) & House System

* **Ascendant Calculation:**
  - Uses Greenwich Mean Sidereal Time (GMST) and True Obliquity of the Ecliptic ($\varepsilon$) from `astronomy-engine`.
  - Calculates Local Sidereal Time / Right Ascension of Midheaven (RAMC): $\theta = \text{GMST} + \lambda_{\text{geo}}$.
  - Ecliptic Ascendant:
    $$\tan(\lambda_{\text{Asc, trop}}) = \frac{-\cos(\theta)}{\sin(\theta) \cos(\varepsilon) + \tan(\phi) \sin(\varepsilon)}$$
  - Sidereal Ascendant: $\lambda_{\text{Asc, sidereal}} = (\lambda_{\text{Asc, trop}} - \text{Ayanamsa}) \pmod{360^\circ}$.
* **House System:** Traditional Vedic **Whole Sign Houses** (Bhava 1 = entire Ascendant sign, Bhava 2 = next sign, ..., Bhava 12 = 12th sign).

---

## 4. Lunar Nodes (Rahu & Ketu)

* **Methodology:** Mean Lunar Ascending Node (IAU standard polynomial).
* **Motion:** Perpetual retrograde motion.
* **Ketu:** Positioned exactly $180^\circ$ opposite Rahu ($\lambda_{\text{Ketu}} = (\lambda_{\text{Rahu}} + 180^\circ) \pmod{360^\circ}$).

---

## 5. Nakshatras & Padas

* **27 Nakshatras:** Each spans $13^\circ 20' = 13.333333^\circ$.
* **108 Padas:** Each spans $3^\circ 20' = 3.333333^\circ$ (4 Padas per Nakshatra).
* **Planetary Lords:** Ketu $\rightarrow$ Venus $\rightarrow$ Sun $\rightarrow$ Moon $\rightarrow$ Mars $\rightarrow$ Rahu $\rightarrow$ Jupiter $\rightarrow$ Saturn $\rightarrow$ Mercury.

---

## 6. Divisional Charts (Vargas)

### D1 (Rashi Chart)
Primary natal positions, ascendant, and whole-sign house placements.

### D9 (Navamsha Chart)
Each sign divided into 9 segments of $3^\circ 20'$:
* **Fire Signs** (Aries 1, Leo 5, Sagittarius 9): Segments 0–8 map to Aries (1) through Sagittarius (9).
* **Earth Signs** (Taurus 2, Virgo 6, Capricorn 10): Segments 0–8 map to Capricorn (10) through Virgo (6).
* **Air Signs** (Gemini 3, Libra 7, Aquarius 11): Segments 0–8 map to Libra (7) through Gemini (3).
* **Water Signs** (Cancer 4, Scorpio 8, Pisces 12): Segments 0–8 map to Cancer (4) through Pisces (12).

### D10 (Dashamsha Chart)
Each sign divided into 10 segments of $3^\circ 00'$:
* **Odd Signs** (1, 3, 5, 7, 9, 11): Segments 0–9 start from the sign itself.
* **Even Signs** (2, 4, 6, 8, 10, 12): Segments 0–9 start from the 9th sign from itself.

---

## 7. Planetary Dignities & Vedic Aspects

* **Dignities:** Exaltation (Uchcha), Debilitation (Neecha), Moolatrikona, Own Sign (Swa Kshetra), Friend (Mitra), Neutral (Sama), Enemy (Shatru).
* **Combustion (Asta):** Angular distance from Sun (Moon $12^\circ$, Mars $17^\circ$, Mercury $14^\circ$, Jupiter $11^\circ$, Venus $10^\circ$, Saturn $15^\circ$).
* **Vedic Aspects (Drishti):**
  - All Grahas: 7th aspect ($180^\circ$).
  - Mars: 4th and 8th aspects.
  - Jupiter, Rahu, Ketu: 5th and 9th trine aspects.
  - Saturn: 3rd and 10th aspects.

---

## 8. Vimshottari Dasha Engine

* **Total Span:** 120 years.
* **Periods:** Ketu (7y), Venus (20y), Sun (6y), Moon (10y), Mars (7y), Rahu (18y), Jupiter (16y), Saturn (19y), Mercury (17y).
* **Starting Balance at Birth:** Computed directly from Moon's elapsed fraction within its birth Nakshatra.
* **Hierarchy:** 3 levels (Mahadasha $\rightarrow$ Antardasha $\rightarrow$ Pratyantardasha) calculated with exact astronomical fractional date arithmetic.

---

## 9. Panchang & Muhurta Engines

* **Tithi:** 30 lunar days (15 Shukla Paksha + 15 Krishna Paksha) based on $(\lambda_{\text{Moon}} - \lambda_{\text{Sun}}) / 12^\circ$.
* **Vara:** 7 solar weekdays with planetary rulers.
* **Nakshatra:** Moon's sidereal Nakshatra position.
* **Yoga:** 27 Yogas based on $(\lambda_{\text{Sun}} + \lambda_{\text{Moon}}) / 13^\circ 20'$.
* **Karana:** 60 half-tithis (4 fixed + 7 repeating).
* **Sun Times:** Astronomical Sunrise, Sunset, and Solar Noon.
* **Muhurta Windows:**
  - Rahu Kaal, Gulika Kaal, Yamaganda Kaal (daytime octants).
  - Abhijit Muhurta (8th of 15 daytime muhurtas).
  - Brahma Muhurta (96m to 48m prior to sunrise).

---

## 10. Performance Benchmarks

* **Full Chart Calculation:** $< 5\text{ ms}$ per chart.
* **Panchang Calculation:** $< 3\text{ ms}$.
* **Transit Calculation:** $< 2\text{ ms}$.
* **Determinism:** 100% identical output for identical birth parameters.
