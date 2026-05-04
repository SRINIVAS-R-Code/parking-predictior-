import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { createParking, updateParking } from '../api/api'

const ParkingForm = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user);

    const [form, setForm] = useState({ name: '', address: '', city: '', lat: '', long: '' })
    const [successMessage, setSuccessMessage] = useState()
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    const handleFormChange = ({ key, value }) => setForm({ ...form, [key]: value })

    const handleSubmit = async () => {
        setSuccessMessage(); setError(); setLoading(true)
        if (state?.parking) {
            await updateParking({ id: state?.parking?._id, body: form, handleUpdateParkingSuccess: () => { setSuccessMessage('Updated successfully!'); setLoading(false) }, handleUpdateParkingFailure: (err) => { setError(err); setLoading(false) } })
        } else {
            await createParking({ body: { ...form, user_id: user?._id }, handleCreateParkingSuccess: () => { setSuccessMessage('Created successfully!'); setLoading(false) }, handleCreateParkingFailure: (err) => { setError(err); setLoading(false) } })
        }
    }

    useEffect(() => {
        if(state?.parking) {
            setForm({
                name: state.parking.name, address: state.parking.address, city: state.parking.city,
                lat: state.parking.lat, long: state.parking.long
            })
        }
    }, [state])

    return (
        <div className="sp-auth-page">
            <div className="sp-auth-card" style={{maxWidth:600}}>
                <div className="sp-badge mb-3">{state?.parking ? 'Edit Mode' : 'New Listing'}</div>
                <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:28,fontWeight:700,marginBottom:24}}>{state?.parking ? 'Update' : 'Create'} Parking Location</h2>
                
                {successMessage && <div className="sp-alert success">✅ {successMessage}</div>}
                {error && <div className="sp-alert error">⚠️ {error}</div>}

                <div className="sp-input-group">
                    <label>Location Name</label>
                    <input type="text" className="sp-input" placeholder="e.g. Koramangala Premium Parking" 
                        value={form?.name} onChange={(e) => handleFormChange({ key: 'name', value: e.target.value })} />
                </div>
                <div className="sp-input-group">
                    <label>City / Area</label>
                    <input type="text" className="sp-input" placeholder="e.g. Koramangala, Bangalore" 
                        value={form?.city} onChange={(e) => handleFormChange({ key: 'city', value: e.target.value })} />
                </div>
                <div className="sp-input-group">
                    <label>Full Address</label>
                    <textarea rows={3} className="sp-input" placeholder="123 Main St, Near the station..." 
                        style={{resize:'vertical'}} value={form?.address} onChange={(e) => handleFormChange({ key: 'address', value: e.target.value })} />
                </div>
                
                <div className="sp-grid mt-2 mb-3" style={{gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <div className="sp-input-group" style={{margin:0}}>
                        <label>Latitude</label>
                        <input type="number" className="sp-input" placeholder="e.g. 12.9716" 
                            value={form?.lat} onChange={(e) => handleFormChange({ key: 'lat', value: e.target.value })} />
                    </div>
                    <div className="sp-input-group" style={{margin:0}}>
                        <label>Longitude</label>
                        <input type="number" className="sp-input" placeholder="e.g. 77.5946" 
                            value={form?.long} onChange={(e) => handleFormChange({ key: 'long', value: e.target.value })} />
                    </div>
                </div>

                <div style={{display:'flex',gap:12,marginTop:32}}>
                    <button className="sp-btn-outline w-full" style={{flex:1,justifyContent:'center'}} onClick={() => navigate('/parking')}>Cancel</button>
                    <button className="sp-btn-primary w-full" style={{flex:2,justifyContent:'center'}} onClick={handleSubmit} disabled={loading}>
                        {loading ? '⏳ Saving...' : 'Save Location'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ParkingForm