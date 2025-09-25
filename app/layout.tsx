import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PIRL MVP',
  description: 'Turn real-world progress into exclusive digital rewards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

