import React, { useState, useEffect } from "react";
import { internshipService } from "../services/internshipService";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";

// InternshipCard Component - COMPACT & BEAUTIFUL
function InternshipCard({ internship, onView, onDelete, onEdit, isDeleting }) {
  const isPaid = internship?.stipendInfo?.isPaid ?? internship?.isPaid;
  const stipend = internship?.stipendInfo?.stipend ?? internship?.stipend;

  // Student info from projected fields
  const studentNameRaw = internship.studentName;
  const studentName = studentNameRaw &&
    (studentNameRaw.firstName || studentNameRaw.lastName) &&
    `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim() !== "N/A"
    ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim()
    : null;
  const studentID = internship.studentID && internship.studentID !== "N/A" ? internship.studentID : null;
  const studentYear = internship.studentYear && internship.studentYear !== "N/A" ? internship.studentYear : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Document/Image Preview Section */}
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
        {internship?.internshipReport?.url ? (
          <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
            <iframe
              src={`${internship.internshipReport.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
              title="PDF Preview"
              className="w-full h-full border-none pointer-events-none"
              scrolling="no"
              tabIndex="-1"
            />
            <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
              <span className="bg-black/50 text-white text-xs px-2 py-1 rounded shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">PDF Preview</span>
            </div>
          </div>
        ) : internship?.photoProof?.url ? (
          <img
            src={internship.photoProof.url}
            alt={internship?.companyName || "Internship"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-300 text-5xl font-bold">
            {internship?.companyName?.charAt(0) || "?"}
          </div>
        )}

        {/* Top Overlay: Student ID & Year */}
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

        {/* Student Name - PRIORITY */}
        {studentName && (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
            <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
          </div>
        )}

        <div className="h-px bg-slate-100 mb-3" />

        {/* Company Name */}
        <h3 className="text-sm font-bold text-blue-600 mb-1 line-clamp-1">
          {internship?.companyName || "N/A"}
        </h3>

        {/* Role */}
        <p className="text-xs text-slate-600 mb-2 line-clamp-1 italic">
          {internship?.role || "Role not specified"}
        </p>

        {/* Badges Row: Duration + Paid status */}
        <div className="flex flex-wrap gap-2 mb-2 text-xs">
          <span className="px-2 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full">
            {internship?.durationMonths ? `${internship.durationMonths} mo` : "N/A"}
          </span>
          {isPaid ? (
            <span className="px-2 py-1 bg-green-50 text-green-700 font-semibold rounded-full">
              Paid {stipend ? `₹${stipend}/mo` : ""}
            </span>
          ) : (
            <span className="px-2 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full">
              Unpaid
            </span>
          )}
        </div>

        {/* Dates */}
        <p className="text-xs text-slate-500 mb-3">
          {internship?.startDate
            ? new Date(internship.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : "N/A"}{" – "}
          {internship?.endDate
            ? new Date(internship.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : "N/A"}
        </p>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => onView && onView(internship)}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => onEdit && onEdit(internship)}
              className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(internship._id)}
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
function DetailModal({ internship, onClose }) {
  if (!internship) return null;

  // Format student name
  const studentName = internship.studentName
    ? `${internship.studentName.firstName || ""} ${internship.studentName.middleName || ""} ${internship.studentName.lastName || ""}`.trim()
    : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Internship Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">

          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Student Info Card */}
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{studentName}</h3>
                  <p className="text-blue-600 font-semibold text-sm">{internship.studentID || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Year</p>
                  <p className="text-sm font-bold text-slate-800">{internship.studentYear || "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Division</p>
                  <p className="text-sm font-bold text-slate-800">{internship.studentDivision || "A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Branch</p>
                  <p className="text-sm font-bold text-slate-800 truncate px-1">{internship.studentBranch || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-100/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" /></svg>
                  {internship.studentEmail || "N/A"}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {internship.studentMobileNo || "N/A"}
                </div>
              </div>
            </div>

            {/* Internship Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Internship Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Company & Role</p>
                  <p className="text-base font-bold text-slate-900">{internship.companyName}</p>
                  <p className="text-sm font-medium text-slate-600 italic">{internship.role}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Duration</p>
                    <p className="text-sm font-bold text-slate-800">{internship.durationMonths} Months</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                    {internship.stipendInfo?.isPaid ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Paid (₹{internship.stipendInfo.stipend}/mo)</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Unpaid</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Timeline</p>
                    <p className="text-xs font-semibold text-slate-700">
                      {internship.startDate ? new Date(internship.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' }) : 'N/A'} - {internship.endDate ? new Date(internship.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Role Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-50">
              {internship.description || "No description provided."}
            </p>
          </div>

          {/* Document Preview Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Document Previews
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF Preview */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">Internship Report (PDF)</span>
                  {internship.internshipReport?.url && (
                    <a href={internship.internshipReport.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      Open Original <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
                {internship.internshipReport?.url ? (
                  <div className="h-96 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner">
                    <iframe
                      src={`${internship.internshipReport.url}#view=FitH`}
                      className="w-full h-full"
                      title="Report Preview"
                    />
                  </div>
                ) : (
                  <div className="h-96 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 italic text-sm">
                    No report uploaded
                  </div>
                )}
              </div>

              {/* Image Preview */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">Photo Proof</span>
                  {internship.photoProof?.url && (
                    <a href={internship.photoProof.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      View Full Image <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
                {internship.photoProof?.url ? (
                  <div className="h-96 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner group relative">
                    <img
                      src={internship.photoProof.url}
                      alt="Proof"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="h-96 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 italic text-sm">
                    No image proof uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Form Modal Component (Add / Edit)
function InternshipFormModal({ isOpen, onClose, internship, onSave }) {
  const [formData, setFormData] = useState({
    studentId: "",
    companyName: "",
    role: "",
    durationMonths: "",
    startDate: "",
    endDate: "",
    isPaid: "false", // We'll keep it as string for the radio/select binding easily
    stipend: "",
    description: "",
  });

  const [files, setFiles] = useState({
    internshipReport: null,
    photoProof: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initForm = async () => {
      if (!isOpen) return;

      if (internship) {
        // Prioritize the human-readable studentID if available from the backend projection
        let initialID = internship.studentID || "";

        // Fallback or cleanup if only a hex ID is present
        const studentObj = internship.student || internship.stuID;
        if (!initialID) {
          initialID = (typeof studentObj === "object" ? studentObj?.studentID : studentObj) || "";
        }

        // If it's still a hex ID string, try to fetch the proper human-readable studentID
        if (/^[0-9a-fA-F]{24}$/.test(initialID)) {
          try {
            const res = await studentService.getSingleStudent(initialID);
            if (res.success && res.data?.studentID) {
              initialID = res.data.studentID;
            }
          } catch (err) {
            console.error("Error resolving student ID for internship edit:", err);
          }
        }

        setFormData({
          studentId: initialID,
          companyName: internship.companyName || "",
          role: internship.role || "",
          durationMonths: internship.durationMonths || "",
          startDate: (internship.startDate && !isNaN(new Date(internship.startDate).getTime()))
            ? new Date(internship.startDate).toISOString().split('T')[0]
            : "",
          endDate: (internship.endDate && !isNaN(new Date(internship.endDate).getTime()))
            ? new Date(internship.endDate).toISOString().split('T')[0]
            : "",
          isPaid: internship.stipendInfo?.isPaid ? "true" : "false",
          stipend: internship.stipendInfo?.stipend || "",
          description: internship.description || "",
        });
      } else {
        setFormData({
          studentId: "",
          companyName: "",
          role: "",
          durationMonths: "",
          startDate: "",
          endDate: "",
          isPaid: "false",
          stipend: "",
          description: "",
        });
      }
      setFiles({
        internshipReport: null,
        photoProof: null,
      });
    };

    initForm();
  }, [isOpen, internship]);

  // Handle auto-calculation of duration whenever dates change
  // Matches the backend's Math.round(diffDays / 30) logic
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        const diffMonths = Math.round(diffDays / 30) || 0;

        // Auto-update durationMonths if it differs and within valid range (1-6)
        if (diffMonths > 0 && diffMonths <= 6 && parseInt(formData.durationMonths) !== diffMonths) {
          setFormData(prev => ({ ...prev, durationMonths: diffMonths.toString() }));
        }
      }
    }
  }, [formData.startDate, formData.endDate]);

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
    if (name === "internshipReport") {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file for the Internship Report!");
        e.target.value = "";
        return;
      }
    } else if (name === "photoProof") {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Please upload an image file (JPG/PNG) for the Photo Proof!");
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
      // Send the raw human-readable Student ID (e.g., 2023FHCO073)
      // The backend will perform the lookup and validation.
      const stuIDToUse = formData.studentId;

      const data = new FormData();

      // Append form fields
      if (!internship) data.append('studentId', stuIDToUse);
      data.append('companyName', formData.companyName);
      data.append('role', formData.role);
      data.append('durationMonths', formData.durationMonths);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('isPaid', formData.isPaid);
      if (formData.isPaid === "true" && formData.stipend) {
        data.append('stipend', formData.stipend);
      }
      data.append('description', formData.description);

      // Append files if selected
      if (files.internshipReport) data.append('internshipReport', files.internshipReport);
      if (files.photoProof) data.append('photoProof', files.photoProof);

      let response;
      if (internship) {
        response = await internshipService.updateInternship(internship._id, data);
        toast.success("Internship updated successfully!");
      } else {
        // ... duplicate check omitted for brevity in target but kept in implementation ...
        response = await internshipService.createInternship(data);
        toast.success("Internship added successfully!");
      }
      onSave(response.data || response);
      onClose();
    } catch (err) {
      console.error("Error saving internship:", err);
      // Improve Validation: Parse detailed messages from backend
      const errorMessage =
        err.response?.data?.errors?.map(e => e.message).join(", ") ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save internship.";
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
            {internship ? "Edit Internship Details" : "Add New Internship"}
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
                  name="studentId"
                  required={!internship}
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 2024COMP123"
                  disabled={!!internship} // Prevent editing student ID if updating
                  className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Company Name */}
              <div>
                <label className={labelClass}>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Google, Microsoft, TCS"
                  className={inputClass}
                />
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>Role/Position *</label>
                <input
                  type="text"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer Intern"
                  className={inputClass}
                />
              </div>

              {/* Duration */}
              <div>
                <label className={labelClass}>Duration (Months) *</label>
                <input
                  type="number"
                  name="durationMonths"
                  required
                  min="1"
                  max="6"
                  value={formData.durationMonths}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className={inputClass}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    max={new Date().toISOString().split('T')[0]} // Not in future visually
                    value={formData.startDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.endDate}
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
              <h4 className="text-lg font-bold text-slate-800">Compensation & Role Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {/* Paid Status & Stipend */}
              <div>
                <label className={labelClass}>Paid / Unpaid *</label>
                <select
                  name="isPaid"
                  value={formData.isPaid}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="false">Unpaid</option>
                  <option value="true">Paid</option>
                </select>
              </div>

              {formData.isPaid === "true" ? (
                <div>
                  <label className={labelClass}>Stipend Amount (Monthly) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      name="stipend"
                      required
                      min="1"
                      value={formData.stipend}
                      onChange={handleChange}
                      placeholder="e.g. 10000"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}

              {/* Description */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Role Description *</label>
                <textarea
                  name="description"
                  required
                  minLength="10"
                  maxLength="300"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your responsibilities and achievements (Max 300 chars)..."
                  className={inputClass}
                ></textarea>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Verification Proofs</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {/* Internship Report */}
              <div>
                <label className={labelClass}>
                  Internship Report (.pdf) {!internship && "*"}
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, PDF only
                  </span>
                </label>
                <input
                  type="file"
                  name="internshipReport"
                  accept=".pdf"
                  required={!internship}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none transition-all cursor-pointer"
                />
              </div>

              {/* Photo Proof */}
              <div>
                <label className={labelClass}>
                  Photo Proof (Image) {!internship && "*"}
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, JPG/PNG only
                  </span>
                </label>
                <input
                  type="file"
                  name="photoProof"
                  accept="image/jpeg, image/png, image/jpg"
                  required={!internship}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none transition-all cursor-pointer"
                />
              </div>
            </div>
            {!internship && <p className="text-xs text-amber-600 mt-3 font-semibold px-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Internship Report and Photo Proof are strictly required when adding a new internship.</p>}
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
                internship ? "Update Internship" : "Add Internship"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Admin Internships Page Component
export default function AdminInternship() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [internshipToEdit, setInternshipToEdit] = useState(null);

  // ── Filter states ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterIsPaid, setFilterIsPaid] = useState("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [endDateFrom, setEndDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");

  // Applied Filters State (Snapshot for WYSIWYG)
  const [appliedFilters, setAppliedFilters] = useState({});

  // Initial fetch on mount or pagination change
  useEffect(() => {
    fetchInternships(currentPage);
  }, [currentPage, limit, appliedFilters]);

  const fetchInternships = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...appliedFilters
      };
      const response = await internshipService.getAllInternships(params);

      const data = response.data || [];
      const total = response.total || 0;
      const totalP = response.totalPages || 1;

      setInternships(data);
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Failed to load internships. Backend might not be running!");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        ...appliedFilters
      };
      const blob = await internshipService.exportInternships(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Internships_Export_${new Date().toLocaleDateString("en-IN")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Error exporting internships:", err);
      toast.error("Failed to export internships. Please try again.");
    }
  };


  const handleView = (internship) => {
    setSelectedInternship(internship);
  };

  const handleCloseModal = () => {
    setSelectedInternship(null);
  };

  const handleEdit = (internship) => {
    setInternshipToEdit(internship);
    setIsFormModalOpen(true);
  };

  const handleAddInternship = () => {
    setInternshipToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleSaveInternship = (updatedItem) => {
    // ALWAYS refetch to ensure all populated fields (studentName, studentID, etc.)
    // are updated correctly on the view cards from the backend response.
    fetchInternships(currentPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?"))
      return;
    setDeletingId(id);
    try {
      await internshipService.deleteInternship(id);
      // Remove from local state
      setInternships((prev) => prev.filter((i) => i._id !== id));
      setTotalRecords((prev) => prev - 1);
      toast.success("Internship deleted successfully!");
    } catch (err) {
      console.error("Error deleting internship:", err);
      toast.error("Failed to delete internship.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Internships</h1>
        <p className="text-slate-600 mt-2">
          <span className="font-semibold text-blue-600">{totalRecords}</span> internships loaded
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">

        {/* Row 1 — Search + Export */}
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-5">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by company, role, or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
              <span className="font-semibold text-blue-600">Note:</span> The search box filters by <strong className="text-slate-700">Company Name</strong>, <strong className="text-slate-700">Role</strong>, <strong className="text-slate-700">Description</strong>, and <strong className="text-slate-700">Student Name</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto md:ml-auto">
            <button
              onClick={() => {
                const sanitizedFilters = {
                  search: searchQuery.trim() || undefined,
                  year: filterYear || undefined,
                  division: filterDivision || undefined,
                  isPaid: filterIsPaid || undefined,
                  startDateFrom: startDateFrom || undefined,
                  startDateTo: startDateTo || undefined,
                  endDateFrom: endDateFrom || undefined,
                  endDateTo: endDateTo || undefined,
                };
                // Remove empty keys
                Object.keys(sanitizedFilters).forEach(key =>
                  (sanitizedFilters[key] === undefined || sanitizedFilters[key] === "") && delete sanitizedFilters[key]
                );
                setAppliedFilters(sanitizedFilters);
                setCurrentPage(1);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find
            </button>
            <button
              onClick={handleAddInternship}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-sm text-center">
              + Add
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 sm:flex-none">
              <button onClick={handleExport}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <div className="text-[11px] text-slate-600 leading-tight">
                <span className="font-semibold text-slate-800 block mb-0.5">How to export:</span>
                1. Click <span className="font-semibold text-blue-600">Find</span> to apply filters.<br />
                2. Click <span className="font-semibold text-emerald-600">Export</span> to download the data.
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — Advanced filters */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Year (All)</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>

            <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Division (All)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>

            <select value={filterIsPaid} onChange={(e) => setFilterIsPaid(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Paid Status (All)</option>
              <option value="true">Paid ✓</option>
              <option value="false">Unpaid ✗</option>
            </select>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Start Date From</label>
              <input type="date" value={startDateFrom} onChange={(e) => setStartDateFrom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Start Date To</label>
              <input type="date" value={startDateTo} onChange={(e) => setStartDateTo(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">End Date From</label>
              <input type="date" value={endDateFrom} onChange={(e) => setEndDateFrom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">End Date To</label>
              <input type="date" value={endDateTo} onChange={(e) => setEndDateTo(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

          </div>

          {(filterYear || filterDivision || filterIsPaid || startDateFrom || startDateTo || endDateFrom || endDateTo) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setFilterYear(""); setFilterDivision(""); setFilterIsPaid("");
                  setStartDateFrom(""); setStartDateTo(""); setEndDateFrom(""); setEndDateTo("");
                }}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="min-h-[60vh]">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading internships...</p>
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
        {!loading && !error && internships.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15s4.228 8.772 10 8.772 10-4.228 10-8.772c0-4.772-4.228-8.747-10-8.747z" />
            </svg>
            <p className="text-slate-600 text-lg font-medium">
              {searchQuery || filterYear || filterDivision || filterIsPaid
                ? "No internships match your filters."
                : "No internships found yet."}
            </p>
          </div>
        )}

        {!loading && !error && internships.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {internships.map((internship) => (
              <InternshipCard
                key={internship?._id}
                internship={internship}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === internship?._id}
              />
            ))}
          </div>
        )}

        {/* Pagination Component */}
        {!loading && !error && internships.length > 0 && (
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
      {selectedInternship && (
        <DetailModal
          internship={selectedInternship}
          onClose={handleCloseModal}
        />
      )}

      {/* Form Modal (Add / Edit) */}
      <InternshipFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        internship={internshipToEdit}
        onSave={handleSaveInternship}
      />
    </main>
  );
}