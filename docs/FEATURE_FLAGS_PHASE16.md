# Feature Flags & Gradual Rollouts (Phase 16)

## 1. Feature Flag Mechanics (`FeatureFlagService`)
- **Percentage-Based Rollout**: Deterministically hashes user ID to evaluate exposure (e.g. 10%, 50%, 100%).
- **Plan-Based Gating**: Automatically gates features based on user tier (`free`, `pro`, `premium`).
- **Emergency Kill Switches**: Instant runtime deactivation of any specific feature without redeploying code.

---

## 2. Active Feature Flags

| Flag Key | Description | Default State | Minimum Tier |
|---|---|---|---|
| `AI_MEMORY` | Context-grounded conversational user memory | Enabled | Free |
| `SMART_RECOMMENDATIONS`| Dasha-aware life recommendations | Enabled | Free |
| `ADVANCED_INSIGHTS` | Multi-chart divisional insights | Enabled | Free |
| `VOICE_AI` | Voice consultation & TTS audio | Enabled | Pro |
| `PDF_REPORTS` | Vector PDF horoscope dossiers | Enabled | Premium |
| `DAILY_AI_INSIGHTS` | Personalized Gochar horoscopes | Enabled | Free |
