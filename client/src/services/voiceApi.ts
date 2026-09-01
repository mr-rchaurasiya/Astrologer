export class VoiceApi {
  public static async transcribe(audioBlob: Blob, language = 'en'): Promise<{ text: string; language?: string }> {
    const token = localStorage.getItem('astrologer_access_token');
    const arrayBuffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const audioBase64 = window.btoa(binary);

    const res = await fetch(`/api/v1/ai/voice/transcribe?language=${language}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        audioBase64,
        mimeType: audioBlob.type || 'audio/webm',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Speech-to-text transcription failed');
    }

    return data.data;
  }

  public static async synthesize(text: string, voice = 'nova'): Promise<Blob> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/ai/voice/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      throw new Error('Text-to-speech synthesis failed');
    }

    return res.blob();
  }
}
