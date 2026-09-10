const paths: Record<string, string> = {
  home: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  book: 'M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15',
  tools: 'm14 6 4 4 M3 21l7-7 M14 3a6 6 0 0 0-5 9L3 18l3 3 6-6a6 6 0 0 0 9-5l-5 2-4-4z',
  help: 'M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  image: 'M3 3h18v18H3z M3 17l5-5 4 4 3-3 6 6 M8 7h.01',
  mail: 'M3 5h18v14H3z m0 0 9 7 9-7',
  settings: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
  file: 'M5 3h9l5 5v13H5z M14 3v6h5 M8 13h8 M8 17h5',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M5 12h14 m-6-6 6 6-6 6',
  refresh: 'M20 7v5h-5 M4 17v-5h5 M5 7a8 8 0 0 1 13-2l2 3 M4 16l2 3a8 8 0 0 0 13-2',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  download: 'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
  edit: 'm15 4 5 5 M4 20l5-1L21 7l-5-5L4 14z',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  close: 'm6 6 12 12 M18 6 6 18',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  logout: 'M9 4H4v16h5 M9 12h12 m-5-5 5 5-5 5',
  check: 'm4 12 5 5L20 6',
};
export default function PanelIcon({ name, size = 19 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.file} /></svg>;
}
