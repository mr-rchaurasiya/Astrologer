import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { PointAndAskBanner } from './PointAndAskBanner';
import { QuickQuestions } from './QuickQuestions';
import { AIThinkingIndicator } from './AIThinkingIndicator';
import { ChatMessage, ChatSession } from '../../types/ai';

describe('AI Consultation & Chat UI Components', () => {
  const mockUserMsg: ChatMessage = {
    id: 'msg-user-1',
    sessionId: 'sess-1',
    userId: 'u1',
    profileId: 'p1',
    role: 'user',
    content: 'What does my 10th house indicate for career?',
    createdAt: '2026-09-01T03:00:00.000Z',
  };

  const mockAssistantMsg: ChatMessage = {
    id: 'msg-asst-1',
    sessionId: 'sess-1',
    userId: 'u1',
    profileId: 'p1',
    role: 'assistant',
    content: '## 10th House Career Indications\nIn traditional Vedic astrology, your 10th house is ruled by Saturn.',
    metadata: {
      model: 'gpt-4o-mini',
      selectedPoint: {
        type: 'house',
        id: '10',
        label: '10th House (Karma)',
      },
    },
    createdAt: '2026-09-01T03:00:05.000Z',
  };

  const mockSessions: ChatSession[] = [
    {
      id: 'sess-1',
      userId: 'u1',
      profileId: 'p1',
      title: 'Career & 10th House',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('ChatMessageItem renders user message and assistant message with markdown', () => {
    const { rerender } = render(<ChatMessageItem message={mockUserMsg} />);
    expect(screen.getByText('What does my 10th house indicate for career?')).toBeDefined();

    rerender(<ChatMessageItem message={mockAssistantMsg} />);
    expect(screen.getByText('10th House Career Indications')).toBeDefined();
    expect(screen.getByText(/Point & Ask: 10th House \(Karma\)/i)).toBeDefined();
    expect(screen.getByText('gpt-4o-mini')).toBeDefined();
  });

  it('ChatInput triggers onSendMessage when Enter is pressed or Send button is clicked', () => {
    const onSend = vi.fn();
    render(<ChatInput onSendMessage={onSend} />);

    const textarea = screen.getByPlaceholderText(/Ask anything about your Vedic Kundli/i);
    fireEvent.change(textarea, { target: { value: 'Explain my Jupiter placement' } });

    expect(screen.getByText(/28/i)).toBeDefined();

    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons[buttons.length - 1];
    fireEvent.click(sendBtn);
    expect(onSend).toHaveBeenCalledWith('Explain my Jupiter placement');
  });

  it('ChatInput displays Stop button when generating and triggers onStopGeneration', () => {
    const onStop = vi.fn();
    render(<ChatInput onSendMessage={vi.fn()} onStopGeneration={onStop} isGenerating={true} />);

    const stopBtn = screen.getByText(/Stop/i);
    fireEvent.click(stopBtn);
    expect(onStop).toHaveBeenCalled();
  });

  it('ChatSidebar renders session list and New Chat button', () => {
    const onNewChat = vi.fn();
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <ChatSidebar
        sessions={mockSessions}
        selectedSessionId="sess-1"
        onNewChat={onNewChat}
        onSelectSession={onSelect}
        onDeleteSession={onDelete}
      />
    );

    expect(screen.getByText('Career & 10th House')).toBeDefined();
    const newChatBtn = screen.getByText('New Chat');
    fireEvent.click(newChatBtn);
    expect(onNewChat).toHaveBeenCalled();
  });

  it('PointAndAskBanner renders active highlighted point and triggers onClear', () => {
    const onClear = vi.fn();
    render(
      <PointAndAskBanner
        pointContext={{ type: 'planet', id: 'Mars', label: 'Mars in Taurus' }}
        onClear={onClear}
      />
    );

    expect(screen.getByText(/Mars in Taurus/i)).toBeDefined();
    const clearBtn = screen.getByRole('button');
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });

  it('QuickQuestions renders contextual suggestions and triggers onSelectQuestion', () => {
    const onSelect = vi.fn();
    render(
      <QuickQuestions
        pointContext={{ type: 'planet', id: 'Mars' }}
        onSelectQuestion={onSelect}
      />
    );

    const questionBtn = screen.getByText(/What does Mars indicate in my birth chart\?/i);
    fireEvent.click(questionBtn);
    expect(onSelect).toHaveBeenCalledWith('What does Mars indicate in my birth chart?');
  });

  it('AIThinkingIndicator renders analyzing state', () => {
    render(<AIThinkingIndicator />);
    expect(
      screen.getByText(/Consulting astrological calculation engine & synthesizing interpretation.../i)
    ).toBeDefined();
  });
});
