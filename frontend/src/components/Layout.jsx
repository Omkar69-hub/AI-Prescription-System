import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Stethoscope, Search, Upload, History as HistoryIcon,
    LogOut, Users, LayoutDashboard, User, Settings as SettingsIcon, UserCircle, ChevronDown
} from "lucide-react";
import { logoutUser } from "../utils/auth";
import NotificationPanel from "./NotificationPanel";
import { addNotification, getCurrentDosageSlot } from "../utils/notifications";

function getAuth() {
    try {
        const raw = localStorage.getItem("auth");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = getAuth();
    const role = auth.role || "patient";
    const user = auth.user || {};

    const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
    const userDropdownRef = React.useRef(null);

    // Close user dropdown on outside click
    useEffect(() => {
        if (!userDropdownOpen) return;
        const handler = (e) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [userDropdownOpen]);

    // One-time session dosage reminder
    useEffect(() => {
        const key = "rx_dosage_reminder_" + new Date().toDateString();
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            const slot = getCurrentDosageSlot();
            const emojis = { Morning: "🌅", Afternoon: "☀️", Evening: "🌇", Night: "🌙" };
            addNotification({
                type: "dosage",
                title: `${emojis[slot]} ${slot} Dose Reminder`,
                message: `It's ${slot.toLowerCase()} — don't forget to take your prescribed medications on time.`,
            });
        }
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const patientNav = [
        { path: "/user/symptom-search", icon: <Search size={20} />, label: "Symptom Search" },
        { path: "/user/upload-prescription", icon: <Upload size={20} />, label: "Upload" },
        { path: "/user/history", icon: <HistoryIcon size={20} />, label: "History" },
    ];
    const doctorNav = [{ path: "/doctor/history", icon: <Users size={20} />, label: "Patient History" }];
    const adminNav = [
        { path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Admin Dashboard" },
        { path: "/doctor/history", icon: <Users size={20} />, label: "Patient History" },
    ];
    const navItems = role === "admin" ? adminNav : role === "doctor" ? doctorNav : patientNav;

    const avatarLetter = user.full_name ? user.full_name[0].toUpperCase()
        : user.email ? user.email[0].toUpperCase() : "U";
    const displayName = user.full_name || user.email || "User";
    const activeLabel = navItems.find(i => i.path === location.pathname)?.label || "Dashboard";

    const roleBadgeCls = role === "admin"
        ? "bg-rose-50 text-rose-600 border-rose-100"
        : role === "doctor"
            ? "bg-blue-50 text-blue-600 border-blue-100"
            : "bg-emerald-50 text-emerald-600 border-emerald-100";

    /* shared inline styles */
    const sidebarStyle = {
        width: 272,
        display: "flex", flexDirection: "column", flexShrink: 0,
        background: "rgba(var(--sidebar-bg-rgb, 255, 255, 255), 0.5)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid var(--color-border-subtle)",
        position: "relative", zIndex: 10,
        transition: "all 0.3s ease",
    };
    const topbarStyle = {
        height: 72, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 32px",
        background: "rgba(var(--topbar-bg-rgb, 255, 255, 255), 0.5)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--color-border-subtle)",
        position: "sticky", top: 0, zIndex: 20,
        transition: "all 0.3s ease",
    };

    return (
        <div className="min-h-screen flex" style={{ isolation: "isolate" }}>

            {/* Global background */}
            <div className="app-bg-fixed" />
            <div className="app-bg-overlay" />

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col" style={sidebarStyle}>

                {/* Brand */}
                <div style={{ padding: "32px 28px 20px" }}>
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                            background: "#10b981",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                        }}>
                            <Stethoscope size={20} color="#fff" />
                        </div>
                        <span style={{
                            fontFamily: "Outfit,sans-serif",
                            fontWeight: 800,
                            fontSize: "1.15rem",
                            color: "var(--color-brand-primary)",
                            letterSpacing: "-0.02em"
                        }}>
                            AI Health
                        </span>
                    </Link>
                </div>

                {/* Role badge */}
                <div style={{ padding: "0 28px 20px" }}>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${roleBadgeCls}`}>
                        {role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Patient"} Portal
                    </span>
                </div>

                {/* Nav links */}
                <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {navItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "10px 14px", borderRadius: 13,
                                fontWeight: 600, fontSize: "0.875rem",
                                textDecoration: "none",
                                transition: "all 0.18s",
                                background: active ? "rgba(16, 185, 129, 0.1)" : "transparent",
                                color: active ? "#10b981" : "var(--color-brand-secondary)",
                                border: active ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid transparent",
                            }}>
                                <span style={{ color: active ? "#10b981" : "var(--color-text-dimmed)" }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User card */}
                <div style={{ padding: "16px 16px 8px" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 14px", borderRadius: 14,
                        background: "rgba(var(--color-accent-emerald-rgb, 16, 185, 129), 0.05)",
                        border: "1px solid var(--color-border-dark, #e2e8f0)",
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: "#10b981",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, color: "#fff", fontSize: "0.875rem",
                        }}>{avatarLetter}</div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, color: "var(--color-brand-primary)", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                            <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-brand-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email || ""}</p>
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <div style={{ padding: "6px 16px 28px" }}>
                    <button onClick={handleLogout} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 14px", borderRadius: 13,
                        background: "transparent", border: "1px solid transparent",
                        color: "var(--color-text-dimmed)", fontWeight: 600, fontSize: "0.875rem",
                        cursor: "pointer", transition: "all 0.18s", fontFamily: "Inter,sans-serif",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(225, 29, 72, 0.1)"; e.currentTarget.style.color = "#e11d48"; e.currentTarget.style.borderColor = "rgba(225, 29, 72, 0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-dimmed)"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ──────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 10 }}>

                {/* Topbar */}
                <header style={topbarStyle}>
                    <h2 style={{ margin: 0, fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--color-brand-primary)" }}>
                        {activeLabel}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <NotificationPanel />

                        {/* User Account with Dropdown */}
                        <div ref={userDropdownRef} style={{ position: "relative" }}>
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    background: "none", border: "none", padding: 0,
                                    cursor: "pointer", borderRadius: 10,
                                    transition: "all 0.2s",
                                }}
                            >
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: "#10b981",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, color: "#fff", fontSize: "0.875rem",
                                    boxShadow: "0 2px 8px rgba(16,185,129,0.2)",
                                }}>{avatarLetter}</div>
                                <ChevronDown size={14} color="#64748b" style={{
                                    transform: userDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                                    transition: "transform 0.2s"
                                }} />
                            </button>

                            {userDropdownOpen && (
                                <div style={{
                                    position: "absolute", top: 46, right: 0,
                                    width: 220, background: "var(--color-bg-card)",
                                    border: "1px solid var(--color-border-subtle)", borderRadius: 18,
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                                    padding: "8px", zIndex: 1000,
                                    animation: "cardIn 0.2s ease-out both"
                                }}>
                                    <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--color-border-subtle)", marginBottom: 6 }}>
                                        <p style={{ margin: 0, fontWeight: 700, color: "var(--color-brand-primary)", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                                        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--color-brand-secondary)" }}>{user.email}</p>
                                    </div>

                                    {[
                                        { label: "View Profile", icon: <User size={16} />, path: "/profile" },
                                        { label: "My History", icon: <HistoryIcon size={16} />, path: role === "admin" ? "/admin/dashboard" : "/user/history" },
                                        { label: "Settings", icon: <SettingsIcon size={16} />, path: "/settings" },
                                    ].map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { opt.path !== "#" && navigate(opt.path); setUserDropdownOpen(false); }}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 10,
                                                width: "100%", padding: "10px 12px", borderRadius: 12,
                                                background: "none", border: "none", cursor: "pointer",
                                                color: "var(--color-brand-secondary)", fontSize: "0.875rem", fontWeight: 500,
                                                transition: "all 0.15s", textAlign: "left"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(16, 185, 129, 0.05)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                                        >
                                            {opt.icon} {opt.label}
                                        </button>
                                    ))}

                                    <div style={{ borderTop: "1px solid var(--color-border-subtle)", marginTop: 6, paddingTop: 6 }}>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 10,
                                                width: "100%", padding: "10px 12px", borderRadius: 12,
                                                background: "none", border: "none", cursor: "pointer",
                                                color: "#e11d48", fontSize: "0.875rem", fontWeight: 600,
                                                transition: "all 0.15s", textAlign: "left"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(225, 29, 72, 0.1)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
