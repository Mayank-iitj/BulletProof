import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'BulletProof — The Resume Bullet Rewriter that A/B Tests Itself',
  description:
    'Paste a weak resume bullet, get three sharper versions. Powered by Flagsmith experimentation to empirically discover which AI rewrite style wins real jobs.',
  openGraph: {
    title: 'BulletProof — Battle-Tested AI Resume Rewriter',
    description: '3 AI styles fight for your resume. Flagsmith experimentation decides the winner in public.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text antialiased selection:bg-accent/20 selection:text-accent flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-accent">[•] BulletProof</span>
              <span>· Toggle Wars Hackathon</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <a href="/arena" className="hover:text-text transition-colors">
                Live Arena
              </a>
              <a href="/method" className="hover:text-text transition-colors">
                Experiment Methodology
              </a>
              <a
                href="https://flagsmith.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Built on Flagsmith
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
