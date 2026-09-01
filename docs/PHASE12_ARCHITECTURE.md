# Phase 12 Architecture: Advanced Astrology Analysis Engine

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (PWA)                                     |
|  - Regional Kundli Visualization (North, South, East)                             |
|  - 16-Varga Divisional Chart Selector (D1 to D60)                                 |
|  - Multi-Dasha Timeline Explorer (Vimshottari, Yogini, Ashtottari)                |
|  - Classical Yoga Grid with Explanations & Badges                                 |
|  - Shadbala Planetary Strength Breakdown Bars & Ranks                             |
|  - Ashtakavarga BAV & SAV 337-Bindu Matrices                                      |
|  - Advanced Gochar Transits & Sade Sati Phase Visualizer                          |
|  - 36-Point Ashtakoota Compatibility (Milan) & Kuja Dosha                         |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST
+------------------------------------------v----------------------------------------+
|                                EXPRESS BACKEND API                                |
|  - Auth & Ownership Middleware (`requireAuth`, `fetchOwnedProfile`)               |
|  - Dynamic Rate Limiting & Distributed Caching (`astrology:adv:*`)                |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                   ADVANCED ASTROLOGY ENGINE (v2.0.0)                              |
|                                                                                   |
|  [Layer 1: Ephemeris & Astronomical Foundations]                                  |
|   - AstronomyEngine (VSOP87/ELP2000-82), Chitra Paksha Lahiri Ayanamsa, Nirayana  |
|                                                                                   |
|  [Layer 2: Vargas & Mathematical Cycles]                                          |
|   - Shodashavarga: D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30,    |
|     D40, D45, D60                                                                 |
|   - Dashas: Vimshottari (120y), Yogini (36y), Ashtottari (108y)                   |
|   - Ashtakavarga: 8-Fold BAV & 337-Bindu SAV Matrix                               |
|   - Shadbala: Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bala (Virupas & Rupas) |
|                                                                                   |
|  [Layer 3: Deterministic Rule Engines]                                             |
|   - Classical Yoga Detection (50+ combinations)                                   |
|   - Gochar Transits & Sade Sati Phase Evaluation                                  |
|   - 36-Guna Ashtakoota Matchmaking & Kuja Dosha Samyam                            |
|                                                                                   |
|  [Layer 4: Synthesized Explainable Insights]                                      |
|   - Vargottama, D10 Career Manifestation, Active Dasha Correlations               |
+-----------------------------------------------------------------------------------+
```
