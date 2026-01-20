'use client'

import { useState } from 'react'
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const blogPosts = [
    {
        id: 1,
        title: 'Savjeti za sigurnu vožnju tijekom ljetne sezone',
        excerpt: 'Ljeto je vrijeme putovanja i odmora. Donosimo vam 10 korisnih savjeta kako sigurno voziti po vrućinama i izbjeći najčešće greške.',
        date: '2024-07-15',
        readTime: '5 min',
        category: 'Savjeti',
    },
    {
        id: 2,
        title: 'Zašto odabrati dugoročni najam vozila?',
        excerpt: 'Dugoročni najam postaje sve popularniji. Saznajte koje su prednosti u odnosu na kupnju vlastitog vozila i leasing.',
        date: '2024-06-28',
        readTime: '4 min',
        category: 'Poslovanje',
    },
    {
        id: 3,
        title: 'Top 5 destinacija za road trip iz Zadra',
        excerpt: 'Od Plitvičkih jezera do Dubrovnika - otkrijte najljepše rute za nezaboravan road trip s Karoca vozilima.',
        date: '2024-06-10',
        readTime: '6 min',
        category: 'Putovanja',
    },
    {
        id: 4,
        title: 'Što trebate znati prije najma vozila u Hrvatskoj',
        excerpt: 'Kompletan vodič za strane i domaće turiste - dokumenti, osiguranje, pravila i sve što morate znati.',
        date: '2024-05-22',
        readTime: '7 min',
        category: 'Vodič',
    },
]

export default function BlogPage() {
    return (
        <div className="blog-page">
            <nav className="blog-nav">
                <div className="container">
                    <Link href="/" className="back-link">
                        <ArrowLeft size={20} />
                        Povratak na početnu
                    </Link>
                    <a href="/" className="logo">
                        <span className="logo-icon">🚗</span>
                        <span className="logo-text">
                            <span className="logo-karoca">Karoca</span>
                            <span className="logo-subtitle">Rent A Car</span>
                        </span>
                    </a>
                </div>
            </nav>

            <header className="blog-header">
                <div className="container">
                    <h1>Novosti i savjeti</h1>
                    <p>Korisni članci o putovanjima, najmu vozila i savjetima za sigurnu vožnju</p>
                </div>
            </header>

            <main className="blog-content">
                <div className="container">
                    <div className="blog-grid">
                        {blogPosts.map((post) => (
                            <article key={post.id} className="blog-card">
                                <div className="blog-card-image">
                                    <span className="blog-category">{post.category}</span>
                                </div>
                                <div className="blog-card-content">
                                    <div className="blog-meta">
                                        <span><Calendar size={14} /> {new Date(post.date).toLocaleDateString('hr-HR')}</span>
                                        <span><Clock size={14} /> {post.readTime}</span>
                                    </div>
                                    <h2>{post.title}</h2>
                                    <p>{post.excerpt}</p>
                                    <button className="read-more">
                                        Pročitaj više <ChevronRight size={16} />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <style jsx>{`
        .blog-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          color: white;
        }
        .blog-nav {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .blog-nav .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: white;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .logo-icon {
          font-size: 1.5rem;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .logo-karoca {
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
        }
        .logo-subtitle {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .blog-header {
          padding: 4rem 0;
          text-align: center;
          background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(245, 175, 25, 0.1) 100%);
        }
        .blog-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .blog-header p {
          color: rgba(255,255,255,0.7);
          font-size: 1.1rem;
        }
        .blog-content {
          padding: 4rem 0;
        }
        .blog-content .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        .blog-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s, border-color 0.3s;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          border-color: rgba(233, 69, 96, 0.5);
        }
        .blog-card-image {
          height: 160px;
          background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 1rem;
        }
        .blog-category {
          padding: 0.375rem 0.75rem;
          background: linear-gradient(135deg, var(--primary, #e94560) 0%, var(--secondary, #f5af19) 100%);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .blog-card-content {
          padding: 1.5rem;
        }
        .blog-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }
        .blog-meta span {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
        }
        .blog-card h2 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .blog-card p {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }
        .read-more {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #e94560;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: gap 0.2s;
        }
        .read-more:hover {
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
        </div>
    )
}
