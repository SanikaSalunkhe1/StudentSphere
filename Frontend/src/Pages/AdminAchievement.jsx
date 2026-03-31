import React, { useState, useEffect } from "react";
import { achievementService } from "../services/achievementService";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";
import SendNotificationButton from "../components/Common/SendNotificationButton";

// Achievement Card Component - COMPACT & BEAUTIFUL
function AchievementCard({ achievement, onView, onDelete, onEdit, isDeleting }) {
  // Student info helper - checks both populated 'stuID' and aggregated 'student' field
  const student = achievement?.student || achievement?.stuID;
  const studentID = student?.studentID && student.studentID !== "N/A" ? student.studentID : null;
  const studentYear = student?.year && student.year !== "N/A" ? student.year : null;
  const studentNameRaw = student?.name;
  const studentName = studentNameRaw &&
    (studentNameRaw.firstName || studentNameRaw.lastName) &&
    `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim() !== "N/A"
    ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim()
    : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Image Section */}
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
        <img
          src={
            achievement?.photographs?.eventPhoto?.url ||
            "https://via.placeholder.com/300x200?text=Achievement"
          }
          alt={achievement?.title || "Achievement"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Overlay: ID & Year */}
        <div className="absolute top-2 left-2 flex gap-1">
          {studentID && (
            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 rounded shadow-sm border border-white/20 uppercase tracking-tighter">
              {studentID}
            </span>
          )}
          {studentYear && (
            <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white rounded shadow-sm border border-blue-500/20 uppercase tracking-tighter font-mono">
              {studentYear}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Student Name */}
        {studentName && (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
            <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
          </div>
        )}

        <div className="h-px bg-slate-100 mb-3" />

        {/* Title */}
        <h3 className="text-sm font-bold text-blue-600 mb-1 line-clamp-2">
          {achievement?.title || "No Title"}
        </h3>

        {/* Category Badge */}
        {achievement?.category && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-blue-100">
              {achievement.category}
            </span>
          </div>
        )}

        {/* Achievement Type */}
        {achievement?.achievementType && (
          <p className="text-xs font-black text-green-600 mb-2 flex items-center gap-1">
            {achievement.achievementType === "Winner" && "🏆 "}
            {achievement.achievementType === "Runner-up" && "🥈 "}
            {achievement.achievementType}
          </p>
        )}

        {/* Date */}
        <div className="mb-3 pb-3 border-b border-slate-100 mt-auto">
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {achievement?.date?.from && !isNaN(new Date(achievement.date.from).getTime())
              ? new Date(achievement.date.from).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: 'numeric' })
              : "Date N/A"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onView && onView(achievement)}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onEdit && onEdit(achievement)}
              className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(achievement._id)}
              disabled={isDeleting}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${isDeleting
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                }`}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail View Modal Component
function DetailModal({ achievement, onClose }) {
  const [student, setStudent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDbId = typeof achievement.stuID === 'string' ? achievement.stuID : achievement.stuID?._id;
        if (studentDbId) {
          const res = await studentService.getSingleStudent(studentDbId);
          setStudent(res.data);
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [achievement]);

  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            {achievement.category && (
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-100 uppercase tracking-tighter">
                  {achievement.category}
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column: Student & Metadata */}
              <div className="lg:col-span-4 space-y-6">
                {/* Student Profile Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  {loading ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-xs text-slate-500 font-medium">Loading Student Profile...</p>
                    </div>
                  ) : student ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                        {student.name?.firstName?.charAt(0) || student.name?.lastName?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 antialiased leading-tight truncate">
                          {student.name?.firstName} {student.name?.lastName}
                        </h3>
                        <p className="text-blue-600 font-bold text-sm tracking-tight">{student.studentID}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase">{student.year}</span>
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase">DIV {student.division}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-400">Student Profile Not Found</p>
                    </div>
                  )}
                </div>

                {/* Success Card */}
                <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-3 drop-shadow-lg">
                      {achievement.achievementType === "Winner" ? "🏆" : achievement.achievementType === "Runner-up" ? "🥈" : "🏵️"}
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-1">Achievement Status</h4>
                    <p className="text-2xl font-black tracking-tight mb-4">{achievement.achievementType || "Participated"}</p>

                    {(achievement.issuedBy) && (
                      <div className="flex flex-col gap-2 items-center text-xs font-bold bg-black/10 rounded-2xl p-4">
                        <p className="text-emerald-100/70 uppercase text-[10px] tracking-widest">Organiser / Issued By</p>
                        <p className="text-center line-clamp-2">{achievement.issuedBy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Level & Nature - REMOVED since they don't exist in DB schema */}

                {/* Team Members Section */}
                {achievement.teamMembers && achievement.teamMembers.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      Team Members
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {achievement.teamMembers.map((member, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm capitalize">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Previews & Details */}
              <div className="lg:col-span-8 flex flex-col gap-6">

                {/* Main Carousel / Grid for Pictures */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                    Media Gallery / Proofs
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Event Photo */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Photo</p>
                      <div className="bg-slate-100 rounded-2xl border aspect-[4/3] overflow-hidden group relative">
                        {achievement.photographs?.eventPhoto?.url ? (
                          <img src={achievement.photographs.eventPhoto.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Event" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">No Photo</div>
                        )}
                      </div>
                    </div>

                    {/* Certificate */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Certificate</p>
                      <div className="bg-slate-100 rounded-2xl border aspect-[4/3] overflow-hidden group relative">
                        {achievement.photographs?.certificate?.url ? (
                          achievement.photographs.certificate.url.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={achievement.photographs.certificate.url} className="w-full h-full border-none" />
                          ) : (
                            <img src={achievement.photographs.certificate.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Certificate" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">No Document</div>
                        )}
                      </div>
                    </div>

                    {/* Course Certificate */}
                    {achievement.course_certificate?.url && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Course Certificate</p>
                        <div className="bg-slate-100 rounded-2xl border aspect-[4/3] overflow-hidden group relative">
                          {achievement.course_certificate.url.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={achievement.course_certificate.url} className="w-full h-full border-none" />
                          ) : (
                            <img src={achievement.course_certificate.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Course Certificate" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {achievement.description && (
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex-grow">
                    <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </span>
                      Story & Impact
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm antialiased font-medium italic">
                      "{achievement.description}"
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-200">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Period</p>
                        <p className="text-sm font-bold text-slate-700">
                          {achievement.date?.from ? new Date(achievement.date.from).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                          {achievement.date?.to ? ` to ${new Date(achievement.date.to).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}` : ""}
                        </p>
                      </div>

                      {achievement.certification_course && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certification / Course Details</p>
                          <p className="text-sm font-bold text-slate-700 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 inline-block line-clamp-1">
                            {achievement.certification_course}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 z-20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-black rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

// Form Modal Component (Add / Edit)
function AchievementFormModal({ isOpen, onClose, achievement, onSave }) {
  const [formData, setFormData] = useState({
    stuID: "",
    title: "",
    category: "Coding competitions",
    achievementType: "Participation",
    issuedBy: "",
    dateFrom: "",
    dateTo: "",
    description: "",
    teamMembers: "", // comma separated string for frontend input
    certification_course: "",
  });

  const [files, setFiles] = useState({
    eventPhoto: null,
    certificate: null,
    course_certificate: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (achievement) {
        // Fix Privacy: Ensure we show human-readable studentID, not MongoDB _id
        const studentObj = achievement.student || achievement.stuID;
        setFormData({
          stuID: (typeof studentObj === "object" ? studentObj?.studentID : studentObj) || "",
          title: achievement.title || "",
          category: achievement.category || "Coding competitions",
          achievementType: achievement.achievementType || "Participation",
          issuedBy: achievement.issuedBy || "",
          dateFrom: (achievement.date?.from && !isNaN(new Date(achievement.date.from).getTime()))
            ? new Date(achievement.date.from).toISOString().split('T')[0]
            : "",
          dateTo: (achievement.date?.to && !isNaN(new Date(achievement.date.to).getTime()))
            ? new Date(achievement.date.to).toISOString().split('T')[0]
            : "",
          description: achievement.description || "",
          teamMembers: achievement.teamMembers ? achievement.teamMembers.join(", ") : "",
          certification_course: achievement.certification_course || "",
        });
      } else {
        setFormData({
          stuID: "",
          title: "",
          category: "Coding competitions",
          achievementType: "Participation",
          issuedBy: "",
          dateFrom: "",
          dateTo: "",
          description: "",
          teamMembers: "",
          certification_course: "",
        });
      }
      setFiles({
        eventPhoto: null,
        certificate: null,
        course_certificate: null,
      });
    }
  }, [isOpen, achievement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    // Size Validation (500KB)
    if (file.size > 500 * 1024) {
      toast.error("File size exceeds 500KB limit!");
      e.target.value = "";
      return;
    }

    // Type Validation
    if (name === "eventPhoto") {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Please upload an image file (JPG/PNG) for the Event Photo!");
        e.target.value = "";
        return;
      }
    } else if (name === "certificate" || name === "course_certificate") {
      if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
        toast.error("Please upload a PDF or image file (JPG/PNG) for the Certificate!");
        e.target.value = "";
        return;
      }
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();

      // Append form fields
      data.append('studentId', formData.stuID);
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('achievementType', formData.achievementType);
      data.append('issuedBy', formData.issuedBy);
      data.append('description', formData.description);

      // Date object restructuring based on backend validation logic
      data.append('dateFrom', formData.dateFrom);
      data.append('dateTo', formData.dateTo);

      if (formData.teamMembers) {
        const membersArr = formData.teamMembers.split(',').map(m => m.trim()).filter(Boolean);
        membersArr.forEach(member => data.append('teamMembers', member));
      }

      if (formData.certification_course) {
        data.append('certification_course', formData.certification_course);
      }

      // Append files
      if (files.eventPhoto) data.append('eventPhoto', files.eventPhoto);
      if (files.certificate) data.append('certificate', files.certificate);
      if (files.course_certificate) data.append('course_certificate', files.course_certificate);

      let response;
      if (achievement) {
        response = await achievementService.updateAchievement(achievement._id, data);
        toast.success("Achievement updated successfully!");
      } else {
        response = await achievementService.createAchievement(data);
        toast.success("Achievement added successfully!");
      }
      // Pass the response data (updated/new achievement) back to the handler
      onSave(response.data || response);
      onClose(); // Close modal
    } catch (err) {
      console.error("Error saving achievement:", err);
      // Improve Validation: Parse detailed messages from backend
      const errorMessage =
        err.response?.data?.errors?.map(e => e.message).join(", ") ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save achievement.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 z-20 px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {achievement ? "Edit Achievement Details" : "Add New Achievement"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Primary Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {/* Student ID */}
              <div>
                <label className={labelClass}>Student ID *</label>
                <input
                  type="text"
                  name="stuID"
                  required
                  value={formData.stuID}
                  onChange={handleChange}
                  placeholder="e.g. 2024COMP123"
                  disabled={!!achievement}
                  className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Title */}
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Smart India Hackathon 2024"
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Coding competitions">Coding Competitions</option>
                  <option value="Academic Topper">Academic Topper</option>
                  <option value="Committee">Committee</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Technical">Technical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Achievement Type */}
              <div>
                <label className={labelClass}>Achievement Type *</label>
                <select
                  name="achievementType"
                  required
                  value={formData.achievementType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Winner">Winner</option>
                  <option value="Runner-up">Runner-up</option>
                  <option value="Participation">Participation</option>
                </select>
              </div>

              {/* Issued By */}
              <div>
                <label className={labelClass}>Issued By / Organiser *</label>
                <input
                  type="text"
                  name="issuedBy"
                  required
                  value={formData.issuedBy}
                  onChange={handleChange}
                  placeholder="e.g. Google, AICTE, College Name"
                  className={inputClass}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date (From) *</label>
                  <input
                    type="date"
                    name="dateFrom"
                    required
                    value={formData.dateFrom}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date (To) *</label>
                  <input
                    type="date"
                    name="dateTo"
                    required
                    value={formData.dateTo}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Additional Context</h4>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
              {/* Description */}
              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the achievement in detail..."
                  className={inputClass}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Team Members (Optional)</label>
                  <input
                    type="text"
                    name="teamMembers"
                    value={formData.teamMembers}
                    onChange={handleChange}
                    placeholder="E.g. John Doe, Jane Smith"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Comma-separated names</p>
                </div>

                <div>
                  <label className={labelClass}>Certification / Course Details (Optional)</label>
                  <input
                    type="text"
                    name="certification_course"
                    value={formData.certification_course}
                    onChange={handleChange}
                    placeholder="E.g. AWS Certified Solutions Architect"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Media Uploads</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {/* Event Photo */}
              <div>
                <label className={labelClass}>
                  Event Photo {!achievement && "*"}
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, JPG/PNG only
                  </span>
                </label>
                <input
                  type="file"
                  name="eventPhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!achievement}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none transition-all cursor-pointer"
                />
              </div>

              {/* Certificate */}
              <div>
                <label className={labelClass}>
                  Event Certificate {!achievement && "*"}
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, PDF/JPG/PNG only
                  </span>
                </label>
                <input
                  type="file"
                  name="certificate"
                  accept=".pdf, image/*"
                  onChange={handleFileChange}
                  required={!achievement}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none transition-all cursor-pointer"
                />
              </div>

              {/* Course Certificate */}
              <div>
                <label className={labelClass}>
                  Course Certificate (Optional)
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, PDF/JPG/PNG only
                  </span>
                </label>
                <input
                  type="file"
                  name="course_certificate"
                  accept=".pdf, image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none transition-all cursor-pointer"
                />
              </div>
            </div>
            {!achievement && <p className="text-xs text-amber-600 mt-3 font-semibold px-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Event Photo and Event Certificate are strictly required when creating a new achievement.</p>}
          </section>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-6 flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                achievement ? "Update Achievement" : "Add Achievement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Admin Achievements Page Component
export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  // Applied Filters State (Snapshot for WYSIWYG)
  const [appliedFilters, setAppliedFilters] = useState({});
  const [achievementEmailMap, setAchievementEmailMap] = useState({});
  const [emailCache, setEmailCache] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [achievementToEdit, setAchievementToEdit] = useState(null);

  // Fetch achievements from backend when component loads or pagination changes
  useEffect(() => {
    fetchAchievements(currentPage);
  }, [currentPage, limit, appliedFilters]);

  const fetchAchievements = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...appliedFilters
      };
      const response = await achievementService.getAllAchievements(params);

      const data = response.data || [];
      const total = response.total || 0;
      const totalP = response.totalPages || 1;

      const studentRefs = data
        .map((item) => ({
          dbId: typeof item?.stuID === "object" && item?.stuID?._id ? String(item.stuID._id) : "",
          studentID: typeof item?.stuID === "object" && item?.stuID?.studentID ? String(item.stuID.studentID) : "",
          existingEmail: item?.stuID?.email || item?.studentEmail || item?.email || item?.student?.email || "",
        }))
        .filter((ref) => ref.dbId);

      const mapFromRecords = { ...emailCache };
      studentRefs.forEach((ref) => {
        if (ref.existingEmail) {
          mapFromRecords[ref.dbId] = ref.existingEmail;
          if (ref.studentID) mapFromRecords[ref.studentID] = ref.existingEmail;
        }
      });

      const missingRefs = studentRefs.filter((ref) => !mapFromRecords[ref.dbId]);
      let resolvedMap = { ...mapFromRecords };

      if (missingRefs.length > 0) {
        const uniqueMissing = Array.from(new Map(missingRefs.map((ref) => [ref.dbId, ref])).values());
        const results = await Promise.allSettled(uniqueMissing.map((ref) => studentService.getSingleStudent(ref.dbId)));
        results.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          const student = result.value?.data;
          const email = student?.email;
          if (!email) return;
          const ref = uniqueMissing[index];
          resolvedMap[ref.dbId] = email;
          if (ref.studentID) resolvedMap[ref.studentID] = email;
        });
      }

      setAchievements(data);
      setAchievementEmailMap(resolvedMap);
      setEmailCache((prev) => ({ ...prev, ...resolvedMap }));
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setError("Failed to load achievements. Backend might not be running!");
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFilteredAchievementsForNotification = async () => {
    const firstPageResponse = await achievementService.getAllAchievements({
      ...appliedFilters,
      page: 1,
      limit: 50,
    });
    const all = [...(firstPageResponse?.data || [])];
    const pages = firstPageResponse?.totalPages || 1;
    if (pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, idx) =>
          achievementService.getAllAchievements({ ...appliedFilters, page: idx + 2, limit: 50 })
        )
      );
      rest.forEach((res) => { if (Array.isArray(res?.data)) all.push(...res.data); });
    }
    return all;
  };

  const buildEmailMapForAchievements = async (records = []) => {
    const studentRefs = records
      .map((item) => {
        const studentObj = item?.student || item?.stuID;
        return {
          dbId: typeof studentObj === "object" && studentObj?._id ? String(studentObj._id) : "",
          studentID: typeof studentObj === "object" && studentObj?.studentID ? String(studentObj.studentID) : "",
          existingEmail: studentObj?.email || item?.studentEmail || item?.email || "",
        };
      })
      .filter((ref) => ref.dbId);

    const resolved = { ...emailCache };
    studentRefs.forEach((ref) => {
      if (ref.existingEmail) {
        resolved[ref.dbId] = ref.existingEmail;
        if (ref.studentID) resolved[ref.studentID] = ref.existingEmail;
      }
    });

    const missing = studentRefs.filter((ref) => !resolved[ref.dbId]);
    if (missing.length > 0) {
      const uniqueMissing = Array.from(new Map(missing.map((ref) => [ref.dbId, ref])).values());
      const results = await Promise.allSettled(
        uniqueMissing.map((ref) => studentService.getSingleStudent(ref.dbId))
      );
      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const student = result.value?.data;
        const email = student?.email;
        if (!email) return;
        const ref = uniqueMissing[index];
        resolved[ref.dbId] = email;
        if (ref.studentID) resolved[ref.studentID] = email;
      });
    }

    setEmailCache((prev) => ({ ...prev, ...resolved }));
    return resolved;
  };

  const handleExport = async () => {
    try {
      const blob = await achievementService.exportAchievements(appliedFilters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Achievements_Export_${new Date().toLocaleDateString("en-IN")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Error exporting achievements:", err);
      toast.error("Failed to export achievements. Please try again.");
    }
  };

  const handleView = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const handleCloseModal = () => {
    setSelectedAchievement(null);
  };

  const handleEdit = (achievement) => {
    setAchievementToEdit(achievement);
    setIsFormModalOpen(true);
  };

  const handleAddAchievement = () => {
    setAchievementToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleSaveAchievement = (updatedItem) => {
    if (achievementToEdit) {
      // Local update for edits
      setAchievements((prev) =>
        prev.map((a) =>
          a._id === updatedItem._id
            ? {
              ...updatedItem,
              student: a.student || updatedItem.student,
              stuID: a.stuID || updatedItem.stuID,
            }
            : a
        )
      );
    } else {
      // For new achievements, a refetch is safer to maintain sorting/pagination
      fetchAchievements(currentPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?"))
      return;
    setDeletingId(id);
    try {
      await achievementService.deleteAchievement(id);
      // Remove from local state
      setAchievements((prev) => prev.filter((a) => a._id !== id));
      setTotalRecords((prev) => prev - 1);
      toast.success("Achievement deleted successfully!");
    } catch (err) {
      console.error("Error deleting achievement:", err);
      toast.error("Failed to delete achievement.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Manage Achievements
        </h1>
        <p className="text-slate-600 mt-2">
          Showing{" "}
          <span className="font-semibold text-blue-600">
            {totalRecords}
          </span>{" "}
          achievements
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by achievement title, issued by, or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-bold placeholder:font-normal"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
              <span className="font-semibold text-blue-600">Note:</span> Search box scans for <strong className="text-slate-700">Achievement Title</strong>, <strong className="text-slate-700">Issued By</strong>, and <strong className="text-slate-700">Student Name</strong>. For specific results, use dropdowns to filter by Category, Year, or Division.
            </p>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
          >
            <option value="">All Categories</option>
            <option value="Coding competitions">Coding Competitions</option>
            <option value="Academic Topper">Academic Topper</option>
            <option value="Committee">Committee</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Technical">Technical</option>
            <option value="Other">Other</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
          >
            <option value="">All Types</option>
            <option value="Winner">Winner</option>
            <option value="Runner-up">Runner-up</option>
            <option value="Participation">Participation</option>
          </select>

          {/* Client-Side Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
          >
            <option value="">All Years</option>
            <option value="SE">Second Year (SE)</option>
            <option value="TE">Third Year (TE)</option>
            <option value="BE">Final Year (BE)</option>
          </select>

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
          >
            <option value="">All Divs</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>

        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setAppliedFilters({
                  search: searchQuery || undefined,
                  category: selectedCategory || undefined,
                  achievementType: selectedType || undefined,
                  year: selectedYear || undefined,
                  division: selectedDivision || undefined,
                });
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Achievements
            </button>

            {(searchQuery || selectedCategory || selectedType || selectedYear || selectedDivision) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedType("");
                  setSelectedYear("");
                  setSelectedDivision("");
                  setAppliedFilters({});
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <SendNotificationButton
              moduleKey="achievement"
              records={achievements}
              emailMap={achievementEmailMap}
              loadRecords={loadAllFilteredAchievementsForNotification}
              resolveEmailMap={buildEmailMapForAchievements}
              disabled={loading || achievements.length === 0}
              onSent={(recipientCount) =>
                toast.success(`Notification sent to ${recipientCount} students.`)
              }
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2">
              <button
                onClick={handleExport}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export
              </button>
              <div className="text-[11px] text-slate-600 leading-tight">
                <span className="font-semibold text-slate-800 block mb-0.5">How to export:</span>
                1. Click <span className="font-semibold text-blue-600">Find</span> to apply filters.<br />
                2. Click <span className="font-semibold text-emerald-600">Export</span> to download the data.
              </div>
            </div>
            <button
              onClick={() => { setAchievementToEdit(null); setIsFormModalOpen(true); }}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition flex items-center gap-2"
            >
              <span>+ Add Achievement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Achievements Container */}
      <div className="min-h-[60vh]">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading achievements...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && achievements.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-600 text-lg font-medium">
              {searchQuery || selectedCategory || selectedType
                ? "No achievements match your filters."
                : "No achievements found yet."}
            </p>
          </div>
        )}

        {/* Achievements Grid - 4 columns for compact cards */}
        {!loading && !error && achievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement?._id}
                achievement={achievement}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === achievement?._id}
              />
            ))}
          </div>
        )}

        {/* Pagination Component */}
        {!loading && !error && achievements.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={limit}
            onPageChange={(page) => setCurrentPage(page)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Detail Modal */}
      {selectedAchievement && (
        <DetailModal
          achievement={selectedAchievement}
          onClose={handleCloseModal}
        />
      )}

      {/* Form Modal (Add / Edit) */}
      <AchievementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        achievement={achievementToEdit}
        onSave={handleSaveAchievement}
      />
    </main>
  );
}