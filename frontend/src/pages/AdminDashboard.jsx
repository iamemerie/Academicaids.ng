import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ADMIN_EMAIL = "wisdomchukwu326@gmail.com";

// ─── Axios factory ────────────────────────────────────────────────────────────
const api = (path = "") =>
  axios.create({
    baseURL: `${BASE_URL}/api/admin${path}`,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);
const timeAgo = (iso) => {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const roleColor = {
  admin: {
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    avatar: "bg-violet-600",
  },
  tutor: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    avatar: "bg-emerald-500",
  },
  student: {
    pill: "bg-sky-50 text-sky-700 border-sky-200",
    avatar: "bg-sky-500",
  },
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold pointer-events-auto transition-all ${
            t.type === "success"
              ? "bg-white border-emerald-200 text-emerald-700"
              : t.type === "error"
                ? "bg-white border-rose-200 text-rose-700"
                : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          <span>
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          {t.msg}
          <button
            onClick={() => remove(t.id)}
            className="ml-2 opacity-40 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, body, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-w-sm w-full mx-4">
        <h3 className="font-black text-slate-900 text-lg mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{body}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition ${
              danger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, delta }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform border-l-4 ${accent}`}
    >
      <div>
        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">
          {fmt(value ?? 0)}
        </p>
        {delta != null && (
          <p
            className={`text-[11px] font-bold mt-1 ${delta >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last week
          </p>
        )}
      </div>
      <div className="text-2xl w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────
function UserDrawer({
  user,
  onClose,
  onToggleBan,
  onDeleteUser,
  actionLoading,
}) {
  if (!user) return null;
  const role = user.role?.toLowerCase();
  const colors = roleColor[role] || roleColor.student;

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-lg">User Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${colors.avatar} flex items-center justify-center text-white font-black text-xl`}
            >
              {user.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg leading-tight">
                {user.fullName}
              </p>
              <span
                className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${colors.pill}`}
              >
                {role}
              </span>
            </div>
          </div>

          {[
            ["Email", user.email],
            ["User ID", user._id],
            [
              "Joined",
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—",
            ],
            ["Last Active", timeAgo(user.lastActive || user.updatedAt)],
            ["Status", user.isBanned ? "🚫 Suspended" : "✅ Active"],
            ...(role === "tutor"
              ? [["Sessions Hosted", user.sessionCount ?? "—"]]
              : []),
            ...(role === "student"
              ? [["Sessions Booked", user.bookingCount ?? "—"]]
              : []),
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between items-center border-b border-slate-50 pb-3"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {k}
              </span>
              <span className="text-sm font-semibold text-slate-800 text-right max-w-[200px] break-all">
                {v}
              </span>
            </div>
          ))}

          <div className="space-y-3 pt-2">
            {user.email?.toLowerCase() !== ADMIN_EMAIL && (
              <>
                <button
                  onClick={() => onToggleBan(user._id)}
                  disabled={actionLoading === user._id}
                  className={`w-full py-2.5 rounded-xl text-sm font-black transition border ${
                    user.isBanned
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  } disabled:opacity-50`}
                >
                  {actionLoading === user._id
                    ? "Processing…"
                    : user.isBanned
                      ? "🔓 Restore Access"
                      : "🚫 Suspend Account"}
                </button>
                <button
                  onClick={() => onDeleteUser(user._id)}
                  disabled={actionLoading === user._id}
                  className="w-full py-2.5 rounded-xl text-sm font-black bg-slate-900 text-white hover:bg-slate-700 transition disabled:opacity-50"
                >
                  🗑 Delete User Permanently
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalBookings: 0,
    totalRequests: 0,
  });
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const autoRefreshRef = useRef(null);

  const PAGE_SIZE = 10;

  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }, []);

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  }, [navigate]);

  const fetchData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        const instance = api();
        const [statsRes, usersRes, activityRes] = await Promise.all([
          instance.get("/dashboard-stats"),
          instance.get("/users"),
          instance.get("/activity").catch(() => ({ data: [] })),
        ]);

        setMetrics(statsRes.data);
        setUsers(usersRes.data);
        setRecentActivity(activityRes.data?.slice(0, 8) ?? []);
        setLastUpdated(new Date());
      } catch (err) {
        const msg =
          err.response?.data?.message || "Failed to load dashboard data.";
        toast(msg, "error");
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast, handleLogout],
  );

  useEffect(() => {
    fetchData();
    autoRefreshRef.current = setInterval(() => fetchData(true), 60_000);
    return () => clearInterval(autoRefreshRef.current);
  }, [fetchData]);

  const handleToggleBan = (userId) => {
    const user = users.find((u) => u._id === userId);
    const action = user?.isBanned ? "restore" : "suspend";
    setConfirm({
      title: action === "suspend" ? "Suspend Account?" : "Restore Account?",
      body: `This will ${action === "suspend" ? "block" : "re-enable"} ${user?.fullName}'s access to the platform.`,
      danger: action === "suspend",
      onConfirm: async () => {
        setConfirm(null);
        try {
          setActionLoading(userId);
          const res = await api().put(`/users/${userId}/toggle-ban`);
          setUsers((prev) =>
            prev.map((u) =>
              u._id === userId ? { ...u, isBanned: res.data.isBanned } : u,
            ),
          );
          if (selectedUser?._id === userId)
            setSelectedUser((u) => ({ ...u, isBanned: res.data.isBanned }));
          toast(
            `${user?.fullName} has been ${res.data.isBanned ? "suspended" : "restored"}.`,
            "success",
          );
          const statsRes = await api().get("/dashboard-stats");
          setMetrics(statsRes.data);
        } catch (err) {
          toast(err.response?.data?.message || "Action failed.", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    setConfirm({
      title: "Delete User?",
      body: `This permanently removes ${user?.fullName} and all their data. This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          setActionLoading(userId);
          await api().delete(`/users/${userId}`);
          setUsers((prev) => prev.filter((u) => u._id !== userId));
          setSelectedUser(null);
          toast(`${user?.fullName} was permanently deleted.`, "success");
          const statsRes = await api().get("/dashboard-stats");
          setMetrics(statsRes.data);
        } catch (err) {
          toast(err.response?.data?.message || "Delete failed.", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Status", "Joined"];
    const rows = filteredUsers.map((u) => [
      `"${u.fullName}"`,
      `"${u.email}"`,
      u.role,
      u.isBanned ? "Suspended" : "Active",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported successfully.", "success");
  };

  const filteredUsers = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u._id?.toLowerCase().includes(q);
      const matchRole =
        roleFilter === "all" || u.role?.toLowerCase() === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !u.isBanned) ||
        (statusFilter === "banned" && u.isBanned);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      let va = a[sortBy] ?? "";
      let vb = b[sortBy] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }) =>
    sortBy === col ? (
      <span className="ml-1 opacity-60">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-bold text-slate-400 tracking-wider">
            Loading admin panel…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800 antialiased">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 shadow-sm z-20 flex-col hidden lg:flex">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              A
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm leading-tight">
                AdminConsole
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Control Panel v2.0
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            ["📊", "Dashboard", true],
            ["👥", "Users", false],
            ["📅", "Bookings", false],
            ["💬", "Messages", false],
            ["📈", "Analytics", false],
            ["⚙️", "Settings", false],
          ].map(([icon, label, active]) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="text-base">{icon}</span> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                Wisdom Chukwuemeka
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              System Administration
            </h1>
            {lastUpdated && (
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Updated {lastUpdated.toLocaleTimeString()} · Auto-refreshes
                every 60s
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border border-slate-200 bg-white text-slate-600 hover:border-slate-300 transition disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin inline-block" : ""}>
                🔄
              </span>
              {refreshing ? "Syncing…" : "Refresh"}
            </button>
            <button
              onClick={handleLogout}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Users"
              value={metrics.totalUsers}
              icon="👥"
              accent="border-l-indigo-500"
              delta={metrics.usersDelta}
            />
            <StatCard
              label="Tutors"
              value={metrics.totalTutors}
              icon="👨‍🏫"
              accent="border-l-emerald-500"
              delta={metrics.tutorsDelta}
            />
            <StatCard
              label="Students"
              value={metrics.totalStudents}
              icon="🎓"
              accent="border-l-sky-500"
              delta={metrics.studentsDelta}
            />
            <StatCard
              label="Total Bookings"
              value={metrics.totalBookings}
              icon="📅"
              accent="border-l-amber-500"
              delta={metrics.bookingsDelta}
            />
            <StatCard
              label="Requests"
              value={metrics.totalRequests}
              icon="📨"
              accent="border-l-rose-500"
              delta={metrics.requestsDelta}
            />
          </div>

          {/* Platform health + activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="font-black text-slate-800 text-sm">
                Platform Health
              </h3>
              {[
                {
                  label: "Active Accounts",
                  value: users.filter((u) => !u.isBanned).length,
                  color: "bg-emerald-500",
                },
                {
                  label: "Suspended Accounts",
                  value: users.filter((u) => u.isBanned).length,
                  color: "bg-rose-500",
                },
                {
                  label: "Admin Accounts",
                  value: users.filter((u) => u.role?.toLowerCase() === "admin")
                    .length,
                  color: "bg-violet-500",
                },
              ].map(({ label, value, color }) => {
                const pct = users.length
                  ? Math.round((value / users.length) * 100)
                  : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-500">
                        {label}
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {value}{" "}
                        <span className="text-slate-400 font-medium">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-800 text-sm mb-4">
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No recent activity. Make sure your{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    /api/admin/activity
                  </code>{" "}
                  endpoint is live.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((act, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-base mt-0.5">
                        {act.icon ?? "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 leading-tight truncate">
                          {act.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {timeAgo(act.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* User table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800">User Management</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filteredUsers.length} of {users.length} users
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, email, ID…"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-52"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="tutor">Tutor</option>
                  <option value="student">Student</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="banned">Suspended</option>
                </select>
                <button
                  onClick={exportCSV}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-600 bg-white hover:bg-slate-50 transition"
                >
                  ⬇ Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      ["fullName", "User"],
                      ["email", "Email"],
                      ["role", "Role"],
                      ["createdAt", "Joined"],
                      [null, "Status"],
                      [null, "Actions"],
                    ].map(([col, label]) => (
                      <th
                        key={label}
                        onClick={() => col && toggleSort(col)}
                        className={`px-4 py-3 text-[10px] font-black text-slate-400 tracking-widest uppercase select-none ${col ? "cursor-pointer hover:text-slate-700" : ""} ${label === "Actions" ? "text-right pr-6" : ""}`}
                      >
                        {label}
                        {col && <SortIcon col={col} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-sm text-slate-400 font-semibold"
                      >
                        No users match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const role = user.role?.toLowerCase();
                      const colors = roleColor[role] || roleColor.student;
                      const isSelf = user.email?.toLowerCase() === ADMIN_EMAIL;

                      return (
                        <tr
                          key={user._id}
                          className={`hover:bg-indigo-50/20 transition-colors group ${user.isBanned ? "opacity-60" : ""}`}
                        >
                          <td className="px-4 py-3.5 pl-5">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="flex items-center gap-3 text-left group/name"
                            >
                              <div
                                className={`w-8 h-8 rounded-xl ${colors.avatar} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}
                              >
                                {user.fullName?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 group-hover/name:text-indigo-600 transition-colors leading-tight">
                                  {user.fullName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  ···{user._id?.slice(-6)}
                                </p>
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold text-slate-600">
                              {user.email}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border capitalize tracking-wider ${colors.pill}`}
                            >
                              {role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-slate-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "2-digit",
                                  },
                                )
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                user.isBanned
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? "bg-rose-500" : "bg-emerald-500"}`}
                              />
                              {user.isBanned ? "Suspended" : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right pr-6 space-x-1.5 whitespace-nowrap">
                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => handleToggleBan(user._id)}
                                  disabled={actionLoading === user._id}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                    user.isBanned
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  } disabled:opacity-50`}
                                >
                                  {user.isBanned ? "Restore" : "Suspend"}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  disabled={actionLoading === user._id}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Overlays & Modals */}
      <UserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleBan={handleToggleBan}
        onDeleteUser={handleDeleteUser}
        actionLoading={actionLoading}
      />

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
