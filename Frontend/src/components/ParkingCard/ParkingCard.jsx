import React from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from '../StarRating/StarRating'
import { useSelector } from 'react-redux'

const ParkingCard = ({ parking, onClick, setSelectedParking, setShowDeleteModal }) => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate()
    const { name, address, city, lat, long, user_id, owner_rating } = parking

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate('/parkingForm', { state: { parking } })
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        setSelectedParking(parking)
        setShowDeleteModal(true)
    }

    const handleRatingClick = (e) => {
        e.stopPropagation();
        navigate('/review', { state: { owner_id: user_id?._id } })
    }

    return (
        <div className="parking-card pointer" onClick={onClick}>
            <div className="parking-card-header">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                        <h3>{name}</h3>
                        <div style={{fontSize:13,color:'var(--accent)'}}>{city}</div>
                    </div>
                    {user?.type !== 'seeker' && user?._id === user_id?._id && (
                        <div style={{display:'flex',gap:6}}>
                            <button className="sp-btn-outline" style={{padding:'4px 8px'}} onClick={handleEdit}>✎</button>
                            <button className="sp-btn-outline" style={{padding:'4px 8px',borderColor:'#ef4444',color:'#ef4444'}} onClick={handleDelete}>✖</button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="parking-card-body">
                <div className="parking-card-meta">
                    <div className="meta-row">
                        <span>📍</span>
                        <span style={{lineHeight:1.4}}>{address}</span>
                    </div>
                    {lat && long && (
                        <div className="meta-row" style={{marginTop:4}}>
                            <span>🗺️</span>
                            <a
                                href={`https://www.google.com/maps?q=${lat},${long}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{color:'var(--accent)',fontSize:12,textDecoration:'none',fontWeight:600}}
                            >View on Google Maps →</a>
                        </div>
                    )}
                </div>
            </div>

            <div className="parking-card-footer">
                <div style={{fontSize:13,color:'var(--text-secondary)'}}>
                    By <span style={{color:'var(--text-primary)',fontWeight:500}}>{user_id?.name}</span>
                </div>
                <div onClick={handleRatingClick} style={{opacity:0.9,transform:'scale(0.85)',transformOrigin:'right center',cursor:'help'}}>
                    <StarRating value={owner_rating} readonly />
                </div>
            </div>
        </div>
    )
}

export default ParkingCard