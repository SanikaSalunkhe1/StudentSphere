import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import dmceLogo from "../assets/dmce_logo_new.png";

export default function ForgotPasswordPage({ role = "student" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Determine back link and role label
  const backToLoginLink = role === "admin" ? "/admin/login" : role === "division" ? "/division/login" : "/login";
  const roleLabel = role === "admin" ? "Admin" : role === "division" ? "Division Incharge" : "Student";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (role === "admin") {
        await authService.adminForgotPassword(email);
      } else if (role === "division") {
        await authService.divisionForgotPassword(email);
      } else {
        await authService.forgotPassword(email);
      }
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-white px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <img src={dmceLogo} alt="DMCE Logo" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{roleLabel} Forgot Password</h1>
            <p className="text-gray-500 text-sm">
              Enter your registered email address and we'll send you a reset link.
            </p>
          </div>

          <div className="px-8 pb-10">
            {success ? (
              /* Success State */
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 underline decoration-blue-500 decoration-4 underline-offset-4">Check Your Email</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We've sent a password reset link to <span className="font-bold text-gray-900">{email}</span>.
                    The link expires in <span className="font-bold text-orange-600">15 minutes</span>.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left space-y-2 shadow-sm">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Didn't receive it?</p>
                  <ul className="text-[13px] text-blue-800 space-y-1.5 list-disc pl-4 font-medium">
                    <li>Check your <span className="font-black underline">Spam</span> folder</li>
                    <li>Look in <span className="font-black underline">All Mail</span> section</li>
                    <li>Ensure you entered the correct email</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => { setSuccess(false); setEmail(""); }}
                  className="text-sm text-[#1D3EA1] font-semibold hover:underline"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1D3EA1] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={() => navigate(backToLoginLink)}
              className="text-sm font-medium text-gray-500 hover:text-[#1D3EA1] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}