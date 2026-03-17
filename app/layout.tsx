import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'MongolHub Cars',
  description: 'Find and reserve Korean used cars easily.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn" className={inter.variable}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
