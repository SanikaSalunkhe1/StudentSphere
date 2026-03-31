
import React, { useState, useEffect } from "react";
import { achievementService } from "../services/achievementService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// AchievementCard Component - COMPACT, BEAUTIFUL & RESPONSIVE
function AchievementCard({ achievement, onEdit, onDelete, isDeleting }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Image Section */}
      <div className="h-32 sm:h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        <img
          src={
            achievement?.photographs?.eventPhoto?.url ||
            "https://via.placeholder.com/300x200?text=Achievement"
          }
          alt={achievement?.title || "Achievement"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Category & Type Badge */}
        <div className="flex flex-wrap gap-2 mb-2 text-xs">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full">
            {achievement?.category || "N/A"}
          </span>
          <span className="px-2 py-1 bg-green-50 text-green-700 font-semibold rounded-full">
            {achievement?.achievementType || "N/A"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-2">
          {achievement?.title || "N/A"}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">
          {achievement?.description || "N/A"}
        </p>

        {/* Issued By */}
        <p className="text-xs sm:text-sm text-slate-500 mb-2">
          <span className="font-semibold">By:</span>{" "}
          {achievement?.issuedBy || "N/A"}
        </p>

        {/* Dates */}
        <p className="text-xs sm:text-sm text-slate-500 mb-3">
          {achievement?.date?.from
            ? new Date(achievement.date.from).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            : "N/A"}{" "}
          -{" "}
          {achievement?.date?.to
            ? new Date(achievement.date.to).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            : "N/A"}
        </p>

        {/* Team Members if any */}
        {achievement?.teamMembers && achievement.teamMembers.length > 0 && (
          <p className="text-xs sm:text-sm text-slate-600 mb-3">
            <span className="font-semibold">Team:</span>{" "}
            {achievement.teamMembers.join(", ")}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {achievement?.photographs?.eventPhoto?.url && (
              <a
                href={achievement.photographs.eventPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Photo
              </a>
            )}
            {achievement?.photographs?.certificate?.url && (
              <a
                href={achievement.photographs.certificate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors text-center"
              >
                Certificate
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(achievement)}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(achievement._id)}
              disabled={isDeleting}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${isDeleting
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-red-50 text-red-700 hover:bg-red-100"
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

export default function StudentAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // View state
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    studentID: "",
    category: "",
    otherCategory: "",
    title: "",
    description: "",
    issuedBy: "",
    dateFrom: "",
    dateTo: "",
    achievementType: "",
    teamMembers: "",
  });

  const [eventPhoto, setEventPhoto] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [eventPhotoPreview, setEventPhotoPreview] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");

  // Fetch achievements on mount
  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const studentId = localStorage.getItem("studentId");
      const data = await achievementService.getAchievementsByStu();
      setAchievements(Array.isArray(data) ? data : []);
      if (studentId) {
        setFormData((prev) => ({ ...prev, studentID: studentId }));
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
      toast.error("Failed to load achievements");
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size - 500KB max
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 500KB. Please upload a smaller file.');
      e.target.value = ''; // Clear the file input
      return;
    }

    if (type === "eventPhoto") {
      // Validate file type - only allow PNG and JPEG images for event photo
      const validImageTypes = ['image/png', 'image/jpeg'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please upload a PNG or JPG image for the event photo.');
        e.target.value = '';
        return;
      }
      setEventPhoto(file);
      setEventPhotoPreview(URL.createObjectURL(file));
    } else if (type === "certificate") {
      // Validate file type - allow PNG, JPEG, and PDF for certificate
      const validCertTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!validCertTypes.includes(file.type)) {
        toast.error('Please upload a PNG, JPG, or PDF file for the certificate.');
        e.target.value = '';
        return;
      }
      setCertificate(file);
      setCertificatePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    const studentId = localStorage.getItem("studentId");
    setFormData({
      studentID: studentId || "",
      category: "",
      otherCategory: "",
      title: "",
      description: "",
      issuedBy: "",
      dateFrom: "",
      dateTo: "",
      achievementType: "",
      teamMembers: "",
    });
    setEventPhoto(null);
    setCertificate(null);
    setEventPhotoPreview("");
    setCertificatePreview("");
    setEditingId(null);
  };

  const openFormForAdd = () => {
    resetForm();
    setView("form");
  };
  const openFormForEdit = (achievement) => {
    setEditingId(achievement._id);

    // Parse out custom "Other" category from description if it exists
    let parsedCategory = achievement.category || "";
    let parsedOther = "";
    let parsedDesc = achievement.description || "";

    if (parsedCategory === "Other" && parsedDesc.startsWith("Category ") && parsedDesc.includes(", ")) {
      const endIdx = parsedDesc.indexOf(", ");
      if (endIdx !== -1) {
        parsedOther = parsedDesc.substring(9, endIdx);
        parsedDesc = parsedDesc.substring(endIdx + 2).trim();
      }
    }

    setFormData({
      studentID:
        achievement.stuID || localStorage.getItem("studentId"),
      category: parsedCategory,
      otherCategory: parsedOther,
      title: achievement.title || "",
      description: parsedDesc,
      issuedBy: achievement.issuedBy || "",
      dateFrom: achievement.date?.from
        ? new Date(achievement.date.from).toISOString().split("T")[0]
        : "",
      dateTo: achievement.date?.to
        ? new Date(achievement.date.to).toISOString().split("T")[0]
        : "",
      achievementType: achievement.achievementType || "",
      teamMembers: achievement.teamMembers?.join(", ") || "",
    });
    setEventPhoto(null);
    setCertificate(null);
    if (achievement.photographs?.eventPhoto?.url) {
      setEventPhotoPreview(achievement.photographs.eventPhoto.url);
    }
    if (achievement.photographs?.certificate?.url) {
      setCertificatePreview(achievement.photographs.certificate.url);
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

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("title", formData.title.trim());

      // Handle injecting the "Other" specification into the description safely for regex
      let finalDescription = formData.description.trim();
      if (formData.category === "Other" && formData.otherCategory.trim()) {
        finalDescription = `Category ${formData.otherCategory.trim()}, ${finalDescription}`;
      }
      data.append("description", finalDescription);

      data.append("issuedBy", formData.issuedBy.trim());
      data.append("achievementType", formData.achievementType);

      // Send as simple keys, handled by backend
      data.append("dateFrom", formData.dateFrom);
      data.append("dateTo", formData.dateTo);

      if (formData.teamMembers) {
        const members = formData.teamMembers.split(",").map((m) => m.trim()).filter(m => m);
        members.forEach((member) => {
          data.append("teamMembers", member);
        });
      }
      if (eventPhoto) data.append("eventPhoto", eventPhoto);
      if (certificate) data.append("certificate", certificate);

      if (editingId) {
        await achievementService.updateAchievement(editingId, data);
        toast.success("Achievement updated successfully!");
      } else {
        if (!eventPhoto || !certificate) {
          toast.error(
            "Both event photo and certificate are required for new achievements."
          );
          setFormLoading(false);
          return;
        }
        await achievementService.createAchievement(data);
        toast.success("Achievement created successfully!");
      }
      resetForm();
      await fetchAchievements();
      setTimeout(() => setView("list"), 500);
    } catch (err) {
      console.error("Error saving achievement:", err);
      const resData = err.response?.data;

      if (resData?.errors && Array.isArray(resData.errors)) {
        resData.errors.forEach(e => toast.error(e.message || "Validation Error"));
      } else {
        toast.error(resData?.message || "Failed to save achievement.");
      }
    } finally {
      setFormLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?"))
      return;

    setDeletingId(id);
    try {
      await achievementService.deleteAchievement(id);
      toast.success("Achievement deleted successfully!");
      fetchAchievements();
    } catch (err) {
      console.error("Error deleting achievement:", err);
      toast.error("Failed to delete achievement");
    } finally {
      setDeletingId(null);
    }
  };

  // =============== FORM VIEW ===============
  if (view === "form") {
    return (
      <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />

        {/* Back Button */}
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
          Back to Achievements
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {editingId ? "Edit Achievement" : "Add New Achievement"}
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            {editingId
              ? "Update your achievement details"
              : "Record your accomplishments"}
          </p>
        </div>

        {/* Achievement Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-8">
              {/* SECTION: Basic Information */}
              <div className="mb-10">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Achievement Details
                </h2>

                {/* Row: Category & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Coding competitions">
                          Coding Competitions
                        </option>
                        <option value="Academic Topper">Academic Topper</option>
                        <option value="Committee">Committee</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Technical">Technical</option>
                        <option value="Other">Other</option>
                      </select>

                      {/* Please Specify Box */}
                      {formData.category === "Other" && (
                        <input
                          type="text"
                          name="otherCategory"
                          value={formData.otherCategory}
                          onChange={handleChange}
                          placeholder="Please specify custom category..."
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      )}
                    </div>
                  </div>
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Achievement title"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your achievement..."
                    rows="4"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    required
                  />
                </div>
                {/* Issued By & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Issued By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="issuedBy"
                      value={formData.issuedBy}
                      onChange={handleChange}
                      placeholder="Organization name"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Achievement Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="achievementType"
                      value={formData.achievementType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Participation">Participation</option>
                      <option value="Winner">Winner</option>
                      <option value="Runner-up">Runner-up</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Dates */}
              <div className="mb-10">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Timeline
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={formData.dateFrom}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateTo"
                      value={formData.dateTo}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Team Members
                    </label>
                    <input
                      type="text"
                      name="teamMembers"
                      value={formData.teamMembers}
                      onChange={handleChange}
                      placeholder="John, Jane, Bob..."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Uploads */}
              <div className="mb-8">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                  Uploads
                </h2>
                {/* Event Photo */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Photo{" "}
                    {!editingId && <span className="text-red-500">*</span>}
                    <span className="text-xs font-semibold text-red-600 ml-2 italic">
                      (Max 500KB | JPG, PNG)
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={
                          eventPhoto
                            ? eventPhoto.name
                            : eventPhotoPreview
                              ? "Current photo uploaded"
                              : "No file chosen"
                        }
                        placeholder="Upload Photo"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                        readOnly
                      />
                    </div>
                    <label className="px-5 py-2.5 mt-2 sm:mt-0 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm">
                      UPLOAD
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "eventPhoto")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {eventPhotoPreview && (
                    <img
                      src={eventPhotoPreview}
                      alt="Event Preview"
                      className="mt-3 w-24 h-24 object-cover rounded-lg border-2 border-blue-500"
                    />
                  )}
                </div>
                {/* Certificate */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Certificate{" "}
                    {!editingId && <span className="text-red-500">*</span>}
                    <span className="text-xs font-semibold text-red-600 ml-2 italic">
                      (Max 500KB | JPG, PNG, PDF)
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={
                          certificate
                            ? certificate.name
                            : certificatePreview
                              ? "Current certificate uploaded"
                              : "No file chosen"
                        }
                        placeholder="Upload Certificate"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                        readOnly
                      />
                    </div>
                    <label className="px-5 py-2.5 mt-2 sm:mt-0 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm">
                      UPLOAD
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, "certificate")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {certificatePreview && (
                    <div className="mt-3">
                      {certificatePreview.toLowerCase().endsWith('.pdf') || (certificate && certificate.type === 'application/pdf') ? (
                        <div className="w-full h-96 bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden mb-2">
                          <object
                            data={certificatePreview}
                            type="application/pdf"
                            className="w-full h-full"
                          >
                            <div className="flex items-center justify-center h-full text-slate-500">
                              <p className="text-sm">Unable to display PDF preview. <a href={certificatePreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download instead</a>.</p>
                            </div>
                          </object>
                        </div>
                      ) : (
                        <img
                          src={certificatePreview}
                          alt="Certificate Preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-blue-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Submit Button */}
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
                    ? "Update Achievement"
                    : "Submit Achievement"}
              </button>
            </div>
          </div>
        </form>
      </main>
    );
  }

  // =============== LIST VIEW ===============
  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Achievements
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Showing{" "}
            <span className="font-semibold text-blue-600">
              {achievements.length}
            </span>{" "}
            achievements
          </p>
        </div>
        {/* Add Button */}
        <button
          onClick={openFormForAdd}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          + Add Achievement
        </button>
      </div>
      {/* Cards Container */}
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
        {/* Empty State */}
        {!loading && achievements.length === 0 && (
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
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <p className="text-slate-600 text-base sm:text-lg font-medium">
              No achievements yet. Click "Add Achievement" to showcase your
              accomplishments!
            </p>
          </div>
        )}
        {/* Achievements Grid */}
        {!loading && achievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement._id}
                achievement={achievement}
                onEdit={openFormForEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === achievement._id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}