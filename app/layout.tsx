import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'BulletProof — The Resume Bullet Rewriter that A/B Tests Itself',
  description:
    'Paste a weak resume bullet, get three sharper versions. Powered by Flagsmith experimentation to empirically discover which AI rewrite style wins real jobs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-dashlane-ignore="true">
      <body
        className="bg-[#0d1117] text-[#e6edf3] antialiased selection:bg-[#2f81f7]/30 selection:text-white flex flex-col min-h-screen"
        suppressHydrationWarning
        data-dashlane-ignore="true"
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#30363d] py-6 text-xs text-[#7d8590] bg-[#010409]">
          <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#2ea043] font-bold">BulletProof</span>
              <span>· Toggle Wars Hackathon</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <a href="/arena" className="hover:text-[#58a6ff] transition-colors">
                The Arena
              </a>
              <a href="/method" className="hover:text-[#58a6ff] transition-colors">
                Methodology
              </a>
              <a
                href="https://flagsmith.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2ea043] hover:underline"
              >
                Powered by Flagsmith
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
