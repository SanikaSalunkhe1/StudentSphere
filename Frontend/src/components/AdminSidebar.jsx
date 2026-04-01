import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Admission", path: "/admin/admission" },
  { name: "Students", path: "/admin/students" },
  { name: "Division Incharges", path: "/admin/division-incharges" },
  { name: "Activities", path: "/admin/activities" },
  { name: "Achievements", path: "/admin/achievements" },
  { name: "Internships", path: "/admin/internships" },
  { name: "Placements", path: "/admin/placements" },
  { name: "Higher Studies", path: "/admin/higher-studies" },
  { name: "Semester Info", path: "/admin/semester-info" },
  { name: "Reports", path: "/admin/reports" },
];

function getIcon(name, isActive) {
  const common = {
    className: "w-5 h-5 flex-shrink-0",
    stroke: isActive ? "white" : "currentColor",
    fill: "none",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "Dashboard":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "Admission":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2l7 4v6c0 5-3.58 9-7 9s-7-4-7-9V6l7-4z" />
          <path d="M8.5 12.5l3.5 2 3.5-2" />
        </svg>
      );
    case "Students":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
          <path d="M6 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
        </svg>
      );
    case "Activities":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 12h3l3 8 4-16 3 8h4" />
        </svg>
      );
    case "Achievements":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="6" />
          <path d="M8 22l4-3 4 3" />
        </svg>
      );
    case "Internships":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M3 11h18" />
        </svg>
      );
    case "Placements":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 12l2-2 4 4 8-8 4 4" />
          <path d="M21 21H3" />
        </svg>
      );
    case "Semester Info":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "Division Incharges":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "Reports":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    default:
      return null;
  }
}

// Extracted outside parent to avoid remounting on every render
function SidebarInner({ pathname, onLinkClick, onLogout }) {
  const roleLabel =
    localStorage.getItem("role") === "division" ||
      localStorage.getItem("role") === "division_incharge"
      ? "Division Incharge Portal"
      : "Admin Portal";

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl">
      {/* Logo Section */}
      <div className="flex flex-col items-center py-8 px-4 border-b border-slate-200/50">
        <img
          src={logo}
          alt="logo"
          className="w-20 h-20 object-contain transition-all duration-500"
        />
        <div className="mt-5 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <h2 className="text-[11px] font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-400 uppercase tracking-[0.2em] leading-relaxed drop-shadow-sm px-2">
            Datta Meghe College Of Engineering
          </h2>
          <div className="mt-3 relative group overflow-hidden rounded-full p-[1px]">
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />
            <span className="relative text-[10px] font-bold text-blue-700 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 group-hover:bg-white/80">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Section - scrollable */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5 custom-scrollbar">
        {menuItems
          .filter((item) => {
            const role = localStorage.getItem("role");
            if (role === "division" && item.name === "Division Incharges") {
              return false;
            }
            return true;
          })
          .map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onLinkClick}
                className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-500 overflow-hidden
                ${isActive
                    ? "text-white shadow-[0_8px_30px_rgb(59,130,246,0.3)] ring-1 ring-white/20 scale-[1.02] translate-x-1"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 hover:shadow-soft hover:translate-x-2"
                  }
                animate-in fade-in slide-in-from-left-4`}
              >
                {/* Background gradient for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 opacity-90 transition-transform duration-500 group-hover:scale-105" />
                )}

                <span className={`relative z-10 flex-shrink-0 transition-all duration-500 ${isActive ? "drop-shadow-md scale-110" : "group-hover:scale-110 group-hover:-rotate-3"}`}>
                  {getIcon(item.name, isActive)}
                </span>
                <span className="relative z-10 truncate tracking-wide">
                  {item.name}
                </span>

                {/* Active right arrow indicator */}
                {isActive && (
                  <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-200/50 bg-slate-50/30">
        <button
          onClick={onLogout}
          className="relative group w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold overflow-hidden transition-all duration-500
            text-red-500 bg-red-50/50 hover:text-white shadow-sm hover:shadow-[0_8px_30px_rgb(239,68,68,0.3)] hover:-translate-y-0.5 active:scale-95"
        >
          {/* Hover Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />

          <svg
            className="relative z-10 w-5 h-5 flex-shrink-0 transition-all duration-500 group-hover:-translate-x-1.5 group-hover:rotate-12"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="relative z-10 tracking-wider uppercase">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <>


      {/* ── Mobile overlay ───────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer ────────────────────────────────────── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white/90 backdrop-blur-2xl shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-50 transition-transform duration-500 ease-out flex flex-col border-r border-white/20
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 active:scale-95"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarInner pathname={pathname} onLinkClick={() => setMobileOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col sticky top-0 h-screen bg-white/60 backdrop-blur-3xl border-r border-slate-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out flex-shrink-0 z-30 w-[280px]"
      >
        <SidebarInner pathname={pathname} onLinkClick={() => { }} onLogout={handleLogout} />
      </aside>
    </>
  );
}
