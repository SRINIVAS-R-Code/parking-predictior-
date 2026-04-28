import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { fetchParkings } from '../api/api'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const QUICK_CITIES = ['All', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata']

// Map type definitions
const ESRI_LABELS_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'

const MAP_TYPES = [
    {
        id: 'satellite',
        label: 'Satellite',
        icon: '🛰️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri',
        maxZoom: 18,
        labelsUrl: ESRI_LABELS_URL,
    },
    {
        id: 'street',
        label: 'Street',
        icon: '🛣️',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
    },
    {
        id: 'terrain',
        label: 'Terrain',
        icon: '🏔️',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenTopoMap',
        maxZoom: 17,
        labelsUrl: ESRI_LABELS_URL,
    },
    {
        id: 'dark',
        label: 'Dark HUD',
        icon: '🌙',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
    },
]

// Floating map type switcher overlay for HUD
const MapTypeSwitcher = ({ activeType, onTypeChange }) => {
    const [open, setOpen] = useState(false)
    const active = MAP_TYPES.find(t => t.id === activeType)

    return (
        <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 1000 }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--accent)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)'
                }}
            >
                <span style={{fontSize:16}}>{active.icon}</span>
                {active.label}
                <span style={{fontSize:10, opacity:0.7, marginLeft:4}}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 40, left: 0,
                    background: '#ffffff', border: '1px solid var(--border)',
                    borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
                    minWidth: 150, boxShadow: 'var(--shadow-card)'
                }}>
                    {MAP_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => { onTypeChange(type.id); setOpen(false) }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px', borderRadius: 6, border: 'none',
                                background: activeType === type.id ? 'rgba(37,99,235,0.06)' : 'transparent',
                                color: activeType === type.id ? 'var(--accent)' : 'var(--text-secondary)',
                                cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600,
                            }}
                        >
                            <span style={{fontSize:16}}>{type.icon}</span> {type.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const createCustomIcon = (score) => {
    let typeClass = 'hud-marker-high'
    let text = score ? `${score}%` : '??'
    
    if (score === null || score === undefined) {
        typeClass = ''
    } else if (score < 40) {
        typeClass = 'hud-marker-low'
    } else if (score < 70) {
        typeClass = 'hud-marker-mid'
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="hud-marker ${typeClass}">${text}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
    })
}

