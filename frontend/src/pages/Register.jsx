import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold mb-6 ${
        type === "error"
          ? "bg-rose-50 border-rose-200 text-rose-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
      }`}
    >
      <span>{type === "error" ? "❌" : "✅"}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="opacity-40 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 5000);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleRole = (selectedRole) =>
    setFormData((prev) => ({ ...prev, role: selectedRole }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      showToast(
        "Please select your account type (Student or Tutor) to proceed.",
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Your passwords do not match. Please verify them.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      showToast(
        response.data.message || "Registration completed successfully!",
        "success",
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!formData.role) {
      showToast(
        "Please select your account type before signing up with Google.",
      );
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: credentialResponse.credential,
        role: formData.role,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("fullName", response.data.fullName);
      localStorage.setItem("role", response.data.role);
      showToast(`Welcome ${response.data.fullName}!`, "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Google Authentication failed",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 antialiased">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Form Column */}
        <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-8">
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] w-full max-w-md">
            <div className="text-center mb-8">
              <div
                className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(79,70,229,0.2)] mx-auto mb-3 cursor-pointer hover:rotate-6 transition duration-300"
                onClick={() => navigate("/")}
              >
                A
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Join Academiq.ng to streamline your learning
              </p>
            </div>

            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ message: "", type: "" })}
            />

            {/* Role Selection */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                I want to join as a:
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRole("student")}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs tracking-wide border-2 transition-all flex items-center justify-center gap-1.5 ${formData.role === "student" ? "border-indigo-600 bg-indigo-50/50 text-indigo-600" : "border-slate-100 bg-slate-50/40 text-slate-500 hover:border-slate-200"}`}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRole("tutor")}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs tracking-wide border-2 transition-all flex items-center justify-center gap-1.5 ${formData.role === "tutor" ? "border-indigo-600 bg-indigo-50/50 text-indigo-600" : "border-slate-100 bg-slate-50/40 text-slate-500 hover:border-slate-200"}`}
                >
                  👨‍🏫 Tutor
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 transition ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-rose-300 focus:ring-rose-200" : "border-slate-200 focus:ring-indigo-600/20 focus:border-indigo-600"}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {formData.confirmPassword && (
                  <span className="absolute right-3.5 top-3.5 text-xs font-bold">
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-emerald-500">✓</span>
                    ) : (
                      <span className="text-rose-400">✗</span>
                    )}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold tracking-wide hover:bg-indigo-700 transition shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-slate-400 text-[11px] font-bold tracking-wider uppercase">
                or
              </span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <div
              className="w-full flex justify-center"
              style={{ colorScheme: "light" }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  showToast("Google Sign Up failed. Please try again.")
                }
                auto_select={false}
                useOneTap={false}
                text="signup_with"
                shape="circle"
                theme="outline"
                size="large"
                // width="320"
              />
            </div>

            <p className="mt-6 text-center text-xs font-semibold text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-bold hover:text-indigo-800 transition"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column — hidden on mobile */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6">
              🤖
            </div>
            <h2 className="text-4xl font-black mb-2">AcademiQ AI</h2>
            <p className="text-lg text-indigo-100 mb-8">
              Your intelligent learning companion
            </p>
            <div className="space-y-6">
              {[
                [
                  "✨",
                  "Smart Learning Assistance",
                  "Get instant help with assignments, explanations, and study materials powered by advanced AI.",
                ],
                [
                  "📚",
                  "Personalized Tutoring",
                  "Connect with qualified tutors tailored to your learning style and academic needs.",
                ],
                [
                  "🚀",
                  "Accelerated Progress",
                  "Track your learning journey with intelligent insights and progress monitoring.",
                ],
                [
                  "🌐",
                  "24/7 Availability",
                  "Access learning resources and support anytime, anywhere.",
                ],
              ].map(([icon, title, desc]) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{title}</h3>
                    <p className="text-indigo-100 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-white/20 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "B", "C"].map((l) => (
                  <div
                    key={l}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm font-bold"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold">Join 10,000+ learners</p>
                <p className="text-indigo-100 text-xs">
                  Already using AcademiQ to excel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
