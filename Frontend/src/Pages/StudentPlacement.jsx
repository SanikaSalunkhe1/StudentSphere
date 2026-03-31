
import React, { useState, useEffect } from "react";
import { placementService } from "../services/placementService";
import { higherStudiesService } from "../services/higherStudiesService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// PlacementCard Component
function PlacementCard({ placement, onEdit, onDelete, isDeleting }) {
  const [imageError, setImageError] = React.useState(false);
  const certificateUrl = placement?.placementProof?.url;
  const isPDF = certificateUrl?.toLowerCase()?.endsWith('.pdf') || placement?.placementProof?.name?.toLowerCase()?.endsWith('.pdf');

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Certificate/Icon Section */}
      <div className="h-32 sm:h-36 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden relative">
        {certificateUrl && !imageError ? (
          <img
            src={certificateUrl.toLowerCase().endsWith('.pdf') ? certificateUrl.replace(/\.pdf$/i, '.jpg') : certificateUrl}
            alt={placement?.companyName || "Placement"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : isPDF ? (
          // PDF Icon Display
          <div className="flex flex-col items-center justify-center text-blue-600">
            <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold">PDF Certificate</span>
          </div>
        ) : (
          // Fallback Icon
          <svg
            className="w-12 h-12 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 7H7v6h6V7z" />
            <path
              fillRule="evenodd"
              d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1h1a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v1a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1H7a2 2 0 01-2-2v-1H4a1 1 0 110-2h1v-2H4a1 1 0 110-2h1V9H4a1 1 0 110-2h1V7a2 2 0 012-2h1V2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-2">
          {placement?.companyName || "N/A"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-2">
          <span className="font-semibold">Role:</span>{" "}
          {placement?.role || "N/A"}
        </p>
        <div className="mb-3">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full text-xs">
            {placement?.placementType || "N/A"}
          </span>
        </div>
        <div className="mt-auto space-y-2">
          {placement?.placementProof?.url && (
            <a
              href={placement.placementProof.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center block"
            >
              View Letter
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(placement)}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(placement._id)}
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

// HigherStudiesCard Component
function HigherStudiesCard({ study, onEdit, onDelete, isDeleting }) {
  const [imageError, setImageError] = React.useState(false);
  const certificateUrl = study?.marksheet?.url;
  const isPDF = certificateUrl?.toLowerCase()?.endsWith('.pdf') || study?.marksheet?.name?.toLowerCase()?.endsWith('.pdf');

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Certificate/Icon Section */}
      <div className="h-32 sm:h-36 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden relative">
        {certificateUrl && !imageError ? (
          <img
            src={certificateUrl.toLowerCase().endsWith('.pdf') ? certificateUrl.replace(/\.pdf$/i, '.jpg') : certificateUrl}
            alt={study?.examName || "Higher Studies"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : isPDF ? (
          // PDF Icon Display
          <div className="flex flex-col items-center justify-center text-green-600">
            <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold">PDF Marksheet</span>
          </div>
        ) : (
          // Fallback Icon
          <svg
            className="w-12 h-12 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
          </svg>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 line-clamp-2">
          {study?.examName || "N/A"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-2">
          <span className="font-semibold">Score:</span> {study?.score || "N/A"}
        </p>
        <div className="mb-3">
          <span className="px-2 py-1 bg-green-50 text-green-700 font-semibold rounded-full text-xs">
            Higher Studies
          </span>
        </div>
        <div className="mt-auto space-y-2">
          {study?.marksheet?.url && (
            <a
              href={study.marksheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors text-center block"
            >
              View Marksheet
            </a>
          )}
          {study?.idCardPhoto?.url && (
            <a
              href={study.idCardPhoto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center block"
            >
              View ID Card
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(study)}
              className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(study._id)}
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

export default function StudentPlacement() {
  const [placements, setPlacements] = useState([]);
  const [higherStudies, setHigherStudies] = useState([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("placement");
  const [editingId, setEditingId] = useState(null);
  const [deletingPlacementId, setDeletingPlacementId] = useState(null);
  const [deletingStudyId, setDeletingStudyId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Local Filters
  const [searchPlacement, setSearchPlacement] = useState("");
  const [filterPlacementType, setFilterPlacementType] = useState("");
  const [searchHigherStudies, setSearchHigherStudies] = useState("");
  const [filterExamName, setFilterExamName] = useState("");

  const [placementData, setPlacementData] = useState({
    companyName: "",
    role: "",
    placementType: "",
    package: "",
    placementYear: "",
    passoutYear: "",
    joiningYear: "",
    placementProof: null,
  });
  const [higherStudiesData, setHigherStudiesData] = useState({
    examName: "",
    score: "",
    marksheet: null,
    idCardPhoto: null,
  });

  const [placementProofPreview, setPlacementProofPreview] = useState("");
  const [marksheetPreview, setMarksheetPreview] = useState("");
  const [idCardPhotoPreview, setIdCardPhotoPreview] = useState("");

  useEffect(() => {
    fetchPlacements();
    fetchHigherStudies();
  }, []);

  const fetchPlacements = async () => {
    try {
      const response = await placementService.getOwnPlacements();
      const data = response.data || response.placements || response;
      setPlacements(Array.isArray(data) ? data : []);
    } catch (err) {
      setPlacements([]);
    } finally {
      setLoadingPlacements(false);
    }
  };

  const fetchHigherStudies = async () => {
    try {
      const response = await higherStudiesService.getOwnHigherStudies();
      const data = response.data || response.higherStudies || response;
      setHigherStudies(Array.isArray(data) ? data : []);
    } catch (err) {
      setHigherStudies([]);
    } finally {
      setLoadingStudies(false);
    }
  };

  const handlePlacementChange = (e) => {
    const { name, value } = e.target;
    setPlacementData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlacementFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size - 500KB max
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 500KB. Please upload a smaller file.');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Validate file type - only allow PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file for the placement proof.');
      e.target.value = ''; // Clear the file input
      return;
    }

    setPlacementData((prev) => ({
      ...prev,
      placementProof: file,
    }));
    setPlacementProofPreview(URL.createObjectURL(file));
  };

  const handleHigherStudiesChange = (e) => {
    const { name, value } = e.target;
    setHigherStudiesData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHigherStudiesFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size - 500KB max
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 500KB. Please upload a smaller file.');
      e.target.value = ''; // Clear the file input
      return;
    }

    // Validate file type - only allow PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file for the marksheet.');
      e.target.value = ''; // Clear the file input
      return;
    }

    setHigherStudiesData((prev) => ({
      ...prev,
      marksheet: file,
    }));
    setMarksheetPreview(URL.createObjectURL(file));
  };

  const handleIdCardPhotoChange = (e) => {
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

    setHigherStudiesData((prev) => ({
      ...prev,
      idCardPhoto: file,
    }));
    setIdCardPhotoPreview(URL.createObjectURL(file));
  };

  const resetPlacementForm = () => {
    setPlacementData({
      companyName: "",
      role: "",
      placementType: "",
      package: "",
      placementYear: "",
      passoutYear: "",
      joiningYear: "",
      placementProof: null,
    });
    setPlacementProofPreview("");
    setEditingId(null);
  };

  const resetHigherStudiesForm = () => {
    setHigherStudiesData({
      examName: "",
      score: "",
      marksheet: null,
      idCardPhoto: null,
    });
    setMarksheetPreview("");
    setIdCardPhotoPreview("");
    setEditingId(null);
  };

  const openFormForAddPlacement = () => {
    resetPlacementForm();
    setActiveTab("placement");
    setView("form");
  };

  const openFormForAddHigherStudies = () => {
    resetHigherStudiesForm();
    setActiveTab("higherStudies");
    setView("form");
  };

  const openFormForEditPlacement = (placement) => {
    setEditingId(placement._id);
    setPlacementData({
      companyName: placement.companyName || "",
      role: placement.role || "",
      placementType: placement.placementType || "",
      package: placement.package || "",
      placementYear: placement.placementYear || "",
      passoutYear: placement.passoutYear || "",
      joiningYear: placement.joiningYear || "",
      placementProof: null,
    });
    // Set preview URL from existing placement proof
    if (placement.placementProof?.url) {
      setPlacementProofPreview(placement.placementProof.url);
    } else {
      setPlacementProofPreview("");
    }
    setActiveTab("placement");
    setView("form");
  };

  const openFormForEditHigherStudies = (study) => {
    setEditingId(study._id);
    setHigherStudiesData({
      examName: study.examName || "",
      score: study.score || "",
      marksheet: null,
      idCardPhoto: null,
    });
    // Set preview URL from existing marksheet
    if (study.marksheet?.url) {
      setMarksheetPreview(study.marksheet.url);
    } else {
      setMarksheetPreview("");
    }
    // Set preview URL from existing ID card photo
    if (study.idCardPhoto?.url) {
      setIdCardPhotoPreview(study.idCardPhoto.url);
    } else {
      setIdCardPhotoPreview("");
    }
    setActiveTab("higherStudies");
    setView("form");
  };

  const backToList = () => {
    resetPlacementForm();
    resetHigherStudiesForm();
    setView("list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (activeTab === "placement") {
        const formData = new FormData();
        formData.append("companyName", placementData.companyName.trim());
        formData.append("role", placementData.role.trim());
        formData.append("placementType", placementData.placementType.trim());
        formData.append("package", placementData.package);
        formData.append("placementYear", placementData.placementYear.trim());
        formData.append("passoutYear", placementData.passoutYear.trim());
        formData.append("joiningYear", placementData.joiningYear.trim());
        if (placementData.placementProof) {
          formData.append("placementProof", placementData.placementProof);
        }
        if (editingId) {
          await placementService.updatePlacement(editingId, formData);
          toast.success("Placement updated successfully!");
        } else {
          await placementService.createPlacement(formData);
          toast.success("Placement saved successfully!");
        }
        resetPlacementForm();
        await fetchPlacements();
      } else {
        const formData = new FormData();
        formData.append("examName", higherStudiesData.examName.trim());
        formData.append("score", String(higherStudiesData.score).trim());
        if (higherStudiesData.marksheet) {
          formData.append("marksheet", higherStudiesData.marksheet);
        }
        if (higherStudiesData.idCardPhoto) {
          formData.append("idCardPhoto", higherStudiesData.idCardPhoto);
        }
        if (editingId) {
          await higherStudiesService.updateHigherStudy(editingId, formData);
          toast.success("Higher Studies updated successfully!");
        } else {
          await higherStudiesService.createHigherStudy(formData);
          toast.success("Higher Studies saved successfully!");
        }
        resetHigherStudiesForm();
        await fetchHigherStudies();
      }
      setTimeout(() => setView("list"), 500);
    } catch (error) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(err.message || `${err.field} is invalid`);
        });
      } else {
        toast.error(
          error.response?.data?.message ||
          "Failed to save data. Please try again."
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePlacement = async (id) => {
    if (!window.confirm("Delete this placement?")) return;
    setDeletingPlacementId(id);
    try {
      await placementService.deletePlacement(id);
      toast.success("Placement deleted successfully!");
      fetchPlacements();
    } catch (err) {
      toast.error("Failed to delete placement");
    } finally {
      setDeletingPlacementId(null);
    }
  };

  const handleDeleteHigherStudies = async (id) => {
    if (!window.confirm("Delete this higher studies record?")) return;
    setDeletingStudyId(id);
    try {
      await higherStudiesService.deleteHigherStudy(id);
      toast.success("Higher Studies deleted successfully!");
      fetchHigherStudies();
    } catch (err) {
      toast.error("Failed to delete higher studies");
    } finally {
      setDeletingStudyId(null);
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
          Back to Career Path
        </button>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {activeTab === "placement"
              ? editingId
                ? "Edit Placement"
                : "Add Placement"
              : editingId
                ? "Edit Higher Studies"
                : "Add Higher Studies"}
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            {activeTab === "placement"
              ? "Document your placement"
              : "Document your higher studies"}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-8">
              {activeTab === "placement" ? (
                <>
                  <div className="mb-10">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                      Placement Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          placeholder="Enter company name"
                          value={placementData.companyName}
                          onChange={handlePlacementChange}
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
                          placeholder="e.g., Software Engineer"
                          value={placementData.role}
                          onChange={handlePlacementChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Placement Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="placementType"
                        value={placementData.placementType}
                        onChange={handlePlacementChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                        required
                      >
                        <option value="">Select Placement Type</option>
                        <option value="Campus">Campus</option>
                        <option value="Off-Campus">Off-Campus</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Package (LPA) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="package"
                          placeholder="e.g. 12"
                          value={placementData.package}
                          onChange={handlePlacementChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                          min="1"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Placement Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="placementYear"
                          placeholder="YYYY-YY"
                          value={placementData.placementYear}
                          onChange={handlePlacementChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                          pattern="\d{4}-\d{2}"
                          title="Format: YYYY-YY (e.g., 2023-24)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Passout Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="passoutYear"
                          placeholder="YYYY-YY"
                          value={placementData.passoutYear}
                          onChange={handlePlacementChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                          pattern="\d{4}-\d{2}"
                          title="Format: YYYY-YY (e.g., 2023-24)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Joining Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="joiningYear"
                          placeholder="YYYY-YY"
                          value={placementData.joiningYear}
                          onChange={handlePlacementChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                          pattern="\d{4}-\d{2}"
                          title="Format: YYYY-YY (e.g., 2023-24)"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-blue-500">
                      Documentation
                    </h2>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Placement Proof
                      <span className="text-xs font-semibold text-red-600 ml-2 italic">
                        (Max 500KB | PDF)
                      </span>
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={
                            placementData.placementProof
                              ? placementData.placementProof.name
                              : "No file chosen"
                          }
                          placeholder="Upload Letter (PDF)"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                          readOnly
                        />
                      </div>
                      <label className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-sm">
                        UPLOAD
                        <input
                          type="file"
                          name="placementProof"
                          accept=".pdf"
                          onChange={handlePlacementFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Certificate Preview */}
                    {placementProofPreview && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-4 items-start">
                          {placementProofPreview.toLowerCase().endsWith('.pdf') ||
                            placementData.placementProof?.name?.toLowerCase().endsWith('.pdf') ? (
                            // PDF Preview
                            <div className="w-full h-96 bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden mb-2">
                              <object
                                data={placementProofPreview}
                                type="application/pdf"
                                className="w-full h-full"
                              >
                                <div className="flex items-center justify-center h-full text-slate-500">
                                  <p className="text-sm">Unable to display PDF preview. <a href={placementProofPreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download instead</a>.</p>
                                </div>
                              </object>
                            </div>
                          ) : (
                            // Image Preview
                            <img
                              src={placementProofPreview}
                              alt="Placement Proof Preview"
                              className="w-24 h-24 object-cover rounded border-2 border-blue-500"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-xs text-green-600 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Certificate ready to submit
                            </p>
                            <a
                              href={placementProofPreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Full Certificate
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-10">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-green-500">
                      Higher Studies Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Exam <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="examName"
                          value={higherStudiesData.examName}
                          onChange={handleHigherStudiesChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                          required
                        >
                          <option value="">Select Exam</option>
                          <option value="GATE">GATE</option>
                          <option value="CAT">CAT</option>
                          <option value="GRE">GRE</option>
                          <option value="TOEFL">TOEFL</option>
                          <option value="IELTS">IELTS</option>
                          <option value="UPSC">UPSC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Score <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="score"
                          placeholder="e.g., 750/990"
                          value={higherStudiesData.score}
                          onChange={handleHigherStudiesChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-green-500">
                      Documentation
                    </h2>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Marksheet (PDF)
                      <span className="text-xs font-semibold text-red-600 ml-2 italic">
                        (Max 500KB | PDF)
                      </span>
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={
                            higherStudiesData.marksheet
                              ? higherStudiesData.marksheet.name
                              : "No file chosen"
                          }
                          placeholder="Upload Marksheet (PDF)"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                          readOnly
                        />
                      </div>
                      <label className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition cursor-pointer shadow-sm">
                        UPLOAD
                        <input
                          type="file"
                          name="marksheet"
                          accept=".pdf"
                          onChange={handleHigherStudiesFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Marksheet Preview */}
                    {marksheetPreview && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex gap-4 items-start">
                          {marksheetPreview.toLowerCase().endsWith('.pdf') ||
                            higherStudiesData.marksheet?.name?.toLowerCase().endsWith('.pdf') ? (
                            // PDF Preview
                            <div className="w-full h-96 bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden mb-2">
                              <object
                                data={marksheetPreview}
                                type="application/pdf"
                                className="w-full h-full"
                              >
                                <div className="flex items-center justify-center h-full text-slate-500">
                                  <p className="text-sm">Unable to display PDF preview. <a href={marksheetPreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download instead</a>.</p>
                                </div>
                              </object>
                            </div>
                          ) : (
                            // Image Preview
                            <img
                              src={marksheetPreview}
                              alt="Marksheet Preview"
                              className="w-24 h-24 object-cover rounded border-2 border-green-500"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-xs text-green-600 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Marksheet ready to submit
                            </p>
                            <a
                              href={marksheetPreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 underline"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Full Certificate
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="block text-sm font-semibold text-slate-700 mb-2 mt-6">
                      ID Card Photo (If no ID Card, then upload any valid admission proof for higher studies.)
                      <span className="text-xs font-semibold text-red-600 ml-2 italic">
                        (Max 500KB | JPG, PNG)
                      </span>
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={
                            higherStudiesData.idCardPhoto
                              ? higherStudiesData.idCardPhoto.name
                              : "No file chosen"
                          }
                          placeholder="Upload ID Card Photo (JPG/PNG)"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm"
                          readOnly
                        />
                      </div>
                      <label className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition cursor-pointer shadow-sm">
                        UPLOAD
                        <input
                          type="file"
                          name="idCardPhoto"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleIdCardPhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* ID Card Preview */}
                    {idCardPhotoPreview && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex gap-4 items-start">
                          <img
                            src={idCardPhotoPreview}
                            alt="ID Card Photo Preview"
                            className="w-24 h-24 object-cover rounded border-2 border-green-500"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-green-600 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              ID Card Photo ready to submit
                            </p>
                            <a
                              href={idCardPhotoPreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 underline"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Full Image
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
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
                    ? "Update"
                    : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </main>
    );
  }

  // =============== LIST VIEW ===============
  const filteredPlacements = placements.filter(p => {
    const matchesSearch = searchPlacement
      ? (p.companyName?.toLowerCase().includes(searchPlacement.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchPlacement.toLowerCase()))
      : true;
    const matchesType = filterPlacementType
      ? p.placementType === filterPlacementType
      : true;
    return matchesSearch && matchesType;
  });

  const filteredHigherStudies = higherStudies.filter(s => {
    const matchesSearch = searchHigherStudies
      ? s.examName?.toLowerCase().includes(searchHigherStudies.toLowerCase())
      : true;
    const matchesExam = filterExamName
      ? s.examName === filterExamName
      : true;
    return matchesSearch && matchesExam;
  });

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Career Path
        </h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          Document your placement or higher studies journey
        </p>
      </div>

      {/* PLACEMENT SECTION */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Placements
            </h2>
            <p className="text-slate-600 mt-1">
              <span className="font-semibold text-blue-600">
                {filteredPlacements.length}
              </span>{" "}
              of {placements.length} placement(s)
            </p>
          </div>
          <button
            onClick={openFormForAddPlacement}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            + Add Placement
          </button>
        </div>

        {/* Placement Filters */}
        {placements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchPlacement}
              onChange={(e) => setSearchPlacement(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white flex-1 min-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterPlacementType}
              onChange={(e) => setFilterPlacementType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Campus">Campus</option>
              <option value="Off-Campus">Off-Campus</option>
            </select>
            {(searchPlacement || filterPlacementType) && (
              <button
                onClick={() => { setSearchPlacement(""); setFilterPlacementType(""); }}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {loadingPlacements && (
          <div className="flex items-center justify-center h-32">
            <p className="text-slate-600">Loading placements...</p>
          </div>
        )}
        {!loadingPlacements && placements.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 sm:p-16 text-center">
            <p className="text-slate-600">No placements yet.</p>
          </div>
        )}
        {!loadingPlacements && placements.length > 0 && filteredPlacements.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-slate-600 text-base font-medium">No placements match your search.</p>
          </div>
        )}
        {!loadingPlacements && filteredPlacements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPlacements.map((placement) => (
              <PlacementCard
                key={placement._id}
                placement={placement}
                onEdit={openFormForEditPlacement}
                onDelete={handleDeletePlacement}
                isDeleting={deletingPlacementId === placement._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* HIGHER STUDIES SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Higher Studies
            </h2>
            <p className="text-slate-600 mt-1">
              <span className="font-semibold text-green-600">
                {filteredHigherStudies.length}
              </span>{" "}
              of {higherStudies.length} record(s)
            </p>
          </div>
          <button
            onClick={openFormForAddHigherStudies}
            className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            + Add Higher Studies
          </button>
        </div>

        {/* Higher Studies Filters */}
        {higherStudies.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search exam..."
              value={searchHigherStudies}
              onChange={(e) => setSearchHigherStudies(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white flex-1 min-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filterExamName}
              onChange={(e) => setFilterExamName(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Exams</option>
              <option value="GATE">GATE</option>
              <option value="CAT">CAT</option>
              <option value="GRE">GRE</option>
              <option value="TOEFL">TOEFL</option>
              <option value="IELTS">IELTS</option>
              <option value="UPSC">UPSC</option>
            </select>
            {(searchHigherStudies || filterExamName) && (
              <button
                onClick={() => { setSearchHigherStudies(""); setFilterExamName(""); }}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {loadingStudies && (
          <div className="flex items-center justify-center h-32">
            <p className="text-slate-600">Loading higher studies...</p>
          </div>
        )}
        {!loadingStudies && higherStudies.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 sm:p-16 text-center">
            <p className="text-slate-600">No higher studies yet.</p>
          </div>
        )}
        {!loadingStudies && higherStudies.length > 0 && filteredHigherStudies.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-slate-600 text-base font-medium">No higher studies match your search.</p>
          </div>
        )}
        {!loadingStudies && filteredHigherStudies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredHigherStudies.map((study) => (
              <HigherStudiesCard
                key={study._id}
                study={study}
                onEdit={openFormForEditHigherStudies}
                onDelete={handleDeleteHigherStudies}
                isDeleting={deletingStudyId === study._id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}