import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fakhrul Alam — 3D Generalist & Multimedia Designer',
  description:
    'Portfolio of Fakhrul Alam, a professional 3D generalist, 3D game assets artist and multimedia designer. 3D game assets, 3D visualization, graphic design and AI-generated content.',
  generator: 'v0.app',
  keywords: [
    'Fakhrul Alam',
    '3D generalist',
    '3D game assets artist',
    'multimedia designer',
    '3D visualization',
    'graphic design',
    'AI-generated content',
  ],
  openGraph: {
    title: 'Fakhrul Alam — 3D Generalist & Multimedia Designer',
    description:
      'Portfolio of Fakhrul Alam, a professional 3D generalist, 3D game assets artist and multimedia designer.',
    type: 'website',
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

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0a09',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

