'use client'

import { useState } from 'react'
import { Star, Users, Settings, Fuel, Check } from 'lucide-react'
import { Vehicle } from '@/lib/supabase'

interface VehicleFleetProps {
    initialVehicles: Vehicle[]
}

export default function VehicleFleet({ initialVehicles }: VehicleFleetProps) {
    const [selectedCategory, setSelectedCategory] = useState('Svi')
    const categories = ['Svi', 'Economy', 'Business', 'Premium', 'SUV', 'Electric', 'Luxury']

    const filteredVehicles = selectedCategory === 'Svi'
        ? initialVehicles
        : initialVehicles.filter((v) => v.category === selectedCategory)

    return (
        <section id="vozila" className="vehicles">
            <div className="container">
                <h2 className="section-title">Naša flota vozila</h2>
                <p className="section-subtitle">
                    Odaberite savršeno vozilo za vaše potrebe iz naše raznolike kolekcije
                </p>

                {/* Category Filter */}
                <div className="category-filter">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Vehicle Grid */}
                <div className="vehicles-grid grid grid-3">
                    {filteredVehicles.length === 0 ? (
                        <div className="empty-state">
                            <p>Nema dostupnih vozila u ovoj kategoriji.</p>
                        </div>
                    ) : (
                        filteredVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="vehicle-card card">
                                <div className="vehicle-image">
                                    <span className="vehicle-emoji">{vehicle.image_url}</span>
                                    <span className="vehicle-category">{vehicle.category}</span>
                                </div>

                                <div className="vehicle-content">
                                    <div className="vehicle-header">
                                        <h4>{vehicle.name}</h4>
                                        <div className="vehicle-rating">
                                            <Star size={14} fill="currentColor" />
                                            <span>{vehicle.rating}</span>
                                        </div>
                                    </div>

                                    <div className="vehicle-specs">
                                        <span><Users size={16} /> {vehicle.seats}</span>
                                        <span><Settings size={16} /> {vehicle.transmission}</span>
                                        <span><Fuel size={16} /> {vehicle.fuel_type}</span>
                                    </div>

                                    <div className="vehicle-features">
                                        {vehicle.features?.map((f, i) => (
                                            <span key={i} className="feature-tag">
                                                <Check size={12} /> {f}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="vehicle-footer">
                                        <div className="vehicle-price">
                                            <span className="price-amount">€{vehicle.price_per_day}</span>
                                            <span className="price-period">/ dan</span>
                                        </div>
                                        <button className="btn btn-primary btn-sm">
                                            Rezerviraj
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
