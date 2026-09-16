import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './refresh.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap' })

export const metadata: Metadata = {
    metadataBase: new URL('https://www.karoca-rentacar.hr'),
    title: 'Karoca Rent A Car | Najam vozila Zadar | Premium Auto iznajmljivanje',
    description: 'Karoca Rent A Car: najam Suzuki Vitara 2026. u Zadru od 1. travnja 2027. Pošaljite upit za vozilo i odabrani termin.',
    keywords: 'rent a car zadar, najam vozila zadar, auto iznajmljivanje, car rental croatia, rent a car airport zadar, jeftini najam auta',
    authors: [{ name: 'Karoca Rent A Car' }],
    creator: 'Karoca Rent A Car',
    publisher: 'Karoca Rent A Car',
    robots: 'index, follow',
    alternates: {
        canonical: 'https://www.karoca-rentacar.hr',
    },
    openGraph: {
        type: 'website',
        locale: 'hr_HR',
        url: 'https://www.karoca-rentacar.hr',
        siteName: 'Karoca Rent A Car',
        title: 'Karoca Rent A Car | Premium najam vozila u Zadru',
        description: 'Najam Suzuki Vitara u Zadru od 1. travnja 2027. Provjerite ponudu i pošaljite upit za najam.',
        images: [
            {
                url: 'https://www.karoca-rentacar.hr/vehicles/suzuki-vitara.png',
                width: 1200,
                height: 630,
                alt: 'Karoca Rent A Car - Premium vozila u Zadru',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Karoca Rent A Car | Premium najam vozila',
        description: 'Karoca Rent A Car: Suzuki Vitara, godište 2026. Najmovi u Zadru od 1. travnja 2027.',
        images: ['https://www.karoca-rentacar.hr/vehicles/suzuki-vitara.png'],
    },
    other: {
        'geo.region': 'HR-13',
        'geo.placename': 'Zadar',
        'geo.position': '44.1194;15.2314',
        'ICBM': '44.1194, 15.2314',
    },
}

// Structured Data (Schema.org) for Local Business
const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: 'Karoca Rent A Car',
    image: 'https://www.karoca-rentacar.hr/karoca-logo-new.png',
    '@id': 'https://www.karoca-rentacar.hr',
    url: 'https://www.karoca-rentacar.hr',
    telephone: '+385991655885',
    email: 'info@karoca-rentacar.hr',

}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="hr">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                <link rel="icon" href="/favicon.svg" />
                <meta name="theme-color" content="#0b1d3d" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
