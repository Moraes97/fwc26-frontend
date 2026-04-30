import './globals.css'

export const metadata = {
  title: 'FWC26 Trocas — Figurinhas Copa 2026',
  description: 'Plataforma de trocas de figurinhas da Copa do Mundo 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
