import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  User as UserIcon,
  ShieldAlert,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Type,
} from 'lucide-react';
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

  // Multi-Directional Layout & View Customization States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [widthMode, setWidthMode] = useState<'normal' | 'wide' | 'full'>('normal');
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Loading & Streaming States
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
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
          if (res.data.sessions.length > 0 && !pointContext) {
            setCurrentSessionId(res.data.sessions[0].id);
          } else {
            setCurrentSessionId(null);
            setMessages([]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load chat sessions:', err);
      }
    };

    loadSessions();
  }, [selectedProfileId]);

  // 3. Load messages when currentSessionId changes
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
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentSessionId]);

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    setPointContext(null);
    setSearchParams({ profile: profileId });
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
        handleNewChat();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete session');
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !selectedProfileId) return;

    setError(null);
    setIsGenerating(true);
    setStreamingText('');

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: currentSessionId || '',
      userId: '',
      profileId: selectedProfileId,
      role: 'user',
      content: messageText,
      pointContext: pointContext || undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    const activePointContext = pointContext;
    if (pointContext) {
      setPointContext(null);
    }

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let fullAssistantResponse = '';

      await ApiClient.streamChatMessage(
        {
          profileId: selectedProfileId,
          sessionId: currentSessionId || undefined,
          message: messageText,
          pointContext: activePointContext || undefined,
        },
        (chunk: string) => {
          fullAssistantResponse += chunk;
          setStreamingText(fullAssistantResponse);
        },
        (createdSessionId: string) => {
          if (!currentSessionId) {
            setCurrentSessionId(createdSessionId);
          }
        },
        controller.signal
      );

      setIsGenerating(false);
      setStreamingText('');

      const res = await ApiClient.getChatSessions(selectedProfileId);
      if (res.success && res.data) {
        setSessions(res.data.sessions);
      }

      if (currentSessionId) {
        const msgRes = await ApiClient.getChatMessages(currentSessionId);
        if (msgRes.success && msgRes.data) {
          setMessages(msgRes.data.messages);
        }
      }
    } catch (streamErr: any) {
      if (streamErr.name === 'AbortError') {
        setIsGenerating(false);
        setStreamingText('');
        return;
      }

      try {
        const res = await ApiClient.sendChatMessage({
          profileId: selectedProfileId,
          sessionId: currentSessionId || undefined,
          message: messageText,
          pointContext: activePointContext || undefined,
        });

        if (res.success && res.data) {
          if (!currentSessionId) {
            setCurrentSessionId(res.data.sessionId);
          }
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
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      } finally {
        setIsGenerating(false);
        setStreamingText('');
      }
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  // Determine container max-width based on widthMode
  const containerMaxWidth =
    widthMode === 'full' ? '100%' : widthMode === 'wide' ? '1540px' : '1240px';

  // Determine font size style
  const fontSizeMap = {
    sm: '0.875rem',
    md: '0.975rem',
    lg: '1.125rem',
    xl: '1.25rem',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: containerMaxWidth,
        margin: '0 auto',
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: widthMode === 'full' ? '6px 12px' : '8px 16px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'max-width 0.25s ease',
      }}
    >
      {/* Top Header & Customization Controls Bar (Hidden in Zen Mode) */}
      {!isZenMode && (
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            marginBottom: '8px',
            border: '1px solid var(--border-gold)',
            flexShrink: 0,
          }}
        >
          {/* Brand & Layer Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Sidebar Open/Close Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="btn btn-outline"
              style={{
                padding: '6px 8px',
                color: isSidebarOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
                borderColor: isSidebarOpen ? 'var(--border-gold)' : 'var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={isSidebarOpen ? 'Close Sessions Sidebar' : 'Open Sessions Sidebar'}
            >
              {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
                  color: 'var(--accent-gold)',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>AI Vedic Astrologer</h2>
                  <Badge variant="gold">Parashari Core</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Actions & Directional Customizers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* 1. Active Profile Chart Selector */}
            {profiles.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <UserIcon size={13} color="var(--accent-gold)" />
                <select
                  className="input-field"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '2px',
                    color: '#FFF',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
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
            )}

            {/* 2. Text Size (Top-to-Bottom Readability Zoom) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 4px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
              title="Change Text Size"
            >
              <Type size={13} style={{ margin: '0 4px', color: 'var(--text-muted)' }} />
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setTextSize(sz)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: textSize === sz ? 700 : 500,
                    background: textSize === sz ? 'var(--accent-gold)' : 'transparent',
                    color: textSize === sz ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {sz === 'sm' ? 'S' : sz === 'md' ? 'M' : sz === 'lg' ? 'L' : 'XL'}
                </button>
              ))}
            </div>

            {/* 3. Width Mode (Left-to-Right Horizontal Expander) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 4px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
              title="Adjust Screen Width (Left & Right)"
            >
              <Maximize2 size={13} style={{ margin: '0 4px', color: 'var(--text-muted)' }} />
              {(['normal', 'wide', 'full'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWidthMode(w)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: widthMode === w ? 700 : 500,
                    background: widthMode === w ? 'var(--accent-gold)' : 'transparent',
                    color: widthMode === w ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* 4. Fullscreen / Zen Reading Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              className="btn btn-outline"
              style={{
                padding: '5px 10px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--text-secondary)',
              }}
              title="Fullscreen Zen Mode (Hide all headers for maximum reading space)"
            >
              <Maximize2 size={13} />
              <span className="desktop-only">Fullscreen</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Exit Button when in Zen / Fullscreen Mode */}
      {isZenMode && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="btn btn-gold"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            <Minimize2 size={14} />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* Main Split Layout with Dynamic Columns & Locked Height */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: isSidebarOpen ? '280px 1fr' : '1fr',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden',
          minHeight: 0,
          transition: 'grid-template-columns 0.2s ease',
        }}
      >
        {/* Left Sidebar: Sessions (Controlled by isSidebarOpen) */}
        {isSidebarOpen && (
          <div className="chat-sidebar-wrapper" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <ChatSidebar
              sessions={sessions}
              selectedSessionId={currentSessionId}
              onSelectSession={(id) => setCurrentSessionId(id)}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
            />
          </div>
        )}

        {/* Right Main Chat Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            background: 'rgba(13, 17, 24, 0.7)',
            fontSize: fontSizeMap[textSize],
          }}
        >
          {/* Messages Scroll Area - Full Vertical Height */}
          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              minHeight: 0,
            }}
          >
            {/* Error Alert */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} flex-shrink="0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && !isGenerating && !loadingMessages && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
                    border: '1px solid var(--border-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                    marginBottom: '16px',
                    boxShadow: 'var(--shadow-gold)',
                  }}
                >
                  <Sparkles size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
                  Your Vedic Astrology AI Assistant
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    maxWidth: '520px',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                  }}
                >
                  Ask questions about {selectedProfile?.name ? `${selectedProfile.name}'s` : 'your'} calculated Vedic
                  birth chart, planetary dignities, 12 Bhavas, Vimshottari Dashas, and traditional Parashari
                  interpretations.
                </p>

                <div style={{ width: '100%', maxWidth: '640px' }}>
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
                <Loader2
                  size={28}
                  className="animate-spin"
                  style={{ margin: '0 auto 10px auto', color: 'var(--accent-gold)' }}
                />
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
          <div
            style={{
              padding: '10px 18px 8px 18px',
              borderTop: '1px solid var(--border-medium)',
              background: 'rgba(7, 9, 14, 0.95)',
              flexShrink: 0,
            }}
          >
            {/* Point & Ask Banner */}
            <PointAndAskBanner
              pointContext={pointContext}
              onClear={() => setPointContext(null)}
            />

            {/* Collapsible Suggestions Toggle when conversation is active */}
            {messages.length > 0 && !isGenerating && (
              <div style={{ marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: showSuggestions ? 'var(--accent-gold)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 4px',
                    transition: 'var(--transition-normal)',
                  }}
                >
                  <HelpCircle size={13} />
                  <span>{showSuggestions ? 'Hide Suggested Questions' : '💡 Suggested Questions (Click to expand)'}</span>
                  {showSuggestions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {showSuggestions && (
                  <div style={{ marginTop: '6px' }}>
                    <QuickQuestions
                      pointContext={pointContext}
                      onSelectQuestion={(q) => {
                        setShowSuggestions(false);
                        handleSendMessage(q);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <ChatInput
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              isGenerating={isGenerating}
              disabled={loadingProfiles || profiles.length === 0}
            />

            {/* Subtle Mandatory Disclaimer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                textAlign: 'center',
              }}
            >
              <ShieldAlert size={11} />
              <span>
                AI responses are traditional Vedic interpretations of calculated chart data for informational purposes.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
