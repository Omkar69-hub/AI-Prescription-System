import React, { useState, useEffect, useRef } from "react";
import {
    Bell, LogIn, UserPlus, ClipboardList, Clock, ShoppingCart,
    BookOpen, X, CheckCheck, Trash2, ChevronRight
} from "lucide-react";
import {
    getNotifications, markAllRead, removeNotification, clearAll,
    getUnreadCount, timeAgo
} from "../utils/notifications";

/* ── Icon map per type ─────────────────────────────────────────────── */
const TYPE_META = {
    login: { icon: LogIn, color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
    signup: { icon: UserPlus, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    prescription: { icon: ClipboardList, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    dosage: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    purchase: { icon: ShoppingCart, color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
    history: { icon: BookOpen, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    reminder: { icon: Bell, color: "#14b8a6", bg: "rgba(20,184,166,0.12)" },
};

function NotifItem({ notif, onRemove }) {
    const meta = TYPE_META[notif.type] || TYPE_META.reminder;
    const Icon = meta.icon;
    return (
        <div style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "12px 16px",
            background: notif.read ? "transparent" : "rgba(6,182,212,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            transition: "background 0.2s",
            position: "relative",
        }}>
            {/* Unread dot */}
            {!notif.read && (
                <span style={{
                    position: "absolute", top: 14, left: 5,
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#06b6d4",
                }} />
            )}

            {/* Type icon */}
            <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: meta.bg, display: "flex", alignItems: "center",
                justifyContent: "center", marginTop: 1,
            }}>
                <Icon size={16} color={meta.color} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.8rem", color: "#e0f2fe", lineHeight: 1.3 }}>
                    {notif.title}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: "rgba(186,230,253,0.6)", lineHeight: 1.45 }}>
                    {notif.message}
                </p>
                <span style={{ fontSize: "0.65rem", color: "rgba(148,163,184,0.45)", fontWeight: 500 }}>
                    {timeAgo(notif.timestamp)}
                </span>
            </div>

            {/* Remove */}
            <button onClick={() => onRemove(notif.id)} style={{
                flexShrink: 0, background: "none", border: "none",
                color: "rgba(148,163,184,0.4)", cursor: "pointer",
                padding: "2px 4px", borderRadius: 6,
                transition: "color 0.18s",
            }}
                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.4)"}
                title="Dismiss"
            >
                <X size={13} />
            </button>
        </div>
    );
}

/** Bell button + dropdown panel — rendered in Layout topbar */
export default function NotificationPanel() {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const [unread, setUnread] = useState(0);
    const panelRef = useRef(null);

    const refresh = () => {
        const all = getNotifications();
        setNotifs(all);
        setUnread(all.filter(n => !n.read).length);
    };

    useEffect(() => {
        refresh();
        window.addEventListener("notifications-changed", refresh);
        return () => window.removeEventListener("notifications-changed", refresh);
    }, []);

    // Close panel on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleOpen = () => {
        setOpen(o => {
            if (!o) {
                // Mark all read when panel opens
                markAllRead();
                setTimeout(refresh, 50);
            }
            return !o;
        });
    };

    const handleRemove = (id) => {
        removeNotification(id);
        refresh();
    };

    const handleClearAll = () => {
        clearAll();
        refresh();
    };

    return (
        <div ref={panelRef} style={{ position: "relative" }}>

            {/* Bell button */}
            <button
                onClick={handleOpen}
                title="Notifications"
                style={{
                    width: 38, height: 38, borderRadius: 10, position: "relative",
                    background: open ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.06)",
                    border: open ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: open ? "#67e8f9" : "rgba(186,230,253,0.6)",
                    cursor: "pointer", transition: "all 0.18s",
                }}
            >
                <Bell size={18} />
                {unread > 0 && (
                    <span style={{
                        position: "absolute", top: -4, right: -4,
                        minWidth: 17, height: 17, borderRadius: 999,
                        background: "#ef4444", color: "#fff",
                        fontSize: "0.6rem", fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid rgba(4,18,38,0.9)",
                        padding: "0 3px", fontFamily: "Inter,sans-serif",
                    }}>
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div style={{
                    position: "absolute", top: 46, right: 0,
                    width: 340, maxHeight: 480,
                    background: "rgba(8,24,52,0.97)",
                    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 18, overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.08) inset",
                    zIndex: 1000,
                    animation: "cardIn 0.22s cubic-bezier(0.22,1,0.36,1) both",
                }}>

                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Bell size={15} color="#06b6d4" />
                            <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#e0f2fe" }}>
                                Notifications
                            </span>
                            {unread > 0 && (
                                <span style={{
                                    background: "rgba(6,182,212,0.2)", color: "#67e8f9",
                                    fontSize: "0.65rem", fontWeight: 700, padding: "1px 7px",
                                    borderRadius: 999, border: "1px solid rgba(6,182,212,0.3)",
                                }}>
                                    {unread} new
                                </span>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {notifs.length > 0 && (
                                <button onClick={handleClearAll} title="Clear all" style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "rgba(148,163,184,0.5)", fontSize: "0.7rem",
                                    padding: "3px 6px", borderRadius: 6, fontFamily: "Inter,sans-serif",
                                    transition: "color 0.18s",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                                    onMouseLeave={e => e.currentTarget.style.color = "rgba(148,163,184,0.5)"}
                                >
                                    <Trash2 size={11} /> Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification list */}
                    <div style={{ overflowY: "auto", maxHeight: 370 }}>
                        {notifs.length === 0 ? (
                            <div style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", padding: "40px 20px", gap: 12,
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: "rgba(6,182,212,0.12)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <CheckCheck size={22} color="#06b6d4" />
                                </div>
                                <p style={{ color: "rgba(186,230,253,0.4)", fontSize: "0.82rem", margin: 0, fontFamily: "Inter,sans-serif", textAlign: "center" }}>
                                    All caught up! No notifications.
                                </p>
                            </div>
                        ) : (
                            notifs.map(n => (
                                <NotifItem key={n.id} notif={n} onRemove={handleRemove} />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifs.length > 0 && (
                        <div style={{
                            padding: "10px 16px",
                            borderTop: "1px solid rgba(255,255,255,0.07)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                            color: "rgba(148,163,184,0.4)", fontSize: "0.7rem", fontFamily: "Inter,sans-serif",
                        }}>
                            <span>{notifs.length} notification{notifs.length !== 1 ? "s" : ""} total</span>
                            <ChevronRight size={11} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
