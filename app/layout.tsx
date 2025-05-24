import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import SiteHeader from "@/components/site-header"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DRSV - As Melhores Ofertas! Sempre!", 
  description: "Descubra as melhores ofertas, cuidadosamente selecionadas para você.",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-8 md:py-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-6">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} DRSV. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground">
                Como participante do programa de Afiliados, recebo por compras qualificadas.
              </p>
            </div>
          </footer>
        </div>
        <Toaster />
      </ThemeProvider>
      </body>
    </html>
  )
}
