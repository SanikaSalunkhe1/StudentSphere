import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import dmceLogo from "../assets/dmce_logo_new.png";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const performVerification = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed. The link may be invalid or expired."
        );
      }
    };

    if (token) {
      performVerification();
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <img src={dmceLogo} alt="DMCE Logo" className="h-20 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verification</h1>

          {status === "verifying" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Verifying your email, please wait...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{message}</span>
              </div>
              <p className="text-gray-600">You can now log in to your account.</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 bg-[#1D3EA1] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition shadow-md hover:shadow-lg"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">{message}</span>
              </div>
              <p className="text-gray-600 text-sm">
                If the link expired, please try signing up again or contact admin.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full py-3 px-4 bg-[#1D3EA1] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition"
                >
                  Back to Sign Up
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm font-medium text-gray-500 hover:text-[#1D3EA1] transition-colors"
                >
                  ← Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}