import { useState, useEffect } from "react";
import PostRequestModal from "../components/PostRequestModal";
import Navbar from "../components/Navbar";
import SessionManager from "./SessionManager";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-[calc(100vw-2rem)] sm:w-auto max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold pointer-events-auto ${
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
          <span className="flex-1">{t.msg}</span>
          <button
            onClick={() => remove(t.id)}
            className="ml-2 opacity-40 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Animated Greeting ─────────────────────────────────────────────────────────
function AnimatedGreeting({ firstName, role }) {
  const [displayedName, setDisplayedName] = useState("");
  const [showRole, setShowRole] = useState(false);
  const [doneTyping, setDoneTyping] = useState(false);

  useEffect(() => {
    setDisplayedName("");
    setShowRole(false);
    setDoneTyping(false);

    if (!firstName) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedName(firstName.slice(0, i));
      if (i >= firstName.length) {
        clearInterval(interval);
        setDoneTyping(true);
        setTimeout(() => setShowRole(true), 200);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [firstName]);

  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
        Welcome back, {displayedName}
        {!doneTyping && (
          <span className="inline-block w-[3px] h-6 sm:h-7 ml-0.5 -mb-1 bg-indigo-600 animate-pulse" />
        )}
        {doneTyping && <span className="ml-1">👋</span>}
      </h1>
      <p
        className={`text-slate-400 text-sm font-medium mt-1 transition-all duration-500 ${
          showRole ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        You are logged in as a{" "}
        <span className="font-bold text-indigo-600">
          {role === "student" ? "🎓 Student" : "👨‍🏫 Tutor"}
        </span>
      </p>
    </div>
  );
}

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("main");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const fullName = localStorage.getItem("fullName");
  const role = localStorage.getItem("role");
  const firstName = fullName?.split(" ")[0] || "";

  const toast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/requests/my-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRequests(response.data);
    } catch (error) {
      toast("Failed to load requests. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast("Request deleted successfully.", "success");
    } catch (error) {
      toast("Failed to delete request.", "error");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fontStyle = {
    fontFamily: "'Space Grotesk', 'Poppins', 'Inter', sans-serif",
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "active":
      case "approved":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "declined":
      case "cancelled":
        return "bg-rose-50 text-rose-600 border border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 antialiased" style={fontStyle}>
      <Navbar />

      <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-10 max-w-7xl mx-auto">
        {/* Back button when in sessions view */}
        {view === "sessions" && (
          <button
            onClick={() => setView("main")}
            className="mb-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            ← Back to Dashboard
          </button>
        )}

        {/* MAIN VIEW */}
        {view === "main" && (
          <>
            {/* Header */}
            <AnimatedGreeting firstName={firstName} role={role} />

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {role === "student" ? (
                <>
                  {/* Post a Request */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-[0_10px_30px_-4px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-indigo-50/60 rounded-xl flex items-center justify-center text-xl mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition duration-300">
                      ✨
                    </div>
                    <h3 className="font-bold text-slate-800 text-base tracking-tight mb-2">
                      Create Request
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Need expert guidance? Broadcast your project requirements
                      instantly.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold tracking-wide hover:bg-indigo-700 shadow-sm transition"
                    >
                      Submit
                    </button>
                  </div>

                  {/* Explore Tutors */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-[0_10px_30px_-4px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-indigo-50/60 text-indigo-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition duration-300">
                      🔍
                    </div>
                    <h3 className="font-bold text-slate-800 text-base tracking-tight mb-2">
                      Explore Tutors
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Find verified tutors matching your exact academic needs.
                    </p>
                    <Link
                      to="/browse-tutors"
                      className="block w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold tracking-wide text-center hover:bg-indigo-700 shadow-sm transition"
                    >
                      Browse
                    </Link>
                  </div>

                  {/* My Sessions */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-[0_10px_30px_-4px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 bg-violet-50/60 text-violet-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 transition duration-300">
                      📅
                    </div>
                    <h3 className="font-bold text-slate-800 text-base tracking-tight mb-2">
                      My Sessions
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Track study sessions and handle scheduling details with
                      various tutors.
                    </p>
                    <button
                      onClick={() => setView("sessions")}
                      className="block w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold tracking-wide text-center hover:bg-indigo-700 shadow-sm transition"
                    >
                      View Sessions
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Tutor: Explore Requests */}
                  <Link
                    to="/browse-requests"
                    className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-[0_10px_30px_-4px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group block"
                  >
                    <div className="w-12 h-12 bg-violet-50/60 text-violet-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition duration-300">
                      🔍
                    </div>
                    <h3 className="font-black text-slate-800 text-base tracking-tight mb-1.5 group-hover:text-violet-600 transition">
                      Explore Requests
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-5">
                      Discover active student listings matching your expertise.
                    </p>
                    <div className="bg-slate-50 text-slate-600 group-hover:bg-violet-600 group-hover:text-white py-2.5 rounded-xl text-xs font-bold tracking-wide w-full transition-all duration-300">
                      Discover
                    </div>
                  </Link>

                  {/* Tutor: My Sessions */}
                  <div
                    onClick={() => setView("sessions")}
                    className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-[0_10px_30px_-4px_rgba(79,70,229,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-indigo-50/60 text-indigo-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                      📅
                    </div>
                    <h3 className="font-black text-slate-800 text-base tracking-tight mb-1.5 group-hover:text-indigo-600 transition">
                      My Sessions
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-5">
                      View and manage your active learning sessions.
                    </p>
                    <div className="bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white py-2.5 rounded-xl text-xs font-bold tracking-wide w-full transition-all duration-300">
                      Open Manager
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Requests Section */}
            <div className="mt-10 sm:mt-16 w-full">
              {role === "student" ? (
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                        My Requests
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Track and manage your active learning requests.
                      </p>
                    </div>
                    {requests.length > 0 && (
                      <span className="self-start sm:self-auto bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md">
                        {requests.length}{" "}
                        {requests.length === 1 ? "Request" : "Total Requests"}
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl text-slate-400 mb-3 border border-slate-100">
                        📁
                      </div>
                      <h4 className="text-sm font-bold text-slate-700">
                        No requests yet
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 max-w-[240px] leading-relaxed">
                        Post your first learning request to get started.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                      >
                        Post a Request
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {requests.map((request) => (
                        <div
                          key={request._id}
                          className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_10px_30px_-4px_rgba(79,70,229,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="bg-indigo-50/80 text-indigo-600 text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-md border border-indigo-100/40">
                                📚 {request.subject}
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50/60 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Open
                              </span>
                            </div>
                            <h3 className="font-black text-slate-800 text-sm tracking-tight mb-1.5 group-hover:text-indigo-600 transition">
                              {request.title}
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                              {request.description}
                            </p>
                          </div>
                          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            <span>📊 {request.level} Level</span>
                            <span className="bg-slate-50 px-2 py-1 rounded-md text-slate-500 normal-case">
                              ⏰{" "}
                              {new Date(request.deadline).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* TUTOR REQUESTS */
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                      Available Requests
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review live task applications looking for answers.
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl p-6">
                      <div className="text-3xl mb-2">📁</div>
                      <p className="text-slate-400 text-sm font-medium">
                        No requests in your feed yet.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {requests.map((request) => (
                        <div
                          key={request._id}
                          className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-200 transition duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex-1 space-y-1">
                              <h3 className="font-bold text-slate-800 text-base tracking-tight">
                                {request.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600">
                                <span>{request.subject}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500">
                                  {request.level} Level
                                </span>
                              </div>
                              <p className="text-slate-400 text-sm leading-relaxed pt-1">
                                {request.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md ${getStatusStyles(request.status)}`}
                              >
                                {request.status || "Open"}
                              </span>
                              <button
                                onClick={() => handleDeleteRequest(request._id)}
                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                title="Delete Request"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-medium text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span>⏰</span>
                              <span>
                                Deadline:{" "}
                                <strong className="text-slate-600">
                                  {new Date(
                                    request.deadline,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </strong>
                              </span>
                            </div>
                            <button className="text-indigo-600 hover:text-indigo-800 font-bold transition self-start sm:self-auto">
                              View Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* SESSIONS VIEW */}
        {view === "sessions" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
            <SessionManager userRole={role} />
          </div>
        )}
      </div>

      {isModalOpen && (
        <PostRequestModal
          onClose={() => setIsModalOpen(false)}
          onPostSuccess={() => {
            fetchRequests();
            setIsModalOpen(false);
          }}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}

export default Dashboard;
