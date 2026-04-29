import React from 'react'

const stats = [
    { num: "500+", lbl: "Parking Spaces Listed" },
    { num: "40+",  lbl: "Indian Cities Covered" },
    { num: "10K+", lbl: "Satisfied Drivers" },
    { num: "95%",  lbl: "Prediction Accuracy" },
]

const team = [
    { icon: "🤖", title: "AI Engine",       desc: "RandomForest ML model trained on 50,000+ data points across Indian cities." },
    { icon: "🔐", title: "Secure Platform", desc: "JWT authentication with bank-grade encryption for all transactions." },
    { icon: "📍", title: "Live Maps",       desc: "Satellite & street-view maps with real-time parking lot markers." },
    { icon: "📱", title: "Mobile Ready",    desc: "Fully responsive design — works perfectly on any device, anywhere." },
]

const About = () => {
    return (
        <div>
            {/* ── HERO with Background Photo ── */}
            <div style={{ position: "relative", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/about_bg.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,8,16,0.78) 0%, rgba(5,8,16,0.92) 100%)" }} />
                <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 28px" }}>
                    <div className="sp-badge" style={{ marginBottom: 20 }}>ℹ️ About Us</div>
                    <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(32px,5vw,60px)", fontWeight: 800, letterSpacing: -2, marginBottom: 20, lineHeight: 1.1, color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                        Revolutionizing <span className="gradient-text">Urban Parking</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.7, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                        We connect drivers with parking spaces using AI — saving time, reducing emissions, and empowering communities across India.
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
                                    Smart Parking Availability Predictor aims to establish a platform that connects parking owners within the community with users in search of affordable parking spaces.
                                    Our web application assists parking owners in effectively renting out their additional parking spaces, providing them with an opportunity to earn extra income.
                                    Additionally, our platform facilitates users in finding cost-effective, AI-predicted parking spaces across 40+ Indian cities.
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
                                Search for available parking spots that meet your exact needs. Filter by city, date, time, and price. Reserve instantly with AI-ranked availability scores — so you always know your best bet before you leave home.
                            </p>
                            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {["AI Predictions", "Instant Booking", "GPS Navigation"].map(t => <span key={t} className="sp-chip">{t}</span>)}
                            </div>
                        </div>
                        <div className="sp-card" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.06),transparent)" }}>
                            <div style={{ fontSize: 40, marginBottom: 20 }}>🏠</div>
                            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>For Parking Owners</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>
                                List your extra parking spaces in minutes. Set your own pricing, control availability, and start earning passive income. Our dashboard gives you full control — approve or reject bookings in real-time.
                            </p>
                            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {["Easy Listing", "Revenue Tracking", "Booking Control"].map(t => <span key={t} className="sp-chip">{t}</span>)}
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