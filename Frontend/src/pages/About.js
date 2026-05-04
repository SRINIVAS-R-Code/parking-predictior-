import React from 'react'

const stats = [
    { num: "30",   lbl: "Mapped Parking Lots" },
    { num: "25+",  lbl: "Bangalore Areas Covered" },
    { num: "600K", lbl: "ML Training Records" },
    { num: "100%", lbl: "Bangalore-Focused" },
]

const team = [
    { icon: "🤖", title: "AI Engine",       desc: "RandomForest ML model trained on 600,000+ real Bangalore parking records for accurate availability prediction." },
    { icon: "🔐", title: "JWT Auth",        desc: "Secure JWT-based authentication with role-based access for parking owners and seekers." },
    { icon: "📍", title: "Live Maps",       desc: "Satellite, street, terrain & dark HUD map views with real GPS-positioned parking lot markers." },
    { icon: "📱", title: "Responsive UI",   desc: "Fully responsive design built with React — works on any device, screen size or browser." },
]

const About = () => {
    return (
        <div>
            {/* ── HERO with Background Photo ── */}
            <div style={{ position: "relative", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/about_bg.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,8,16,0.78) 0%, rgba(5,8,16,0.92) 100%)" }} />
                <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 28px" }}>
                    <div className="sp-badge" style={{ marginBottom: 20 }}>ℹ️ About SmartPark</div>
                    <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(32px,5vw,60px)", fontWeight: 800, letterSpacing: -2, marginBottom: 20, lineHeight: 1.1, color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                        AI-Powered <span className="gradient-text">Urban Parking</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.7, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                        We connect drivers with parking spaces across Bangalore using a RandomForest ML model trained on 600,000+ real parking records.
                    </p>
                </div>
            </div>

            {/* ── STATS ── */}
            <div style={{ background: "#fff", borderTop: "1px solid rgba(15,23,42,0.07)", borderBottom: "1px solid rgba(15,23,42,0.07)", padding: "48px 28px" }}>
                <div className="sp-container">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
                        {stats.map((s, i) => (
                            <div key={i}>
                                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 44, fontWeight: 800, background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.num}</div>
                                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 500, marginTop: 6 }}>{s.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="sp-section">
                <div className="sp-container">
                    {/* Mission */}
                    <div className="sp-card" style={{ padding: "40px 48px", marginBottom: 40, background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.04))" }}>
                        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <div style={{ fontSize: 48 }}>🎯</div>
                            <div style={{ flex: 1, minWidth: 280 }}>
                                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 14 }}>Our Mission</h2>
                                <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.8 }}>
                                    SmartPark aims to solve Bangalore's urban parking problem using AI. Our platform connects parking lot owners with drivers searching for affordable parking spaces.
                                    Owners list and manage their spaces through a dedicated dashboard. Seekers use ML-predicted availability scores to find the best parking before they leave home.
                                    Built on a RandomForest model trained on 600,000 synthetic-but-realistic Bangalore parking records, SmartPark delivers data-driven predictions across 30 lots in 25+ city areas.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* For Seekers & Owners */}
                    <div className="sp-grid sp-grid-2" style={{ gap: 24, marginBottom: 40 }}>
                        <div className="sp-card" style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.06),transparent)" }}>
                            <div style={{ fontSize: 40, marginBottom: 20 }}>🚗</div>
                            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>For Parking Seekers</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>
                                Browse 30 live parking lots on an interactive AI-powered map. Use the time slider to simulate availability at any hour. Filter by area, lot type, and status. Click any marker to view rich AI scores and book real parking slots backed by the database.
                            </p>
                            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {["AI Predictions", "Instant Booking", "Interactive Map"].map(t => <span key={t} className="sp-chip">{t}</span>)}
                            </div>
                        </div>
                        <div className="sp-card" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.06),transparent)" }}>
                            <div style={{ fontSize: 40, marginBottom: 20 }}>🏠</div>
                            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>For Parking Owners</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>
                                List your extra parking spaces in minutes. Set your own pricing, define time slots, and control availability. Approve or reject incoming booking requests in real-time. Your profile shows live revenue, approved bookings, and open slot counts.
                            </p>
                            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {["Easy Listing", "Booking Control", "Analytics Dashboard"].map(t => <span key={t} className="sp-chip">{t}</span>)}
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div className="sp-badge purple" style={{ marginBottom: 14 }}>⚙️ Technology</div>
                        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, letterSpacing: -1 }}>
                            Built with <span className="gradient-text">Cutting-Edge Tech</span>
                        </h2>
                    </div>
                    <div className="sp-grid sp-grid-4">
                        {team.map((t, i) => (
                            <div className="sp-card" key={i} style={{ textAlign: "center", padding: "28px 20px" }}>
                                <div style={{ fontSize: 36, marginBottom: 16 }}>{t.icon}</div>
                                <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, marginBottom: 10 }}>{t.title}</h4>
                                <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About