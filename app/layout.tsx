import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Glossary from '@/components/Glossary';

export const metadata: Metadata = {
  title: 'FP Insights // Terminal',
  description: 'Interactive Functional Programming concepts from FP in Scala',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
