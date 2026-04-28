import React from 'react'

const DeleteModal = ({ value, showModal, setShowModal, onDeleteConfirm }) => {
    if (!showModal) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
            <div className="sp-card" style={{width: 400, maxWidth: '90%', padding: '32px 24px', textAlign: 'center'}}>
                <div style={{fontSize: 48, marginBottom: 16}}>🗑️</div>
                <h3 style={{fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12}}>Confirm Deletion</h3>
                <p style={{color: 'var(--text-secondary)', fontSize: 15, marginBottom: 24, lineHeight: 1.5}}>
                    Are you sure you want to delete <strong style={{color: 'var(--text-primary)'}}>{value}</strong>? This action cannot be undone.
                </p>
                <div style={{display: 'flex', gap: 12}}>
                    <button className="sp-btn-outline w-full" style={{flex: 1, justifyContent: 'center'}} onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="sp-btn-primary w-full" style={{flex: 1, justifyContent: 'center', background: '#ef4444', boxShadow: 'none'}} onClick={onDeleteConfirm}>Delete</button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal