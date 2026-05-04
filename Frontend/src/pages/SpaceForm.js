import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { createSpace, fetchParkings, updateSpace } from '../api/api'

const SpaceForm = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user);

    const [form, setForm] = useState({ name: '', date: '', slot_start_time: '', slot_end_time: '', parking_id: '' })
    const [successMessage, setSuccessMessage] = useState()
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)
    const [parkings, setParkings] = useState()

    const time = ['12:00am', '2:00am', '4:00am', '6:00am', '8:00am', '10:00am', '12:00pm', '2:00pm', '4:00pm', '6:00pm', '8:00pm', '10:00pm']

    const handleFormChange = ({ key, value }) => setForm({ ...form, [key]: value })

    const handleSubmit = async () => {
        setSuccessMessage(); setError(); setLoading(true)
        if (state?.space) {
            await updateSpace({ id: state?.space?._id, body: form, handleUpdateSpaceSuccess: () => { setSuccessMessage('Updated successfully!'); setLoading(false) }, handleUpdateSpaceFailure: (err) => { setError(err); setLoading(false) } })
        } else {
            await createSpace({ body: { ...form, user_id: user?._id }, handleCreateSpaceSuccess: () => { setSuccessMessage('Created successfully!'); setLoading(false) }, handleCreateSpaceFailure: (err) => { setError(err); setLoading(false) } })
        }
    }

    useEffect(() => {
        fetchParkings({ user_id: user?._id, setParkings })
        if(state?.space) {
            setForm({
                name: state.space.name, date: state.space.date,
                slot_start_time: state.space.slot_start_time, slot_end_time: state.space.slot_end_time,
                parking_id: state.space.parking_id
            })
        }
    }, [state, user])

    return (
        <div className="sp-auth-page">
            <div className="sp-auth-card" style={{maxWidth:600}}>
                <div className="sp-badge mb-3">{state?.space ? 'Edit Mode' : 'New Listing'}</div>
                <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:28,fontWeight:700,marginBottom:24}}>{state?.space ? 'Update' : 'Create'} Space Slot</h2>
                
                {successMessage && <div className="sp-alert success">✅ {successMessage}</div>}
                {error && <div className="sp-alert error">⚠️ {error}</div>}

                <div className="sp-input-group">
                    <label>Select Parking Location</label>
                    <select className="sp-input sp-select" value={form?.parking_id} onChange={(e) => handleFormChange({ key: 'parking_id', value: e.target.value })}>
                        <option value="">-- Choose a location --</option>
                        {parkings?.map((item) => <option key={item._id} value={item?._id}>{item?.name}</option>)}
                    </select>
                </div>

                <div className="sp-input-group" style={{margin:0}}>
                    <label>Space Name</label>
                    <input type="text" className="sp-input" placeholder="e.g. VIP Slot A1" 
                        value={form?.name} onChange={(e) => handleFormChange({ key: 'name', value: e.target.value })} />
                </div>

                <div className="sp-input-group">
                    <label>Date Available</label>
                    <input type="date" className="sp-input" value={form?.date} onChange={(e) => handleFormChange({ key: 'date', value: e.target.value })} />
                </div>
                
                <div className="sp-grid mt-2 mb-3" style={{gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <div className="sp-input-group" style={{margin:0}}>
                        <label>Start Time</label>
                        <select className="sp-input sp-select" value={form?.slot_start_time} onChange={(e) => handleFormChange({ key: 'slot_start_time', value: e.target.value })}>
                            <option value="">Start</option>
                            {time?.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="sp-input-group" style={{margin:0}}>
                        <label>End Time</label>
                        <select className="sp-input sp-select" value={form?.slot_end_time} onChange={(e) => handleFormChange({ key: 'slot_end_time', value: e.target.value })}>
                            <option value="">End</option>
                            {time?.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{display:'flex',gap:12,marginTop:32}}>
                    <button className="sp-btn-outline w-full" style={{flex:1,justifyContent:'center'}} onClick={() => navigate('/space')}>Cancel</button>
                    <button className="sp-btn-primary w-full" style={{flex:2,justifyContent:'center'}} onClick={handleSubmit} disabled={loading}>
                        {loading ? '⏳ Saving...' : 'Save Space'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SpaceForm