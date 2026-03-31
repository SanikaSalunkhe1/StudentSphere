import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import dmceLogo from "../assets/dmce_logo_new.png";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Read the success message passed via navigation state
  const successMsg = location.state?.message || "";

  // ✅ REDIRECT IF ALREADY LOGGED IN
  React.useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin" || role === "division" || role === "divisionIncharge") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanPassword = form.password.trim();
      const response = await authService.adminLogin(cleanEmail, cleanPassword);
      localStorage.setItem("role", "admin");

      // Store token in localStorage to fix mobile browser 3rd-party cookie blocking issues
      if (response.token) {
        localStorage.setItem("token", response.token);
      } else {
        localStorage.removeItem("token"); // Cleanup just in case
      }

      const admin = response.admin || response.data?.admin || response.user;
      if (admin) {
        const adminId = admin._id || admin.id;
        if (adminId) {
          localStorage.setItem("adminId", adminId);
        }
        if (admin.email) {
          localStorage.setItem("adminEmail", admin.email);
        }
      }

      navigate("/admin/dashboard");
    } catch (err) {
      let errorMessage = "Admin login failed. Please try again.";

      if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
          errorMessage = err.response.data.errors[0].message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      // MASK PASSWORD POLICY ERROR
      if (errorMessage && errorMessage.includes("Password must be")) {
        errorMessage = "Invalid credentials";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {/* Login Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <img src={dmceLogo} alt="DMCE Logo" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-500 text-sm">
              Secure access for administrators.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-8 pb-10">
            {/* Success message from redirect */}
            {successMsg && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg flex items-start gap-3 text-sm shadow-sm animate-fadeIn text-left">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{successMsg}</span>
                  <p className="text-[11px] font-bold text-blue-700 bg-blue-100/50 p-1.5 rounded border border-blue-200 mt-1 uppercase tracking-tight text-center">
                    💡 Pro Tip: Check your Spam or All Mail folders!
                  </p>
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                spellCheck="false"
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/admin/forgot-password")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1D3EA1] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-medium text-gray-500 hover:text-[#1D3EA1] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              ← Back to Home
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Protected by <span className="font-semibold text-gray-600">Datta Meghe College of Engineering</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}