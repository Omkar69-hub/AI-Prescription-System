import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Stethoscope,
    Search,
    Upload,
    History as HistoryIcon,
    LogOut,
    User,
    LayoutDashboard,
    Bell
} from "lucide-react";
import { logoutUser } from "../utils/auth";

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const navItems = [
        { path: "/user/symptom-search", icon: <Search size={22} />, label: "Symptom Search" },
        { path: "/user/upload-prescription", icon: <Upload size={22} />, label: "Upload" },
        { path: "/user/history", icon: <HistoryIcon size={22} />, label: "History" },
    ];

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

                <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 font-semibold"
                    >
                        <LogOut size={22} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h2 className="text-xl font-bold text-slate-800 font-outfit">
                        {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
                    </h2>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                            U
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
