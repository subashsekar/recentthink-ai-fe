export const APP_EVENTS = {
  LEETCODE_NEW_CHAT: 'recentthink:leetcode:new-chat',
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

export function emitAppEvent(name: AppEventName) {
  window.dispatchEvent(new CustomEvent(name));
}
