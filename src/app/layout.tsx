import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Karoca Rent A Car | Premium Vehicle Rental',
    description: 'Experience premium car rental with Karoca. Wide selection of vehicles, competitive prices, and exceptional service.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="hr">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
