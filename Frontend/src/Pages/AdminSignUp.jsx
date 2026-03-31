import React from "react";
import { useNavigate } from "react-router-dom";
import dmceLogo from "../assets/dmce_logo_new.png";

/**
 * AdminSignUp — Informational page.
 * Admin accounts are pre-created by the system administrator.
 * There is no self-registration flow for admins.
 */
export default function AdminSignUp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-white px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <img src={dmceLogo} alt="DMCE Logo" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Registration</h1>
          </div>

          {/* Body */}
          <div className="px-8 pb-10 text-center space-y-5">
            {/* Info icon */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Admin accounts are not self-registered
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Admin access is granted by the system administrator. If you need an admin account, please
                contact your institution's IT administrator or department head.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/login")}
              className="w-full py-3 px-4 bg-[#1D3EA1] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Go to Admin Login
            </button>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-medium text-gray-500 hover:text-[#1D3EA1] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}