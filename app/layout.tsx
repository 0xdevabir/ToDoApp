import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowDo — Advanced Todo',
  description: 'An advanced, interactive todo app that lives in your browser.',
  manifest: '/manifest.webmanifest',
  applicationName: 'FlowDo',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          theme="system"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                '!bg-[var(--bg-elev)] !text-[var(--fg)] !border !border-[var(--border)] !shadow-[var(--shadow-md)]',
            },
          }}
        />
      </body>
    </html>
  );
}
