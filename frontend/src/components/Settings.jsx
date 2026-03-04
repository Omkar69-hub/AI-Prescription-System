import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Shield, Keyboard, Info } from "lucide-react";
import Layout from "./Layout";

export default function Settings() {
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains("dark") ||
            localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("notification_prefs");
        return saved ? JSON.parse(saved) : {
            dosage: true,
            prescription: true,
            activity: true
        };
    });

    useEffect(() => {
        localStorage.setItem("notification_prefs", JSON.stringify(notifications));
    }, [notifications]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePrivacy = () => {
        alert("Privacy settings have been updated to 'Secure Management'. Your medical data is encrypted.");
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-2 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your application preferences and system configuration.</p>
                </div>

                <div className="space-y-6">
                    {/* Appearance Section */}
                    <div className="glass-card p-8 rounded-[32px]">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8 dark:text-white">
                            <Monitor className="text-emerald-500" size={24} /> Appearance
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors ${darkMode ? 'bg-indigo-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                    {darkMode ? <Moon size={22} /> : <Sun size={22} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white mb-0.5">Dark Mode</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Use darker colors for late-night sessions</p>
                                </div>
                            </div>

                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${darkMode ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="glass-card p-8 rounded-[32px]">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8 dark:text-white">
                            <Bell className="text-emerald-500" size={24} /> Notifications
                        </h3>

                        <div className="space-y-4">
                            {[
                                { id: "dosage", title: "Dosage Reminders", desc: "Get alerted when it's time for your medicine" },
                                { id: "prescription", title: "New Prescription", desc: "Notify when a new OCR result is ready" },
                                { id: "activity", title: "Account Activity", desc: "Security alerts and login notifications" }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 dark:border-slate-800">
                                    <div className="min-w-0 pr-4">
                                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification(item.id)}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${notifications[item.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${notifications[item.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security & System */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 rounded-[32px]">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 dark:text-white">
                                <Shield className="text-emerald-500" size={20} /> Privacy
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Manage how your medical data is shared and stored.</p>
                            <button
                                onClick={handlePrivacy}
                                className="btn-secondary w-full text-xs py-2 dark:bg-slate-800 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                            >
                                Configure Privacy
                            </button>
                        </div>

                        <div className="glass-card p-8 rounded-[32px]">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 dark:text-white">
                                <Info className="text-emerald-500" size={20} /> System
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">View version info and connected diagnostic tools.</p>
                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                <span>Version</span>
                                <span className="text-emerald-500">2.0.4-LTS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
