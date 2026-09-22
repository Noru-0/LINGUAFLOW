import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from 'next/font/google'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['vietnamese', 'latin'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['vietnamese', 'latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LinguaFlow — Learn with momentum',
  description: 'A focused English learning workspace for vocabulary, translation, and lasting progress.',
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

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                document.documentElement.classList.remove('dark', 'pink');
                if (theme === 'pink') {
                  document.documentElement.classList.add('pink');
                } else if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AnimatedBackground />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
