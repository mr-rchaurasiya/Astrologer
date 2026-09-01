# Server-Authoritative Feature Flags

## Overview
Feature flags provide runtime control over feature rollouts, subscription tier restrictions, and operational toggles without requiring client redeployments.

## Defined Feature Flags
| Flag Key | Minimum Tier | Default Enabled | Description |
|---|---|---|---|
| `AI_MEMORY` | `free` | `true` | Enables personalized AI memory storage and recall |
| `SMART_RECOMMENDATIONS` | `free` | `true` | Enables deterministic Jyotish action recommendations |
| `ADVANCED_INSIGHTS` | `free` | `true` | Multi-chart correlation observations |
| `VOICE_AI` | `pro` | `true` | Voice transcription and TTS consultation |
| `PDF_REPORTS` | `pro` | `true` | High-resolution PDF horoscope reports |
| `DAILY_AI_INSIGHTS` | `free` | `true` | Contextual daily Jyotish insights |
| `ANALYTICS` | `free` | `true` | Life Curve and Transit Timeline |
| `PREMIUM_FEATURES` | `pro` | `true` | Extended quota access |

## API Endpoint
- `GET /api/v1/features`: Evaluates user subscription tier and global overrides to return active flag map: `{ AI_MEMORY: true, VOICE_AI: false, ... }`.
