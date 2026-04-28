import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../api/api'

const Register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [type, setType] = useState('seeker')
    const [isRegistered, setIsRegistered] = useState(false)
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        if (!name || !email || !password) { setError("Please fill in all fields."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true); setIsRegistered(false); setError()
        await register({ name, email, password, type, handleRegisterSuccess, handleRegisterFailure })
        setLoading(false)
    }
    const handleRegisterSuccess = () => setIsRegistered(true)
    const handleRegisterFailure = (err) => setError(err || "Registration failed. Please try again.")

    const accountTypes = [
        { value: "seeker", icon: "🚗", label: "Parking Seeker", desc: "I'm looking for parking" },
        { value: "owner",  icon: "🏠", label: "Parking Owner",  desc: "I have spaces to rent" },
    ]

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
            {/* Left photo panel */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/auth_bg.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,8,16,0.88) 0%, rgba(124,58,237,0.12) 100%)" }} />
                <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "40px 48px" }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>✨</div>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 14, background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        Start Parking Smarter
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, maxWidth: 300 }}>
                        Create your free account and get instant access to AI-powered parking predictions across India.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36, textAlign: "left" }}>
                        {["✅ Free forever — no credit card", "✅ AI predictions in real-time", "✅ Book in under 30 seconds"].map((t, i) => (
                            <div key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500 }}>{t}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "var(--bg-secondary)", overflowY: "auto" }}>
                <div style={{ width: "100%", maxWidth: 460 }}>
                    <div className="sp-badge purple" style={{ marginBottom: 16 }}>✨ Create Account</div>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 800, marginBottom: 6, letterSpacing: -1 }}>Join SmartPark</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>Start your smart parking journey — free forever</p>

                    {isRegistered && <div className="sp-alert success"><span>🎉</span> Account created! <Link to="/login" style={{ color: "var(--green)", fontWeight: 700 }}>Sign in →</Link></div>}
                    {error && <div className="sp-alert error"><span>⚠️</span> {error}</div>}

                    <div className="sp-input-group">
                        <label>Full Name</label>
                        <input className="sp-input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="sp-input-group">
                        <label>Email Address</label>
                        <input className="sp-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="sp-input-group">
                        <label>Password</label>
                        <div style={{ position: "relative" }}>
                            <input className="sp-input" type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                                value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 48 }} />
                            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>{showPass ? "🙈" : "👁️"}</button>
                        </div>
                        {password && (
                            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                                {[1,2,3,4].map(i => (
                                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: password.length >= i * 2 ? (i <= 2 ? "var(--red)" : i === 3 ? "var(--yellow)" : "var(--green)") : "var(--border)", transition: "background 0.3s" }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="sp-input-group">
                        <label>Account Type</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {accountTypes.map(({ value, icon, label, desc }) => (
                                <div key={value} onClick={() => setType(value)} style={{
                                    padding: "14px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.25s",
                                    border: `1px solid ${type === value ? "var(--accent)" : "var(--border)"}`,
                                    background: type === value ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
                                    boxShadow: type === value ? "0 0 16px rgba(0,212,255,0.15)" : "none",
                                }}>
                                    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="sp-btn-primary w-full" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 8, fontSize: 15 }}
                        onClick={handleRegister} disabled={loading}>
                        {loading ? <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Creating Account...</span> : "✨ Create Account Free"}
                    </button>

                    <div className="sp-auth-divider">or</div>
                    <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                        Already have an account? <Link to='/login' style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>Sign in →</Link>
                    </p>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

export default Register