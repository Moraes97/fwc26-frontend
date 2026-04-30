import { Barlow_Condensed, Barlow } from 'next/font/google'
import './globals.css'

const barlow = Barlow({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-barlow' })
const barlowCond = Barlow_Condensed({ subsets: ['latin'], weight: ['400','700','900'], variable: '--font-barlow-cond' })

export const metadata = {
  title: 'FWC26 Trocas — Figurinhas Copa 2026',
  description: 'Plataforma de trocas de figurinhas da Copa do Mundo 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${barlow.variable} ${barlowCond.variable}`}>
        {children}
      </body>
    </html>
  )
}
