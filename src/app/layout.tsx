import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'The Tribunal — Evidence Scoring Arena',
    template: '%s | The Tribunal',
  },
  description:
    'The world\'s first evidence performance arena. Community judges score submissions across credibility dimensions with the drama of Olympic scoring.',
  metadataBase: new URL('https://tribunal.so'),
  openGraph: {
    type: 'website',
    siteName: 'The Tribunal',
    title: 'The Tribunal — Evidence Scoring Arena',
    description:
      'Rotten Tomatoes meets ESPN — for evidence. Score claims across Source, Logic, and Relevance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Tribunal',
    description:
      'The world\'s first evidence performance arena. Judge it on tribunal.so',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable}`}>
      <body>
        <Navbar />
        <main className="page-content">
          {children}
        </main>
      </body>
    </html>
  );
}
