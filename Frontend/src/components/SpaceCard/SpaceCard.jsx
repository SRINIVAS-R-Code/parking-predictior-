import React from 'react'
import moment from "moment";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SpaceCard = ({ space, onBooking, setSelectedSpace, setShowDeleteModal }) => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate()
    const { name, date, slot_start_time, slot_end_time, parking_id, is_booked, availability_score } = space

    const pred = availability_score || 0;

    // Color + label based on prediction score
    let probColor, probBg, probBorder, predLabel, predEmoji;
    if (pred >= 70) {
        probColor = '#10b981'; probBg = 'rgba(16,185,129,0.1)'; probBorder = 'rgba(16,185,129,0.35)';
        predLabel = 'High Availability'; predEmoji = '🟢';
    } else if (pred >= 40) {
        probColor = '#f59e0b'; probBg = 'rgba(245,158,11,0.1)'; probBorder = 'rgba(245,158,11,0.35)';
        predLabel = 'Moderate Availability'; predEmoji = '🟡';
    } else {
        probColor = '#ef4444'; probBg = 'rgba(239,68,68,0.1)'; probBorder = 'rgba(239,68,68,0.35)';
        predLabel = 'Low Availability'; predEmoji = '🔴';
    }

    const handleEdit   = (e) => { e.stopPropagation(); navigate('/spaceForm', { state: { space } }) }
    const handleDelete = (e) => { e.stopPropagation(); setSelectedSpace(space); setShowDeleteModal(true) }

    return (
        <div className="parking-card pointer" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* ── AI PREDICTION HERO SECTION ── */}
            <div style={{
                background: `linear-gradient(135deg, ${probBg}, rgba(0,212,255,0.06))`,
                borderBottom: `1px solid ${probBorder}`,
                padding: '20px 20px 16px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow orb */}
                <div style={{
                    position: 'absolute', top: -30, right: -30,
                    width: 100, height: 100,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${probBg} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 1,
                            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4
                        }}>Parking Spot</div>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                            {name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            📍 {parking_id?.city} — {parking_id?.name}
                        </div>
                    </div>
                    {user?.type !== 'seeker' && user?._id === parking_id?.user_id && (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button className="sp-btn-outline" style={{ padding: '4px 8px' }} onClick={handleEdit}>✎</button>
                            <button className="sp-btn-outline" style={{ padding: '4px 8px', borderColor: '#ef4444', color: '#ef4444' }} onClick={handleDelete}>✖</button>
                        </div>
                    )}
                </div>

                {/* AI PREDICTION METER */}
                <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${probBorder}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>🤖</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5 }}>
                                AI AVAILABILITY PREDICTION
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 12 }}>{predEmoji}</span>
                            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: probColor }}>
                                {pred}%
                            </span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${pred}%`,
                            background: `linear-gradient(90deg, ${probColor}99, ${probColor})`,
                            borderRadius: 99,
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: `0 0 8px ${probColor}66`,
                        }} />
                    </div>

                    <div style={{ marginTop: 6, fontSize: 11, color: probColor, fontWeight: 600 }}>
                        {predLabel}
                    </div>
                </div>
            </div>

            {/* ── DETAILS SECTION ── */}
            <div style={{ padding: '16px 20px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date</div>
                        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 15, fontWeight: 600 }}>
                            {moment.utc(date).format('DD MMM YYYY')}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Slot</div>
                            <div style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                                {slot_start_time} – {slot_end_time}
                            </div>
                        </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
                    <span>🕒</span>
                    <span style={{ fontWeight: 500 }}>{slot_start_time}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span style={{ fontWeight: 500 }}>{slot_end_time}</span>
                </div>
            </div>

            {/* ── BOOK BUTTON ── */}
            <div style={{ padding: '0 16px 16px' }}>
                {!is_booked ? (
                    <button
                        className="sp-btn-primary w-full"
                        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
                        onClick={onBooking}
                        disabled={user?.type === 'owner'}
                    >
                        {user?.type === 'owner' ? '✅ Space Available' : '🅿️ Book This Spot'}
                    </button>
                ) : (
                    <button
                        className="sp-btn-outline w-full"
                        style={{ width: '100%', justifyContent: 'center', opacity: 0.45, borderColor: 'var(--text-muted)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                        disabled
                    >
                        🚫 Already Booked
                    </button>
                )}
            </div>
        </div>
    )
}

export default SpaceCard