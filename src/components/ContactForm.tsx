'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, Loader2 } from 'lucide-react'

export default function ContactForm() {
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactLoading, setContactLoading] = useState(false)
    const [contactSuccess, setContactSuccess] = useState(false)

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setContactLoading(true)

        const { error } = await supabase
            .from('contact_messages')
            .insert([contactForm])

        if (error) {
            console.error('Error sending message:', error)
            alert('Greška pri slanju poruke. Molimo pokušajte ponovo.')
        } else {
            setContactSuccess(true)
            setContactForm({ name: '', email: '', message: '' })
            setTimeout(() => setContactSuccess(false), 5000)
        }
        setContactLoading(false)
    }

    return (
        <form className="contact-form glass" onSubmit={handleContactSubmit}>
            {contactSuccess && (
                <div className="success-message">
                    <Check size={20} />
                    Poruka je uspješno poslana!
                </div>
            )}
            <div className="form-group">
                <label>Ime i prezime</label>
                <input
                    type="text"
                    placeholder="Vaše ime"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="vas@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>Poruka</label>
                <textarea
                    placeholder="Vaša poruka..."
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                ></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={contactLoading}>
                {contactLoading ? (
                    <>
                        <Loader2 className="spinner" size={18} />
                        Slanje...
                    </>
                ) : (
                    'Pošalji poruku'
                )}
            </button>
        </form>
    )
}
