import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { deleteSpace, fetchSpaces } from '../api/api'
import { DeleteModal, SpaceCard } from '../components'

const Space = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [spaces, setSpaces] = useState()
    const time = ['12:00am', '2:00am', '4:00am', '6:00am', '8:00am', '10:00am', '12:00pm', '2:00pm', '4:00pm', '6:00pm', '8:00pm', '10:00pm']

    const [searchForm, setSearchForm] = useState({ city: '', price: '', date: '', time: '', availability: false })
    const [selectedSpace, setSelectedSpace] = useState()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        const queryParams = state?.parking?._id ? { parking_id: state?.parking?._id } : {}
        if (user?.type === 'owner') queryParams.user_id = user?._id
        fetchSpaces({ ...queryParams, setSpaces })
    }, [state, user])

    const handleSearchForm = ({ key, value }) => setSearchForm({ ...searchForm, [key]: value })

    const handleSearch = () => {
        setSpaces([])
        const queryParams = state?.parking?._id ? { parking_id: state?.parking?._id } : {}
        if (user?.type === 'owner') queryParams.user_id = user?._id
        fetchSpaces({ ...queryParams, ...searchForm, setSpaces })
    }

    // Sort spaces by availability score (highest first)
    const sortedSpaces = spaces ? [...spaces].sort((a, b) => (b.availability_score || 0) - (a.availability_score || 0)) : []

    const handleDeleteSpace = () => deleteSpace({ id: selectedSpace?._id, handleDeleteSpaceSuccess, handleDeleteSpaceFailure })
    const handleDeleteSpaceSuccess = () => { handleSearch(); setShowDeleteModal(false) }
    const handleDeleteSpaceFailure = () => setShowDeleteModal(false)

    return (
        <div className="sp-container" style={{paddingTop:40}}>
            {/* PAGE HEADER — AI PREDICTION FOCUSED */}
            <div style={{marginBottom:28}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                    <div>
                        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.25)',borderRadius:99,padding:'4px 14px',fontSize:11,fontWeight:700,color:'var(--accent)',letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>
                            <span style={{width:7,height:7,borderRadius:'50%',background:'var(--accent)',display:'inline-block',animation:'pulse 2s infinite'}}></span>
                            🤖 AI Prediction Engine Active
                        </div>
                        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:32,fontWeight:800,letterSpacing:-1,marginBottom:6}}>
                            Find Parking Spaces
                        </h1>
                        <p style={{color:'var(--text-secondary)',fontSize:14}}>
                            AI predicts real-time availability across India — sorted by best chance of parking
                        </p>
                    </div>
                    {user?.type !== 'seeker' && (
                        <button className="sp-btn-primary" onClick={() => navigate('/spaceForm')}>+ Create Space</button>
                    )}
                </div>

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

            <div className="sp-card mb-3" style={{padding:'24px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,alignItems:'end'}}>
                    <div className="sp-input-group" style={{margin:0}}>
                        <label>City</label>
                        <input type="text" placeholder='e.g. Mumbai' className="sp-input" value={searchForm?.city} onChange={(e) => handleSearchForm({ key: 'city', value: e.target.value })} />
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
                    <p>No parking spaces available matching your criteria.</p>
                </div>
            )}

            <DeleteModal value={selectedSpace?.name} showModal={showDeleteModal} setShowModal={setShowDeleteModal} onDeleteConfirm={handleDeleteSpace} />
        </div>
    )
}

export default Space