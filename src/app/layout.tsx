import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'

import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'GitHub Popular Languages',
  description: 'Most used programming languages on GitHub, ranked by public repository count.',
}

type Props = {
  children: ReactNode
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}

export default RootLayout
