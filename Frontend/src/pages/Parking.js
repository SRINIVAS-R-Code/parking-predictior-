import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { fetchParkings } from '../api/api'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

const QUICK_CITIES = ['All', 'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Malleswaram', 'Electronic City']

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

const createCustomIcon = (score, isUploaded = false) => {
    let typeClass = 'hud-marker-high'
    let text = score ? `${score}%` : '??'
    
    if (score === null || score === undefined) {
        typeClass = ''
    } else if (score < 40) {
        typeClass = 'hud-marker-low'
    } else if (score < 70) {
        typeClass = 'hud-marker-mid'
    }

    let ringHTML = isUploaded ? `<div style="position:absolute; inset:-4px; border:2px solid #00d4ff; border-radius:50%; animation: pulse 2s infinite;"></div>` : ''
    
    let statsHTML = score !== null ? `
        <div style="background:rgba(0,0,0,0.7); color:#fff; font-size:9px; padding:2px 5px; border-radius:4px; margin-top:4px; white-space:nowrap; border:1px solid rgba(255,255,255,0.2);">
            ${score}% Open | ${100 - score}% Occ
        </div>
    ` : ''

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="position:relative; display:flex; flex-direction:column; align-items:center;">${ringHTML}<div class="hud-marker ${typeClass}">${text}</div>${statsHTML}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
    })
}

// MapController: exposes map.flyTo to the parent via a ref
const MapController = ({ flyToRef }) => {
    const map = useMap()
    useEffect(() => {
        if (flyToRef) flyToRef.current = (lat, lng, zoom = 14) =>
            map.flyTo([lat, lng], zoom, { duration: 1.5, easeLinearity: 0.25 })
    }, [map, flyToRef])
    return null
}

