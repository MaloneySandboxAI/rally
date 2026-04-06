import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PostHogProvider } from '@/lib/posthog-provider'
import { FeedbackButton } from '@/components/rally/feedback-button'
import { GemProvider } from '@/lib/gem-context'
import { QuestionTrackerProvider } from '@/lib/question-tracker-context'
import { AuthGate } from '@/components/rally/auth-gate'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800']
});

export const viewport: Viewport = {
  themeColor: '#021f3d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Rally - SAT Prep Game',
  description: 'SAT prep meets Words with Friends. Challenge your friends and ace the SAT.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <PostHogProvider>
          <GemProvider>
            <QuestionTrackerProvider>
              <AuthGate>
                {children}
                <FeedbackButton />
                <Toaster position="top-center" />
              </AuthGate>
            </QuestionTrackerProvider>
          </GemProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
