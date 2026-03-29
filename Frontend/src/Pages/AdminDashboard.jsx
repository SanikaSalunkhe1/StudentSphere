import React, { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";

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
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-600 mt-2">
          Live statistics and activity across the platform
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">

        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Activities</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalActivities}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Achievements</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalAchievements}</p>
            </div>
            <div className="bg-green-100 rounded-full p-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Internships */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Internships</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalInternships}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.728 0-7.196-.575-10.468-1.673M5 13a10 10 0 1120 0m0 0a10.038 10.038 0 01-1.463 4.09c1.622 1.084 3.61 1.71 5.791 1.71 2.18 0 4.17-.626 5.793-1.71A10.038 10.038 0 0121 13.255z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Placements */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Placements</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.totalPlacements}</p>
            </div>
            <div className="bg-emerald-100 rounded-full p-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Higher Studies */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Higher Studies</p>
              <p className="text-3xl font-bold text-amber-600">{stats.totalHigherStudies || 0}</p>
            </div>
            <div className="bg-amber-100 rounded-full p-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15s4.228 8.772 10 8.772 10-4.228 10-8.772c0-4.772-4.228-8.747-10-8.747z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Placement Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Placements by Type</h3>
          <div className="space-y-4">
            {placementByType.length > 0 ? (
              placementByType.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item._id || "Other"}</span>
                    <span className="text-sm font-bold text-blue-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / Math.max(...placementByType.map(p => p.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No placement data available.</p>
            )}
          </div>
        </div>

        {/* Achievement Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Achievements by Category</h3>
          <div className="space-y-4">
            {achievementByCategory.length > 0 ? (
              achievementByCategory.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item._id || "Other"}</span>
                    <span className="text-sm font-bold text-green-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / Math.max(...achievementByCategory.map(a => a.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No achievement data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Activities by Type</h3>
          <div className="space-y-4">
            {activityByType.length > 0 ? (
              activityByType.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item._id || "Other"}</span>
                    <span className="text-sm font-bold text-amber-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / Math.max(...activityByType.map(a => a.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No activity data available.</p>
            )}
          </div>
        </div>

        {/* Internship Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Internships Status</h3>
          <div className="space-y-4">
            {internshipByType.length > 0 ? (
              internshipByType.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item._id || "Other"}</span>
                    <span className="text-sm font-bold text-purple-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / Math.max(...internshipByType.map(i => i.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No internship data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Global Activity</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{activity.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {activity.date ? new Date(activity.date).toLocaleDateString() : "Date N/A"}
                      </span>
                      {activity.studentName && (
                        <span className="text-xs text-slate-500">
                          • Student: {activity.studentName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-500">No recent activity detected.</p>
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          {/* You could add a Link here to a full activity log page if it existed */}
          <p className="text-xs text-slate-400">Showing last 5 global activities</p>
        </div>
      </div>
    </main>
  );
}