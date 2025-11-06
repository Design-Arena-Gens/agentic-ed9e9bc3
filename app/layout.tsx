import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JSON Explorer',
  description: 'Upload, inspect, search and export JSON files',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
