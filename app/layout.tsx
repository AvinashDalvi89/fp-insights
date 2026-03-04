import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Glossary from '@/components/Glossary';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  title: 'FP Insights // Terminal',
  description: 'Interactive Functional Programming concepts from FP in Scala',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'FP Insights // Terminal',
    description: 'Interactive Functional Programming concepts from FP in Scala',
    images: [
      {
        url: '/feature-image.png',
        width: 1200,
        height: 630,
        alt: 'FP Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FP Insights // Terminal',
    description: 'Interactive Functional Programming concepts from FP in Scala',
    images: ['/feature-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Glossary />
      </body>
    </html>
  );
}
