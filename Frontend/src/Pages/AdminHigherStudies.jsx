
import React, { useEffect, useState } from "react";
import { higherStudiesService } from "../services/higherStudiesService";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";

function HigherStudyCard({ higherStudy, onView, onDelete, onEdit, isDeleting }) {
  const studentNameRaw = higherStudy.studentName;
  const studentName = studentNameRaw ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim() : "N/A";
  const studentID = higherStudy.studentID || "N/A";
  const studentYear = higherStudy.studentYear || "N/A";

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
        {higherStudy?.marksheet?.url ? (
          higherStudy.marksheet.url.toLowerCase().endsWith(".pdf") ? (
            <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
              <iframe
                src={`${higherStudy.marksheet.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                title="PDF Preview"
                className="w-full h-full border-none pointer-events-none"
                scrolling="no"
                tabIndex="-1"
              />
              <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  PDF Preview
                </span>
              </div>
            </div>
          ) : (
            <img
              src={higherStudy.marksheet.url}
              alt={higherStudy?.examName || "Higher Study"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="text-slate-300 text-5xl font-bold">
            {higherStudy?.examName?.charAt(0) || "?"}
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 rounded shadow-sm border border-white/20 uppercase tracking-tighter">
            {studentID}
          </span>
          <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white rounded shadow-sm border border-blue-500/20 uppercase tracking-tighter font-mono">
            {studentYear}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
          <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
        </div>

        <div className="h-px bg-slate-100 mb-3" />

        <h3 className="text-sm font-bold text-blue-600 mb-1 line-clamp-2">
          {higherStudy?.examName || "N/A"}
        </h3>

        <div className="mb-3">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Exam Score</p>
          <p className="text-lg font-black text-slate-900">{higherStudy?.score || "N/A"}</p>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => onView && onView(higherStudy)}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => onEdit && onEdit(higherStudy)}
              className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(higherStudy._id)}
              disabled={isDeleting}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                isDeleting
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

function DetailModal({ item, onClose }) {
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!item?.stuID) return;
      setLoadingStudent(true);
      try {
        const studentId = typeof item.stuID === "string" ? item.stuID : item.stuID._id;
        const res = await studentService.getSingleStudent(studentId);
        if (res.success) setStudentDetails(res.data);
      } catch (err) {
        console.error("Error fetching student details for modal:", err);
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudent();
  }, [item]);

  if (!item) return null;

  const studentNameRaw = studentDetails?.name || item.studentName;
  const studentName = studentNameRaw
    ? `${studentNameRaw.firstName || ""} ${studentNameRaw.middleName || ""} ${studentNameRaw.lastName || ""}`.trim()
    : "N/A";

  const studentID =
    studentDetails?.studentID ||
    (typeof item.stuID === "string" ? item.stuID : item.stuID?.studentID) ||
    "N/A";

  const marksheetUrl = item.marksheet?.url || item.marksheet;
  const idCardUrl = item.idCardPhoto?.url || item.idCardPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Higher Study Details</h2>
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

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
              {loadingStudent && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold uppercase">
                  {studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{studentName}</h3>
                  <p className="text-blue-600 font-semibold text-sm">{studentID}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Year</p>
                  <p className="text-sm font-bold text-slate-800">{studentDetails?.year || item.studentYear || "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Division</p>
                  <p className="text-sm font-bold text-slate-800">{studentDetails?.division || "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Branch</p>
                  <p className="text-sm font-bold text-slate-800 truncate px-1">{studentDetails?.branch || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-100/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" /></svg>
                  {studentDetails?.email || "N/A"}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {studentDetails?.mobileNo || "N/A"}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                Exam Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Exam Name</p>
                  <p className="text-lg font-bold text-slate-900">{item.examName}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block px-8 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Score</p>
                  <p className="text-2xl font-black text-blue-600">{item.score}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Document Previews
            </h4>

            <div className={`grid grid-cols-1 ${idCardUrl ? "lg:grid-cols-2" : ""} gap-6`}>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">Marksheet</span>
                  {marksheetUrl && (
                    <a href={marksheetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      Open Original
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>

                {marksheetUrl ? (
                  <div className="h-[450px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner">
                    {marksheetUrl.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={`${marksheetUrl}#view=FitH`}
                        className="w-full h-full border-none"
                        title="Document Preview"
                      />
                    ) : (
                      <img
                        src={marksheetUrl}
                        alt="Preview"
                        className="w-full h-full object-contain p-2"
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-64 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 italic text-sm">
                    No document uploaded
                  </div>
                )}
              </div>

              {idCardUrl && (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">ID Card Photo</span>
                    <a href={idCardUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      View Full
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                  <div className="h-[450px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
                    <img
                      src={idCardUrl}
                      alt="ID Card"
                      className="max-w-full max-h-full object-contain p-2 hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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

function HigherStudyFormModal({ isOpen, onClose, higherStudy, onSave }) {
  const [formData, setFormData] = useState({
    studentId: "",
    examName: "GATE",
    score: "",
  });
  const [marksheet, setMarksheet] = useState(null);
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (higherStudy) {
      setFormData({
        studentId: higherStudy.studentID || "",
        examName: higherStudy.examName || "GATE",
        score: higherStudy.score || "",
      });
    } else {
      setFormData({
        studentId: "",
        examName: "GATE",
        score: "",
      });
    }
    setMarksheet(null);
    setIdCardPhoto(null);
  }, [isOpen, higherStudy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("File size exceeds 500KB limit!");
      e.target.value = "";
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPG/PNG)!");
      e.target.value = "";
      return;
    }

    setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => payload.append(key, formData[key]));

      if (marksheet) payload.append("marksheet", marksheet);
      if (idCardPhoto) payload.append("idCardPhoto", idCardPhoto);

      let response;
      if (higherStudy) {
        response = await higherStudiesService.updateHigherStudy(higherStudy._id, payload);
        toast.success("Higher study record updated successfully!");
      } else {
        if (!marksheet || !idCardPhoto) {
          toast.error("Both Marksheet and ID Card Photo are required for new records.");
          setLoading(false);
          return;
        }
        response = await higherStudiesService.createHigherStudy(payload);
        toast.success("Higher study record added successfully!");
      }

      onSave(response.data || response);
      onClose();
    } catch (err) {
      console.error("Error saving higher study:", err);
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 z-20 px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {higherStudy ? "Edit Higher Study Details" : "Add New Higher Study"}
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
              <h4 className="text-lg font-bold text-slate-800">Exam Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className={labelClass}>Student ID *</label>
                <input type="text" name="studentId" required={!higherStudy} disabled={!!higherStudy} value={formData.studentId} onChange={handleChange} placeholder="e.g. 2024COMP123" className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Exam Name *</label>
                <select name="examName" required value={formData.examName} onChange={handleChange} className={inputClass}>
                  <option value="GATE">GATE</option>
                  <option value="CAT">CAT</option>
                  <option value="GRE">GRE</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="IELTS">IELTS</option>
                  <option value="UPSC">UPSC</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Score *</label>
                <input type="text" name="score" required value={formData.score} onChange={handleChange} placeholder="e.g. 98.5% or 165/155" className={inputClass} />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Verification Proofs</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className={labelClass}>
                  Marksheet (.pdf / image) {!higherStudy && "*"}
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, PDF/JPG/PNG only
                  </span>
                </label>
                <input type="file" accept=".pdf, image/jpeg, image/png, image/jpg" onChange={(e) => handleFileChange(e, setMarksheet)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none transition-all cursor-pointer" />
              </div>
              <div>
                <label className={labelClass}>
                  ID Card Photo {!higherStudy && "*"}
                  <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                    * Max 500KB, JPG/PNG only
                  </span>
                </label>
                <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => handleFileChange(e, setIdCardPhoto)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none transition-all cursor-pointer" />
              </div>
            </div>
            {!higherStudy && <p className="text-xs text-amber-600 mt-3 font-semibold px-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Both Marksheet and ID Card Photo are strictly required when adding a new record.</p>}
          </section>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-6 flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                higherStudy ? "Update Higher Study" : "Add Higher Study"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminHigherStudies() {
  const [higherStudies, setHigherStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [hsFilterYear, setHsFilterYear] = useState("");
  const [hsFilterDivision, setHsFilterDivision] = useState("");
  const [hsFilterExamName, setHsFilterExamName] = useState("");
  const [hsFilterAcademicYear, setHsFilterAcademicYear] = useState("");
  const [hsFilterScore, setHsFilterScore] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [isHigherStudyModalOpen, setIsHigherStudyModalOpen] = useState(false);
  const [higherStudyToEdit, setHigherStudyToEdit] = useState(null);

  const fetchHigherStudies = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        year: hsFilterYear || undefined,
        division: hsFilterDivision || undefined,
        examName: hsFilterExamName || undefined,
        academicYear: hsFilterAcademicYear || undefined,
        score: hsFilterScore || undefined,
      };

      const response = await higherStudiesService.getAllHigherStudies(params);
      const data = response.data || [];
      const total = response.total || 0;
      const totalP = response.totalPages || 1;

      setHigherStudies(data);
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching higher studies:", err);
      setError("Failed to load higher studies!");
      setHigherStudies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHigherStudies(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const handleViewHigherStudy = (higherStudy) => setSelectedItem(higherStudy);
  const handleCloseModal = () => setSelectedItem(null);
  const handleSaveHigherStudy = () => fetchHigherStudies(currentPage);

  const handleDeleteHigherStudy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this higher study record?")) return;
    setDeletingId(id);
    try {
      await higherStudiesService.deleteHigherStudy(id);
      setHigherStudies((prev) => prev.filter((h) => h._id !== id));
      setTotalRecords((prev) => prev - 1);
      toast.success("Higher study record deleted successfully!");
    } catch (err) {
      console.error("Error deleting higher study:", err);
      toast.error("Failed to delete higher study record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    try {
      if (higherStudies.length === 0) {
        toast.warn("No data available to export.");
        return;
      }

      setLoading(true);
      const params = {
        search: searchQuery || undefined,
        year: hsFilterYear || undefined,
        division: hsFilterDivision || undefined,
        examName: hsFilterExamName || undefined,
        academicYear: hsFilterAcademicYear || undefined,
        score: hsFilterScore || undefined,
      };

      const blob = await higherStudiesService.exportHigherStudies(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Higher_Studies_Export_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("✅ Exported successfully!");
    } catch (err) {
      console.error("Error exporting data:", err);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Higher Studies</h1>
        <p className="text-slate-600 mt-2">
          Manage <span className="font-semibold text-blue-600">{totalRecords}</span> higher studies
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-5">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by exam name or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
              <span className="font-semibold text-blue-600">Note:</span> Search filters by <strong className="text-slate-700">Exam Name</strong>, <strong className="text-slate-700">Student ID</strong>, and <strong className="text-slate-700">Student Name</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto md:ml-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 sm:flex-none">
              <button
                onClick={handleExport}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>

            <button
              onClick={() => { setHigherStudyToEdit(null); setIsHigherStudyModalOpen(true); }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center"
            >
              + Add Higher Study
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <select value={hsFilterYear} onChange={(e) => setHsFilterYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Year (All)</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>

            <select value={hsFilterDivision} onChange={(e) => setHsFilterDivision(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Division (All)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>

            <select value={hsFilterExamName} onChange={(e) => setHsFilterExamName(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Exam (All)</option>
              <option value="GATE">GATE</option>
              <option value="CAT">CAT</option>
              <option value="GRE">GRE</option>
              <option value="TOEFL">TOEFL</option>
              <option value="IELTS">IELTS</option>
              <option value="UPSC">UPSC</option>
            </select>

            <input type="text" placeholder="Academic Year (e.g. 2024-2025)" value={hsFilterAcademicYear} onChange={(e) => setHsFilterAcademicYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Score (Partial Match)" value={hsFilterScore} onChange={(e) => setHsFilterScore(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mt-3 flex gap-3">
            <button onClick={() => fetchHigherStudies(1)} className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Higher Studies
            </button>
            <button onClick={() => { setHsFilterYear(""); setHsFilterDivision(""); setHsFilterExamName(""); setHsFilterAcademicYear(""); setHsFilterScore(""); fetchHigherStudies(1); }} className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[60vh]">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && higherStudies.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 text-lg font-medium">
              {searchQuery ? "No higher studies match your search." : "No higher studies found!"}
            </p>
          </div>
        )}

        {!loading && !error && higherStudies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {higherStudies.map((h) => (
              <HigherStudyCard
                key={h._id}
                higherStudy={h}
                onView={handleViewHigherStudy}
                onEdit={(hs) => { setHigherStudyToEdit(hs); setIsHigherStudyModalOpen(true); }}
                onDelete={handleDeleteHigherStudy}
                isDeleting={deletingId === h._id}
              />
            ))}
          </div>
        )}

        {!loading && !error && higherStudies.length > 0 && (
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

      {selectedItem && <DetailModal item={selectedItem} onClose={handleCloseModal} />}

      <HigherStudyFormModal
        isOpen={isHigherStudyModalOpen}
        higherStudy={higherStudyToEdit}
        onClose={() => setIsHigherStudyModalOpen(false)}
        onSave={handleSaveHigherStudy}
      />
    </main>
  );
}
