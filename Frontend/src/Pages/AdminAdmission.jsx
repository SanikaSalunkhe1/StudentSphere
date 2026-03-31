import React, { useState, useEffect } from "react";
import { admissionService } from "../services/admissionService";
import { toast, Toaster } from "react-hot-toast";
import Pagination from "../components/Common/Pagination";

// ==================== COMPONENTS ====================

function AdmissionCard({ admission, onView, onEdit, onDelete, isDeleting }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // Safe Data Extraction
  const studentId =
    typeof admission?.stuID === "string"
      ? admission.stuID
      : admission?.stuID?.studentID || "N/A";

  const studentName =
    typeof admission?.stuID === "object" && admission.stuID?.name
      ? typeof admission.stuID.name === "object"
        ? `${admission.stuID.name.firstName || ""} ${admission.stuID.name.lastName || ""
          }`.trim() || "Student"
        : admission.stuID.name
      : "Student";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col h-full group relative">
      {/* Top Banner - Subtle Status Color */}
      <div className={`h-20 w-full bg-gradient-to-br transition-all duration-300 ${admission?.status === 'approved' ? 'from-emerald-600 to-teal-700' : admission?.status === 'rejected' ? 'from-rose-600 to-red-700' : 'from-blue-600 to-indigo-700'}`}>
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20`}>
            {admission?.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Profile Photo (Initial-Avatar) */}
      <div className="relative px-6 -mt-10 mb-4 flex items-end justify-between">
        <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-xl group-hover:scale-105 transition-transform duration-500">
          <div className={`w-full h-full rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-inner bg-gradient-to-br ${admission?.status === 'approved' ? 'from-emerald-500 to-teal-600' : admission?.status === 'rejected' ? 'from-rose-500 to-red-600' : 'from-blue-500 to-indigo-600'}`}>
            {studentName.charAt(0)}
          </div>
        </div>
        <div className="text-right pb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Student ID</p>
          <p className="text-xs font-bold text-slate-700 font-mono tracking-tighter">{studentId}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 pb-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-0.5 group-hover:text-blue-600 transition-colors">
            {studentName}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission Record</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
          <div>
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Course</span>
            <span className="text-xs font-bold text-slate-700 truncate block">{admission?.course || "N/A"}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Roll Number</span>
            <span className="text-xs font-bold text-slate-700 block">{admission?.rollno || "N/A"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onView && onView(admission)}
              className="px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              View Details
            </button>
            <button
              onClick={() => onEdit && onEdit(admission)}
              className="px-3 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
              Edit
            </button>
          </div>
          <button
            onClick={() => onDelete && onDelete(admission._id)}
            disabled={isDeleting}
            className={`w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border active:scale-95 ${isDeleting
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              }`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ admission, onClose }) {
  if (!admission) return null;

  // Safe Data Extraction
  const student = admission.stuID || {};
  const studentName = typeof student.name === "object"
    ? `${student.name.firstName || ""} ${student.name.lastName || ""}`.trim()
    : student.name || "Student";
  const studentId = student.studentID || student._id || "N/A";
  const year = admission.year || student.year || "N/A";
  const div = admission.div || student.division || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admission Details</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6">

          {/* Main Info Section */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-full sm:w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden border border-slate-200 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                {admission.stuID?.studentPhoto?.url ? (
                  <img src={admission.stuID.studentPhoto.url} alt={studentName} className="w-full h-full object-cover" />
                ) : (
                  studentName.charAt(0)
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 pt-2">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{studentName}</h3>
                <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">
                  {studentId}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${admission.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : admission.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {admission.status || "Pending"}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  {admission.course || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Roll Number</p>
              <p className="text-sm font-bold text-slate-800">{admission.rollno || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Year & Division</p>
              <p className="text-sm font-bold text-slate-800">{year} - {div}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Admission Date</p>
              <p className="text-sm font-bold text-slate-800">
                {admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Financial & Scholarship</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-xs text-slate-500 font-bold">Scholarship</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${admission.isScholarshipApplied ? 'text-green-600' : 'text-slate-400'}`}>
                    {admission.isScholarshipApplied ? 'Applied' : 'Not Applied'}
                  </span>
                </div>
                {!admission.isScholarshipApplied && admission.scholarshipNotAppliedReason && (
                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reason</p>
                    <p className="text-xs text-slate-600 italic">"{admission.scholarshipNotAppliedReason}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500 font-bold">MahaDBT Form</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${admission.isMahadbtFormSubmitted ? 'text-green-600' : 'text-amber-600'}`}>
                    {admission.isMahadbtFormSubmitted ? 'Submitted' : 'Pending'}
                  </span>
                </div>
                {admission.isMahadbtFormSubmitted ? (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-xs">
                    <span className="text-slate-400 font-bold">Filled Date</span>
                    <span className="text-slate-700 font-bold">{new Date(admission.mahadbtFilledDate).toLocaleDateString()}</span>
                  </div>
                ) : admission.mahadbtNotFilledReason && (
                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reason</p>
                    <p className="text-xs text-slate-600 italic">"{admission.mahadbtNotFilledReason}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Migration Details</h4>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Migration Certificate</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${admission.hasMigrationCertificate ? 'text-green-600' : 'text-amber-600'}`}>
                  {admission.hasMigrationCertificate ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {admission.hasMigrationCertificate ? (
                <div className="flex justify-between items-center pt-2 border-t border-slate-50 text-xs">
                  <span className="text-slate-400 font-bold">Expected Date</span>
                  <span className="text-slate-700 font-bold">{new Date(admission.migrationExpectedDate).toLocaleDateString()}</span>
                </div>
              ) : admission.migrationNotAvailableReason && (
                <div className="mt-2 pt-2 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reason</p>
                  <p className="text-xs text-slate-600 italic">"{admission.migrationNotAvailableReason}"</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAdmissionModal({ isOpen, onClose, onAdded }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    div: "A",
    rollno: "",
    course: "Computer Engineering",
    fees: "",
    isScholarshipApplied: false, scholarshipNotAppliedReason: "",
    isMahadbtFormSubmitted: false, mahadbtFilledDate: "", mahadbtNotFilledReason: "",
    hasMigrationCertificate: false, migrationExpectedDate: "", migrationNotAvailableReason: "",
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const submitData = { ...form };
      // Clean up irrelevant fields based on booleans to prevent Joi errors

      if (submitData.isScholarshipApplied) {
        delete submitData.scholarshipNotAppliedReason;
      }
      if (submitData.isMahadbtFormSubmitted) {
        delete submitData.mahadbtNotFilledReason;
      } else {
        delete submitData.mahadbtFilledDate;
      }
      if (submitData.hasMigrationCertificate) {
        delete submitData.migrationNotAvailableReason;
      } else {
        delete submitData.migrationExpectedDate;
      }

      const response = await admissionService.createAdmission(submitData);

      toast.success("✅ Admission added successfully.");
      onAdded(response.data || response);
      onClose();
      // Reset form
      setForm({
        studentId: "", academicYear: "",
        div: "", rollno: "", course: "Computer Engineering", fees: "",
        isScholarshipApplied: false, scholarshipNotAppliedReason: "",
        isMahadbtFormSubmitted: false, mahadbtFilledDate: "", mahadbtNotFilledReason: "",
        hasMigrationCertificate: false, migrationExpectedDate: "", migrationNotAvailableReason: "",
        year: "SE"
      });
    } catch (err) {
      console.error(err);
      const resData = err.response?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
        resData.errors.forEach((e) => toast.error(e.message || "Validation error"));
      } else {
        toast.error(resData?.message || "Failed to add admission.");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-white/20 animate-fadeIn">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Add New Admission</h3>
              <p className="text-sm text-slate-500 font-medium font-mono">Create admission record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:ring-2 focus:ring-slate-300 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 bg-slate-50/30">
          <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
            {/* Section: Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1.5 bg-blue-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Admission Info</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Student ID <span className="text-red-500">*</span></label>
                  <input type="text" name="studentId" value={form.studentId} onChange={handleInputChange} required className={inputClass} placeholder="e.g. 211P041" />
                </div>
                <div>
                  <label className={labelClass}>Course <span className="text-red-500">*</span></label>
                  <input type="text" name="course" value={form.course} onChange={handleInputChange} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Roll Number <span className="text-red-500">*</span></label>
                  <input type="text" name="rollno" value={form.rollno} onChange={handleInputChange} required pattern="\d+" title="Only digits allowed" className={inputClass} placeholder="e.g. 101" />
                </div>
                <div>
                  <label className={labelClass}>Fees Amount (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="fees" value={form.fees} onChange={handleInputChange} required min="0" className={inputClass} placeholder="e.g. 150000" />
                </div>
              </div>
            </section>

            {/* Section: Scholarship & MahaDBT */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1.5 bg-purple-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Scholarship & MahaDBT</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Scholarship Applied?</label>
                    <input type="checkbox" name="isScholarshipApplied" checked={form.isScholarshipApplied} onChange={handleInputChange} className="w-5 h-5 accent-blue-600 rounded" />
                  </div>
                  {!form.isScholarshipApplied && (
                    <div>
                      <label className={labelClass}>Reason if Not Applied <span className="text-red-500">*</span></label>
                      <textarea name="scholarshipNotAppliedReason" value={form.scholarshipNotAppliedReason} onChange={handleInputChange} required={!form.isScholarshipApplied} minLength="5" className={`${inputClass} min-h-[80px]`} placeholder="Specify reason..." />
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">MahaDBT Form Submitted?</label>
                    <input type="checkbox" name="isMahadbtFormSubmitted" checked={form.isMahadbtFormSubmitted} onChange={handleInputChange} className="w-5 h-5 accent-purple-600 rounded" />
                  </div>
                  {form.isMahadbtFormSubmitted ? (
                    <div>
                      <label className={labelClass}>Form Submission Date <span className="text-red-500">*</span></label>
                      <input type="date" name="mahadbtFilledDate" value={form.mahadbtFilledDate} onChange={handleInputChange} required={form.isMahadbtFormSubmitted} className={inputClass} />
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Reason if Not Submitted <span className="text-red-500">*</span></label>
                      <textarea name="mahadbtNotFilledReason" value={form.mahadbtNotFilledReason} onChange={handleInputChange} required={!form.isMahadbtFormSubmitted} minLength="5" className={`${inputClass} min-h-[80px]`} placeholder="Specify reason..." />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section: Migration Details */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1.5 bg-orange-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Migration Details</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Has Migration Certificate?</label>
                  <input type="checkbox" name="hasMigrationCertificate" checked={form.hasMigrationCertificate} onChange={handleInputChange} className="w-5 h-5 accent-orange-600 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {form.hasMigrationCertificate ? (
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Migration Expected/Received Date <span className="text-red-500">*</span></label>
                      <input type="date" name="migrationExpectedDate" value={form.migrationExpectedDate} onChange={handleInputChange} required={form.hasMigrationCertificate} className={inputClass} />
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Reason if Unavailable <span className="text-red-500">*</span></label>
                      <textarea name="migrationNotAvailableReason" value={form.migrationNotAvailableReason} onChange={handleInputChange} required={!form.hasMigrationCertificate} minLength="5" className={`${inputClass} min-h-[80px]`} placeholder="Specify reason..." />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 sm:p-6 flex flex-wrap justify-end gap-3 sm:gap-4">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs sm:text-sm">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-10 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {saving ? "Saving..." : "Add Admission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function EditAdmissionModal({ isOpen, onClose, onSaved, admission }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    rollno: "", course: "", fees: "", status: "",
    isScholarshipApplied: false, scholarshipNotAppliedReason: "",
    isMahadbtFormSubmitted: false, mahadbtFilledDate: "", mahadbtNotFilledReason: "",
    hasMigrationCertificate: false, migrationExpectedDate: "", migrationNotAvailableReason: ""
  });

  useEffect(() => {
    if (admission && isOpen) {
      setForm({
        rollno: admission.rollno || "",
        course: admission.course || "",
        fees: admission.fees || "",
        status: admission.status || "pending",
        isScholarshipApplied: !!admission.isScholarshipApplied,
        scholarshipNotAppliedReason: admission.scholarshipNotAppliedReason || "",
        isMahadbtFormSubmitted: !!admission.isMahadbtFormSubmitted,
        mahadbtFilledDate: admission.mahadbtFilledDate ? new Date(admission.mahadbtFilledDate).toISOString().split('T')[0] : "",
        mahadbtNotFilledReason: admission.mahadbtNotFilledReason || "",
        hasMigrationCertificate: !!admission.hasMigrationCertificate,
        migrationExpectedDate: admission.migrationExpectedDate ? new Date(admission.migrationExpectedDate).toISOString().split('T')[0] : "",
        migrationNotAvailableReason: admission.migrationNotAvailableReason || ""
      });
    }
  }, [admission, isOpen]);

  if (!isOpen || !admission) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Calculate what actually changed so we only send necessary updates.
      const updateData = {};
      Object.keys(form).forEach(key => {
        if (key === 'status') return;

        let originalValue = admission[key];
        // Handle dates for comparison
        if (key === 'mahadbtFilledDate' || key === 'migrationExpectedDate') {
          originalValue = originalValue ? new Date(originalValue).toISOString().split('T')[0] : "";
        }
        if (typeof form[key] === 'boolean') {
          originalValue = !!originalValue;
        }

        // Only include fields that modified and are not empty
        if (form[key] !== originalValue && form[key] !== "") {
          updateData[key] = form[key];
        }
      });

      // 1. MUST UPDATE ADMISSION DATA FIRST!
      // If we update status first to 'approved', the backend instantly blocks subsequent data updates.
      if (Object.keys(updateData).length > 0) {
        await admissionService.updateAdmission(admission._id, updateData);
      }

      // 2. NOW UPDATE STATUS
      let finalResponse;
      if (form.status !== admission.status) {
        finalResponse = await admissionService.updateAdmissionStatus(admission._id, form.status);
      } else if (Object.keys(updateData).length > 0) {
        // If status didn't change but data did, we need a response for state update
        // The updateAdmission might return the data, but let's be safe.
        finalResponse = await admissionService.updateAdmission(admission._id, updateData);
      } else {
        // Nothing changed
        onClose();
        return;
      }

      toast.success("✅ Admission updated successfully.");
      onSaved(finalResponse?.data || finalResponse || admission);
      onClose();
    } catch (err) {
      console.error(err);
      const resData = err.response?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
        resData.errors.forEach((e) => toast.error(e.message || "Validation error"));
      } else {
        toast.error(resData?.message || "Failed to update admission.");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-white/20">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Edit Admission Record</h3>
              <p className="text-sm text-slate-500 font-medium font-mono">ID: {admission._id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:ring-2 focus:ring-slate-300 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 bg-slate-50/30">
          <div className="p-6 sm:p-8 space-y-10">
            {/* Section: Basic Info & Status */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1.5 bg-blue-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Admission Info</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Approval Status</label>
                  <select name="status" value={form.status} onChange={handleInputChange} className={`${inputClass} font-bold text-blue-700`}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div><label className={labelClass}>Course</label><input type="text" name="course" value={form.course} onChange={handleInputChange} className={inputClass} /></div>
                <div><label className={labelClass}>Roll Number</label><input type="text" name="rollno" value={form.rollno} onChange={handleInputChange} className={inputClass} /></div>
              </div>
            </section>

            {/* Section: Scholarship & MahaDBT */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1.5 bg-purple-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Scholarship & MahaDBT</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Scholarship Applied?</label>
                    <input type="checkbox" name="isScholarshipApplied" checked={form.isScholarshipApplied} onChange={handleInputChange} className="w-5 h-5 accent-blue-600 rounded" />
                  </div>
                  {!form.isScholarshipApplied && (
                    <div>
                      <label className={labelClass}>Reason if Not Applied</label>
                      <textarea name="scholarshipNotAppliedReason" value={form.scholarshipNotAppliedReason} onChange={handleInputChange} className={`${inputClass} min-h-[80px]`} placeholder="Specify reason..." />
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">MahaDBT Form Submitted?</label>
                    <input type="checkbox" name="isMahadbtFormSubmitted" checked={form.isMahadbtFormSubmitted} onChange={handleInputChange} className="w-5 h-5 accent-purple-600 rounded" />
                  </div>
                  {form.isMahadbtFormSubmitted ? (
                    <div>
                      <label className={labelClass}>Form Submission Date</label>
                      <input type="date" name="mahadbtFilledDate" value={form.mahadbtFilledDate} onChange={handleInputChange} className={inputClass} />
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Reason if Not Submitted</label>
                      <textarea name="mahadbtNotFilledReason" value={form.mahadbtNotFilledReason} onChange={handleInputChange} className={`${inputClass} min-h-[80px]`} placeholder="Specify reason..." />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section: Migration Details */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1.5 bg-orange-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Migration Details</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Has Migration Certificate?</label>
                  <input type="checkbox" name="hasMigrationCertificate" checked={form.hasMigrationCertificate} onChange={handleInputChange} className="w-5 h-5 accent-orange-600 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {form.hasMigrationCertificate ? (
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Migration Expected/Received Date</label>
                      <input type="date" name="migrationExpectedDate" value={form.migrationExpectedDate} onChange={handleInputChange} className={inputClass} />
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Reason if Unavailable</label>
                      <textarea name="migrationNotAvailableReason" value={form.migrationNotAvailableReason} onChange={handleInputChange} className={`${inputClass} min-h-[80px]`} placeholder="Specify reason..." />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 sm:p-6 flex flex-wrap justify-end gap-3 sm:gap-4">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs sm:text-sm">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-10 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function AdminAdmission() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supported filters per backend getAdmissionsValidation schema
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [divFilter, setDivFilter] = useState("");
  const [scholarshipFilter, setScholarshipFilter] = useState("");
  const [mahadbtFilter, setMahadbtFilter] = useState("");
  const [migrationFilter, setMigrationFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedAdmission, setSelectedAdmission] = useState(null); // For View
  const [editingAdmission, setEditingAdmission] = useState(null); // For Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add
  const [deletingIds, setDeletingIds] = useState([]); // Track IDs currently being deleted
  const [exporting, setExporting] = useState(false); // Track export status

  useEffect(() => {
    // Only auto-fetch on pagination/limit changes to minimize API hits
    fetchAdmissions(currentPage);
  }, [currentPage, limit]);

  const fetchAdmissions = async (page = 1) => {
    const trimmedSearch = searchQuery.trim();
    if (trimmedSearch) {
      if (/^\d+$/.test(trimmedSearch)) {
        setError("Purely numeric searches (like Roll Number) are not supported by the server. Please search by Course or Academic Year (e.g. '2024-2025').");
        setAdmissions([]);
        setTotalRecords(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      if (!/^[A-Za-z0-9\s.,!?'-]+$/.test(trimmedSearch)) {
        setError("Search contains invalid characters. Only letters, numbers, and basic punctuation are allowed.");
        setAdmissions([]);
        setTotalRecords(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: trimmedSearch || undefined,
        year: yearFilter || undefined,
        status: statusFilter || undefined,
        isScholarshipApplied: scholarshipFilter !== "" ? scholarshipFilter === "true" : undefined,
        isMahadbtFormSubmitted: mahadbtFilter !== "" ? mahadbtFilter === "true" : undefined,
        hasMigrationCertificate: migrationFilter !== "" ? migrationFilter === "true" : undefined,
      };

      const response = await admissionService.getAllAdmissions(params);

      const data = response.data || [];
      const total = response.total || 0;
      const totalP = response.totalPages || 1;

      setAdmissions(data);
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching admissions:", err);
      const resData = err.response?.data;
      const serverMsg = resData?.errors?.[0]?.message || resData?.message || "Failed to load admissions. Please try again.";
      setError(serverMsg);
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // HANDLERS

  const handleEdit = (admission) => {
    setEditingAdmission(admission);
    setIsEditModalOpen(true);
  };

  const handleSaveAdmission = (updatedItem) => {
    setAdmissions((prev) => {
      const exists = prev.some((a) => a._id === updatedItem._id);
      if (exists) {
        return prev.map((a) =>
          a._id === updatedItem._id
            ? { ...updatedItem, stuID: a.stuID || updatedItem.stuID }
            : a
        );
      } else {
        // For new admissions, refetch to maintain sorting/pagination
        fetchAdmissions(currentPage);
        return prev;
      }
    });
  };

  const handleDeleteAdmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admission? This action cannot be undone.")) return;

    setDeletingIds(prev => [...prev, id]);
    const toastId = toast.loading("Deleting admission...");

    try {
      await admissionService.deleteAdmission(id);
      // Remove from local state
      setAdmissions((prev) => prev.filter((a) => a._id !== id));
      setTotalRecords((prev) => prev - 1);
      toast.success("Admission deleted successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to delete admission";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setDeletingIds(prev => prev.filter(deletingId => deletingId !== id));
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const toastId = toast.loading("Preparing Excel file...");

      const params = {
        search: searchQuery.trim() || undefined,
        year: yearFilter || undefined,
        status: statusFilter || undefined,
        isScholarshipApplied: scholarshipFilter !== "" ? scholarshipFilter === "true" : undefined,
        isMahadbtFormSubmitted: mahadbtFilter !== "" ? mahadbtFilter === "true" : undefined,
        hasMigrationCertificate: migrationFilter !== "" ? migrationFilter === "true" : undefined,
      };

      const blob = await admissionService.exportAdmissions(params);

      // Create a link and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("✅ Excel file downloaded successfully", { id: toastId });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export admissions. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // FILTER LOGIC - Manual Trigger Only
  const handleFind = () => {
    setCurrentPage(1);
    fetchAdmissions(1);
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Admissions</h1>
        <p className="text-slate-600 mt-2">
          {totalRecords} admissions
        </p>
      </div>

      {/* FILTER BAR - Only showing filters supported by Backend Joi Schema */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-8 flex flex-wrap gap-3 sm:gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by course or academic year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-normal"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
            <span className="font-semibold text-blue-600">Note:</span> Search box filters by <strong className="text-slate-700">Course</strong> or other text fields.
          </p>        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all shadow-sm shadow-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all shadow-sm shadow-slate-100"
          >
            <option value="">All Years</option>
            <option value="SE">SE</option>
            <option value="TE">TE</option>
            <option value="BE">BE</option>
          </select>

          <select
            value={scholarshipFilter}
            onChange={(e) => setScholarshipFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all shadow-sm shadow-slate-100"
          >
            <option value="">Scholarship</option>
            <option value="true">Applied</option>
            <option value="false">Not Applied</option>
          </select>

          <select
            value={mahadbtFilter}
            onChange={(e) => setMahadbtFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all shadow-sm shadow-slate-100"
          >
            <option value="">MahaDBT Form</option>
            <option value="true">Submitted</option>
            <option value="false">Not Submitted</option>
          </select>

          <select
            value={migrationFilter}
            onChange={(e) => setMigrationFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all shadow-sm shadow-slate-100"
          >
            <option value="">Migration Cert.</option>
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto md:ml-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 sm:flex-none">
            <button
              onClick={handleExport}
              disabled={exporting || admissions.length === 0}
              className={`w-full sm:w-auto px-6 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${exporting || admissions.length === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? "Exporting..." : "Export"}
            </button>
            <div className="text-[11px] text-slate-600 leading-tight normal-case tracking-normal font-medium text-left">
              <span className="font-bold text-slate-800 block mb-0.5">How to export:</span>
              1. Click <span className="font-bold text-slate-900">Find</span> to apply filters.<br />
              2. Click <span className="font-bold text-blue-600">Export</span> to download data.
            </div>
          </div>

          <button
            onClick={handleFind}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find
          </button>

          {(searchQuery || yearFilter || statusFilter || scholarshipFilter || mahadbtFilter || migrationFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setYearFilter("");
                setStatusFilter("");
                setScholarshipFilter("");
                setMahadbtFilter("");
                setMigrationFilter("");
                setCurrentPage(1);

                // Immediately fetch with empty params to bypass stale state values
                setLoading(true);
                admissionService.getAllAdmissions({ page: 1, limit }).then(response => {
                  setAdmissions(response.data || []);
                  setTotalRecords(response.total || 0);
                  setTotalPages(response.totalPages || 1);
                }).catch(console.error).finally(() => setLoading(false));
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear
            </button>
          )}
        </div>
      </div>


      {/* CONTENT */}
      <div className="min-h-[50vh]">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {!loading && !error && admissions.length === 0 && (
          <div className="bg-white p-16 text-center rounded-xl border border-slate-200 border-dashed">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-600 font-medium">No admissions found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {!loading && !error && admissions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {admissions.map((admission) => (
              <AdmissionCard
                key={admission._id}
                admission={admission}
                onView={setSelectedAdmission}
                onEdit={handleEdit}
                onDelete={handleDeleteAdmission}
                isDeleting={deletingIds.includes(admission._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination Component */}
        {!loading && !error && admissions.length > 0 && (
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

      {/* MODALS */}
      <AddAdmissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={handleSaveAdmission}
      />

      <DetailModal
        admission={selectedAdmission}
        onClose={() => setSelectedAdmission(null)}
      />

      <EditAdmissionModal
        isOpen={isEditModalOpen}
        admission={editingAdmission}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={handleSaveAdmission}
      />

      <Toaster position="bottom-right" />
    </main>
  );
}