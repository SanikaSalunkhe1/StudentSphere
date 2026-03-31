import React, { useState, useEffect } from "react";
import { activityService } from "../services/activityService";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";
import SendNotificationButton from "../components/Common/SendNotificationButton";

// Activity Card Component - COMPACT & BEAUTIFUL
function ActivityCard({ activity, onView, onDelete, onEdit, isDeleting }) {

  // Student info helper - checks both populated 'stuID' and aggregated 'student' field
  const student = activity?.student || activity?.stuID;
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
      {/* Document/Image Preview Section */}
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
        {activity?.certificateURL?.url ? (
          activity.certificateURL.url.toLowerCase().endsWith(".pdf") ? (
            <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
              <iframe
                src={`${activity.certificateURL.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                title="PDF Preview"
                className="w-full h-full border-none pointer-events-none"
                scrolling="no"
                tabIndex="-1"
              />
              <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">PDF Preview</span>
              </div>
            </div>
          ) : (
            <img
              src={activity.certificateURL.url}
              alt={activity?.title || "Activity"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="text-slate-300 text-5xl font-bold">
            {activity?.title?.charAt(0) || "A"}
          </div>
        )}

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

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Student Name */}
        {studentName && (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
            <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
          </div>
        )}

        <div className="h-px bg-slate-100 mb-3" />

        {/* Activity Title */}
        <h3 className="text-sm font-bold text-blue-600 mb-2 line-clamp-2">
          {activity?.title || "No Title"}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 mb-2 line-clamp-1">
          {activity?.description || "No description"}
        </p>

        {/* Date Range */}
        <div className="mb-3 pb-3 border-b border-slate-100">
          <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              {activity?.date?.from && !isNaN(new Date(activity.date.from).getTime())
                ? new Date(activity.date.from).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                : "N/A"}
              {" — "}
              {activity?.date?.to && !isNaN(new Date(activity.date.to).getTime())
                ? new Date(activity.date.to).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                : "Present"}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => onView && onView(activity)}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => onEdit && onEdit(activity)}
              className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(activity._id)}
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
function DetailModal({ activity, onClose }) {
  const [student, setStudent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDbId = typeof activity.stuID === 'string' ? activity.stuID : activity.stuID?._id;
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
  }, [activity]);

  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Activity Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column: Student Profile & Info */}
              <div className="lg:col-span-5 space-y-6">

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

                {/* Activity Summary Card */}
                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-4">Activity Highlights</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-blue-100/80 mb-0.5">Title</p>
                      <p className="text-lg font-bold leading-tight">{activity.title}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-xs text-blue-100/80 mb-0.5">Date</p>
                        <p className="text-sm font-bold">
                          {activity.date?.from ? new Date(activity.date.from).toLocaleDateString() : "N/A"}
                          {" — "}
                          {activity.date?.to ? new Date(activity.date.to).toLocaleDateString() : "Present"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {activity.description && (
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Description
                    </h4>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 leading-relaxed italic">
                      "{activity.description}"
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Previews */}
              <div className="lg:col-span-7">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Certificate Preview
                </h4>

                <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden h-[400px] flex items-center justify-center relative group">
                  {activity.certificateURL?.url ? (
                    activity.certificateURL.url.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={`${activity.certificateURL.url}#view=FitH`}
                        title="Certificate PDF"
                        className="w-full h-full border-none shadow-2xl"
                      />
                    ) : (
                      <div className="w-full h-full p-4">
                        <img
                          src={activity.certificateURL.url}
                          alt="Certificate"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                    )
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-400">No Professional Certificate Uploaded</p>
                    </div>
                  )}

                  {activity.certificateURL?.url && (
                    <a
                      href={activity.certificateURL.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-blue-600 text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all border border-slate-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Open Original
                    </a>
                  )}
                </div>
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
// Form Modal Component (Add / Edit) - PREMIUM RE-DESIGN
function ActivityFormModal({ isOpen, onClose, activity, onSave }) {
  const [formData, setFormData] = useState({
    studentId: "",
    title: "",
    dateFrom: "",
    dateTo: "",
    description: "",
  });
  const [certificate, setCertificate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        // Extract student info from either 'student' (aggregate) or 'stuID' (populated)
        const studentInfo = activity.student || activity.stuID;
        const initialID = (typeof studentInfo === "object" ? studentInfo?.studentID : studentInfo) || "";

        setFormData({
          studentId: initialID,
          title: activity.title || "",
          dateFrom: (activity.date?.from && !isNaN(new Date(activity.date.from).getTime()))
            ? new Date(activity.date.from).toISOString().split('T')[0]
            : "",
          dateTo: (activity.date?.to && !isNaN(new Date(activity.date.to).getTime()))
            ? new Date(activity.date.to).toISOString().split('T')[0]
            : "",
          description: activity.description || "",
        });
      } else {
        setFormData({
          studentId: "",
          title: "",
          dateFrom: "",
          dateTo: "",
          description: "",
        });
      }
      setCertificate(null);
    }
  }, [isOpen, activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Size Validation (500KB)
    if (file.size > 500 * 1024) {
      toast.error("File size exceeds 500KB limit!");
      e.target.value = "";
      return;
    }

    // Type Validation (PDF/JPG/PNG)
    if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPG/PNG)!");
      e.target.value = "";
      return;
    }

    setCertificate(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "dateFrom") {
          data.append("date[from]", formData[key]);
        } else if (key === "dateTo") {
          data.append("date[to]", formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      });
      // Admin Hardcode: activity Type is always "Committee"
      data.append("type", "Committee");

      if (certificate) {
        data.append("certificate", certificate);
      }

      let response;
      if (activity) {
        response = await activityService.updateActivity(activity._id, data);
        toast.success("Activity updated successfully!");
      } else {
        response = await activityService.createActivity(data);
        toast.success("Activity added successfully!");
      }
      onSave(response.data || response);
      onClose();
    } catch (err) {
      console.error("Error saving activity:", err);
      const errorMessage =
        err.response?.data?.errors?.map(e => e.message).join(", ") ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save activity.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[95vh] flex flex-col">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 px-6 sm:px-8 py-6 sm:py-8 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -m-8 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>

          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {activity ? "Edit Record" : "Management"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-white overflow-y-auto custom-scrollbar">
          {/* Student ID Field - Styled with Icon */}
          <div className="space-y-1.5 sm:space-y-2.5">
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identity Confirmation</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input
                type="text"
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter Student ID (e.g. 2024COMP123)"
                disabled={!!activity}
                className="w-full pl-11 pr-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm sm:text-base font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            {activity && <p className="text-[9px] text-amber-600 font-bold ml-1 italic opacity-80">* Identity cannot be modified during editing</p>}
          </div>

          {/* Activity Title - Featured Input */}
          <div className="space-y-1.5 sm:space-y-2.5">
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Activity Title</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Annual Technical Symposium"
                className="w-full pl-11 pr-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm sm:text-base font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
              />
            </div>
          </div>

          {/* Date Range - Compact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2.5">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Commencement Date</label>
              <div className="relative group">
                <input
                  type="date"
                  name="dateFrom"
                  required
                  value={formData.dateFrom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm sm:text-base font-bold text-slate-700 focus:bg-white focus:border-blue-600 transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2.5">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Completion Date</label>
              <div className="relative group">
                <input
                  type="date"
                  name="dateTo"
                  required
                  value={formData.dateTo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm sm:text-base font-bold text-slate-700 focus:bg-white focus:border-blue-600 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2.5">
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Narrative Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe roles, responsibilities, and achievements..."
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm sm:text-base font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 transition-all outline-none resize-none"
            ></textarea>
          </div>

          {/* Certificate Selection Box - Custom Styled */}
          <div className="space-y-1.5 sm:space-y-2.5">
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Proof of Participation</label>
            <div className="relative">
              <input
                type="file"
                id="cert-upload"
                accept=".pdf, image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="cert-upload"
                className="flex items-center justify-center gap-4 w-full p-6 border-2 border-dashed border-slate-200 rounded-[1.5rem] hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-black text-slate-700 group-hover:text-blue-700 transition-colors">
                    {certificate ? certificate.name : "Click to select certificate"}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest italic leading-tight">* Max 500KB, PDF/JPG/PNG only</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-500 text-sm font-black hover:bg-slate-200 transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm sm:text-base font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Commit Activity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Admin Activity Component
export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({});
  const [activityEmailMap, setActivityEmailMap] = useState({});
  const [emailCache, setEmailCache] = useState({});

  // Fetch activities from backend when component loads or pagination changes
  useEffect(() => {
    fetchActivities(currentPage);
  }, [currentPage, limit, appliedFilters]);

  const fetchActivities = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...appliedFilters,
      };
      const response = await activityService.getAllActivities(params);

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

      setActivities(data);
      setActivityEmailMap(resolvedMap);
      setEmailCache((prev) => ({ ...prev, ...resolvedMap }));
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Backend might not be running!");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFilteredActivitiesForNotification = async () => {
    const firstPageResponse = await activityService.getAllActivities({
      ...appliedFilters,
      page: 1,
      limit: 50,
    });
    const all = [...(firstPageResponse?.data || [])];
    const pages = firstPageResponse?.totalPages || 1;
    if (pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, idx) =>
          activityService.getAllActivities({ ...appliedFilters, page: idx + 2, limit: 50 })
        )
      );
      rest.forEach((res) => { if (Array.isArray(res?.data)) all.push(...res.data); });
    }
    return all;
  };

  const buildEmailMapForActivities = async (records = []) => {
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
      const blob = await activityService.exportActivities(appliedFilters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Activities_Export_${new Date().toLocaleDateString("en-IN")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Error exporting activities:", err);
      toast.error("Failed to export activities. Please try again.");
    }
  };

  const handleView = (activity) => {
    setSelectedActivity(activity);
  };

  const handleCloseModal = () => {
    setSelectedActivity(null);
  };

  const handleEdit = (activity) => {
    setActivityToEdit(activity);
    setIsFormModalOpen(true);
  };

  const handleAddActivity = () => {
    setActivityToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleSaveActivity = (updatedItem) => {
    if (activityToEdit) {
      // Local update for edits
      setActivities((prev) =>
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
      // For new activities, a refetch is safer to maintain sorting/pagination
      fetchActivities(currentPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?"))
      return;
    setDeletingId(id);
    try {
      await activityService.deleteActivity(id);
      // Remove from local state
      setActivities((prev) => prev.filter((a) => a._id !== id));
      setTotalRecords((prev) => prev - 1);
      toast.success("Activity deleted successfully");
    } catch (err) {
      console.error("Error deleting activity:", err);
      toast.error("Failed to delete activity.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Activities</h1>
        <p className="text-slate-600 mt-2">
          Showing{" "}
          <span className="font-semibold text-blue-600">
            {totalRecords}
          </span>{" "}
          activities
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by title, description, or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
              <span className="font-semibold text-blue-600">Note:</span> The search box filters by <strong className="text-slate-700">Title</strong>, <strong className="text-slate-700">Description</strong>, <strong className="text-slate-700">First Name</strong>, and <strong className="text-slate-700">Last Name</strong>.
            </p>
          </div>


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

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setAppliedFilters({
                  search: searchQuery || undefined,
                  year: selectedYear || undefined,
                  division: selectedDivision || undefined,
                });
                setCurrentPage(1);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Activities
            </button>

            {(searchQuery || selectedYear || selectedDivision) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedYear("");
                  setSelectedDivision("");
                  setAppliedFilters({});
                  setCurrentPage(1);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons Group */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto md:ml-auto">
            <SendNotificationButton
              moduleKey="activity"
              records={activities}
              emailMap={activityEmailMap}
              loadRecords={loadAllFilteredActivitiesForNotification}
              resolveEmailMap={buildEmailMapForActivities}
              disabled={loading || activities.length === 0}
              onSent={(recipientCount) =>
                toast.success(`Notification sent to ${recipientCount} students.`)
              }
            />

            {/* Export Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 sm:flex-none">
              <button
                onClick={handleExport}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <div className="text-[11px] text-slate-600 leading-tight">
                <span className="font-semibold text-slate-800 block mb-0.5">How to export:</span>
                1. Click <span className="font-semibold text-blue-600">Find</span> to apply filters.<br />
                2. Click <span className="font-semibold text-green-600">Export</span> to download the data.
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddActivity}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add Activity
            </button>
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="min-h-[60vh]">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading activities...</p>
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
        {!loading && !error && activities.length === 0 && (
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="text-slate-600 text-lg font-medium">
              {searchQuery || selectedYear || selectedDivision
                ? "No activities match your filters."
                : "No activities found yet."}
            </p>
          </div>
        )}

        {/* Activities Grid - 4 columns for compact cards */}
        {!loading && !error && activities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {activities.map((activity) => (
              <ActivityCard
                key={activity?._id}
                activity={activity}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === activity?._id}
              />
            ))}
          </div>
        )}

        {/* Pagination Component */}
        {!loading && !error && activities.length > 0 && (
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
      {selectedActivity && (
        <DetailModal
          activity={selectedActivity}
          onClose={handleCloseModal}
        />
      )}

      {/* Form Modal (Add / Edit) */}
      <ActivityFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        activity={activityToEdit}
        onSave={handleSaveActivity}
      />
    </main>
  );
}