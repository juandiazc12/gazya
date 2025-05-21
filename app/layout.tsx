import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GasStationsProvider } from "@/contexts/gas-stations-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GasYa - Encuentra gasolineras cercanas",
  description: "Aplicación para encontrar y navegar hacia gasolineras cercanas",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <GasStationsProvider>{children}</GasStationsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
