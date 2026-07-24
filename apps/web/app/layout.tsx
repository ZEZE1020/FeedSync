import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Feed Sync',
    template: '%s · Feed Sync',
  },
  description: 'Decision support for responsible cage and pond fish farming.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
