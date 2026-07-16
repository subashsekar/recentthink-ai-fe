import type { FollowUpFeature, FollowUpUiMessage } from '@/types/followUpChat';
import { storage } from './storage';

const STORAGE_KEY = 'recentthink-followups-v1';

type ConversationMap = Record<string, FollowUpUiMessage[]>;
type FeatureMap = Partial<Record<FollowUpFeature, ConversationMap>>;

function readAll(): FeatureMap {
  return storage.get<FeatureMap>(STORAGE_KEY) ?? {};
}

function writeAll(map: FeatureMap): void {
  storage.set(STORAGE_KEY, map);
}

function sessionKey(feature: FollowUpFeature, sessionId: string): string {
  return `${feature}:${sessionId}`;
}

export function loadFollowUpConversation(
  feature: FollowUpFeature,
  sessionId: string | null | undefined,
): FollowUpUiMessage[] {
  if (!sessionId) return [];
  const all = readAll();
  const byFeature = all[feature] ?? {};
  const messages = byFeature[sessionId] ?? byFeature[sessionKey(feature, sessionId)];
  return Array.isArray(messages)
    ? messages.filter((m) => !m.isStreaming).map((m) => ({ ...m, isStreaming: false }))
    : [];
}

export function saveFollowUpConversation(
  feature: FollowUpFeature,
  sessionId: string | null | undefined,
  messages: FollowUpUiMessage[],
): void {
  if (!sessionId) return;
  const all = readAll();
  const byFeature = { ...(all[feature] ?? {}) };
  const cleaned = messages.filter((m) => !m.isStreaming);
  if (cleaned.length === 0) {
    delete byFeature[sessionId];
  } else {
    byFeature[sessionId] = cleaned;
  }
  writeAll({ ...all, [feature]: byFeature });
}

export function clearFollowUpConversation(
  feature: FollowUpFeature,
  sessionId: string | null | undefined,
): void {
  if (!sessionId) return;
  const all = readAll();
  const byFeature = { ...(all[feature] ?? {}) };
  if (!(sessionId in byFeature)) return;
  delete byFeature[sessionId];
  writeAll({ ...all, [feature]: byFeature });
}
