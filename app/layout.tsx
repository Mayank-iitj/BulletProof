import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CustomCursor } from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: 'BulletProof — The Resume Bullet Rewriter that A/B Tests Itself',
  description:
    'Paste a weak resume bullet, get three sharper versions. Powered by Flagsmith experimentation to empirically discover which AI rewrite style wins real jobs.',
  icons: {
    icon: [
      { url: '/bulletproof-icon.png', sizes: '90x90', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/bulletproof-icon.png',
    apple: '/bulletproof-icon.png',
  },
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
        <CustomCursor />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
