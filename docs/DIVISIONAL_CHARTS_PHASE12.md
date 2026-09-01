# Shodashavarga (16 Divisional Charts) Engine (Phase 12)

## 1. Overview
In Vedic Astrology (Brihat Parashara Hora Shastra), divisional charts (Vargas) divide each 30° Rashi into harmonic segments to analyze specific dimensions of human destiny.

---

## 2. Complete Shodashavarga Specification

| Varga | Division Name | Segment Arc | Domain / Significations | Classical Calculation Rule |
|---|---|---|---|---|
| **D1** | Rashi | 30° 00' | Physical body, general vitality | Same sign as natal longitude |
| **D2** | Hora | 15° 00' | Wealth, financial prosperity | Odd signs: Sun (Leo) / Moon (Cancer); Even signs: Moon (Cancer) / Sun (Leo) |
| **D3** | Drekkana | 10° 00' | Siblings, courage, initiatives | 0-10° 1st sign; 10-20° 5th sign; 20-30° 9th sign |
| **D4** | Chaturthamsa | 07° 30' | Fixed assets, properties, fortune | 1st, 4th, 7th, 10th signs from natal sign |
| **D7** | Saptamsa | 04° 17' 08.57" | Children, progeny, dynasty | Odd signs: start from sign itself; Even signs: start from 7th sign |
| **D9** | Navamsha | 03° 20' | Dharma, marriage, inner potential | Fire: Aries; Earth: Capricorn; Air: Libra; Water: Cancer |
| **D10** | Dashamsha | 03° 00' | Career, status, public reputation | Odd signs: start from sign itself; Even signs: start from 9th sign |
| **D12** | Dwadashamsa | 02° 30' | Parents, lineage, ancestral karma | Starts from the sign itself for all signs |
| **D16** | Shodasamsa | 01° 52' 30" | Vehicles, conveyance, material joys | Movable: Aries; Fixed: Leo; Dual: Sagittarius |
| **D20** | Vimsamsa | 01° 30' | Spiritual progress, upasana | Movable: Aries; Fixed: Sagittarius; Dual: Leo |
| **D24** | Chaturvimsamsa | 01° 15' | Higher intellect, scholarship | Odd signs: start from Leo; Even signs: start from Cancer |
| **D27** | Bhamsa | 01° 06' 40" | Core strengths & weaknesses | Fire: Aries; Earth: Cancer; Air: Libra; Water: Capricorn |
| **D30** | Trimsamsa | Unequal (5°) | Misfortunes, karmic debts, evils | Parashari 5 planet divisions (Mars, Saturn, Jup, Mer, Ven) |
| **D40** | Khavedamsa | 00° 45' | Auspicious & inauspicious fruits | Odd signs: start from Aries; Even signs: start from Libra |
| **D45** | Akshavedamsa | 00° 40' | Character, integrity, moral nature | Movable: Aries; Fixed: Leo; Dual: Sagittarius |
| **D60** | Shashtiamsa | 00° 30' | Root karma, past-life impressions | Starts from the sign itself, cycling 5 times through 12 signs |

---

## 3. Mathematical Verification & Reusability
All 16 charts are generated deterministically via the universal `calculateDivisionalChart(ascendant, planets, division)` API with 0°/360° boundary safety and strict integer house mappings.
