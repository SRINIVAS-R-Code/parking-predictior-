import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { deleteSpace, fetchSpaces } from '../api/api'
import { DeleteModal, SpaceCard } from '../components'

const TIME_SLOTS = [
    { start: '8:00am',  end: '10:00am' },
    { start: '10:00am', end: '12:00pm' },
    { start: '12:00pm', end: '2:00pm'  },
    { start: '2:00pm',  end: '4:00pm'  },
    { start: '4:00pm',  end: '6:00pm'  },
    { start: '6:00pm',  end: '8:00pm'  },
]

// ── Deterministic seed from lot name so every lot is unique ────
const makeSeed = (name = '') => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
    return Math.abs(h);
}

// ── Slot labels per lot type ──────────────────────────────────
const SLOT_LABELS = {
    Mall:        ['Level 1 – Bay A', 'Level 1 – Bay B', 'Level 2 – Bay A', 'Level 2 – Bay B', 'Level 3 – Bay A', 'Terrace Park'],
    Office:      ['Block A – Fl. 1', 'Block A – Fl. 2', 'Block B – Fl. 1', 'Block B – Fl. 2', 'Visitor Bay',     'Reserved Zone'],
    Hospital:    ['Emergency Bay',   'OPD Parking',     'Visitor Zone A',  'Visitor Zone B',  'Night Parking',   'Staff Reserved'],
    Airport:     ['P1 – Level 1',    'P1 – Level 2',    'P2 – Level 1',    'P2 – Level 2',    'Short Stay',      'Long Stay'],
    Transit:     ['Platform Bay 1',  'Platform Bay 2',  'Short Stop',      'Day Parking',     'Night Parking',   'Commuter Zone'],
    Street:      ['North Side',      'South Side',      'East Corner',     'West Corner',     'Near Junction',   'Service Lane'],
    Residential: ['Block A',         'Block B',         'Visitor Slot',    'Two-Wheeler',     'EV Charging',     'Night Slot'],
}
const BASE_PRICE = { Mall:60, Office:50, Hospital:40, Airport:120, Transit:30, Street:20, Residential:25 }

// Natural hour-of-day offset from lot average (not a multiplier — keeps mid/low realistic)
// Morning rush → slightly below avg; midday → above avg; evening rush → below avg again
const HOUR_OFFSETS = [+4, +8, +12, -8, -14, -2]

// ── Build unique preview slots for one lot ─────────────────────
const buildPreviewSlots = (p) => {
    const score     = p.availability_score ?? p.avg_availability ?? 50
    const seed      = makeSeed(p.name)
    const labels    = (SLOT_LABELS[p.type] || ['Zone A','Zone B','Zone C','Zone D','Zone E','Zone F'])
    const count     = Math.min(6, Math.max(3, Math.ceil((p.total_spaces || 100) / 80)))
    const basePrice = (BASE_PRICE[p.type] || 50) + (seed % 11) - 5

    return labels.slice(0, count).map((name, i) => {
        // Seed-based jitter: ±10 unique to this lot + slot index
        const jitter    = ((seed >> (i * 3 + 2)) & 0x1f) - 10      // range -10 … +11
        // Final slot score = lot score + natural hour drift + lot-specific jitter
        const rawScore  = score + HOUR_OFFSETS[i] + jitter
        const slotScore = Math.min(97, Math.max(8, Math.round(rawScore)))
        const slotPrice = Math.max(15, basePrice + ((seed >> (i + 3)) % 21) - 7)
        return {
            _id:              `prev_${seed}_${i}`,
            name,
            parking_id: {
                name:    p.name,
                city:    p.city    || 'Bangalore',
                address: p.address || p.area || p.city || 'Bangalore',
            },
            date:             new Date(),
            slot_start_time:  TIME_SLOTS[i].start,
            slot_end_time:    TIME_SLOTS[i].end,
            price:            slotPrice,
            availability_score: slotScore,
            lot_type:         p.type  || 'Parking',
            total_spaces:     p.total_spaces || 100,
            isPreview:        true,
        }
    })
}


