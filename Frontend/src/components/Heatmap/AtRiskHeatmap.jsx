import React, { useState, useEffect, useRef } from "react";
import { heatmapService } from "../../services/heatmapService";
import { FaFireAlt, FaExclamationTriangle, FaTimes, FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function AtRiskHeatmap() {
  const [data, setData] = useState({ students: [], metrics: null });
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role")?.toLowerCase());

  // For Admin selection
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedDiv, setSelectedDiv] = useState("All");
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);


  const [selectedStudent, setSelectedStudent] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, [selectedYear, selectedDiv, role]);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const res = await heatmapService.getHeatmapData(
        role === "admin" ? selectedYear : null,
        role === "admin" ? selectedDiv : null
      );
      setData(res);

      if (res.metrics && res.metrics.total > 0) {
        fetchInsight(res.metrics);
      } else {
        setInsight("Not enough data to generate an insight.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load heatmap data");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async (metrics) => {
    try {
      const res = await heatmapService.getInsights(metrics);
      setInsight(res.insight);
    } catch (error) {
      console.log(error);
      setInsight("Insight currently unavailable.");
    }
  };

  const toggleFlag = async (id, currentStatus) => {
    try {
      await heatmapService.toggleRisk(id);
      setData(prev => ({
        ...prev,
        students: prev.students.map(s =>
          s._id === id ? { ...s, isAtRisk: !currentStatus } : s
        )
      }));
      if (selectedStudent?._id === id) {
        setSelectedStudent({ ...selectedStudent, isAtRisk: !currentStatus });
      }
      toast.success(currentStatus ? "Removed from At-Risk" : "Flagged as At-Risk");
    } catch (error) {
      toast.error("Failed to toggle risk flag");
    }
  };

  const [loadingNudge, setLoadingNudge] = useState(false);
  const [cooldowns, setCooldowns] = useState({});

  // Initialize cooldowns from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nudge_cooldowns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out expired ones immediately
        const now = Date.now();
        const filtered = {};
        Object.keys(parsed).forEach(id => {
          if (parsed[id] > now) filtered[id] = parsed[id];
        });
        setCooldowns(filtered);
      } catch (e) {
        console.error("Failed to parse cooldowns", e);
      }
    }
  }, []);

  // Timer interval to keep UI fresh
  useEffect(() => {
    if (Object.keys(cooldowns).length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updated = { ...cooldowns };
      
      Object.keys(updated).forEach(id => {
        if (updated[id] <= now) {
          delete updated[id];
          changed = true;
        }
      });

      if (changed) {
        setCooldowns(updated);
        localStorage.setItem("nudge_cooldowns", JSON.stringify(updated));
      } else {
        // Just force a re-render to update the display timers
        setCooldowns({ ...updated });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldowns]);

  const handleNudge = async () => {
    if (!selectedStudent || !selectedStudent.email) {
      toast.error("Student email not found.");
      return;
    }

    // Double check cooldown
    if (cooldowns[selectedStudent._id] > Date.now()) {
      toast.error("Cooldown active for this student.");
      return;
    }

    const toastId = toast.loading(`Drafting AI email for ${selectedStudent.name?.firstName}...`);
    try {
      setLoadingNudge(true);
      await heatmapService.sendNudge({
        studentId: selectedStudent._id,
        studentName: `${selectedStudent.name?.firstName} ${selectedStudent.name?.lastName}`,
        studentEmail: selectedStudent.email,
        counts: selectedStudent.counts,
        isProfileIncomplete: selectedStudent.isProfileIncomplete
      });
      
      // Set 10 minute cooldown
      const expiry = Date.now() + 10 * 60 * 1000;
      const newCooldowns = { ...cooldowns, [selectedStudent._id]: expiry };
      setCooldowns(newCooldowns);
      localStorage.setItem("nudge_cooldowns", JSON.stringify(newCooldowns));

      toast.success(`Personalized nudge sent to ${selectedStudent.name?.firstName}!`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send nudge. Check AI settings.", { id: toastId });
    } finally {
      setLoadingNudge(false);
    }
  };

  const handleBulkNudge = async () => {
    const incompleteStudents = data.students.filter(s => s.isProfileIncomplete && s.email && (!cooldowns[s._id] || cooldowns[s._id] < Date.now()));
    
    if (incompleteStudents.length === 0) {
      toast.error("No valid students to nudge (or all on cooldown).");
      return;
    }

    if (!window.confirm(`Are you sure you want to AI Nudge ${incompleteStudents.length} students?`)) return;

    const toastId = toast.loading(`Sending ${incompleteStudents.length} nudges...`);
    setLoadingNudge(true);
    let successCount = 0;
    
    const newCooldowns = { ...cooldowns };
    const expiry = Date.now() + 10 * 60 * 1000;

    for (const student of incompleteStudents) {
      try {
        await heatmapService.sendNudge({
          studentId: student._id,
          studentName: `${student.name?.firstName} ${student.name?.lastName}`,
          studentEmail: student.email,
          counts: student.counts,
          isProfileIncomplete: true
        });
        successCount++;
        newCooldowns[student._id] = expiry;
      } catch (e) {
        console.error("Bulk nudge failed for", student.email);
      }
    }

    setCooldowns(newCooldowns);
    localStorage.setItem("nudge_cooldowns", JSON.stringify(newCooldowns));
    setLoadingNudge(false);
    
    if (successCount === incompleteStudents.length) {
       toast.success(`Successfully sent ${successCount} nudges!`, { id: toastId });
    } else {
       toast.error(`Sent ${successCount}/${incompleteStudents.length} nudges. Some failed.`, { id: toastId });
    }
  };

  const getCooldownText = (studentId) => {
    const expiry = cooldowns[studentId];
    if (!expiry) return null;
    const diff = Math.max(0, expiry - Date.now());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8 hover:shadow-md transition overflow-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div className="min-w-0 w-full xl:w-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 truncate">
            <FaFireAlt className="text-orange-500" /> At-Risk Student Heatmap
          </h2>
          <p className="text-slate-500 text-sm mt-1">Profile completeness tracking for accreditation needs.</p>
        </div>

        {role === "admin" && (
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0 justify-end items-center">
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg mr-2">
              <label className="text-sm font-bold text-slate-700 cursor-pointer flex items-center gap-2 select-none">
                <input 
                  type="checkbox" 
                  checked={showIncompleteOnly}
                  onChange={(e) => setShowIncompleteOnly(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                Details Missing
                {data.metrics?.incompleteProfilesCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full ml-1 leading-none shadow-sm">
                    {data.metrics.incompleteProfilesCount}
                  </span>
                )}
              </label>
              {showIncompleteOnly && (
                <button
                  onClick={handleBulkNudge}
                  disabled={loadingNudge}
                  className="ml-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center gap-1 hover:bg-slate-800"
                >
                  {loadingNudge ? "Sending..." : <><FaFireAlt className="text-orange-400" /> Nudge All</>}
                </button>
              )}
            </div>

            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="All">All Years</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>
            <select
              value={selectedDiv}
              onChange={e => setSelectedDiv(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="All">All Divs</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (

        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : data.students.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-500">
          No students found for this division.
        </div>
      ) : (
        <>
          {/* AI Banner */}
          <div className="mb-6 p-4 rounded-xl relative overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200/50">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-400"></div>
            <div className="flex gap-4 items-start pl-2">
              <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                <FaFireAlt className="text-orange-500 text-xl" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-orange-800 uppercase tracking-wider mb-1">AI Insights</h4>
                <p className="text-orange-950 font-medium italic text-sm md:text-base leading-relaxed">
                  "{insight}"
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Container with Gradient Masks */}
          <div className="relative w-full min-w-0 max-w-full group/carousel">
            {/* Left Button - Glassmorphism */}
            <button 
              onClick={() => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 bg-white/50 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] text-slate-700 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0"
              title="Scroll Left"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>

            {/* Scrollable Area */}
            {data.students.filter(s => showIncompleteOnly ? s.isProfileIncomplete : true).length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 m-4 w-full">
                <FaCheck className="text-3xl text-emerald-400 mb-2 opacity-50" />
                <p className="font-semibold">{showIncompleteOnly ? "All students have filled their details! 🎉" : "No students found."}</p>
              </div>
            ) : (
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x scrollbar-hide pb-8 pt-4 gap-6 scroll-smooth px-4 w-full min-w-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {data.students.filter(student => showIncompleteOnly ? student.isProfileIncomplete : true).map((student) => {
                // Status Colors & Layouts

                const statusTheme = student.status === "green" 
                  ? { border: "border-emerald-500", bg: "bg-emerald-500", text: "text-emerald-700", lightBg: "bg-emerald-50" }
                  : student.status === "yellow" 
                    ? { border: "border-amber-400", bg: "bg-amber-400", text: "text-amber-700", lightBg: "bg-amber-50" }
                    : { border: "border-red-500", bg: "bg-red-500", text: "text-red-700", lightBg: "bg-red-50" };

                const flagPulse = student.isAtRisk ? "ring-4 ring-red-600/30 ring-offset-2 animate-pulse" : "";
                const fallBackInitial = student.name?.firstName?.charAt(0) || "S";

                return (
                  <button
                    key={student._id}
                    onClick={() => setSelectedStudent(student)}
                    className={`group relative flex flex-col items-center p-0 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 shrink-0 w-44 snap-start overflow-hidden ${flagPulse}`}
                  >
                    {/* Status Accent Bar at Top */}
                    <div className={`h-1.5 w-full ${statusTheme.bg}`} />
                    
                    <div className="p-5 flex flex-col items-center w-full">
                      {/* Photo/Avatar - Larger & Consistent with Admission */}
                      <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md mb-4 flex items-center justify-center ${statusTheme.border}`}>
                        {student.studentPhoto?.url ? (
                          <img src={student.studentPhoto.url} alt={student.name?.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-black text-3xl text-white shadow-inner ${statusTheme.bg}`}>
                            {fallBackInitial}
                          </div>
                        )}
                      </div>

                      <div className="w-full text-center space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Student</p>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight truncate px-1">
                          {student.name?.firstName || student.name?.lastName 
                            ? `${student.name.firstName || ""} ${student.name.lastName || ""}`.trim()
                            : <span className="text-xs font-mono text-slate-500 overflow-hidden text-ellipsis">{student.email}</span>}
                        </h3>
                        
                        <div className="pt-2 border-t border-slate-100 mt-2 w-full flex items-center justify-center gap-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ID</p>
                          <p className="text-xs font-bold text-indigo-600 font-mono tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-full inline-block leading-none">
                            {student.studentID || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className={`w-1.5 h-1.5 rounded-full ${student.counts.internships > 0 ? statusTheme.bg : 'bg-slate-200'}`} title="Internship" />
                      <div className={`w-1.5 h-1.5 rounded-full ${student.counts.activities > 0 ? statusTheme.bg : 'bg-slate-200'}`} title="Activity" />
                      <div className={`w-1.5 h-1.5 rounded-full ${student.counts.achievements > 0 ? statusTheme.bg : 'bg-slate-200'}`} title="Achievement" />
                    </div>

                    {/* Indicators */}
                    {student.isProfileIncomplete && (
                      <div className="absolute top-2 left-2 bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm border border-orange-200" title="Missing Complete Details (Address, DOB, Bloodgroup, etc.)">
                        Missing Details
                      </div>
                    )}

                    {student.isAtRisk && (
                      <div className={`absolute top-2 right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md border-[1.5px] border-white ${student.isProfileIncomplete ? '' : 'animate-bounce'}`}>
                        <FaExclamationTriangle className="text-[8px]" />
                      </div>
                    )}
                  </button>

                );
              })}
            </div>
            )}

            {/* Right Button - Glassmorphism */}
            <button 
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 bg-white/50 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] text-slate-700 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0"
              title="Scroll Right"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> Excellent (2+ Logs)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Needs Polish (1 Log)</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> At-Risk (0 Logs)</div>
          </div>
        </>
      )}

      {/* Modal Overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Student Overview</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {selectedStudent.name?.firstName?.charAt(0) || "S"}
                </div>
                <h4 className="text-lg font-bold text-slate-900">{selectedStudent.name?.firstName} {selectedStudent.name?.lastName}</h4>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-1">{selectedStudent.studentID || "No ID"}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">Internships</span>
                  <span className="font-bold text-slate-900">{selectedStudent.counts?.internships || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">Activities</span>
                  <span className="font-bold text-slate-900">{selectedStudent.counts?.activities || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">Achievements</span>
                  <span className="font-bold text-slate-900">{selectedStudent.counts?.achievements || 0}</span>
                </div>
                <button
                  onClick={handleNudge}
                  disabled={loadingNudge || !!cooldowns[selectedStudent._id]}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-xl active:scale-95 disabled:opacity-70 disabled:bg-slate-700"
                >
                  {loadingNudge ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Sending AI Nudge...</>
                  ) : cooldowns[selectedStudent._id] ? (
                    <><FaFireAlt className="text-orange-400" /> Nudge in {getCooldownText(selectedStudent._id)}</>
                  ) : (
                    <><FaFireAlt className="text-orange-400" /> Nudge Student (AI Email)</>
                  )}
                </button>

                <button
                  onClick={() => toggleFlag(selectedStudent._id, selectedStudent.isAtRisk)}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border ${selectedStudent.isAtRisk ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'}`}
                >
                  {selectedStudent.isAtRisk ? (
                    <><FaCheck /> Remove At-Risk Flag</>
                  ) : (
                    <><FaExclamationTriangle /> Flag as At-Risk</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
