import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../api/api'

const BookingForm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [space, setSpace] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        vehicle_company: '', vehicle_model: '', plate_number: '', car_color: '', space_id: '',
    })
    const [error, setError] = useState()

    const handleFormChange = ({ key, value }) => setForm(prev => ({ ...prev, [key]: value }))

    const handleCreateBooking = () => {
        if (!form.vehicle_company || !form.vehicle_model || !form.plate_number || !form.car_color) {
            setError('Please fill in all vehicle details before confirming.');
            return;
        }
        setError();
        setLoading(true);

        // Bypass API for preview (AI-generated) or dynamic map spaces
        // — they have no real DB space_id, so the backend would reject the FK
        if (space?.isPreview || space?.isDynamic) {
            setTimeout(() => {
                const dummyBooking = {
                    _id: 'dyn_' + Math.floor(Math.random() * 100000),
                    vehicle_company: form.vehicle_company,
                    vehicle_model: form.vehicle_model,
                    plate_number: form.plate_number,
                    car_color: form.car_color,
                    confirm_booking: 'pending',
                    space_id: space,
                    user_id: user?._id
                };
                
                const existing = JSON.parse(localStorage.getItem('dynamicBookings') || '[]');
                existing.push(dummyBooking);
                localStorage.setItem('dynamicBookings', JSON.stringify(existing));

                handleCreateBookingSuccess({ booking: dummyBooking });
            }, 800);
            return;
        }

        createBooking({
            body: { ...form, user_id: user?._id },
            handleCreateBookingSuccess,
            handleCreateBookingFailure
        })
    }

    const handleCreateBookingSuccess = (data) => {
        setLoading(false);
        // Navigate to the success page, passing booking + space info
        navigate('/bookingSuccess', {
            state: {
                booking: { ...data?.booking, ...form },
                space: space,
            }
        });
    }

    const handleCreateBookingFailure = (err) => {
        setLoading(false);
        setError(err || 'Something went wrong. Please try again.');
    }

    useEffect(() => {
        if (state?.space) {
            setSpace(state.space);
            setForm(prev => ({ ...prev, space_id: state.space._id }));
        }
    }, [state])

    const isFormComplete = form.vehicle_company && form.vehicle_model && form.plate_number && form.car_color;

    return (
        <div className="sp-container" style={{ paddingTop: 60, paddingBottom: 60 }}>
            <div className="sp-grid sp-grid-2">

                {/* Space Details Side */}
                <div>
                    <div className="sp-badge mb-3">Booking Details</div>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                        Secure Your Spot
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                        Fill in your vehicle details to complete the reservation.
                    </p>

                    {space && (
                        <div className="sp-card" style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.05),transparent)' }}>
                            {/* Parking name header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                marginBottom: 20, paddingBottom: 16,
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'rgba(0,212,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22
                                }}>🅿️</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                                        {space?.parking_id?.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        {space?.name}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📍 Location</span>
                                    <span style={{ fontWeight: 500, textAlign: 'right', fontSize: 13 }}>
                                        {space?.parking_id?.address && <>{space.parking_id.address}<br /></>}
                                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{space?.parking_id?.city}</span>
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📅 Date</span>
                                    <span style={{ fontWeight: 600 }}>{moment.utc(space?.date).format('MMMM DD, YYYY')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>⏰ Time Slot</span>
                                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                                        {space?.slot_start_time} – {space?.slot_end_time}
                                    </span>
                                </div>
                                {space?.availability_score !== undefined && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>🤖 AI Availability</span>
                                        <span style={{
                                            fontWeight: 700, fontSize: 13,
                                            color: space.availability_score >= 70 ? '#10b981' : space.availability_score >= 40 ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {space.availability_score}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Steps */}
                    <div style={{ marginTop: 24 }}>
                        {[
                            { step: '1', label: 'Fill vehicle info', done: isFormComplete },
                            { step: '2', label: 'Confirm booking', done: false },
                            { step: '3', label: 'Owner approves', done: false },
                            { step: '4', label: 'Park & pay on arrival', done: false },
                        ].map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: s.done ? '#10b981' : 'rgba(255,255,255,0.06)',
                                    border: `2px solid ${s.done ? '#10b981' : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700,
                                    color: s.done ? '#fff' : 'var(--text-muted)',
                                    flexShrink: 0,
                                    transition: 'all 0.3s',
                                }}>
                                    {s.done ? '✓' : s.step}
                                </div>
                                <span style={{ fontSize: 13, color: s.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Side */}
                <div className="sp-card">
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, marginBottom: 8 }}>
                        Vehicle Information
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
                        Enter the details of the vehicle you'll be parking.
                    </p>

                    {error && <div className="sp-alert error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

                    <div className="sp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="sp-input-group" style={{ margin: 0 }}>
                            <label>Make (Company) *</label>
                            <input
                                type="text" className="sp-input"
                                placeholder="e.g. Toyota, Honda"
                                value={form?.vehicle_company}
                                onChange={(e) => handleFormChange({ key: 'vehicle_company', value: e.target.value })}
                            />
                        </div>
                        <div className="sp-input-group" style={{ margin: 0 }}>
                            <label>Model *</label>
                            <input
                                type="text" className="sp-input"
                                placeholder="e.g. Camry, Civic"
                                value={form?.vehicle_model}
                                onChange={(e) => handleFormChange({ key: 'vehicle_model', value: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="sp-input-group mt-2">
                        <label>License Plate *</label>
                        <input
                            type="text" className="sp-input"
                            placeholder="MH-01-AB-1234"
                            style={{ fontFamily: 'monospace', fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 }}
                            value={form?.plate_number}
                            onChange={(e) => handleFormChange({ key: 'plate_number', value: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="sp-input-group">
                        <label>Car Color *</label>
                        <input
                            type="text" className="sp-input"
                            placeholder="e.g. Black, White, Silver"
                            value={form?.car_color}
                            onChange={(e) => handleFormChange({ key: 'car_color', value: e.target.value })}
                        />
                    </div>

                    <button
                        className="sp-btn-primary w-full mt-3"
                        style={{
                            width: '100%', justifyContent: 'center', padding: 16,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: 16, fontWeight: 700,
                        }}
                        onClick={handleCreateBooking}
                        disabled={loading}
                    >
                        {loading ? '⏳ Processing…' : '🎯 Confirm Booking'}
                    </button>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
                        padding: '12px 16px',
                        background: 'rgba(16,185,129,0.06)',
                        border: '1px solid rgba(16,185,129,0.15)',
                        borderRadius: 10,
                    }}>
                        <span style={{ fontSize: 18 }}>🎉</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
                            Secure booking — owner reviews and approves your request.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default BookingForm