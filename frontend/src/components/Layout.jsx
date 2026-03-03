import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Stethoscope, Search, Upload, History as HistoryIcon,
    LogOut, Users, LayoutDashboard
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
        ? "bg-red-500/20 text-red-300 border-red-500/30"
        : role === "doctor"
            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";

    /* shared inline styles */
    const sidebarStyle = {
        width: 272,
        display: "flex", flexDirection: "column", flexShrink: 0,
        background: "rgba(4,18,38,0.72)",
        backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        position: "relative", zIndex: 10,
    };
    const topbarStyle = {
        height: 72, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 32px",
        background: "rgba(4,18,38,0.65)",
        backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky", top: 0, zIndex: 20,
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
                            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                            background: "linear-gradient(135deg,#06b6d4,#0e7490)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(6,182,212,0.35)",
                        }}>
                            <Stethoscope size={22} color="#fff" />
                        </div>
                        <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.02em" }}>
                            AI Health
                        </span>
                    </Link>
                </div>

                {/* Role badge */}
                <div style={{ padding: "0 28px 20px" }}>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${roleBadgeCls}`}>
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
                                background: active ? "rgba(6,182,212,0.18)" : "transparent",
                                color: active ? "#67e8f9" : "rgba(186,230,253,0.6)",
                                border: active ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                            }}>
                                <span style={{ color: active ? "#67e8f9" : "rgba(186,230,253,0.4)" }}>{item.icon}</span>
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
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, color: "#fff", fontSize: "0.875rem",
                        }}>{avatarLetter}</div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, color: "#e0f2fe", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                            <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(148,163,184,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email || ""}</p>
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <div style={{ padding: "6px 16px 28px" }}>
                    <button onClick={handleLogout} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 14px", borderRadius: 13,
                        background: "transparent", border: "1px solid transparent",
                        color: "rgba(186,230,253,0.45)", fontWeight: 600, fontSize: "0.875rem",
                        cursor: "pointer", transition: "all 0.18s", fontFamily: "Inter,sans-serif",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.22)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(186,230,253,0.45)"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main ──────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 10 }}>

                {/* Topbar */}
                <header style={topbarStyle}>
                    <h2 style={{ margin: 0, fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#e0f2fe" }}>
                        {activeLabel}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Full notification panel */}
                        <NotificationPanel />
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, color: "#fff", fontSize: "0.875rem",
                            boxShadow: "0 2px 10px rgba(6,182,212,0.3)",
                        }}>{avatarLetter}</div>
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
