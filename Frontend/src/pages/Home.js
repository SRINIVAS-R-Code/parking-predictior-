import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    img: "/hero1.png",
    badge: "🤖 AI-Powered Prediction",
    title: "Find Parking.",
    highlight: "Predict. Park. Go.",
    sub: "Smart Parking Availability Predictor uses AI to forecast real-time space availability across 40+ Indian cities.",
  },
  {
    img: "/hero2.png",
    badge: "📍 40+ Indian Cities",
    title: "Your City.",
    highlight: "Always a Spot.",
    sub: "From Mumbai to Chennai — our live prediction engine scans thousands of spaces so you never circle again.",
  },
  {
    img: "/hero3.png",
    badge: "⚡ Real-Time Technology",
    title: "Smart Tech.",
    highlight: "Smarter Parking.",
    sub: "AI-driven sensors and machine learning give you availability scores before you even start your engine.",
  },
];

const stats = [
  { num: "500+", lbl: "Parking Spaces" },
  { num: "40+", lbl: "Indian Cities" },
  { num: "10K+", lbl: "Happy Drivers" },
  { num: "99%", lbl: "Uptime" },
];

const steps = [
  { icon: "🔍", num: "01", title: "Search", desc: "Browse available spots by city, date & time with real-time AI filtering." },
  { icon: "📅", num: "02", title: "Book", desc: "Reserve instantly with secure confirmation in under 10 seconds." },
  { icon: "🅿️", num: "03", title: "Park", desc: "Arrive at your reserved spot — no stress, no guessing, guaranteed." },
];

const features = [
  { icon: "⚡", title: "Real-time Prediction", desc: "AI-powered availability with zero lag. Know exactly where to park before you leave." },
  { icon: "💳", title: "Secure Payments", desc: "Multiple payment options with bank-grade encryption." },
  { icon: "📍", title: "GPS Navigation", desc: "Integrated maps guide you turn-by-turn to your reserved spot." },
  { icon: "⭐", title: "Verified Owners", desc: "Community-rated, background-verified parking owners you can trust." },
  { icon: "🔔", title: "Smart Alerts", desc: "Get notified the moment your favourite spot becomes available." },
  { icon: "📊", title: "Usage Analytics", desc: "Owners get detailed occupancy insights to optimize pricing." },
];

const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat"];

