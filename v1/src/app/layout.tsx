import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans/wght.css';
import '@fontsource-variable/manrope/wght.css';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'Acadia Edu — Opportunity, with a way forward',
  description:
    'An opportunity navigator and practical student planner. Starting with Pennsylvania grades 9–12.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
