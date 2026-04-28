import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PostHogProvider } from '@/lib/posthog-provider'
import { FeedbackButton } from '@/components/rally/feedback-button'
import { GemProvider } from '@/lib/gem-context'
import { PremiumProvider } from '@/lib/premium-context'
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
  title: 'Rally - SAT & AP Prep Game',
  description: 'Challenge your friends to a head-to-head SAT & AP prep game. Adaptive questions, real-time scoring, and a gem economy that makes studying actually fun.',
  generator: 'v0.app',
  metadataBase: new URL('https://rallyplaylive.com'),
  openGraph: {
    title: 'Rally - SAT & AP Prep That Hits Differently',
    description: 'Challenge your friends to a head-to-head prep game. 1,000+ questions across SAT & AP subjects. Free to play.',
    url: 'https://rallyplaylive.com',
    siteName: 'Rally',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rally - SAT & AP prep game with categories for Algebra, Reading, Grammar, Data & Stats, and AP exams',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rally - SAT & AP Prep That Hits Differently',
    description: 'Challenge your friends to a head-to-head prep game. Free to play.',
    images: ['/og-image.png'],
  },
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
            <PremiumProvider>
            <QuestionTrackerProvider>
              <AuthGate>
                {children}
                <FeedbackButton />
                <Toaster position="top-center" />
              </AuthGate>
            </QuestionTrackerProvider>
            </PremiumProvider>
          </GemProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
