# Advanced Astrology Insight Correlation Layer

## Overview
The Astrology Insight Correlation engine synthesizes multi-chart factors into high-level structured observations. Rather than analyzing single planets in isolation, it correlates D1 Rashi, D9 Navamsha, D10 Dashamsha, and Vimshottari timing into cohesive Jyotish insights.

## Core Correlations
1. **Lagna & Moon Synthesis (`personality_core`)**: Balances the conscious identity (Lagna) with the emotional mind (Moon).
2. **Karmasthana & D10 Alignment (`career_dharma`)**: Correlates the 10th house cusp with D10 Dashamsha vocational drivers.
3. **Jupiter & Higher Discernment (`spiritual_evolution`)**: Analyzes Jupiter's sign and house dignity for moral intellect (Buddhi).
4. **Vimshottari Dasha Timing (`timing_activation`)**: Pinpoints active planetary rulers influencing current life events.

## API Endpoint
- `GET /api/v1/astrology/insights/:profileId`: Returns structured observations with supporting chart factors and strength ratings (`strong`, `moderate`, `subtle`).
