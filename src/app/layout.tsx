import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'KAIROS - AI Automation Platform',
  description: 'KAIROS lets you give natural-language tasks to LLM agents, which convert them into structured tool calls and controlled multi-step automation through MCP.',
  keywords: ['AI', 'automation', 'MCP', 'LLM', 'agent', 'KAIROS'],
  authors: [{ name: 'KAIROS' }],
  creator: 'KAIROS',
  openGraph: {
    title: 'KAIROS - AI Automation Platform',
    description: 'Natural-language tasks to LLM agents through MCP.',
    type: 'website',
  },
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}