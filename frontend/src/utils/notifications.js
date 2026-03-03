/**
 * notifications.js
 * Manages persistent notifications stored in localStorage.
 * Used across Login, Signup, SymptomSearch, and the NotificationPanel.
 */

const KEY = "ai_rx_notifications";
const MAX = 25;

/** Return all notifications (newest first) */
export function getNotifications() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
        return [];
    }
}

/** Add a new notification. Returns the created object. */
export function addNotification({ type, title, message }) {
    const all = getNotifications();
    const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,       // login | signup | prescription | dosage | purchase | history | reminder
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
    };
    const updated = [entry, ...all].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
    // Dispatch custom event so other components re-render
    window.dispatchEvent(new Event("notifications-changed"));
    return entry;
}

/** Mark all notifications as read */
export function markAllRead() {
    const updated = getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("notifications-changed"));
}

/** Remove a single notification by id */
export function removeNotification(id) {
    const updated = getNotifications().filter(n => n.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("notifications-changed"));
}

/** Clear all notifications */
export function clearAll() {
    localStorage.setItem(KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("notifications-changed"));
}

/** How many are unread */
export function getUnreadCount() {
    return getNotifications().filter(n => !n.read).length;
}

/** Get current dosage slot label based on local time */
export function getCurrentDosageSlot() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Morning";
    if (h >= 12 && h < 17) return "Afternoon";
    if (h >= 17 && h < 21) return "Evening";
    return "Night";
}

/** Add a dosage reminder for the current time slot */
export function addDosageReminder(medicines = []) {
    const slot = getCurrentDosageSlot();
    const slotEmojis = { Morning: "🌅", Afternoon: "☀️", Evening: "🌇", Night: "🌙" };
    const meds = medicines.slice(0, 3).map(m => m.brand).join(", ");
    addNotification({
        type: "dosage",
        title: `${slotEmojis[slot]} ${slot} Dose Reminder`,
        message: meds
            ? `Time to take your ${slot.toLowerCase()} medications: ${meds}.`
            : `It's ${slot.toLowerCase()} — remember to take your prescribed medications.`,
    });
}

/** Friendly relative time label (e.g. "2 min ago") */
export function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return "Just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    return `${days}d ago`;
}
