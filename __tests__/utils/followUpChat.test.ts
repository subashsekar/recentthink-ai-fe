import {
  isRejectedFollowUp,
  normalizeFollowUpPayload,
  pickTeacherAnswer,
} from '@/utils/followUpChat';

describe('followUpChat utils', () => {
  it('picks teacher string from nested payloads', () => {
    expect(pickTeacherAnswer({ teacher: 'Hello' })).toBe('Hello');
    expect(pickTeacherAnswer({ response: { teacher: { content: 'Nested' } } })).toBe('Nested');
  });

  it('treats rejected / out_of_context / context_match=false as rejection', () => {
    expect(isRejectedFollowUp({ rejected: true })).toBe(true);
    expect(isRejectedFollowUp({ intent: 'out_of_context' })).toBe(true);
    expect(isRejectedFollowUp({ contextMatch: false })).toBe(true);
    expect(
      isRejectedFollowUp({ rejected: false, contextMatch: true, intent: 'explain_again' }),
    ).toBe(false);
  });

  it('normalizes accepted follow-up payloads', () => {
    const result = normalizeFollowUpPayload({
      session_id: 'abc',
      intent: 'explain_again',
      teacher: 'HashMap gives O(1) lookups.',
      context_match: true,
      rejected: false,
    });

    expect(result.rejected).toBe(false);
    expect(result.contextMatch).toBe(true);
    expect(result.teacher).toContain('HashMap');
    expect(result.intent).toBe('explain_again');
  });

  it('normalizes rejected follow-up payloads from complete.response', () => {
    const result = normalizeFollowUpPayload({
      type: 'complete',
      response: {
        session_id: 'abc',
        intent: 'out_of_context',
        teacher: 'Stay on this problem instead.',
        context_match: false,
        rejected: true,
        action: 'follow_up',
      },
    });

    expect(result.rejected).toBe(true);
    expect(result.contextMatch).toBe(false);
    expect(result.intent).toBe('out_of_context');
    expect(result.teacher).toContain('Stay on this problem');
  });
});
