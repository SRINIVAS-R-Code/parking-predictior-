import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/api'
import { setUser } from '../reducers/userReducer'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setLoading(true); setError(null)
        await login({ email, password, handleLoginSuccess, handleLoginFailure })
        setLoading(false)
    }
    const handleLoginSuccess = (data) => {
        dispatch(setUser({ ...data?.user, token: data?.token }))
        navigate('/')
    }
    const handleLoginFailure = (err) => setError(err || "Login failed. Please try again.")

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
            {/* Left — Photo Panel */}
            <div style={{
                flex: 1, position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                minHeight: 500,
            }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/auth_bg.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,8,16,0.85) 0%, rgba(0,212,255,0.1) 100%)" }} />
                <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "40px 48px" }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>🅿️</div>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16, background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        SmartPark Predictor
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.7, maxWidth: 320 }}>
                        AI-powered real-time parking availability across Bangalore.
                    </p>
                    <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 36 }}>
                        {["30 Lots", "25+ Areas", "600K Records"].map((t, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{t}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form Panel */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#f8faff" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div className="sp-badge" style={{ marginBottom: 16 }}>🔐 Secure Login</div>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: -1 }}>Welcome Back</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 36 }}>Sign in to your SmartPark account</p>

                    {error && <div className="sp-alert error"><span>⚠️</span> {error}</div>}

                    <div className="sp-input-group">
                        <label>Email Address</label>
                        <input id="login-email" className="sp-input" type="email" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    </div>
                    <div className="sp-input-group">
                        <label>Password</label>
                        <div style={{ position: "relative" }}>
                            <input id="login-password" className="sp-input" type={showPass ? "text" : "password"}
                                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ paddingRight: 48 }} />
                            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>
                                {showPass ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button id="login-submit" className="sp-btn-primary w-full" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 8, fontSize: 15 }}
                        onClick={handleLogin} disabled={loading}>
                        {loading ? <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Signing in...</span> : "→ Sign In"}
                    </button>

                    <div className="sp-auth-divider">or</div>
                    <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                        Don't have an account?{' '}<Link to='/register' style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>Create one free →</Link>
                    </p>
                    <div style={{ marginTop: 28, padding: "16px", borderRadius: "var(--radius-sm)", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.8 }}>
                            🔒 JWT Auth &nbsp;·&nbsp; 🚀 Instant access &nbsp;·&nbsp; 🤖 Bangalore AI Engine
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

export default Login