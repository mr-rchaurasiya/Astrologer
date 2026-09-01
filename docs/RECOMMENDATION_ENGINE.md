# Intelligent Recommendation Engine

## Overview
The Recommendation Engine suggests actionable Jyotish next steps based on the native's chart, active Vimshottari Dasha period, 10th house karmic placements, Janma Nakshatra, and multi-decade Life Curve milestones.

## Rule Definitions
1. **Active Vimshottari Dasha (`dasha_transition`)**: Identifies the currently active Mahadasha and Antardasha lords and prompts the user to explore planetary themes in AI Consultation.
2. **Karmasthana 10th House (`house_focus`)**: Examines the 10th house sign and lord, suggesting deep dive into the D10 Dashamsha chart.
3. **Janma Nakshatra (`nakshatra_deepdive`)**: Prompts psychological reflection on the Moon's birth constellation.
4. **Life Curve Milestones (`life_curve_milestone`)**: Encourages tracking harmonic multi-decade strength curves.

## API Endpoints
- `GET /api/v1/recommendations`: Returns ranked, active recommendations for the authenticated user.
- `POST /api/v1/recommendations/:id/dismiss`: Dismisses a specific recommendation for the user's session.
