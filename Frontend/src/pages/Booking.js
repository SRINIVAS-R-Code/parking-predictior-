import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { deleteBooking, fetchBookings, updateBooking } from '../api/api'
import { DeleteModal } from '../components';

const Booking = () => {
    const user = useSelector((state) => state.user);
    const [bookings, setBookings] = useState([])

    const [selectedBooking, setSelectedBooking] = useState()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (user?.type === 'owner') {
            fetchBookings({ owner_id: user?._id, setBookings })
        } else {
            fetchBookings({ user_id: user?._id, setBookings })
        }
    }, [user])

    const handleDelete = (booking) => { setSelectedBooking(booking); setShowDeleteModal(true) }

    const handleUpdateBooking = ({ id, confirm_booking }) => {
        updateBooking({ id, body: { confirm_booking }, handleUpdateBookingSuccess, handleUpdateBookingFailure: () => {} })
    }

    const handleUpdateBookingSuccess = () => {
        if (user?.type === 'owner') {
            fetchBookings({ owner_id: user?._id, setBookings })
        } else {
            fetchBookings({ user_id: user?._id, setBookings })
        }
    }

    const handleDeleteBooking = () => {
        deleteBooking({ id: selectedBooking?._id, handleDeleteBookingSuccess, handleDeleteBookingFailure: () => setShowDeleteModal(false) })
    }

    const handleDeleteBookingSuccess = () => {
        fetchBookings({ user_id: user?._id, setBookings })
        setShowDeleteModal(false)
    }

    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved': return <span className="sp-badge green">Approved</span>
            case 'rejected': return <span className="sp-badge red">Rejected</span>
            default: return <span className="sp-badge yellow">Pending</span>
        }
    }

    return (
        <div className="sp-container" style={{paddingTop:40}}>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:32,fontWeight:700,marginBottom:32}}>My Bookings</h1>

            <div className="sp-table-wrap">
                <table className="sp-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Plate No.</th>
                            <th>Color</th>
                            <th>Space / Location</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings && bookings.length > 0 ? bookings.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div style={{fontWeight:600}}>{item?.vehicle_company}</div>
                                    <div style={{fontSize:12,color:'var(--text-muted)'}}>{item?.vehicle_model}</div>
                                </td>
                                <td><div style={{fontFamily:'monospace',fontSize:15}}>{item?.plate_number}</div></td>
                                <td style={{textTransform:'capitalize'}}>{item?.car_color}</td>
                                <td>
                                    <div>{item?.space_id?.name}</div>
                                    <div style={{fontSize:12,color:'var(--text-muted)'}}>{item?.space_id?.parking_id?.city}</div>
                                </td>
                                <td>
                                    <div>{moment.utc(item?.space_id?.date).format('MMM DD, YYYY')}</div>
                                    <div style={{fontSize:12,color:'var(--accent)'}}>{item?.space_id?.slot_start_time} - {item?.space_id?.slot_end_time}</div>
                                </td>
                                <td>{getStatusBadge(item?.confirm_booking)}</td>
                                <td>
                                    {user?.type === 'seeker' ? (
                                        <button className="sp-btn-outline" style={{padding:'4px 10px',borderColor:'#ef4444',color:'#ef4444',fontSize:12}} onClick={() => handleDelete(item)}>Cancel</button>
                                    ) : (
                                        item?.confirm_booking === 'pending' ? (
                                            <div style={{display:'flex',gap:6}}>
                                                <button className="sp-btn-outline" style={{padding:'4px 10px',borderColor:'#10b981',color:'#10b981',fontSize:12}} onClick={() => handleUpdateBooking({ id: item?._id, confirm_booking: 'approved' })}>Approve</button>
                                                <button className="sp-btn-outline" style={{padding:'4px 10px',borderColor:'#ef4444',color:'#ef4444',fontSize:12}} onClick={() => handleUpdateBooking({ id: item?._id, confirm_booking: 'rejected' })}>Reject</button>
                                            </div>
                                        ) : <span style={{fontSize:12,color:'var(--text-muted)'}}>Done</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="empty-state" style={{border:0}}>
                                    <div className="icon">🎫</div>
                                    <p>No bookings found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <DeleteModal showModal={showDeleteModal} setShowModal={setShowDeleteModal} onDeleteConfirm={handleDeleteBooking} />
        </div>
    )
}

export default Booking