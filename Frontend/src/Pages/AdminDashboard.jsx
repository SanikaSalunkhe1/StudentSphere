import React, { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import AtRiskHeatmap from "../components/Heatmap/AtRiskHeatmap";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActivities: 0,
    totalAchievements: 0,
    totalInternships: 0,
    totalPlacements: 0,
    totalHigherStudies: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [placementByType, setPlacementByType] = useState([]);
  const [achievementByCategory, setAchievementByCategory] = useState([]);
  const [activityByType, setActivityByType] = useState([]);
  const [internshipByType, setInternshipByType] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const role = localStorage.getItem("role") || "";
      const lowerRole = role.toLowerCase();
      let data;

      if (lowerRole === "admin") {
        data = await dashboardService.getAdminDashboard();
      } else if (lowerRole === "division" || lowerRole === "divisionincharge") {
        data = await dashboardService.getDivisionDashboard();
      }

      if (!data) {
        throw new Error("No data returned for role: " + role);
      }

      if (data && data.stats) {
        setStats(data.stats);
        setPlacementByType(data.placementsByType || []);
        setAchievementByCategory(data.achievementsByCategory || []);
        setActivityByType(data.activitiesByType || []);
        setInternshipByType(data.internshipsByType || []);

        // Map recentAchievements to recentActivities format
        if (data.recentAchievements) {
          const mappedActivities = data.recentAchievements.map(ach => ({
            title: ach.title,
            description: ach.description,
            type: ach.category,
            date: ach.date?.from || ach.createdAt,
            studentName: typeof ach.stuID?.name === "object"
              ? `${ach.stuID.name.firstName || ""} ${ach.stuID.name.lastName || ""}`.trim() || "Student"
              : ach.stuID?.name || "Student"
          }));
          setRecentActivities(mappedActivities);
        } else {
          setRecentActivities([]);
        }
      } else {
        throw new Error("Data format is incorrect. Stats object missing.");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error?.response?.data?.message || error.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-lg text-center max-w-lg shadow-sm">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-sm">{error}</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading system overview...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 shrink-0">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 text-sm sm:text-base">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live platform statistics and engagement tracking
            </p>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 w-fit text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="font-bold text-slate-700">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Cards Grid - Restored Vibrant Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
          {[
            { label: "Total Students", value: stats.totalStudents, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
            { label: "Activities", value: stats.totalActivities, icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600" },
            { label: "Achievements", value: stats.totalAchievements, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
            { label: "Internships", value: stats.totalInternships, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.728 0-7.196-.575-10.468-1.673M5 13a10 10 0 1120 0m0 0a10.038 10.038 0 01-1.463 4.09c1.622 1.084 3.61 1.71 5.791 1.71 2.18 0 4.17-.626 5.793-1.71A10.038 10.038 0 0121 13.255z", color: "purple", bg: "bg-purple-50", text: "text-purple-600" },
            { label: "Placements", value: stats.totalPlacements, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "rose", bg: "bg-rose-50", text: "text-rose-600" },
            { label: "Higher Studies", value: stats.totalHigherStudies || 0, icon: "M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15s4.228 8.772 10 8.772 10-4.228 10-8.772c0-4.772-4.228-8.747-10-8.747z", color: "amber", bg: "bg-amber-50", text: "text-amber-600" }
          ].map((card, i) => (
            <div 
              key={i} 
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col h-full justify-between items-start">
                <div className={`p-3 rounded-xl mb-4 ${card.bg} transition-colors duration-300`}>
                  <svg className={`w-5 h-5 ${card.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</p>
                  <p className={`text-2xl font-black ${card.text} tracking-tight`}>{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Division Heatmap Section */}
        <div className="mb-10 w-full min-w-0">
          <AtRiskHeatmap />
        </div>

        {/* Distribution Charts Grid - Restored Color Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 w-full">
          {[
            { title: "Placements by Type", data: placementByType, color: "blue", keyPrefix: "placement", from: "from-blue-400", to: "to-blue-600" },
            { title: "Achievements by Category", data: achievementByCategory, color: "emerald", keyPrefix: "achievement", from: "from-emerald-400", to: "to-emerald-600" },
            { title: "Activities by Type", data: activityByType, color: "amber", keyPrefix: "activity", from: "from-amber-400", to: "to-amber-600" },
            { title: "Internships Status", data: internshipByType, color: "purple", keyPrefix: "internship", from: "from-purple-400", to: "to-purple-600" }
          ].map((chart, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className={`w-2 h-6 rounded-full bg-${chart.color}-500 shadow-lg`}></span>
                  {chart.title}
                </h3>
              </div>
              <div className="space-y-6">
                {chart.data.length > 0 ? (
                  chart.data.map((item, i) => (
                    <div key={`${chart.keyPrefix}-${i}`} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item._id || "Unspecified"}</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-black text-${chart.color}-600`}>{item.count}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">entries</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                        <div
                          className={`bg-gradient-to-r ${chart.from} ${chart.to} h-full rounded-full transition-all duration-1000 shadow-sm relative`}
                          style={{ width: `${(item.count / (Math.max(...chart.data.map(p => p.count)) || 1)) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2),rgba(255,255,255,0))] h-[50%] top-0"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-slate-400 text-sm font-medium italic">No data footprints detected.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Global Activity Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-12">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity Feed</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Global engagement timeline</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${recentActivities.length > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
              {recentActivities.length} Movements Loaded
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="px-8 py-8 hover:bg-slate-50/50 transition duration-300 group">
                  <div className="flex items-start gap-6">
                    <div className="relative shrink-0 pt-1">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      {index !== recentActivities.length - 1 && (
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-100"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{activity.title}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                          {activity.date ? new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium opacity-80 group-hover:opacity-100 transition-opacity italic line-clamp-2">
                        "{activity.description}"
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                          {activity.type}
                        </div>
                        {activity.studentName && (
                          <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-900 transition-colors">
                            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-black">ST</div>
                            <span className="text-[11px] font-bold tracking-tight">
                              Student: <span className="text-slate-800 font-black">{activity.studentName}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Platform Pulse Quiet</p>
                <p className="text-slate-300 text-xs mt-1">No recent activity detected on the global radar.</p>
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-slate-200"></span>
              Synchronized with real-time logs
              <span className="h-px w-8 bg-slate-200"></span>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}