function Home() {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setSlide(idx); setAnimating(false); }, 400);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const cur = SLIDES[slide];

  return (
    <div>
      {/* ── HERO SLIDESHOW ── */}
      <section style={{ position: "relative", minHeight: "calc(100vh - 72px)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Background Images */}
        {SLIDES.map((s, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${s.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "opacity 0.8s ease",
            opacity: i === slide ? 1 : 0,
            zIndex: 0,
          }} />
        ))}
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.65) 50%, rgba(15,23,42,0.80) 100%)", zIndex: 1 }} />
        {/* Subtle grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 1, pointerEvents: "none" }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "80px 28px", maxWidth: 860, margin: "0 auto", transition: "opacity 0.4s ease", opacity: animating ? 0 : 1 }}>
          <div className="sp-hero-eyebrow" style={{ marginBottom: 28, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", color: "#3b82f6" }}>{cur.badge}</div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(48px,7.5vw,86px)", fontWeight: 800, letterSpacing: -3, lineHeight: 1.05, marginBottom: 24, color: "#ffffff", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}>
            {cur.title}<br />
            <span className="gradient-text">{cur.highlight}</span>
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: 18, maxWidth: 580, margin: "0 auto 44px", lineHeight: 1.7, fontWeight: 500, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{cur.sub}</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
            <Link to="/space" className="sp-btn-primary" style={{ fontSize: 16, padding: "14px 36px", boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}>🔍 Find Parking Now</Link>
            <Link to="/about" style={{ fontSize: 16, padding: "14px 36px", borderRadius: 10, border: "2px solid rgba(255,255,255,0.5)", color: "#ffffff", fontWeight: 600, textDecoration: "none", backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.3)", transition: "all 0.25s" }}>How It Works</Link>
          </div>

          {/* Slide dots */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 60 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === slide ? 32 : 10, height: 10,
                borderRadius: 99, border: "none", cursor: "pointer",
                background: i === slide ? "var(--accent)" : "rgba(255,255,255,0.25)",
                transition: "all 0.4s ease",
                boxShadow: i === slide ? "0 0 12px var(--accent)" : "none",
              }} />
            ))}
          </div>

          {/* Stats */}
          <div className="sp-stats">
            {stats.map((s, i) => (
              <div className="sp-stat" key={i}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        <button onClick={() => goTo((slide - 1 + SLIDES.length) % SLIDES.length)} style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", zIndex: 3, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(15,23,42,0.15)", color: "#0f172a", width: 48, height: 48, borderRadius: "50%", fontSize: 20, cursor: "pointer", backdropFilter: "blur(10px)", transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>&#8249;</button>
        <button onClick={() => goTo((slide + 1) % SLIDES.length)} style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", zIndex: 3, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(15,23,42,0.15)", color: "#0f172a", width: 48, height: 48, borderRadius: "50%", fontSize: 20, cursor: "pointer", backdropFilter: "blur(10px)", transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>&#8250;</button>

        {/* Slide thumbnails */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, display: "flex" }}>
          {SLIDES.map((s, i) => (
            <div key={i} onClick={() => goTo(i)} style={{
              flex: 1, height: 4, cursor: "pointer",
              background: i === slide ? "#2563eb" : "rgba(15,23,42,0.2)",
              transition: "background 0.4s ease",
            }} />
          ))}
        </div>
      </section>

      {/* ── CITIES TICKER ── */}
      <div style={{ background: "#fff", borderTop: "1px solid rgba(15,23,42,0.07)", borderBottom: "1px solid rgba(15,23,42,0.07)", padding: "14px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 48, animation: "tickerScroll 22s linear infinite", width: "max-content", alignItems: "center" }}>
          {[...cities, ...cities].map((c, i) => (
            <span key={i} style={{ color: "#475569", fontSize: 13, fontWeight: 600, letterSpacing: 1, whiteSpace: "nowrap" }}>📍 {c}</span>
          ))}
        </div>
        <style>{`@keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 28px", background: "#ffffff" }}>
        <div className="sp-container">
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="sp-badge" style={{ marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1.5 }}>
              Park in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, fontSize: 16 }}>No more guessing. Our predictor handles the hard part.</p>
          </div>
          <div className="sp-grid sp-grid-3">
            {steps.map((step, i) => (
              <div className="sp-card reveal" key={i} style={{ position: "relative", overflow: "hidden", transitionDelay: `${i * 0.1}s` }}>
                <div className="sp-step-number">{step.num}</div>
                <div className="sp-icon-box" style={{ background: "rgba(0,212,255,0.08)" }}>
                  <span style={{ fontSize: 26 }}>{step.icon}</span>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="sp-section" style={{ paddingTop: 0 }}>
        <div className="sp-container">
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="sp-badge purple" style={{ marginBottom: 16 }}>Features</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1.5 }}>
              Built for the <span className="gradient-text">Modern Driver</span>
            </h2>
          </div>
          <div className="sp-grid sp-grid-3">
            {features.map((f, i) => (
              <div className="sp-card reveal" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="sp-icon-box"><span style={{ fontSize: 24 }}>{f.icon}</span></div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITY CARDS ── */}
      <section className="sp-section" style={{ paddingTop: 0 }}>
        <div className="sp-container">
          <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="sp-badge" style={{ marginBottom: 16 }}>🇮🇳 Coverage</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, letterSpacing: -1 }}>
              Available in <span className="gradient-text">Top Indian Cities</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {cities.map((city, i) => (
              <Link to={`/space`} key={i} style={{
                padding: "10px 22px", borderRadius: 99,
                background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)",
                color: "var(--text-secondary)", fontSize: 14, fontWeight: 600,
                textDecoration: "none", transition: "all 0.25s",
                backdropFilter: "blur(10px)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,212,255,0.15)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,212,255,0.06)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                📍 {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="sp-section" style={{ paddingTop: 0 }}>
        <div className="sp-container">
          <div className="reveal sp-card" style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.12) 100%)",
            borderColor: "rgba(0,212,255,0.2)", padding: "60px 40px", textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div className="sp-badge" style={{ marginBottom: 20 }}>🎯 Get Started Free</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>
              Ready to <span className="gradient-text">Never Circle Again?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Join thousands of drivers who park smarter with AI-powered predictions.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="sp-btn-primary" style={{ fontSize: 16, padding: "14px 36px" }}>✨ Create Free Account</Link>
              <Link to="/space" className="sp-btn-outline" style={{ fontSize: 16, padding: "14px 36px" }}>🔍 Browse Spaces</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
