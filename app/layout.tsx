import './globals.css'
import AppShell from '@/components/AppShell'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="scroll-smooth">
      <body className="bg-slate-600 text-slate-900 min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}