const Space = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [spaces, setSpaces] = useState()
    const [fromMapLot, setFromMapLot] = useState(null)
    const [loadingSource, setLoadingSource] = useState('')
    const time = ['12:00am', '2:00am', '4:00am', '6:00am', '8:00am', '10:00am', '12:00pm', '2:00pm', '4:00pm', '6:00pm', '8:00pm', '10:00pm']

    const [searchForm, setSearchForm] = useState({ city: '', date: '', time: '', availability: false })
    const [selectedSpace, setSelectedSpace] = useState()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // ── Client-side filter state ──────────────────────────────
    const [scoreFilter, setScoreFilter] = useState('all')   // 'all' | 'high' | 'moderate' | 'low'
    const [timeFilter, setTimeFilter] = useState('all')     // 'all' | 'morning' | 'afternoon' | 'evening'
    const [sortBy, setSortBy] = useState('score')           // 'score' | 'earliest' | 'latest'
    const [searchText, setSearchText] = useState('')

    useEffect(() => {
        if (state?.parking) {
            const p = state.parking;
            setFromMapLot(p);

            // ── If this is a Bangalore map lot (isBangaloreLot flag or LOT_ prefix),
            //    skip the DB call entirely and show AI preview slots immediately ──
            const isBangaloreLot =
                p.isBangaloreLot ||
                String(p._id  || '').startsWith('LOT_') ||
                String(p.id   || '').startsWith('LOT_');

            if (isBangaloreLot) {
                // Show preview slots instantly — no backend wait needed
                setSpaces(buildPreviewSlots(p));
                setLoadingSource('preview');
                return;
            }

            // ── Real DB lot: try fetching actual spaces ──
            setLoadingSource('db');
            let settled = false;

            // Safety timeout: if backend takes >6 s, fall back to preview
            const timer = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    setSpaces(buildPreviewSlots(p));
                    setLoadingSource('preview');
                }
            }, 6000);

            fetchSpaces({
                parking_id: p._id,
                setSpaces: (fetched) => {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        if (fetched && fetched.length > 0) {
                            setSpaces(fetched);
                            setLoadingSource('real');
                        } else {
                            // DB empty → AI preview
                            setSpaces(buildPreviewSlots(p));
                            setLoadingSource('preview');
                        }
                    }
                }
            });

            return () => clearTimeout(timer);
        } else {
            setLoadingSource('list');
            const queryParams = {};
            if (user?.type === 'owner') queryParams.user_id = user?._id;
            fetchSpaces({ ...queryParams, setSpaces });
        }
    }, [state, user])

    const handleSearchForm = ({ key, value }) => setSearchForm({ ...searchForm, [key]: value })

    const handleSearch = () => {
        setSpaces([])
        const queryParams = {}
        if (user?.type === 'owner') queryParams.user_id = user?._id
        fetchSpaces({ ...queryParams, ...searchForm, setSpaces })
    }

    // ── Apply client-side filters + sort ─────────────────────
    const applyFilters = (list) => {
        let out = [...list]
        // Score filter
        if (scoreFilter === 'high')     out = out.filter(s => (s.availability_score||0) >= 70)
        if (scoreFilter === 'moderate') out = out.filter(s => (s.availability_score||0) >= 40 && (s.availability_score||0) < 70)
        if (scoreFilter === 'low')      out = out.filter(s => (s.availability_score||0) < 40)
        // Time filter
        if (timeFilter === 'morning')   out = out.filter(s => ['6:00am','7:00am','8:00am','9:00am','10:00am','11:00am'].some(t => s.slot_start_time?.includes(t.replace(':00','').replace('am','')) ))
        if (timeFilter === 'afternoon') out = out.filter(s => ['12:00pm','1:00pm','2:00pm','3:00pm','4:00pm'].some(t => s.slot_start_time?.toLowerCase().includes(t.split(':')[0])))
        if (timeFilter === 'evening')   out = out.filter(s => ['5:00pm','6:00pm','7:00pm','8:00pm','9:00pm'].some(t => s.slot_start_time?.toLowerCase().includes(t.split(':')[0])))
        // Text search
        if (searchText.trim()) {
            const q = searchText.toLowerCase()
            out = out.filter(s =>
                s.name?.toLowerCase().includes(q) ||
                s.parking_id?.name?.toLowerCase().includes(q) ||
                s.parking_id?.city?.toLowerCase().includes(q)
            )
        }
        // Sort
        if (sortBy === 'score')    out.sort((a, b) => (b.availability_score||0) - (a.availability_score||0))
        if (sortBy === 'earliest') out.sort((a, b) => (a.slot_start_time||'').localeCompare(b.slot_start_time||''))
        if (sortBy === 'latest')   out.sort((a, b) => (b.slot_start_time||'').localeCompare(a.slot_start_time||''))
        return out
    }

    const sortedSpaces = spaces ? applyFilters(spaces) : []

    const handleDeleteSpace = () => deleteSpace({ id: selectedSpace?._id, handleDeleteSpaceSuccess, handleDeleteSpaceFailure })
    const handleDeleteSpaceSuccess = () => { handleSearch(); setShowDeleteModal(false) }
    const handleDeleteSpaceFailure = () => setShowDeleteModal(false)

    return (
        <div className="sp-container" style={{paddingTop:40}}>
            {/* PAGE HEADER */}
            <div style={{marginBottom:28}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                    <div>
                        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.25)',borderRadius:99,padding:'4px 14px',fontSize:11,fontWeight:700,color:'var(--accent)',letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>
                            <span style={{width:7,height:7,borderRadius:'50%',background:'var(--accent)',display:'inline-block',animation:'pulse 2s infinite'}}></span>
                            🤖 AI Prediction Engine Active
                        </div>
                        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:32,fontWeight:800,letterSpacing:-1,marginBottom:6}}>
                            {fromMapLot ? `📍 ${fromMapLot.name}` : 'Find Parking Spaces'}
                        </h1>
                        <p style={{color:'var(--text-secondary)',fontSize:14}}>
                            {fromMapLot
                                ? `${fromMapLot.address || fromMapLot.area || fromMapLot.city || 'Bangalore'} · ${loadingSource === 'real' ? '✅ Live DB spaces loaded' : loadingSource === 'preview' ? '⚡ AI-generated preview' : 'Loading...'}`
                                : 'AI predicts real-time availability across Bangalore — sorted by best chance of parking'}
                        </p>
                    </div>
                    {user?.type !== 'seeker' && (
                        <button className="sp-btn-primary" onClick={() => navigate('/spaceForm')}>+ Create Space</button>
                    )}
                </div>

                {/* Preview notice */}
                {loadingSource === 'preview' && (
                    <div style={{marginTop:14,padding:'10px 16px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:10,fontSize:13,color:'#f59e0b',display:'flex',alignItems:'center',gap:8}}>
                        ⚠️ <strong>AI Preview Mode:</strong> No DB spaces found for this lot yet. Showing estimated slot availability. Contact the owner to list real spaces.
                    </div>
                )}

                {/* PREDICTION SUMMARY BAR */}
                {sortedSpaces.length > 0 && (
                    <div style={{display:'flex',gap:16,marginTop:20,flexWrap:'wrap'}}>
                        {[
                            { label: 'High Availability (≥70%)', count: sortedSpaces.filter(s => (s.availability_score||0) >= 70).length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', emoji: '🟢' },
                            { label: 'Moderate (40–69%)',         count: sortedSpaces.filter(s => (s.availability_score||0) >= 40 && (s.availability_score||0) < 70).length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', emoji: '🟡' },
                            { label: 'Low Availability (<40%)',   count: sortedSpaces.filter(s => (s.availability_score||0) < 40).length, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', emoji: '🔴' },
                        ].map(stat => (
                            <div key={stat.label} style={{display:'flex',alignItems:'center',gap:10,background:stat.bg,border:`1px solid ${stat.border}`,borderRadius:10,padding:'8px 16px',flex:1,minWidth:180}}>
                                <span style={{fontSize:20}}>{stat.emoji}</span>
                                <div>
                                    <div style={{fontFamily:"'Space Grotesk'",fontSize:20,fontWeight:800,color:stat.color}}>{stat.count}</div>
                                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SEARCH — only show if not coming from a map lot */}
            {!fromMapLot && (
                <div className="sp-card mb-3" style={{padding:'24px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,alignItems:'end'}}>
                        <div className="sp-input-group" style={{margin:0}}>
                            <label>City / Area</label>
                            <input type="text" placeholder='e.g. Koramangala' className="sp-input" value={searchForm?.city} onChange={(e) => handleSearchForm({ key: 'city', value: e.target.value })} />
                        </div>
                        <div className="sp-input-group" style={{margin:0}}>
                            <label>Date</label>
                            <input type="date" className="sp-input" value={searchForm?.date} onChange={(e) => handleSearchForm({ key: 'date', value: e.target.value })} />
                        </div>
                        <div className="sp-input-group" style={{margin:0}}>
                            <label>Time</label>
                            <select className="sp-input sp-select" value={searchForm?.time} onChange={(e) => handleSearchForm({ key: 'time', value: e.target.value })} >
                                <option value="">Any Time</option>
                                {time?.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="sp-input-group" style={{margin:0,flexDirection:'row',alignItems:'center',gap:10,height:41}}>
                            <input type="checkbox" id="avail" checked={searchForm?.availability} style={{width:18,height:18,accentColor:'var(--accent)'}}
                                onChange={(e) => handleSearchForm({ key: 'availability', value: e.target.checked })} />
                            <label htmlFor="avail" style={{margin:0,cursor:'pointer'}}>Available Only</label>
                        </div>
                        <button className="sp-btn-primary" style={{height:41,justifyContent:'center'}} onClick={handleSearch}>
                            Search 🔍
                        </button>
                    </div>
                </div>
            )}

            {/* ── SMART FILTERS BAR ── */}
            {spaces && spaces.length > 0 && (
                <div className="sp-card mb-3" style={{padding:'18px 24px'}}>
                    <div style={{display:'flex',flexWrap:'wrap',gap:20,alignItems:'center'}}>

                        {/* Text Search */}
                        <div style={{flex:'1 1 200px',minWidth:160}}>
                            <input
                                type="text" className="sp-input"
                                placeholder="🔍  Search by name or area..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{height:36,fontSize:13,padding:'6px 14px'}}
                            />
                        </div>

                        {/* Availability Score Filter */}
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                            <span style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.8}}>Availability</span>
                            {[
                                {key:'all',      label:'All',      color:'var(--text-secondary)', active:'rgba(255,255,255,0.08)'},
                                {key:'high',     label:'🟢 High',  color:'#10b981', active:'rgba(16,185,129,0.12)'},
                                {key:'moderate', label:'🟡 Mid',   color:'#f59e0b', active:'rgba(245,158,11,0.12)'},
                                {key:'low',      label:'🔴 Low',   color:'#ef4444', active:'rgba(239,68,68,0.12)'},
                            ].map(f => (
                                <button key={f.key} onClick={() => setScoreFilter(f.key)} style={{
                                    padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                                    background: scoreFilter === f.key ? f.active : 'transparent',
                                    color: scoreFilter === f.key ? f.color : 'var(--text-muted)',
                                    border: scoreFilter === f.key ? `1.5px solid ${f.color}` : '1.5px solid var(--border)',
                                }}>{f.label}</button>
                            ))}
                        </div>

                        {/* Time of Day Filter */}
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                            <span style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.8}}>Time</span>
                            {[
                                {key:'all',       label:'Any'},
                                {key:'morning',   label:'🌅 Morning'},
                                {key:'afternoon', label:'☀️ Afternoon'},
                                {key:'evening',   label:'🌆 Evening'},
                            ].map(f => (
                                <button key={f.key} onClick={() => setTimeFilter(f.key)} style={{
                                    padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                                    background: timeFilter === f.key ? 'rgba(0,212,255,0.1)' : 'transparent',
                                    color: timeFilter === f.key ? 'var(--accent)' : 'var(--text-muted)',
                                    border: timeFilter === f.key ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                                }}>{f.label}</button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}>
                            <span style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.8}}>Sort</span>
                            <select className="sp-input sp-select" value={sortBy} onChange={e => setSortBy(e.target.value)}
                                style={{height:34,fontSize:12,padding:'4px 10px',minWidth:160}}>
                                <option value="score">Best Availability</option>
                                <option value="earliest">Earliest Time</option>
                                <option value="latest">Latest Time</option>
                            </select>
                        </div>

                        {/* Reset Filters */}
                        {(scoreFilter !== 'all' || timeFilter !== 'all' || searchText) && (
                            <button onClick={() => { setScoreFilter('all'); setTimeFilter('all'); setSearchText(''); setSortBy('score'); }}
                                style={{padding:'5px 14px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',background:'rgba(239,68,68,0.08)',color:'#ef4444',border:'1.5px solid rgba(239,68,68,0.25)',transition:'all 0.2s'}}>
                                ✕ Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Back to map button */}
            {fromMapLot && (
                <div style={{marginBottom:20}}>
                    <button
                        onClick={() => navigate('/parking')}
                        style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,padding:'8px 16px',color:'var(--accent)',fontWeight:600,fontSize:13,cursor:'pointer'}}
                    >
                        ← Back to Map
                    </button>
                </div>
            )}

            <p style={{color:'var(--text-secondary)',marginBottom:24,fontSize:14}}>
                Showing <strong style={{color:'var(--text-primary)'}}>{sortedSpaces.length}</strong> spaces — sorted by AI availability score
            </p>

            {sortedSpaces.length > 0 ? (
                <div className="sp-grid sp-grid-3">
                    {sortedSpaces.map((item, index) => (
                        <SpaceCard key={index} space={item}
                            onBooking={() => navigate('/bookingForm', { state: { space: item } })}
                            setSelectedSpace={setSelectedSpace} setShowDeleteModal={setShowDeleteModal} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="icon">🚙</div>
                    <p>
                        {spaces === undefined
                            ? 'Loading spaces...'
                            : fromMapLot
                                ? `No spaces found for ${fromMapLot.name}. Try the map search.`
                                : 'No parking spaces available matching your criteria.'}
                    </p>
                </div>
            )}

            <DeleteModal value={selectedSpace?.name} showModal={showDeleteModal} setShowModal={setShowDeleteModal} onDeleteConfirm={handleDeleteSpace} />
        </div>
    )
}

export default Space