# Voice AI Consultation Layer

## Overview
The Voice AI layer enables conversational speech interaction with the Vedic Jyotish consultation assistant. Users can speak their questions using their microphone, transcribe speech to text, submit it to the AI consultation engine with structured Kundli context, and listen to spoken answers via neural text-to-speech.

## Architecture

```
[ User Microphone (Browser) ]
              │ (MediaRecorder Blob)
              ▼
[ POST /api/v1/ai/voice/transcribe ]
              │
      [ VoiceService ]
              │ (Validation: <10MB, mimeType)
              ▼
   [ OpenAIVoiceProvider ]
              │ (Whisper STT API)
              ▼
[ Text Question Sent to Chat ]
              │
   [ AI Consultation Answer ]
              │
              ▼
[ POST /api/v1/ai/voice/synthesize ]
              │
   [ OpenAIVoiceProvider ]
              │ (OpenAI TTS-1 API)
              ▼
[ Audio Stream / Playback (VoicePlayer) ]
```

## Security & Quota Controls
- **Payload Limits**: Maximum audio file size enforced at 10 MB.
- **Allowed Formats**: `audio/webm`, `audio/mp3`, `audio/wav`, `audio/ogg`, `audio/m4a`.
- **Usage Tracking**: Voice interactions increment the user's daily consultation usage record (`UsageRecord` model).
- **Graceful Fallbacks**: When external AI voice credentials are not configured, the system provides safe offline synthesis and transcription responses for development and testing.
