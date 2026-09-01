# AI Token & Cost Analytics

## Overview
The platform captures every AI interaction across Chat, Daily Insight, Voice STT/TTS, and Conversation Summarization in the `AIUsageLog` model to track token consumption, inference latency, error rates, and estimated dollar costs.

## Pricing Model
- **Input Tokens**: $0.15 / 1,000,000 tokens (GPT-4o-mini baseline)
- **Output Tokens**: $0.60 / 1,000,000 tokens (GPT-4o-mini baseline)

## Aggregation Windows
- `today`: Running 24-hour total
- `7d`: 7-day rolling window
- `30d`: Monthly telemetry
- `all`: Lifetime platform usage

## Admin API
- `GET /api/v1/admin/ai/usage?timeframe=7d`: Returns total requests, prompt tokens, completion tokens, estimated cost USD, average latency, and breakdown by plan tier (`free`, `pro`, `premium`).
