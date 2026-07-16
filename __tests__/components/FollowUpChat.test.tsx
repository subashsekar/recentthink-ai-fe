import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FollowUpMessage } from '@/components/follow-up-chat/FollowUpMessage';
import { RejectedGuidanceCard } from '@/components/follow-up-chat/RejectedGuidanceCard';
import type { FollowUpUiMessage } from '@/types/followUpChat';

jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('@/components/leetcode-agent/ChatMarkdown', () => ({
  ChatMarkdown: ({ content }: { content: string }) => (
    <div data-testid="chat-markdown">{content}</div>
  ),
}));

describe('FollowUp rejected vs accepted rendering', () => {
  it('renders accepted assistant markdown normally', () => {
    const message: FollowUpUiMessage = {
      id: 'a1',
      role: 'assistant',
      content: 'Use a HashMap for O(1) lookups.',
      createdAt: new Date().toISOString(),
      rejected: false,
      contextMatch: true,
      intent: 'explain_again',
    };

    render(<FollowUpMessage message={message} feature="leetcode" />);

    expect(screen.getByTestId('follow-up-assistant')).toBeInTheDocument();
    expect(screen.getByText(/HashMap/i)).toBeInTheDocument();
    expect(screen.queryByTestId('follow-up-rejected')).not.toBeInTheDocument();
  });

  it('renders rejected guidance card with CTAs', async () => {
    const user = userEvent.setup();
    const onAsk = jest.fn();
    const onNew = jest.fn();

    const message: FollowUpUiMessage = {
      id: 'a2',
      role: 'assistant',
      content: 'That is outside this session. Ask about Two Sum instead.',
      createdAt: new Date().toISOString(),
      rejected: true,
      contextMatch: false,
      intent: 'out_of_context',
    };

    render(
      <FollowUpMessage
        message={message}
        feature="leetcode"
        onAskAboutSession={onAsk}
        onStartNewSession={onNew}
      />,
    );

    expect(screen.getByTestId('follow-up-rejected')).toBeInTheDocument();
    expect(screen.getByText(/Ask about Two Sum instead/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /HackerRank Mentor/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ask about this session/i }));
    expect(onAsk).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Start a new session/i }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('RejectedGuidanceCard excludes the current product from links', () => {
    render(
      <RejectedGuidanceCard
        content="Please stay on topic."
        currentFeature="dsa_pattern"
        onAskAboutSession={() => undefined}
      />,
    );

    expect(screen.queryByRole('link', { name: /DSA Pattern Coach/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LeetCode Mentor/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Course Generator/i })).toBeInTheDocument();
  });
});
