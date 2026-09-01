import React, { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, Send, Loader2 } from 'lucide-react';
import { VoiceApi } from '../../services/voiceApi';

interface VoiceRecorderProps {
  onTranscribed: (text: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscribed, onCancel }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250);
      setRecording(true);

      timerRef.current = setInterval(() => {
        setDurationSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Microphone permission denied.');
    }
  };

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  const handleFinishAndSend = async () => {
    if (!mediaRecorderRef.current) return;

    setTranscribing(true);
    setError(null);

    // Stop tracks
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());

    setTimeout(async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const result = await VoiceApi.transcribe(audioBlob);
        onTranscribed(result.text);
      } catch (err: any) {
        setError(err.message || 'Failed to transcribe speech.');
        setTranscribing(false);
      }
    }, 500);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderRadius: '12px',
        border: '1px solid var(--border-gold)',
        background: 'rgba(245, 208, 97, 0.08)',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444',
          }}
        >
          <Mic size={16} className={recording ? 'animate-pulse' : ''} />
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>
            {transcribing ? 'Transcribing with Whisper AI...' : `Listening... (${formatTimer(durationSeconds)})`}
          </div>
          {error && <div style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>{error}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onCancel}
          disabled={transcribing}
          className="btn btn-outline"
          style={{ padding: '6px 10px', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          title="Cancel Recording"
        >
          <Trash2 size={14} />
        </button>

        <button
          onClick={handleFinishAndSend}
          disabled={transcribing}
          className="btn btn-gold"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          {transcribing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
