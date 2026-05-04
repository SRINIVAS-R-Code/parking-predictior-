import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { deleteUser, fetchUsers } from '../api/api'
import { DeleteModal } from '../components';

const Users = () => {
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()
    const [users, setUsers] = useState()
    const [selectedUser, setSelectedUser] = useState()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (!user || user?.type !== 'owner') {
            navigate('/')
            return
        }
        fetchUsers({ setUsers })
    }, [user, navigate])

    // Guard: show nothing while redirecting
    if (!user || user?.type !== 'owner') return null

    const handleDelete = (user) => { setSelectedUser(user); setShowDeleteModal(true) }

    const handleDeleteUser = () => {
        deleteUser({ id: selectedUser?._id, handleDeleteUserSuccess: () => { fetchUsers({ setUsers }); setShowDeleteModal(false) }, handleDeleteUserFailure: () => setShowDeleteModal(false) })
    }

    return (
        <div className="sp-container" style={{paddingTop:40}}>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:32,fontWeight:700,marginBottom:32}}>User Management</h1>

            <div className="sp-table-wrap">
                <table className="sp-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email Address</th>
                            <th>Account Type</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? users.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                                        <div className="sp-avatar" style={{width:32,height:32,fontSize:12,boxShadow:'none'}}>{item?.name?.[0]?.toUpperCase()}</div>
                                        <span style={{fontWeight:500}}>{item?.name}</span>
                                    </div>
                                </td>
                                <td>{item?.email}</td>
                                <td>
                                    <span className={`sp-badge ${item?.type==='admin'?'yellow':item?.type==='owner'?'green':''}`}>
                                        {item?.type}
                                    </span>
                                </td>
                                <td style={{textAlign:'right'}}>
                                    <button className="sp-btn-outline" style={{padding:'4px 8px',borderColor:'#ef4444',color:'#ef4444'}} onClick={() => handleDelete(item)}>✖ Remove</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="empty-state" style={{border:0}}>
                                    <div className="icon">👥</div>
                                    <p>No users found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <DeleteModal value={selectedUser?.name} showModal={showDeleteModal} setShowModal={setShowDeleteModal} onDeleteConfirm={handleDeleteUser} />
        </div>
    )
}

export default Users