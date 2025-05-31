import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "ShopWave - Your Ultimate Online Shopping Destination",
  keywords: [
    "ecommerce", 
    "online shopping", 
    "electronics", 
    "fashion", 
    "home appliances", 
    "books", 
    "gadgets", 
    "clothing", 
    "shoes", 
    "buy online", 
    "shop now"
  ],
  authors: [{ name: "ShopWave Team", url: "" }],
  description: "Shop premium products, including electronics, clothing, gadgets, and more, at ShopWave. Enjoy unbeatable prices, fast shipping, and great customer service.",
  generator: 'Next.js',
  applicationName: "ShopWave",
  icons: "https://www.restoconnection.com/wp-content/uploads/connections-images/shopwave/logo_shopwave_black_logo.jpg"
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
