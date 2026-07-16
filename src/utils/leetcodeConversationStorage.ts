import type { MentorConversationMessage } from './leetcodeConversation';
import { storage } from './storage';

const STORAGE_KEY = 'leetcode-mentor-followups-v1';

type ConversationMap = Record<string, MentorConversationMessage[]>;

function readMap(): ConversationMap {
  return storage.get<ConversationMap>(STORAGE_KEY) ?? {};
}

function writeMap(map: ConversationMap): void {
  storage.set(STORAGE_KEY, map);
}

export function loadSessionConversation(
  sessionId: string | null | undefined,
): MentorConversationMessage[] {
  if (!sessionId) return [];
  const map = readMap();
  const messages = map[sessionId];
  return Array.isArray(messages) ? messages.filter((m) => !m.isAnalysis) : [];
}

export function saveSessionConversation(
  sessionId: string | null | undefined,
  messages: MentorConversationMessage[],
): void {
  if (!sessionId) return;
  const map = readMap();
  const cleaned = messages.filter((m) => !m.isAnalysis && !m.isStreaming);
  if (cleaned.length === 0) {
    delete map[sessionId];
  } else {
    map[sessionId] = cleaned;
  }
  writeMap(map);
}

export function clearSessionConversation(sessionId: string | null | undefined): void {
  if (!sessionId) return;
  const map = readMap();
  if (!(sessionId in map)) return;
  delete map[sessionId];
  writeMap(map);
}