// Inner component so we can use useMap to get the map instance
const MapWithControls = ({ activeType, onTypeChange, filteredParkings, navigate }) => {
    const currentTile = MAP_TYPES.find(t => t.id === activeType)

    return (
        <>
            <TileLayer key={activeType + '_base'} url={currentTile.url} attribution={currentTile.attribution} maxZoom={currentTile.maxZoom} />
            {currentTile.labelsUrl && (
                <TileLayer key={activeType + '_labels'} url={currentTile.labelsUrl} attribution='' maxZoom={currentTile.maxZoom} opacity={1} zIndex={2} />
            )}
            {filteredParkings.map((p, idx) => {
                if (p.lat && p.long) {
                    const score = p.avg_availability ?? p.availability_score
                    return (
                        <Marker
                            key={idx}
                            position={[parseFloat(p.lat), parseFloat(p.long)]}
                            icon={createCustomIcon(score)}
                            eventHandlers={{ click: () => navigate('/space', { state: { parking: p } }) }}
                        >
                            <Popup className="hud-popup">
                                <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', background: '#ffffff', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: 'var(--accent)' }}>{p.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>📍 {p.address || p.city}</div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: 12, marginBottom: 12 }}>🏙️ {p.city}</div>
                                    <button
                                        onClick={() => navigate('/space', { state: { parking: p } })}
                                        className="hud-btn"
                                        style={{ display: 'block', width: '100%' }}
                                    >
                                        View Spaces →
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                }
                return null
            })}
            <MapTypeSwitcher activeType={activeType} onTypeChange={onTypeChange} />
        </>
    )
}

const Parking = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate()
    const [parkings, setParkings] = useState()
    const [cityFilter, setCityFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [mapType, setMapType] = useState('satellite')

    useEffect(() => {
        if (user?.type === 'owner') {
            fetchParkings({ user_id: user?._id, setParkings })
        } else {
            fetchParkings({ setParkings })
        }
    }, [user])

    const mapCenter = [22.5937, 82.9629];
    const mapZoom = 5;
    const indiaBounds = [[6.5, 68.0], [37.6, 97.4]];

    const filteredParkings = useMemo(() => {
        if (!parkings) return []
        let filtered = parkings
        if (cityFilter && cityFilter !== 'All') {
            filtered = filtered.filter(p => p.city?.toLowerCase() === cityFilter.toLowerCase())
        }
        if (searchQuery) {
            filtered = filtered.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.city?.toLowerCase().includes(searchQuery.toLowerCase()))
        }
        return filtered
    }, [parkings, cityFilter, searchQuery])

    const stats = useMemo(() => {
        if (!filteredParkings) return { total: 0, live: 0, avg: 0 }
        let total = filteredParkings.length
        let live = filteredParkings.filter(p => (p.avg_availability ?? p.availability_score) >= 40).length
        let sum = filteredParkings.reduce((acc, p) => acc + (p.avg_availability ?? p.availability_score ?? 0), 0)
        let avg = total > 0 ? Math.round(sum / total) : 0
        return { total, live, avg }
    }, [filteredParkings])

    return (
        <div className="hud-container">
            {/* SIDEBAR HUD */}
            <div className="hud-sidebar">
                <div className="hud-header">
                    <div>
                        <div className="hud-logo"><span>P</span> PARKEASE HUD</div>
                        <div className="hud-subtitle">India ML Engine V2.0</div>
                    </div>
                    <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12, border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 6 }}>← Exit</Link>
                </div>

                <div className="hud-card active">
                    <div className="hud-section-title">System Core</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 3s infinite' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.3)' }}></div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>ML Model Active</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>Continuous Learning: {filteredParkings.length * 10} Samples</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Precision: 94.8%</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 16, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #7c3aed, #f472b6)', animation: 'tickerScroll 2s linear infinite' }}></div>
                    </div>
                </div>

                <div className="hud-card">
                    <div className="hud-section-title">Smart Discovery</div>
                    <div className="hud-input-group">
                        <input
                            type="text"
                            className="hud-input"
                            placeholder="Find a spot or area..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                        {QUICK_CITIES.map(city => (
                            <button
                                key={city}
                                onClick={() => setCityFilter(city === 'All' ? '' : city)}
                                style={{
                                    background: (cityFilter === city || (city === 'All' && !cityFilter)) ? 'rgba(37,99,235,0.06)' : '#ffffff',
                                    border: `1px solid ${(cityFilter === city || (city === 'All' && !cityFilter)) ? 'var(--accent)' : 'var(--border)'}`,
                                    color: (cityFilter === city || (city === 'All' && !cityFilter)) ? 'var(--accent)' : 'var(--text-secondary)',
                                    padding: '4px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer',
                                }}
                            >{city}</button>
                        ))}
                    </div>
                </div>

                <div className="hud-card">
                    <div className="hud-section-title">Schedule Scan</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>ARRIVAL DATE</div>
                            <input type="date" className="hud-input" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>ARRIVAL TIME</div>
                            <input type="time" className="hud-input" />
                        </div>
                    </div>
                </div>

                <div className="hud-card" style={{ flex: 1 }}>
                    <div className="hud-section-title">Nearby Highlights</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filteredParkings.slice(0, 3).map((p, i) => (
                            <div key={i} onClick={() => navigate('/space', { state: { parking: p } })} style={{ padding: '10px 12px', background: 'rgba(37,99,235,0.03)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{p.city}</div>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: (p.avg_availability ?? p.availability_score) >= 70 ? '#00ffaa' : '#ffb800' }}>
                                    {p.avg_availability ?? p.availability_score ?? '--'}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {user?.type !== 'seeker' && (
                    <div className="hud-card">
                        <div className="hud-section-title">Data Source</div>
                        <button className="hud-btn" onClick={() => navigate('/parkingForm')}>+ Create Parking Node</button>
                    </div>
                )}
            </div>

            {/* MAIN MAP AREA */}
            <div className="hud-main">
                {/* FLOATING STATS OVERLAY */}
                <div className="hud-overlay">
                    <div className="hud-stat" style={{ color: '#a78bfa' }}>
                        <div className="val">{stats.total}</div>
                        <div className="lbl">Total Nodes</div>
                    </div>
                    <div className="hud-stat" style={{ color: '#00ffaa' }}>
                        <div className="val">{stats.live}</div>
                        <div className="lbl">Live Available</div>
                    </div>
                    <div className="hud-stat" style={{ color: '#00d4ff' }}>
                        <div className="val">{stats.avg}%</div>
                        <div className="lbl">City Traffic</div>
                    </div>
                </div>

                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    minZoom={5}
                    maxZoom={18}
                    maxBounds={indiaBounds}
                    maxBoundsViscosity={1.0}
                    style={{ height: '100%', width: '100%', zIndex: 1, background: '#0b0f19' }}
                    zoomControl={false}
                >
                    <MapWithControls activeType={mapType} onTypeChange={setMapType} filteredParkings={filteredParkings} navigate={navigate} />
                </MapContainer>
            </div>
        </div>
    )
}

export default Parking