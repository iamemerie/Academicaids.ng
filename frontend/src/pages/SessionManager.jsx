import React, { useState } from "react";

function SessionManager({ userRole }) {
  // Toggle between 'upcoming' and 'past' filters
  const [activeTab, setActiveTab] = useState("upcoming");

  // Sample static data mimicking what you'll fetch from your Express/MongoDB backend
  const sampleSessions = [
    {
      id: "1",
      tutorName: "Mr Drake",
      studentName: "Alex",
      subject: "Organic Chemistry II",
      date: "June 8, 2026",
      time: "4:00 PM - 5:30 PM",
      status: "upcoming",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      isLiveNow: true, // Custom property to trigger active visual alerts
    },
    {
      id: "2",
      tutorName: "Mr Drake",
      studentName: "Sarah Musa",
      subject: "Introduction to Physics",
      date: "May 28, 2026",
      time: "11:00 AM - 12:30 PM",
      status: "past",
      meetingLink: "#",
      isLiveNow: false,
    },
  ];

  // Filter our data array based on the active tab state
  const filteredSessions = sampleSessions.filter(
    (session) => session.status === activeTab,
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Dynamic Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            className="text-2xl font-black text-slate-800 tracking-tight"
          >
            Your Learning Sessions
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Track, schedule, and join your virtual tutoring classrooms.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "upcoming"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "past"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Past Sessions
          </button>
        </div>
      </div>

      {/* Sessions Content Grid Layout */}
      {filteredSessions.length === 0 ? (
        /* Empty Fallback Block UI */
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <div className="text-4xl mb-3">📅</div>
          <h4
            className="text-base font-bold text-slate-700"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            No {activeTab} sessions found
          </h4>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            {activeTab === "upcoming"
              ? "Book a time window with a verified tutor to launch your next session."
              : "You haven't completed any sessions yet."}
          </p>
        </div>
      ) : (
        /* Dynamic Cards Render Pipeline */
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white border rounded-2xl p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${
                session.isLiveNow
                  ? "border-indigo-500 ring-4 ring-indigo-50/50 shadow-sm"
                  : "border-slate-100 hover:border-slate-200 shadow-sm"
              }`}
            >
              {/* Left Column: Subject and User Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-md tracking-wide">
                    {session.subject}
                  </span>
                  {session.isLiveNow && (
                    <span className="bg-rose-50 text-rose-600 text-xs font-extrabold px-2.5 py-1 rounded-md tracking-wide flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>{" "}
                      LIVE NOW
                    </span>
                  )}
                </div>

                <h3
                  className="text-lg font-bold text-slate-800"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {userRole === "student"
                    ? `Tutor: ${session.tutorName}`
                    : `Student: ${session.studentName}`}
                </h3>

                {/* Logistics Badges Row */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span>🗓️</span> {session.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏰</span> {session.time}
                  </div>
                </div>
              </div>

              {/* Right Column: Context Action CTA Buttons */}
              <div className="flex items-center gap-3 border-t border-slate-50 pt-4 md:border-none md:pt-0">
                {activeTab === "upcoming" ? (
                  <>
                    <button className="flex-grow md:flex-none text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                      Reschedule
                    </button>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-grow md:flex-none text-center text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm ${
                        session.isLiveNow
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Join Room
                    </a>
                  </>
                ) : (
                  <button className="w-full md:w-auto text-xs font-bold text-indigo-600 border border-indigo-100 hover:bg-indigo-50/50 px-5 py-2.5 rounded-xl transition">
                    Leave a Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionManager;
