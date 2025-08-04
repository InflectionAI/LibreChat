import { renderHook, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { vi } from 'vitest';
import useSubmitMessage from '../useSubmitMessage';

// Mock dependencies
vi.mock('~/utils/posthog', () => ({
  captureEvent: vi.fn(),
}));

vi.mock('~/hooks/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'test-user' } }),
}));

vi.mock('~/Providers', () => ({
  useChatFormContext: () => ({
    reset: vi.fn(),
    getValues: vi.fn().mockReturnValue(''),
  }),
  useChatContext: () => ({
    ask: vi.fn(),
    index: 0,
    getMessages: vi.fn().mockReturnValue([]),
    setMessages: vi.fn(),
    latestMessage: null,
    conversation: {
      conversationId: 'test-conversation',
      endpoint: 'openAI',
      endpointType: 'openAI',
      model: 'gpt-4',
      modelLabel: 'GPT-4',
    },
  }),
  useAddedChatContext: () => ({
    addedIndex: null,
    ask: vi.fn(),
    conversation: null,
  }),
}));

vi.mock('recoil', async () => {
  const actual = await vi.importActual('recoil');
  return {
    ...actual,
    useRecoilValue: vi.fn().mockReturnValue([]),
    useSetRecoilState: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe('useSubmitMessage', () => {
  it('should track message sent event with endpoint and model information', async () => {
    const { captureEvent } = await import('~/utils/posthog');
    const { result } = renderHook(() => useSubmitMessage(), {
      wrapper: RecoilRoot,
    });

    const testMessage = { text: 'Test message' };

    act(() => {
      result.current.submitMessage(testMessage);
    });

    expect(captureEvent).toHaveBeenCalledWith('message_sent', {
      endpoint: 'openAI',
      endpointType: 'openAI',
      model: 'gpt-4',
      modelLabel: 'GPT-4',
      messageLength: testMessage.text.length,
      hasFiles: false,
      isMultiConvo: false,
      conversationId: 'test-conversation',
      timestamp: expect.any(String),
    });
  });

  it('should not track event when no conversation is available', async () => {
    const { captureEvent } = await import('~/utils/posthog');
    
    // Override the mock to return null conversation
    vi.mocked(require('~/Providers').useChatContext).mockReturnValue({
      ask: vi.fn(),
      index: 0,
      getMessages: vi.fn().mockReturnValue([]),
      setMessages: vi.fn(),
      latestMessage: null,
      conversation: null,
    });

    const { result } = renderHook(() => useSubmitMessage(), {
      wrapper: RecoilRoot,
    });

    const testMessage = { text: 'Test message' };

    act(() => {
      result.current.submitMessage(testMessage);
    });

    expect(captureEvent).not.toHaveBeenCalled();
  });
});