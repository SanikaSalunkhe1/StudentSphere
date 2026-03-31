
import React, { useState, useEffect } from "react";
import { internshipService } from "../services/internshipService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// InternshipCard Component - COMPACT, BEAUTIFUL & RESPONSIVE
function InternshipCard({ internship, onEdit, onDelete, isDeleting }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Image Section */}
      <div className="h-32 sm:h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        <img
          src={
            internship?.photoProof?.url ||
            "https://via.placeholder.com/300x200?text=Internship"
          }
          alt={internship?.companyName || "Internship"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Company Name */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-2">
          {internship?.companyName || "N/A"}
        </h3>
        {/* Role */}
        <p className="text-xs sm:text-sm text-slate-600 mb-2">
          <span className="font-semibold">Role:</span>{" "}
          {internship?.role || "N/A"}
        </p>
        {/* Duration & Type Badges */}
        <div className="flex gap-2 flex-wrap mb-2 text-xs">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full">
            {internship?.durationMonths || "N/A"} months
          </span>
          {internship?.stipendInfo?.isPaid ? (
            <span className="px-2 py-1 bg-green-50 text-green-700 font-semibold rounded-full">
              ₹{internship.stipendInfo.stipend}/mo
            </span>
          ) : (
            <span className="px-2 py-1 bg-orange-50 text-orange-700 font-semibold rounded-full">
              Unpaid
            </span>
          )}
        </div>
        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">
          {internship?.description || "N/A"}
        </p>
        {/* Dates */}
        <p className="text-xs sm:text-sm text-slate-500 mb-3">
          {internship?.startDate
            ? new Date(internship.startDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
            : "N/A"}{" "}
          -{" "}
          {internship?.endDate
            ? new Date(internship.endDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
            : "N/A"}
        </p>
        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {internship?.photoProof?.url && (
              <a
                href={internship.photoProof.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Photo
              </a>
            )}
            {internship?.internshipReport?.url && (
              <a
                href={internship.internshipReport.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors text-center"
              >
                Report
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(internship)}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(internship._id)}
              disabled={isDeleting}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${isDeleting
                ? "bg-red-200 text-red-500 cursor-not-allowed"
                : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function StudentInternship() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Local Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIsPaid, setFilterIsPaid] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    startDate: "",
    endDate: "",
    durationMonths: "",
    isPaid: "",
    stipend: "",
    description: "",
  });

  const [photoProof, setPhotoProof] = useState(null);
  const [internshipReport, setInternshipReport] = useState(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const [reportFileName, setReportFileName] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [reportPreview, setReportPreview] = useState("");

  useEffect(() => {
    fetchInternships();
  }, []);

  // Auto-calculate duration to match backend Joi exact validation
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        // Backend math: Math.round(diffDays / 30) || 0
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        const diffMonths = Math.round(diffDays / 30) || 0;

        setFormData((prev) => ({
          ...prev,
          // Automatically cap to valid minimums on the form if desired, 
          // but strict match requires sending exactly the calculated months
          durationMonths: diffMonths.toString()
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const fetchInternships = async () => {
    try {
      const response = await internshipService.getOwnInternships();
      const data = response.data || response.internships || response;
      setInternships(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching internships:", err);
      toast.error("Failed to load internships");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const formatIndianCurrency = (val) => {
    if (!val) return "";
    const num = val.toString().replace(/,/g, "");
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "stipend") {
      // Remove commas before saving to state
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue) || rawValue === "") {
        setFormData((prev) => ({ ...prev, [name]: rawValue }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size - 500KB max
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 500KB. Please upload a smaller photo.');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Validate file type - only allow PNG and JPEG images
    const validImageTypes = ['image/png', 'image/jpeg'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a PNG or JPG image only.');
      e.target.value = ''; // Clear the file input
      return;
    }

    setPhotoProof(file);
    setPhotoFileName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleReportChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size - 500KB max
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 500KB. Please upload a smaller report.');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Validate file type - only allow PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file for the report.');
      e.target.value = ''; // Clear the file input
      return;
    }

    setInternshipReport(file);
    setReportFileName(file.name);
    setReportPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      role: "",
      startDate: "",
      endDate: "",
      durationMonths: "",
      isPaid: "",
      stipend: "",
      description: "",
    });
    setPhotoProof(null);
    setInternshipReport(null);
    setPhotoFileName("");
    setReportFileName("");
    setPhotoPreview("");
    setReportPreview("");
    setEditingId(null);
  };

  const openFormForAdd = () => {
    resetForm();
    setView("form");
  };

  const openFormForEdit = (internship) => {
    setEditingId(internship._id);
    setFormData({
      companyName: internship.companyName || "",
      role: internship.role || "",
      startDate: internship.startDate
        ? new Date(internship.startDate).toISOString().split("T")[0]
        : "",
      endDate: internship.endDate
        ? new Date(internship.endDate).toISOString().split("T")[0]
        : "",
      durationMonths: internship.durationMonths || "",
      isPaid: internship.stipendInfo?.isPaid ? "paid" : "unpaid",
      stipend: internship.stipendInfo?.stipend || "",
      description: internship.description || "",
    });
    setPhotoProof(null);
    setInternshipReport(null);
    setPhotoPreview("");
    setReportPreview("");
    setPhotoFileName(internship.photoProof?.url ? "Current photo uploaded" : "");
    if (internship.photoProof?.url) {
      setPhotoPreview(internship.photoProof.url);
    }
    setReportFileName(internship.internshipReport?.url ? "Current report uploaded" : "");
    if (internship.internshipReport?.url) {
      setReportPreview(internship.internshipReport.url);
    }
    setView("form");
  };

  const backToList = () => {
    resetForm();
    setView("list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (formData.description.length < 10) {
      toast.error("Description must be at least 10 characters long");
      setFormLoading(false);
      return;
    }
    if (!photoProof && !editingId) {
      toast.error("Please upload internship photo");
      setFormLoading(false);
      return;
    }
    if (!internshipReport && !editingId) {
      toast.error("Please upload internship report PDF");
      setFormLoading(false);
      return;
    }
    try {
      const data = new FormData();
      data.append("companyName", formData.companyName.trim());
      data.append("role", formData.role.trim());
      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      data.append("durationMonths", formData.durationMonths);
      data.append("isPaid", formData.isPaid === "paid");
      if (formData.isPaid === "paid") {
        data.append("stipend", String(formData.stipend).trim());
      }
      data.append("description", formData.description.trim());
      if (photoProof) data.append("photoProof", photoProof);
      if (internshipReport) data.append("internshipReport", internshipReport);

      if (editingId) {
        await internshipService.updateInternship(editingId, data);
        toast.success("Internship updated successfully!");
      } else {
        await internshipService.createInternship(data);
        toast.success("Internship added successfully!");
      }
      resetForm();
      await fetchInternships();
      setTimeout(() => setView("list"), 500);
    } catch (err) {
      const resData = err.response?.data;

      if (resData?.errors && Array.isArray(resData.errors)) {
        resData.errors.forEach(e => toast.error(e.message || "Validation Error"));
      } else {
        toast.error(resData?.message || "Failed to save internship");
      }
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?"))
      return;

    setDeletingId(id);
    try {
      await internshipService.deleteInternship(id);
      toast.success("Internship deleted successfully!");
      fetchInternships();
    } catch (err) {
      console.error("Error deleting internship:", err);
      toast.error("Failed to delete internship");
    } finally {
      setDeletingId(null);
    }
  };

  // =============== FORM VIEW ===============
  if (view === "form") {
    return (
      <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        <button
          onClick={backToList}
          className="mb-6 px-4 py-2.5 rounded-lg bg-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-400 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Internships
        </button>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {editingId ? "Edit Internship" : "Add New Internship"}
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            {editingId
              ? "Update your internship details"
              : "Document your internship journey and achievements"}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-8">
              {/* Company Info */}
              <div className="mb-10">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Company Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g., Software Developer"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Duration & Dates */}
              <div className="mb-10">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Duration & Timeline
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Duration (Months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="durationMonths"
                      value={formData.durationMonths}
                      onChange={handleChange}
                      placeholder="1-6  "
                      min="1"
                      max="6"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Compensation */}
              <div className="mb-10">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Compensation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Stipend Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="isPaid"
                      value={formData.isPaid}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                      required
                    >
                      <option value="">Select Stipend Type</option>
                      <option value="paid">Stipend - Paid</option>
                      <option value="unpaid">Stipend - Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Stipend Amount (₹)
                    </label>
                    <input
                      type="text"
                      name="stipend"
                      value={formatIndianCurrency(formData.stipend)}
                      onChange={handleChange}
                      placeholder="e.g. 10,000"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                      disabled={formData.isPaid !== "paid"}
                      required={formData.isPaid === "paid"}
                    />
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="mb-10">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Experience Details
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                    <span className="text-slate-500 font-normal ml-2">
                      (minimum 10 characters)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your internship experience, responsibilities, and learnings..."
                    rows="4"
                    minLength={10}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    required
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    {formData.description.length}/10 characters minimum
                  </div>
                </div>
              </div>
              {/* File Uploads */}
              <div className="mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Documentation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Internship Photo{" "}
                      {!editingId && <span className="text-red-500">*</span>}
                      <span className="text-xs font-semibold text-red-600 ml-2 italic">
                        (Max 500KB | JPG, PNG)
                      </span>
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={photoFileName || "No file chosen"}
                          placeholder="Upload Photo"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                          readOnly
                        />
                      </div>
                      <label className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm">
                        UPLOAD
                        <input
                          type="file"
                          accept="image/jpeg, image/png"
                          onChange={handlePhotoChange}
                          className="hidden"
                          required={!editingId}
                        />
                      </label>
                    </div>

                    {/* Photo Preview */}
                    {photoPreview && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-4 items-start">
                          <img
                            src={photoPreview}
                            alt="Photo Proof Preview"
                            className="w-24 h-24 object-cover rounded border-2 border-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-green-600 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Photo ready to submit
                            </p>
                            <a
                              href={photoPreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Full Photo
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Report Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Report (PDF){" "}
                      {!editingId && <span className="text-red-500">*</span>}
                      <span className="text-xs font-semibold text-red-600 ml-2 italic">
                        (Max 500KB | PDF)
                      </span>
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={reportFileName || "No file chosen"}
                          placeholder="Upload PDF"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                          readOnly
                        />
                      </div>
                      <label className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm">
                        UPLOAD
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleReportChange}
                          className="hidden"
                          required={!editingId}
                        />
                      </label>
                    </div>

                    {/* Report Preview */}
                    {reportPreview && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-4 items-start">
                          {reportPreview.toLowerCase().endsWith('.pdf') ||
                            reportFileName?.toLowerCase().endsWith('.pdf') ? (
                            // PDF Preview
                            <div className="w-full h-96 bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden mb-2">
                              <object
                                data={reportPreview}
                                type="application/pdf"
                                className="w-full h-full"
                              >
                                <div className="flex items-center justify-center h-full text-slate-500">
                                  <p className="text-sm">Unable to display PDF preview. <a href={reportPreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download instead</a>.</p>
                                </div>
                              </object>
                            </div>
                          ) : (
                            // Image Preview fallback
                            <img
                              src={reportPreview}
                              alt="Report Preview"
                              className="w-24 h-24 object-cover rounded border-2 border-blue-500"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={backToList}
                className="px-6 py-2.5 rounded-lg bg-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {formLoading
                  ? "Submitting..."
                  : editingId
                    ? "Update Internship"
                    : "Submit Internship"}
              </button>
            </div>
          </div>
        </form>
      </main>
    );
  }

  // =============== LIST VIEW ===============
  const filteredInternships = internships.filter((internship) => {
    const matchesSearch = searchQuery
      ? (internship.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.role?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesPaid = filterIsPaid
      ? (filterIsPaid === "paid" ? internship.stipendInfo?.isPaid : !internship.stipendInfo?.isPaid)
      : true;

    return matchesSearch && matchesPaid;
  });

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Internships
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Showing{" "}
            <span className="font-semibold text-blue-600">
              {filteredInternships.length}
            </span>{" "}
            of {internships.length} internships
          </p>
        </div>
        <button
          onClick={openFormForAdd}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          + Add Internship
        </button>
      </div>

      {/* Local Filters */}
      {internships.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white flex-1 min-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterIsPaid}
            onChange={(e) => setFilterIsPaid(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types (Paid/Unpaid)</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          {(searchQuery || filterIsPaid) && (
            <button
              onClick={() => { setSearchQuery(""); setFilterIsPaid(""); }}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className="min-h-[60vh]">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading internships...</p>
            </div>
          </div>
        )}
        {!loading && internships.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 sm:p-16 text-center">
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
                d="M21 13v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7m18 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v4m18 0H3m12-4V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7"
              />
            </svg>
            <p className="text-slate-600 text-base sm:text-lg font-medium">
              No internships yet. Click "Add Internship" to document your
              experience!
            </p>
          </div>
        )}
        {!loading && internships.length > 0 && filteredInternships.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-slate-600 text-base font-medium">No internships match your filter criteria.</p>
          </div>
        )}
        {!loading && filteredInternships.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredInternships.map((internship) => (
              <InternshipCard
                key={internship._id}
                internship={internship}
                onEdit={openFormForEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === internship._id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}