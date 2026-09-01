import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { VoiceApi } from '../../services/voiceApi';

interface VoicePlayerProps {
  text: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ text }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayTTS = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const blob = await VoiceApi.synthesize(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(false);
      };

      audio.play();
      setPlaying(true);
    } catch {
      // Silently handle fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlayTTS}
      disabled={loading}
      className="btn btn-outline"
      style={{
        padding: '4px 8px',
        fontSize: '0.725rem',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: playing ? 'var(--accent-gold)' : 'var(--text-secondary)',
      }}
      title="Listen to reading"
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : playing ? (
        <VolumeX size={12} />
      ) : (
        <Volume2 size={12} />
      )}
      <span>{playing ? 'Pause' : 'Listen'}</span>
    </button>
  );
};
