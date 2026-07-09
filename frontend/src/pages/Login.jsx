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

function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [googlePending, setGooglePending] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 5000);
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        loginData,
      );
      const { token, role, fullName } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("fullName", fullName);
      if (role === "admin") navigate("/admin/control-panel");
      else navigate("/dashboard");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Login connection failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      if (response.data.needsRole) {
        setGooglePending({
          name: response.data.name,
          email: response.data.email,
          token: credentialResponse.credential,
        });
        setShowRolePicker(true);
        return;
      }
      const { token, role, fullName } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("fullName", fullName);
      if (role === "admin") navigate("/admin/control-panel");
      else navigate("/dashboard");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Google authentication failed",
        "error",
      );
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        token: googlePending.token,
        role: selectedRole,
      });
      const { token, role, fullName } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("fullName", fullName);
      navigate("/dashboard");
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center py-8 px-4 antialiased">
      {/* Role Picker Modal */}
      {showRolePicker && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-3">
                A
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Welcome, {googlePending?.name}! 👋
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-1">
                How will you be using Academiq.ng?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleRoleSelect("student")}
                className="w-full py-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 font-bold text-sm text-slate-600 hover:text-indigo-600 transition-all"
              >
                🎓 I'm a Student
              </button>
              <button
                onClick={() => handleRoleSelect("tutor")}
                className="w-full py-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 font-bold text-sm text-slate-600 hover:text-indigo-600 transition-all"
              >
                👨‍🏫 I'm a Tutor
              </button>
            </div>
            <button
              onClick={() => setShowRolePicker(false)}
              className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(79,70,229,0.2)] mx-auto mb-3 cursor-pointer hover:rotate-6 transition duration-300"
            onClick={() => navigate("/")}
          >
            A
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Log in to manage your active tutoring modules
          </p>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
            value={loginData.email}
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition"
              value={loginData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold tracking-wide hover:bg-indigo-700 transition shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-semibold text-slate-400">
          Forgot password?{" "}
          <Link
            to="/forgot-password"
            className="text-indigo-600 font-bold hover:text-indigo-800 transition"
          >
            Reset it here
          </Link>
        </p>

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
              showToast("Google login failed. Please try again.", "error")
            }
            auto_select={false}
            useOneTap={false}
            text="continue_with"
            shape="circle"
            theme="outline"
            size="large"
            // width="320"
          />
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-bold hover:text-indigo-800 transition"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
