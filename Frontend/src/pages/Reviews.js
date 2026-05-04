import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'
import { createReview, deleteReview, fetchReviews } from '../api/api'
import { DeleteModal, StarRating } from '../components';

const Reviews = () => {
    const user = useSelector((state) => state.user);
    const { state } = useLocation()
    const [reviews, setReviews] = useState()

    const [selectedReview, setSelectedReview] = useState()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [form, setForm] = useState({ message: '', rating: 0 })
    const [successMessage, setSuccessMessage] = useState()
    const [error, setError] = useState()

    useEffect(() => {
        fetchReviews({ owner_id: state?.owner_id, setReviews })
    }, [state])

    const handleDelete = (review) => { setSelectedReview(review); setShowDeleteModal(true) }

    const handleDeleteReview = () => deleteReview({ id: selectedReview?._id, handleDeleteReviewSuccess: () => { fetchReviews({ owner_id: state?.owner_id, setReviews }); setShowDeleteModal(false) }, handleDeleteReviewFailure: () => setShowDeleteModal(false) })

    const handleFormChange = ({ key, value }) => setForm({ ...form, [key]: value })

    const handleCreateReview = () => {
        setSuccessMessage(); setError()
        createReview({ body: { ...form, owner_id: state?.owner_id, user_id: user?._id }, handleCreateReviewSuccess: () => { fetchReviews({ owner_id: state?.owner_id, setReviews }); setSuccessMessage('Review added successfully!'); setForm({ message: '', rating: 0 }) }, handleCreateReviewFailure: setError })
    }

    return (
        <div className="sp-container" style={{paddingTop:40}}>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:32,fontWeight:700,marginBottom:32}}>Owner Reviews</h1>

            {!state?.owner_id && (
                <div className="empty-state sp-card">
                    <div className="icon">⭐</div>
                    <p>Navigate to a parking owner's profile to view or leave reviews.</p>
                </div>
            )}
            {state?.owner_id && (
            <div className="sp-grid sp-grid-2" style={{alignItems:'start'}}>
                <div>
                    {reviews && reviews.length > 0 ? (
                        <div style={{display:'flex',flexDirection:'column',gap:16}}>
                            {reviews.map((item, index) => (
                                <div key={index} className="sp-card" style={{padding:20}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                                        <div>
                                            <h3 style={{fontSize:16,marginBottom:4}}>{item?.user_id?.name}</h3>
                                            <div style={{transform:'scale(0.85)',transformOrigin:'left center'}}><StarRating value={item?.rating} readonly /></div>
                                        </div>
                                        {user?._id === item?.user_id?._id && (
                                            <button className="sp-btn-outline" style={{padding:'4px 8px',borderColor:'#ef4444',color:'#ef4444'}} onClick={() => handleDelete(item)}>✖</button>
                                        )}
                                    </div>
                                    <p style={{color:'var(--text-secondary)',fontSize:14,lineHeight:1.6,margin:0}}>"{item?.message}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state sp-card">
                            <div className="icon">⭐</div>
                            <p>No reviews yet for this owner.</p>
                        </div>
                    )}
                </div>

                {user?.type === 'seeker' && (
                    <div className="sp-card" style={{position:'sticky',top:100}}>
                        <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:24}}>Write a Review</h3>
                        
                        {successMessage && <div className="sp-alert success">✅ {successMessage}</div>}
                        {error && <div className="sp-alert error">⚠️ {error}</div>}

                        <div className="sp-input-group">
                            <label>Rating</label>
                            <div style={{marginTop:8}}>
                                <StarRating value={form?.rating} onChange={(value) => handleFormChange({ key: 'rating', value })} />
                            </div>
                        </div>

                        <div className="sp-input-group mt-3">
                            <label>Your Experience</label>
                            <textarea className="sp-input" rows={4} placeholder="How was your parking experience?" value={form?.message} onChange={(e) => handleFormChange({ key: 'message', value: e.target.value })} style={{resize:'vertical'}} />
                        </div>

                        <button className="sp-btn-primary w-full mt-2" style={{width:'100%',justifyContent:'center'}} onClick={handleCreateReview}>
                            Submit Review
                        </button>
                    </div>
                )}
            </div>
            )}

            <DeleteModal showModal={showDeleteModal} setShowModal={setShowDeleteModal} onDeleteConfirm={handleDeleteReview} />
        </div>
    )
}

export default Reviews