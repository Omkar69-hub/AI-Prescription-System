import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Stethoscope, Search, Upload, History as HistoryIcon,
    LogOut, Bell, Users, LayoutDashboard
} from "lucide-react";
import { logoutUser } from "../utils/auth";

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

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    // Build nav per role
    const patientNav = [
        { path: "/user/symptom-search", icon: <Search size={22} />, label: "Symptom Search" },
        { path: "/user/upload-prescription", icon: <Upload size={22} />, label: "Upload" },
        { path: "/user/history", icon: <HistoryIcon size={22} />, label: "History" },
    ];
    const doctorNav = [
        { path: "/doctor/history", icon: <Users size={22} />, label: "Patient History" },
    ];
    const adminNav = [
        { path: "/admin/dashboard", icon: <LayoutDashboard size={22} />, label: "Admin Dashboard" },
        { path: "/doctor/history", icon: <Users size={22} />, label: "Patient History" },
    ];

    const navItems = role === "admin" ? adminNav : role === "doctor" ? doctorNav : patientNav;

    const avatarLetter = user.full_name ? user.full_name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U");
    const displayName = user.full_name || user.email || "User";
    const activePath = navItems.find(item => item.path === location.pathname)?.label || "Dashboard";

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                <div className="p-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Stethoscope size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-800 font-outfit">AI Health</span>
                    </Link>
                </div>

                {/* Role badge */}
                <div className="px-6 mb-4">
                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${role === "admin" ? "bg-red-100 text-red-600" :
                            role === "doctor" ? "bg-blue-100 text-blue-600" :
                                "bg-emerald-100 text-emerald-600"
                        }`}>
                        {role === "admin" ? "Admin" : role === "doctor" ? "Doctor" : "Patient"} Portal
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${location.pathname === item.path
                                    ? "bg-emerald-50 text-emerald-600 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <div className={`${location.pathname === item.path ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-600"}`}>
                                {item.icon}
                            </div>
                            <span className="font-semibold">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User info */}
                <div className="p-4 mx-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                            {avatarLetter}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email || ""}</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 font-semibold"
                    >
                        <LogOut size={22} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h2 className="text-xl font-bold text-slate-800 font-outfit">{activePath}</h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                            {avatarLetter}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    );
}