// Inner component so we can use useMap to get the map instance
const MapWithControls = ({ activeType, onTypeChange, filteredParkings, setSelectedLot, flyToRef }) => {
    const currentTile = MAP_TYPES.find(t => t.id === activeType)

    return (
        <>
            <MapController flyToRef={flyToRef} />
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
                            icon={createCustomIcon(score, p.isUploaded)}
                            title={`${p.name} - ${score}% Available`}
                            eventHandlers={{ click: () => setSelectedLot(p) }}
                        />
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
    const [selectedLot, setSelectedLot] = useState(null)
    const [toast, setToast] = useState('')
    const flyToRef = useRef(null)

    // Bangalore ML state
    const [hour, setHour] = useState(new Date().getHours())
    const [bangaloreLots, setBangaloreLots] = useState([])
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const debounceRef = useRef(null)
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const fetchBangaloreLots = async (h) => {
        try {
            const res = await axios.get(`https://parking-predictior.onrender.com/api/bangalore-lots/?hour=${h}`)
            const data = res.data.lots || []
            const mapped = data.map(l => ({
                id: l.lot_id,
                name: l.lot_name,
                city: 'Bangalore',
                lat: l.lat,
                long: l.lng,
                address: l.location_area,
                type: l.lot_type,
                price: l.price_per_hour,
                availability_score: l.availability_score,
                avg_availability: l.availability_score,
                total_spaces: l.total_spaces,
                available_spaces: l.available_spaces,
                status: l.status,
                isBangaloreLot: true
            }))
            setBangaloreLots(mapped)
        } catch (err) {
            console.error('Could not load Bangalore lots', err)
        }
    }

    useEffect(() => {
        fetchBangaloreLots(hour)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleHourChange = (e) => {
        const h = parseInt(e.target.value)
        setHour(h)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchBangaloreLots(h), 400)
    }

    const lotTypes = useMemo(() => {
        const types = new Set()
        if (parkings) parkings.forEach(p => p.type && types.add(p.type))
        bangaloreLots.forEach(p => p.type && types.add(p.type))
        return ['all', ...Array.from(types).sort()]
    }, [parkings, bangaloreLots])


    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchBangaloreLots(new Date().getHours())
            setLastRefresh(new Date())
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        // Only load DB parkings for owners (their own listings)
        // Seekers see ONLY the Bangalore ML lots — no DB duplicates
        if (user?.type === 'owner') {
            fetchParkings({ user_id: user?._id, setParkings })
        }
        // else: leave parkings as undefined — only bangaloreLots will show
    }, [user])


    const mapCenter = [12.9716, 77.5946];
    const mapZoom = 12;

    const filteredParkings = useMemo(() => {
        let combined = [...(parkings || []), ...bangaloreLots]
        if (combined.length === 0) return []
        let filtered = combined
        
        if (cityFilter && cityFilter !== 'All') {
            filtered = filtered.filter(p => 
                p.city?.toLowerCase() === cityFilter.toLowerCase() || 
                p.address?.toLowerCase().includes(cityFilter.toLowerCase()) ||
                p.isUploaded
            )
        }
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(p => 
                p.name?.toLowerCase().includes(q) || 
                p.city?.toLowerCase().includes(q) ||
                p.address?.toLowerCase().includes(q)
            )
        }

        if (statusFilter === 'available') {
            filtered = filtered.filter(p => (p.avg_availability ?? p.availability_score) >= 35)
        } else if (statusFilter === 'occupied') {
            filtered = filtered.filter(p => (p.avg_availability ?? p.availability_score) < 50)
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p.type === typeFilter)
        }

        return filtered
    }, [parkings, bangaloreLots, cityFilter, searchQuery, statusFilter, typeFilter])

    // Stats computed from ML dataset lots only (true dataset-driven numbers)
    const mlStats = useMemo(() => {
        const lots = bangaloreLots
        if (!lots.length) return { total: 0, high: 0, moderate: 0, low: 0, avg: 0 }
        const scores = lots.map(p => p.availability_score ?? 0)
        const high     = scores.filter(s => s >= 70).length
        const moderate = scores.filter(s => s >= 40 && s < 70).length
        const low      = scores.filter(s => s < 40).length
        const avg      = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        return { total: lots.length, high, moderate, low, avg }
    }, [bangaloreLots])

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
                        <div className="hud-logo"><span>S</span> SMARTPARK</div>
                        <div className="hud-subtitle">Bangalore Live Intelligence</div>
                    </div>
                    <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12, border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 6 }}>← Exit</Link>
                </div>

                {/* ── SYSTEM CORE ── */}
                <div className="hud-card active" style={{ boxShadow: "0 0 15px rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.5)" }}>
                    <div className="hud-section-title">System Core</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* ML pulse ring */}
                        <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                            <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="3" />
                                <circle cx="24" cy="24" r="20" fill="none" stroke="#7c3aed" strokeWidth="3"
                                    strokeDasharray={`${Math.round(stats.avg * 1.257)} 126`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 24 24)"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#7c3aed' }}>
                                {stats.avg}%
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>RandomForest ML Active</div>
                            <div style={{ color: '#7c3aed', fontSize: 11, marginTop: 3, fontWeight: 600 }}>{filteredParkings.length} lots monitored</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>Trained on 600K Bangalore records</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 12, height: 3, background: 'rgba(124,58,237,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #7c3aed, #00d4ff, #7c3aed)', backgroundSize: '200% 100%', animation: 'tickerScroll 2s linear infinite' }}></div>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Last refresh: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        <button onClick={() => {
                            fetchBangaloreLots(hour)
                            setLastRefresh(new Date())
                            setToast('Predictions updated!')
                            setTimeout(() => setToast(''), 3000)
                        }}
                            style={{ fontSize: 10, color: '#00d4ff', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── LIVE INTELLIGENCE ── */}
                <div className="hud-card" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), transparent)', border: '1px solid rgba(0,212,255,0.25)' }}>
                    <div className="hud-section-title" style={{ color: '#00d4ff' }}>Live Intelligence</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {[
                            { label: 'Total Lots', value: filteredParkings.length, color: '#a78bfa' },
                            { label: 'Available', value: filteredParkings.filter(p => (p.avg_availability ?? p.availability_score ?? 0) >= 50).length, color: '#10b981' },
                            { label: 'Occupied', value: filteredParkings.filter(p => (p.avg_availability ?? p.availability_score ?? 0) < 50).length, color: '#ef4444' },
                            { label: 'Avg Score', value: stats.avg + '%', color: '#00d4ff' },
                        ].map(item => (
                            <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{item.value}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                    {/* Availability distribution bar */}
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>Availability Distribution</div>
                    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
                        {(() => {
                            const high = filteredParkings.filter(p => (p.avg_availability ?? p.availability_score ?? 0) >= 70).length
                            const mid  = filteredParkings.filter(p => { const s = p.avg_availability ?? p.availability_score ?? 0; return s >= 40 && s < 70 }).length
                            const low  = filteredParkings.filter(p => (p.avg_availability ?? p.availability_score ?? 0) < 40).length
                            const total = filteredParkings.length || 1
                            return (
                                <>
                                    <div style={{ flex: high/total, background: '#10b981', borderRadius: '4px 0 0 4px', minWidth: high > 0 ? 4 : 0 }} title={`High: ${high}`} />
                                    <div style={{ flex: mid/total, background: '#f59e0b', minWidth: mid > 0 ? 4 : 0 }} title={`Moderate: ${mid}`} />
                                    <div style={{ flex: low/total, background: '#ef4444', borderRadius: '0 4px 4px 0', minWidth: low > 0 ? 4 : 0 }} title={`Low: ${low}`} />
                                </>
                            )
                        })()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--text-muted)' }}>
                        <span style={{ color: '#10b981' }}>High ≥70%</span>
                        <span style={{ color: '#f59e0b' }}>Mod 40-69%</span>
                        <span style={{ color: '#ef4444' }}>Low &lt;40%</span>
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
                    <div className="hud-section-title">Time Simulation</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                            <span>Arrival Hour</span>
                            <span style={{ fontWeight: 'bold', color: '#00d4ff' }}>
                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={23}
                            value={hour}
                            onChange={handleHourChange}
                            style={{ width: '100%', cursor: 'pointer', accentColor: '#00d4ff' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                            <span>12 AM</span>
                            <span>11 PM</span>
                        </div>
                    </div>
                </div>

                <div className="hud-card">
                    <div className="hud-section-title">Filters</div>
                    
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Status</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {[
                            { key: 'all', emoji: '🅿️', label: 'All' },
                            { key: 'available', emoji: '🟢', label: 'Available' },
                            { key: 'occupied', emoji: '🔴', label: 'Occupied' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                style={{
                                    flex: 1, padding: '6px 4px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                                    background: statusFilter === f.key ? 'rgba(0,212,255,0.1)' : '#ffffff',
                                    border: `1px solid ${statusFilter === f.key ? '#00d4ff' : 'var(--border)'}`,
                                    color: statusFilter === f.key ? '#00d4ff' : 'var(--text-secondary)',
                                    fontWeight: statusFilter === f.key ? 700 : 500
                                }}
                            >
                                {f.emoji} {f.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Type</div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{
                            width: '100%', padding: '6px 10px', borderRadius: 6, fontSize: 12,
                            border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-primary)', outline: 'none'
                        }}
                    >
                        {lotTypes.map(t => (
                            <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
                        ))}
                    </select>
                </div>

                <div className="hud-card" style={{ flex: 1 }}>
                    <div className="hud-section-title">Top Available Spots</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[...filteredParkings]
                            .sort((a, b) => (b.avg_availability ?? b.availability_score ?? 0) - (a.avg_availability ?? a.availability_score ?? 0))
                            .slice(0, 5)
                            .map((p, i) => {
                                const score = p.avg_availability ?? p.availability_score ?? 0
                                const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
                                return (
                                    <div key={i} onClick={() => navigate('/space', { state: { parking: p } })}
                                        style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{p.name}</div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color, flexShrink: 0 }}>{score}%</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                                            </div>
                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', flexShrink: 0 }}>{p.address || p.city}</div>
                                        </div>
                                    </div>
                                )
                            })
                        }
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
                {/* FLOATING STATS OVERLAY — top-right of map, dataset-driven */}
                <div style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 1100,
                    display: 'flex', gap: 10, pointerEvents: 'none',
                }}>
                    {[
                        { val: mlStats.total,    lbl: 'ML Lots',    color: '#a78bfa', title: 'Bangalore dataset lots' },
                        { val: mlStats.high,     lbl: 'High Avail', color: '#00ffaa', title: 'Score ≥ 70%' },
                        { val: mlStats.avg + '%',lbl: 'Avg Score',  color: '#00d4ff', title: 'Mean ML prediction' },
                    ].map(s => (
                        <div key={s.lbl} title={s.title} style={{
                            background: 'rgba(10,15,30,0.85)',
                            border: `1px solid ${s.color}44`,
                            borderRadius: 10, padding: '8px 14px',
                            backdropFilter: 'blur(12px)', textAlign: 'center',
                            boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${s.color}22`,
                            minWidth: 68,
                        }}>
                            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, textShadow: `0 0 12px ${s.color}` }}>{s.val}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{s.lbl}</div>
                        </div>
                    ))}
                </div>

                {/* LOCATE ME BUTTON */}
                <button
                    title="Center map on my location"
                    onClick={() => {
                        if (!navigator.geolocation) { alert('Geolocation not supported by your browser'); return }
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                if (flyToRef.current) flyToRef.current(pos.coords.latitude, pos.coords.longitude, 14)
                                setToast('Map centered on your location')
                                setTimeout(() => setToast(''), 3000)
                            },
                            () => { setToast('Location access denied'); setTimeout(() => setToast(''), 3000) }
                        )
                    }}
                    style={{
                        position: 'absolute', bottom: 100, right: 16, zIndex: 1000,
                        width: 42, height: 42, borderRadius: '50%',
                        background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(0,212,255,0.4)',
                        color: '#00d4ff', fontSize: 18, cursor: 'pointer',
                        backdropFilter: 'blur(10px)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.92)'}
                >
                    📍
                </button>

                {/* TOAST NOTIFICATION */}
                {toast && (
                    <div style={{
                        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                        zIndex: 1001, background: 'rgba(15,23,42,0.95)',
                        border: '1px solid rgba(0,212,255,0.4)', borderRadius: 10,
                        padding: '10px 20px', color: '#00d4ff', fontSize: 13, fontWeight: 600,
                        backdropFilter: 'blur(10px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', gap: 8,
                        animation: 'fadeInUp 0.3s ease',
                    }}>
                        <span style={{ fontSize: 16 }}>✓</span> {toast}
                    </div>
                )}

                {/* RICH LOT INFO PANEL — shown when a marker is clicked */}
                {selectedLot && (() => {
                    const score = selectedLot.avg_availability ?? selectedLot.availability_score ?? 0
                    const probColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
                    const probLabel = score >= 70 ? 'High Availability' : score >= 40 ? 'Moderate' : 'Low Availability'
                    const lotTypeIcon = { Mall: '🏬', Office: '🏢', Hospital: '🏥', Street: '🛣️', Airport: '✈️', Transit: '🚌', Residential: '🏘️' }[selectedLot.type] || '🅿️'
                    return (
                        <div style={{
                            position: 'absolute', bottom: 24, left: 24, zIndex: 1001,
                            width: 320, background: 'rgba(10,15,30,0.97)',
                            border: `1px solid ${probColor}44`,
                            borderRadius: 16, overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${probColor}22`,
                            animation: 'fadeInUp 0.3s ease',
                        }}>
                            {/* Coloured top bar */}
                            <div style={{ height: 4, background: `linear-gradient(90deg, ${probColor}, transparent)` }} />

                            <div style={{ padding: '16px 18px' }}>
                                {/* Header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                            {lotTypeIcon} {selectedLot.type || 'Parking'}
                                        </div>
                                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 16, lineHeight: 1.3, marginBottom: 4 }}>
                                            {selectedLot.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                            📍 {selectedLot.address || selectedLot.city}
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedLot(null)}
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'var(--text-muted)', width: 28, height: 28, cursor: 'pointer', fontSize: 14, flexShrink: 0, marginLeft: 8 }}>
                                        ✕
                                    </button>
                                </div>

                                {/* AI Score bar */}
                                <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${probColor}33`, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>🤖 AI AVAILABILITY</div>
                                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: probColor }}>{score}%</div>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${probColor}99, ${probColor})`, borderRadius: 99, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${probColor}66` }} />
                                    </div>
                                    <div style={{ fontSize: 11, color: probColor, fontWeight: 600, marginTop: 4 }}>{probLabel}</div>
                                </div>

                                {/* Stats row */}
                                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                                    {[
                                        { label: 'Spaces', value: selectedLot.total_spaces || '—' },
                                        { label: 'Available', value: selectedLot.available_spaces ?? Math.round((score / 100) * (selectedLot.total_spaces || 100)) },
                                    ].map(s => (
                                        <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '7px 10px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 15 }}>{s.value}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => navigate('/space', { state: { parking: selectedLot } })}
                                        style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${probColor}, ${probColor}cc)`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 12px ${probColor}44` }}
                                    >
                                        🅿️ Book This Spot
                                    </button>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLot.lat},${selectedLot.long}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontWeight: 600, fontSize: 13, textDecoration: 'none', background: 'rgba(0,212,255,0.06)', display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                        🗺️ Nav
                                    </a>
                                    <button
                                        onClick={() => { if (flyToRef.current) flyToRef.current(selectedLot.lat, selectedLot.long, 17) }}
                                        style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}
                                        title="Zoom in to this lot"
                                    >
                                        🔍
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })()}

                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    minZoom={5}
                    maxZoom={18}
                    style={{ height: '100%', width: '100%', zIndex: 1, background: '#0b0f19' }}
                    zoomControl={false}
                >
                    <MapWithControls activeType={mapType} onTypeChange={setMapType} filteredParkings={filteredParkings} setSelectedLot={setSelectedLot} flyToRef={flyToRef} />
                </MapContainer>
            </div>
        </div>
    )
}

export default Parking