import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, AlertCircle, Loader2, User as UserIcon, ShieldAlert } from 'lucide-react';
import { ApiClient } from '../services/api';
import { BirthProfile } from '../types';
import { ChatSession, ChatMessage, PointContext } from '../types/ai';
import { ChatSidebar } from '../components/ai/ChatSidebar';
import { ChatMessageItem } from '../components/ai/ChatMessageItem';
import { ChatInput } from '../components/ai/ChatInput';
import { PointAndAskBanner } from '../components/ai/PointAndAskBanner';
import { QuickQuestions } from '../components/ai/QuickQuestions';
import { AIThinkingIndicator } from '../components/ai/AIThinkingIndicator';
import { Badge } from '../components/common/Badge';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parameters for Point & Ask
  const paramProfileId = searchParams.get('profile');
  const paramPointType = searchParams.get('pointType');
  const paramPointId = searchParams.get('pointId');
  const paramPointLabel = searchParams.get('pointLabel');

  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Point & Ask State
  const [pointContext, setPointContext] = useState<PointContext | null>(null);

  // UI & Loading States
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isGenerating]);

  // 1. Fetch user's profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setLoadingProfiles(true);
      setError(null);
      try {
        const res = await ApiClient.getProfiles();
        if (res.success && res.data && res.data.profiles.length > 0) {
          const profileList = res.data.profiles;
          setProfiles(profileList);

          let targetProfile = profileList.find((p) => p.id === paramProfileId);
          if (!targetProfile) {
            targetProfile = profileList.find((p) => p.isPrimary) || profileList[0];
          }

          setSelectedProfileId(targetProfile.id);

          // If Point & Ask params are present in URL, initialize pointContext
          if (paramPointType && paramPointId) {
            setPointContext({
              type: paramPointType as any,
              id: paramPointId,
              label: paramPointLabel || undefined,
            });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profiles');
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, []);

  // 2. Fetch sessions whenever selectedProfileId changes
  useEffect(() => {
    if (!selectedProfileId) return;

    const loadSessions = async () => {
      try {
        const res = await ApiClient.getChatSessions(selectedProfileId);
        if (res.success && res.data) {
          setSessions(res.data.sessions);
          // If no session selected or current session belongs to another profile, select latest or clear
          if (res.data.sessions.length > 0 && !pointContext) {
            setCurrentSessionId(res.data.sessions[0].id);
          } else {
            setCurrentSessionId(null);
            setMessages([]);
          }
        }
      } catch {
        // Handle silently
      }
    };

    loadSessions();
  }, [selectedProfileId]);

  // 3. Fetch messages whenever currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const res = await ApiClient.getChatMessages(currentSessionId);
        if (res.success && res.data) {
          setMessages(res.data.messages);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load conversation history');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentSessionId]);

  const handleProfileChange = (newProfileId: string) => {
    setSelectedProfileId(newProfileId);
    setCurrentSessionId(null);
    setMessages([]);
    setPointContext(null);
    setSearchParams({ profile: newProfileId });
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setPointContext(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await ApiClient.deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete chat session');
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingText('');
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedProfileId) return;

    setError(null);
    setIsGenerating(true);
    setStreamingText('');

    // Optimistic user message representation
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: currentSessionId || 'pending',
      userId: '',
      profileId: selectedProfileId,
      role: 'user',
      content: text,
      metadata: pointContext ? { selectedPoint: pointContext } : undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    abortControllerRef.current = new AbortController();

    try {
      // Attempt SSE streaming first
      let accumulated = '';
      let serverSessionId = currentSessionId;

      await ApiClient.streamChatMessage(
        {
          profileId: selectedProfileId,
          sessionId: currentSessionId || undefined,
          message: text,
          pointContext: pointContext || undefined,
        },
        (chunk) => {
          if (chunk.sessionId && !serverSessionId) {
            serverSessionId = chunk.sessionId;
            setCurrentSessionId(chunk.sessionId);
          }
          if (chunk.text) {
            accumulated += chunk.text;
            setStreamingText(accumulated);
          }
          if (chunk.isFinal) {
            setIsGenerating(false);
          }
        },
        abortControllerRef.current.signal
      );

      // Refresh full message list to get server-persisted timestamps and IDs
      if (serverSessionId) {
        const msgRes = await ApiClient.getChatMessages(serverSessionId);
        if (msgRes.success && msgRes.data) {
          setMessages(msgRes.data.messages);
        }
        // Refresh session list
        const sessRes = await ApiClient.getChatSessions(selectedProfileId);
        if (sessRes.success && sessRes.data) {
          setSessions(sessRes.data.sessions);
        }
      }
      setStreamingText('');
    } catch (err: any) {
      // Fallback to normal REST send if streaming error or unsupported
      try {
        const res = await ApiClient.sendChatMessage({
          profileId: selectedProfileId,
          sessionId: currentSessionId || undefined,
          message: text,
          pointContext: pointContext || undefined,
        });

        if (res.success && res.data) {
          setCurrentSessionId(res.data.sessionId);
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempUserMsg.id),
            res.data.userMessage,
            res.data.assistantMessage,
          ]);

          const sessRes = await ApiClient.getChatSessions(selectedProfileId);
          if (sessRes.success && sessRes.data) {
            setSessions(sessRes.data.sessions);
          }
        }
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || 'Sorry, I could not generate a response right now. Please try again.');
        // Remove optimistic user message on complete failure
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      } finally {
        setIsGenerating(false);
        setStreamingText('');
      }
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <div className="container" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', paddingTop: '16px', paddingBottom: '16px' }}>
      {/* Top Header Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '14px',
          border: '1px solid var(--border-gold)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)', color: 'var(--accent-gold)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Vedic Astrologer</h2>
              <Badge variant="gold">Parashari Interpretation Layer</Badge>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Grounded strictly in backend deterministic planetary ephemeris
            </span>
          </div>
        </div>

        {/* Profile Selector */}
        {profiles.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Chart:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
              <UserIcon size={14} color="var(--accent-gold)" />
              <select
                className="input-field"
                style={{ background: 'transparent', border: 'none', padding: '2px 4px', color: '#FFF', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#0D1118', color: '#FFF' }}>
                    {p.name} {p.isPrimary ? '★' : `(${p.relationship})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left Sidebar: Sessions */}
        <ChatSidebar
          sessions={sessions}
          selectedSessionId={currentSessionId}
          onSelectSession={(id) => setCurrentSessionId(id)}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />

        {/* Right Main Chat Container */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'rgba(13, 17, 24, 0.7)' }}>
          {/* Messages Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', minHeight: 0 }}>
            {/* Error Alert */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.875rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} flex-shrink="0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && !isGenerating && !loadingMessages && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '16px', boxShadow: 'var(--shadow-gold)' }}>
                  <Sparkles size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
                  Your Vedic Astrology AI Assistant
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Ask questions about {selectedProfile?.name ? `${selectedProfile.name}'s` : 'your'} calculated Vedic birth chart, planetary dignities, 12 Bhavas, Vimshottari Dashas, and traditional Parashari interpretations.
                </p>

                <div style={{ width: '100%', maxWidth: '600px' }}>
                  <QuickQuestions
                    pointContext={pointContext}
                    onSelectQuestion={(q) => handleSendMessage(q)}
                  />
                </div>
              </div>
            )}

            {/* Loading Messages Spinner */}
            {loadingMessages && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px auto', color: 'var(--accent-gold)' }} />
                <div>Loading conversation history...</div>
              </div>
            )}

            {/* Messages List */}
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}

            {/* Streaming Message if generating */}
            {isGenerating && streamingText && (
              <ChatMessageItem
                message={{
                  id: 'streaming-active',
                  sessionId: currentSessionId || '',
                  userId: '',
                  profileId: selectedProfileId,
                  role: 'assistant',
                  content: streamingText,
                  createdAt: new Date().toISOString(),
                }}
              />
            )}

            {/* Thinking indicator before first stream token arrives */}
            {isGenerating && !streamingText && <AIThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input & Controls */}
          <div style={{ padding: '16px 24px 12px 24px', borderTop: '1px solid var(--border-medium)', background: 'rgba(7, 9, 14, 0.95)' }}>
            {/* Point & Ask Banner */}
            <PointAndAskBanner
              pointContext={pointContext}
              onClear={() => setPointContext(null)}
            />

            {/* Quick Questions chips if conversation is active */}
            {messages.length > 0 && !isGenerating && (
              <QuickQuestions
                pointContext={pointContext}
                onSelectQuestion={(q) => handleSendMessage(q)}
              />
            )}

            <ChatInput
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              isGenerating={isGenerating}
              disabled={loadingProfiles || profiles.length === 0}
            />

            {/* Subtle Mandatory Disclaimer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
              <ShieldAlert size={12} />
              <span>
                AI responses are traditional Vedic interpretations of calculated chart data for informational purposes. Not a substitute for medical, legal, or financial advice.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
