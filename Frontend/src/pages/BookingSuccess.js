import moment from 'moment';
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const BookingSuccess = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const booking = state?.booking;
    const space = state?.space;

    // confetti-like animated dots
    const dots = Array.from({ length: 18 }, (_, i) => i);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            position: 'relative',
            overflow: 'hidden',
        }}>

            {/* Animated background orbs */}
            <div style={{
                position: 'absolute', width: 500, height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
                top: '10%', left: '50%', transform: 'translateX(-50%)',
                pointerEvents: 'none',
            }} />

            {/* Floating confetti dots */}
            {dots.map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: ['#10b981','#00d4ff','#a78bfa','#f59e0b','#ef4444'][i % 5],
                    top: `${10 + Math.random() * 80}%`,
                    left: `${5 + (i * 5.5)}%`,
                    opacity: 0.5 + Math.random() * 0.5,
                    animation: `float ${2 + (i % 3)}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.2}s`,
                }} />
            ))}

            <style>{`
                @keyframes float {
                    from { transform: translateY(0px) rotate(0deg); }
                    to   { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to   { transform: scale(1); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }
                @keyframes checkPop {
                    0%   { transform: scale(0) rotate(-15deg); }
                    70%  { transform: scale(1.2) rotate(5deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                @keyframes pulse-ring {
                    0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
                    100% { box-shadow: 0 0 0 32px rgba(16,185,129,0); }
                }
            `}</style>

            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 24,
                padding: '56px 48px',
                maxWidth: 580,
                width: '100%',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.2)',
                animation: 'slideUp 0.5s ease-out both',
            }}>

                {/* Big success icon */}
                <div style={{
                    width: 100, height: 100,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 28px',
                    fontSize: 48,
                    animation: 'checkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
                    animationName: 'checkPop, pulse-ring',
                    animationDuration: '0.6s, 2s',
                    animationDelay: '0.2s, 1s',
                    animationIterationCount: '1, infinite',
                }}>
                    ✓
                </div>

                <div style={{
                    display: 'inline-block',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 99,
                    padding: '4px 16px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#10b981',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 16,
                }}>
                    Booking Registered
                </div>

                <h1 style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 32, fontWeight: 800,
                    marginBottom: 12,
                    letterSpacing: -1,
                }}>
                    You're all set! 🎉
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>
                    Your parking space has been reserved. The owner will confirm your booking shortly.
                    You'll find the booking details below.
                </p>

                {/* Booking Detail Card */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 24,
                    textAlign: 'left',
                    marginBottom: 28,
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                        Booking Summary
                    </div>

                    {[
                        { label: '🅿️ Parking', value: space?.parking_id?.name || booking?.space_id?.parking_id?.name || '—' },
                        { label: '🪑 Space',   value: space?.name || booking?.space_id?.name || '—' },
                        { label: '📍 City',    value: space?.parking_id?.city || booking?.space_id?.parking_id?.city || '—' },
                        { label: '📅 Date',    value: space?.date ? moment.utc(space.date).format('MMMM DD, YYYY') : (booking?.space_id?.date ? moment.utc(booking.space_id.date).format('MMMM DD, YYYY') : '—') },
                        { label: '⏰ Slot',    value: space ? `${space.slot_start_time} – ${space.slot_end_time}` : (booking?.space_id ? `${booking.space_id.slot_start_time} – ${booking.space_id.slot_end_time}` : '—') },
                        { label: '🚗 Vehicle', value: booking ? `${booking.vehicle_company || ''} ${booking.vehicle_model || ''}`.trim() || '—' : '—' },
                        { label: '🔖 Plate',   value: booking?.plate_number || '—' },
                    ].map(row => (
                        <div key={row.label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{row.label}</span>
                            <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                        </div>
                    ))}

                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: 14, marginTop: 4,
                    }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>⏳ Status</span>
                        <span style={{
                            background: 'rgba(245,158,11,0.12)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            color: '#f59e0b',
                            borderRadius: 99, padding: '3px 14px',
                            fontSize: 12, fontWeight: 700,
                        }}>Pending Approval</span>
                    </div>
                </div>

                {/* Info note */}
                <div style={{
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    marginBottom: 28,
                    lineHeight: 1.6,
                }}>
                    💡 Parking is completely free! Please arrive on time and carry your booking confirmation.
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className="sp-btn-outline"
                        style={{ flex: 1, justifyContent: 'center', padding: 14 }}
                        onClick={() => navigate('/booking')}
                    >
                        View My Bookings
                    </button>
                    <button
                        className="sp-btn-primary"
                        style={{ flex: 1, justifyContent: 'center', padding: 14 }}
                        onClick={() => navigate('/parking')}
                    >
                        Find More Parking 🅿️
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookingSuccess
