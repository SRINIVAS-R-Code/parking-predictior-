import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { clearUser } from "../reducers/userReducer";

const Layout = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [scrolled, setScrolled] = useState(false);

    const handleLogout = () => {
        dispatch(clearUser());
    };

    useEffect(() => {
        if (!user && location.pathname !== '/' && location.pathname !== '/about'
            && location.pathname !== '/login' && location.pathname !== '/register') {
            navigate('/login');
        }
    }, [user, location, navigate]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isActive = (path) => location.pathname === path ? "active" : "";

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/parking", label: "Parking" },
        { to: "/space", label: "Find Spaces" },
        { to: "/booking", label: "Bookings" },
    ];

    return (
        <div>
            <nav className="sp-navbar" style={scrolled ? { boxShadow: "0 4px 24px rgba(15,23,42,0.1)", background: "rgba(255,255,255,0.97)" } : {}}>
                <Link className="sp-logo" to="/">
                    <span style={{ fontWeight: 800 }}>SmartPark</span>
                    <span style={{ fontWeight: 300, fontSize: 12, color: "var(--text-muted)", marginLeft: 4, WebkitTextFillColor: "var(--text-muted)" }}>
                        Predictor
                    </span>
                </Link>

                <ul className="sp-nav-links">
                    {navLinks.map(({ to, label }) => (
                        <li key={to}><Link className={`nav-link ${isActive(to)}`} to={to}>{label}</Link></li>
                    ))}
                    {user?.type !== "seeker" && <>
                        <li><Link className={`nav-link ${isActive("/parkingForm")}`} to="/parkingForm">+ Parking</Link></li>
                        <li><Link className={`nav-link ${isActive("/spaceForm")}`} to="/spaceForm">+ Space</Link></li>
                    </>}
                    {user?.type === "admin" && <li><Link className={`nav-link ${isActive("/users")}`} to="/users">Users</Link></li>}
                </ul>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {user ? <>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user?.name}</span>
                            <span className="sp-badge" style={{ fontSize: 10, padding: "2px 8px", marginTop: 2 }}>{user?.type}</span>
                        </div>
                        <Link to="/profile" className="sp-avatar" title="Profile">{user?.name?.[0]?.toUpperCase()}</Link>
                        <button className="sp-btn-outline" onClick={handleLogout} style={{ fontSize: 13 }}>Logout</button>
                    </> : <>
                        <Link className="sp-btn-outline" to="/login">Sign In</Link>
                        <Link className="sp-btn-primary" to="/register">Get Started →</Link>
                    </>}
                </div>
            </nav>

            <main style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 72px)" }}>
                <Outlet />
            </main>

            <footer className="sp-footer">
                <div>
                    <div style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: 20, fontWeight: 800,
                        background: "var(--accent-gradient)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        marginBottom: 8,
                    }}>
                        🅿️ SmartPark Predictor
                    </div>
                    <p style={{ color: "#64748b", fontSize: 13 }}>AI-Powered Smart Parking Availability Predictor</p>
                    <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>Serving 40+ cities across India</p>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Navigation</div>
                    <div className="sp-footer-links" style={{ flexDirection: "column", gap: 10 }}>
                        <Link to="/">🏠 Home</Link>
                        <Link to="/about">ℹ️ About</Link>
                        <Link to="/parking">🅿️ Parking</Link>
                        <Link to="/space">🔍 Find Spaces</Link>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Account</div>
                    <div className="sp-footer-links" style={{ flexDirection: "column", gap: 10 }}>
                        {!user && <Link to="/register">✨ Create Account</Link>}
                        {!user && <Link to="/login">🔐 Sign In</Link>}
                        {user && <Link to="/booking">📋 My Bookings</Link>}
                        {user && <Link to="/profile">👤 My Profile</Link>}
                    </div>
                </div>
                <div className="sp-footer-copy">
                    © {new Date().getFullYear()} Smart Parking Availability Predictor · Built with ❤️ for India
                </div>
            </footer>
        </div>
    );
};

export default Layout;