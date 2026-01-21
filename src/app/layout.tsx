import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Karoca Rent A Car | Najam vozila Zadar | Premium Auto iznajmljivanje',
    description: 'Karoca Rent A Car - Premium najam vozila u Zadru. Širok izbor automobila po povoljnim cijenama. Besplatna dostava na aerodrom. Rezervirajte online 24/7!',
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
        description: 'Najbolji rent a car u Zadru. Širok izbor vozila, konkurentne cijene i besplatna dostava na aerodrom. Rezervirajte sada!',
        images: [
            {
                url: 'https://www.karoca-rentacar.hr/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Karoca Rent A Car - Premium vozila u Zadru',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Karoca Rent A Car | Premium najam vozila',
        description: 'Rent a car Zadar - Širok izbor vozila po povoljnim cijenama. Besplatna dostava na aerodrom!',
        images: ['https://www.karoca-rentacar.hr/og-image.jpg'],
    },
    verification: {
        google: 'your-google-verification-code', // Zamijeni s pravim kodom
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
    email: 'info@karoca.hr',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Obala kneza Branimira 1',
        addressLocality: 'Zadar',
        postalCode: '23000',
        addressCountry: 'HR',
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 44.1194,
        longitude: 15.2314,
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
    },
    priceRange: '€€',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '150',
    },
    sameAs: [
        'https://www.facebook.com/karocarentacar',
        'https://www.instagram.com/karocarentacar',
    ],
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
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#0b1d3d" />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
