import type { CSSProperties } from 'react';

const paths = {
  chat: <><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z"/><path d="M7 10h8M7 14h5"/></>,
  book: <><path d="M12 5v15M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1Z"/></>,
  tools: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 21h8M12 16v5m-4-11 2 2 4-4"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/></>,
  person: <><circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M4 9v5m16-5v5"/></>,
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  send: <><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  reset: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/></>,
  menu: <><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="15" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
  spark: <><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/></>,
};
export default function ChatIcon({ name, size = 20, style }: { name: keyof typeof paths; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={style}>{paths[name]}</svg>;
}
