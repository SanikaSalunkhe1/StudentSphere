
import React, { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalAchievements: 0,
    internshipStatus: "Pending",
    placementStatus: "Not Placed",
    higherStudiesStatus: "Not Applied",
  });

  const [activityDistribution, setActivityDistribution] = useState([]);
  const [achievementDistribution, setAchievementDistribution] = useState([]);
  const [placementDistribution, setPlacementDistribution] = useState([]);
  const [internshipDistribution, setInternshipDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStudentDashboard();

      if (!data) {
        throw new Error("No data returned from backend.");
      }

      if (data && data.stats) {
        setStats({
          ...data.stats,
          internshipStatus: data.stats.totalInternships > 0 ? "Done" : "Pending",
          placementStatus: data.stats.totalPlacements > 0 ? "Placed" : "Not Placed",
          higherStudiesStatus: data.stats.totalHigherStudies > 0 ? "Applied" : "Not Applied",
        });
        setActivityDistribution(data.activitiesByType || []);
        setAchievementDistribution(data.achievementsByCategory || []);
        setPlacementDistribution(data.placementsByType || []);
        setInternshipDistribution(data.internshipsByType || []);
        setInternshipDistribution(data.internshipsByType || []);
      } else {
        throw new Error("Incorrect data format from backend. 'stats' is missing.");
      }
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
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
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-7 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
          Welcome Back!
        </h1>
        <p className="text-slate-600 mt-1 sm:mt-2">
          Here's your complete career journey overview
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-7 sm:mb-10">
        {/* Activities Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Total Activities
              </p>
              <p className="text-xl sm:text-3xl font-bold text-blue-600">
                {stats.totalActivities}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 sm:p-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* Achievements Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Achievements
              </p>
              <p className="text-xl sm:text-3xl font-bold text-green-600">
                {stats.totalAchievements}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-2 sm:p-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* Internship Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Internship
              </p>
              <p
                className={`text-lg sm:text-2xl font-bold ${stats.internshipStatus === "Done"
                  ? "text-purple-600"
                  : "text-slate-400"
                  }`}
              >
                {stats.internshipStatus}
              </p>
            </div>
            <div
              className={`rounded-full p-2 sm:p-4 ${stats.internshipStatus === "Done"
                ? "bg-purple-100"
                : "bg-slate-100"
                }`}
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 ${stats.internshipStatus === "Done"
                  ? "text-purple-600"
                  : "text-slate-400"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.728 0-7.196-.575-10.468-1.673M5 13a10 10 0 1120 0m0 0a10.038 10.038 0 01-1.463 4.09c1.622 1.084 3.61 1.71 5.791 1.71 2.18 0 4.17-.626 5.793-1.71A10.038 10.038 0 0121 13.255z"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* Placement Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Placement
              </p>
              <p
                className={`text-lg sm:text-2xl font-bold ${stats.placementStatus === "Placed"
                  ? "text-emerald-600"
                  : "text-slate-400"
                  }`}
              >
                {stats.placementStatus === "Placed" ? "✓ Placed" : "Not Placed"}
              </p>
            </div>
            <div
              className={`rounded-full p-2 sm:p-4 ${stats.placementStatus === "Placed"
                ? "bg-emerald-100"
                : "bg-slate-100"
                }`}
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 ${stats.placementStatus === "Placed"
                  ? "text-emerald-600"
                  : "text-slate-400"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* Higher Studies Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Higher Studies
              </p>
              <p
                className={`text-lg sm:text-xl font-bold ${stats.higherStudiesStatus === "Applied"
                  ? "text-amber-600"
                  : "text-slate-400"
                  }`}
              >
                {stats.higherStudiesStatus === "Applied" ? "Applied" : "N/A"}
              </p>
            </div>
            <div
              className={`rounded-full p-2 sm:p-4 ${stats.higherStudiesStatus === "Applied"
                ? "bg-amber-100"
                : "bg-slate-100"
                }`}
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 ${stats.higherStudiesStatus === "Applied"
                  ? "text-amber-600"
                  : "text-slate-400"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15s4.228 8.772 10 8.772 10-4.228 10-8.772c0-4.772-4.228-8.747-10-8.747z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-7 sm:mb-10">
        {/* Activity Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
            Activities by Category
          </h3>
          <div className="space-y-3">
            {activityDistribution.length > 0 ? (
              (() => {
                const maxCount = Math.max(...activityDistribution.map(d => d.count)) || 1;
                return activityDistribution.map((item) => (
                  <div key={item._id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {item._id || "Other"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-blue-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm">
                No activities yet
              </p>
            )}
          </div>
        </div>
        {/* Achievement Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
            Achievements by Category
          </h3>
          <div className="space-y-3">
            {achievementDistribution.length > 0 ? (
              (() => {
                const maxCount = Math.max(...achievementDistribution.map(d => d.count)) || 1;
                return achievementDistribution.map((item) => (
                  <div key={item._id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {item._id || "Other"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-green-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm">
                No achievements yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-7 sm:mb-10">
        {/* Placement Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
            Placements by Type
          </h3>
          <div className="space-y-3">
            {placementDistribution.length > 0 ? (
              (() => {
                const maxCount = Math.max(...placementDistribution.map(d => d.count)) || 1;
                return placementDistribution.map((item) => (
                  <div key={item._id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {item._id || "Other"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm">
                No placements yet
              </p>
            )}
          </div>
        </div>
        {/* Internship Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
            Internships Status
          </h3>
          <div className="space-y-3">
            {internshipDistribution.length > 0 ? (
              (() => {
                const maxCount = Math.max(...internshipDistribution.map(d => d.count)) || 1;
                return internshipDistribution.map((item) => (
                  <div key={item._id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {item._id || "Other"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-purple-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm">
                No internships yet
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
