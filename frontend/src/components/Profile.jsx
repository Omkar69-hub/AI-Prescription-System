import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Edit2, Check, X, Loader2, AlertCircle } from "lucide-react";
import Layout from "./Layout";
import apiClient from "../services/api";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ full_name: "", phone: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchProfile = async () => {
        try {
            const res = await apiClient.get("/auth/me");
            setUser(res.data);
            setForm({
                full_name: res.data.full_name || "",
                phone: res.data.phone || "",
            });

            // Update local storage too to keep it fresh
            const auth = JSON.parse(localStorage.getItem("auth") || "{}");
            if (auth.user) {
                auth.user = { ...auth.user, ...res.data };
                localStorage.setItem("auth", JSON.stringify(auth));
            }
        } catch (err) {
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!form.full_name.trim()) {
            setError("Full name cannot be empty.");
            return;
        }
        if (form.phone && !/^\d+$/.test(form.phone)) {
            setError("Phone number must contain only digits.");
            return;
        }

        setSaving(true);
        try {
            const res = await apiClient.patch("/auth/me", form);
            setUser(res.data);
            setSuccess("Profile updated successfully!");
            setEditing(false);

            // Update local storage
            const auth = JSON.parse(localStorage.getItem("auth") || "{}");
            if (auth.user) {
                auth.user = { ...auth.user, ...res.data };
                localStorage.setItem("auth", JSON.stringify(auth));
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit mb-2">My Profile</h1>
                    <p className="text-slate-500">Manage your personal information and account settings.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in duration-300">
                        <AlertCircle size={20} />
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in duration-300">
                        <Check size={20} />
                        <p className="text-sm font-semibold">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Avatar Card */}
                    <div className="lg:col-span-1">
                        <div className="glass-card p-8 rounded-[32px] border border-slate-100 shadow-xl flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-4xl font-bold shadow-lg mb-4">
                                {user?.full_name ? user.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{user?.full_name || "User"}</h3>
                            <p className="text-slate-500 text-sm mb-6 capitalize">{user?.role} Portal</p>

                            <div className="w-full border-t border-slate-100 pt-6">
                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="text-slate-400 font-medium">Status</span>
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">Active</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Member Since</span>
                                    <span className="text-slate-700 font-semibold">March 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-8 rounded-[32px] border border-slate-100 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <User className="text-emerald-500" size={24} /> Basic Information
                                </h3>
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
                                    >
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={form.full_name}
                                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address (Read-only)</label>
                                            <input
                                                type="email"
                                                className="input-field bg-slate-50 cursor-not-allowed"
                                                value={user?.email}
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Type</label>
                                            <input
                                                type="text"
                                                className="input-field bg-slate-50 cursor-not-allowed capitalize"
                                                value={user?.role}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(false);
                                                setForm({ full_name: user?.full_name || "", phone: user?.phone || "" });
                                                setError("");
                                            }}
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <X size={18} /> Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                            <p className="text-slate-900 font-bold">{user?.full_name || "Not set"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                            <Mail size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="text-slate-900 font-bold break-all">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                            <p className="text-slate-900 font-bold">{user?.phone || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account Type</p>
                                            <p className="text-slate-900 font-bold capitalize">{user?.role}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
