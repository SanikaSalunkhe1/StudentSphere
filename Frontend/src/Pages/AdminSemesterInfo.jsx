import React, { useState, useEffect } from "react";
import { semInfoService } from "../services/semInfoService";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ record, onClose }) {
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDbId = record?.stuID?._id || record?.stuID;
        if (studentDbId) {
          const res = await studentService.getSingleStudent(studentDbId);
          setStudent(res.data);
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setStudentLoading(false);
      }
    };
    fetchStudent();
  }, [record]);

  if (!record) return null;
  const totalScore = record.marks?.reduce((s, m) => s + m.score, 0) ?? 0;
  const totalOutOf = record.marks?.reduce((s, m) => s + m.outOf, 0) ?? 0;
  const attendancePct = record.attendance || 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-black text-slate-900 italic uppercase italic tracking-tighter">
              Semester {record.semester} Performance
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column: Student & Summary */}
              <div className="lg:col-span-4 space-y-6">
                {/* Student Profile Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  {studentLoading ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-xs text-slate-500 font-medium">Loading Student Profile...</p>
                    </div>
                  ) : student ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-200">
                        {student.name?.firstName?.charAt(0) || student.name?.lastName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 antialiased leading-tight">
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

                {/* Performance Status Card */}
                <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden ${attendancePct >= 75 ? 'bg-indigo-600 shadow-indigo-100' : 'bg-red-600 shadow-red-100'}`}>
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-3 drop-shadow-lg">
                      {attendancePct >= 75 ? "🎯" : "⚠️"}
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1 tracking-widest">Attendance Status</h4>
                    <p className="text-3xl font-black tracking-tight mb-4">{attendancePct}%</p>

                    <div className="flex flex-col gap-2 items-center text-xs font-bold bg-black/10 rounded-2xl p-4">
                      <p className="text-white/70 uppercase text-[10px] tracking-widest">Compliance Status</p>
                      <p className="text-center">{attendancePct >= 75 ? "Regular Attendance" : "Defaulter Warning!"}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 uppercase tracking-widest">Marks (Avg)</p>
                    <p className="text-sm font-black text-slate-900">
                      {totalOutOf > 0 ? ((totalScore / totalOutOf) * 100).toFixed(1) : "0"}%
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 uppercase tracking-widest">Academic KTs</p>
                    <p className={`text-sm font-black ${record.kts?.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {record.kts?.length || 0} Subjects
                    </p>
                  </div>
                </div>

                {/* Compliance Badges */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between font-black italic tracking-tighter ${record.journalTaken ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                    <span className="text-[10px] uppercase tracking-widest">Journal Status</span>
                    <span className="text-sm">{record.journalTaken ? "VERIFIED" : "PENDING"}</span>
                  </div>
                  <div className={`p-4 rounded-2xl border flex items-center justify-between font-black italic tracking-tighter ${record.examFormFilled ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    <span className="text-[10px] uppercase tracking-widest">Exam Form</span>
                    <span className="text-sm">{record.examFormFilled ? "SUBMITTED" : "NOT FILLED"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Marks & Subjects */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Course Subject Performance</h4>
                    <span className="px-2 py-1 bg-white text-[10px] font-black text-slate-500 rounded border border-slate-200">SEM {record.semester}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Out Of</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {record.marks?.map((m, i) => {
                          const pct = m.outOf > 0 ? ((m.score / m.outOf) * 100).toFixed(1) : "0";
                          return (
                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-slate-900">{m.subject}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-black text-slate-700">{m.score}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-bold text-slate-400">{m.outOf}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`text-xs font-black italic tracking-tighter ${pct >= 40 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {pct}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50/80 border-t border-slate-100">
                        <tr>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">Aggregate Performance</td>
                          <td className="px-6 py-4 text-center text-sm font-black text-slate-900">{totalScore}</td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{totalOutOf}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-indigo-600 italic underline decoration-indigo-200">
                              {totalOutOf > 0 ? ((totalScore / totalOutOf) * 100).toFixed(1) : "0"}%
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {record.kts?.length > 0 && (
                  <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6">
                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                      Active backlog / KT Subjects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {record.kts.map((kt, i) => (
                        <span key={i} className="px-4 py-1.5 bg-white text-red-700 text-xs font-black rounded-xl border border-red-200 shadow-sm">
                          {kt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 z-20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-black rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Semester Card ────────────────────────────────────────────────────────────
function SemInfoCard({ record, onView, onDelete, onEdit, isDeleting }) {
  const [student, setStudent] = useState(null);
  const [loadingName, setLoadingName] = useState(false);

  useEffect(() => {
    const fetchStudentName = async () => {
      // If stuID is already an object with a name, use it
      if (record.stuID && typeof record.stuID === 'object' && record.stuID.name) {
        setStudent(record.stuID);
        return;
      }

      // Otherwise, fetch the student details using the ID
      const studentDbId = typeof record.stuID === 'string' ? record.stuID : record.stuID?._id;
      if (studentDbId) {
        setLoadingName(true);
        try {
          const res = await studentService.getSingleStudent(studentDbId);
          setStudent(res.data);
        } catch (err) {
          console.error("Error fetching student for card:", err);
        } finally {
          setLoadingName(false);
        }
      }
    };
    fetchStudentName();
  }, [record.stuID]);

  const studentID = student?.studentID || record?.studentID || "N/A";
  const studentYear = student?.year || (typeof record.stuID === 'object' ? record.stuID?.year : "N/A");
  const studentNameRaw = student?.name;
  const studentName = studentNameRaw &&
    `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim() !== ""
    ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim()
    : null;

  const totalScore = record.marks?.reduce((s, m) => s + m.score, 0) ?? 0;
  const totalOutOf = record.marks?.reduce((s, m) => s + m.outOf, 0) ?? 0;
  const attendancePct = record.attendance || 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      {/* Visual Indicator Top Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${attendancePct >= 75 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-orange-600'}`}></div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Top Info: Semester & Chips */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded uppercase tracking-tighter border border-indigo-100">
              SEM {record.semester}
            </span>
            {record.isDefaulter && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase tracking-tighter border border-red-200">
                DEFAULTER
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-400 tracking-widest">{studentYear}</span>
        </div>

        {/* Student Name & ID */}
        <div className="mb-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student Info</p>
          {loadingName ? (
            <div className="h-5 bg-slate-100 animate-pulse rounded w-3/4 mb-1"></div>
          ) : (
            <h4 className="text-sm font-black text-slate-900 line-clamp-1">
              {studentName || "Name Not Registered"}
            </h4>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">ID:</span>
            <span className="text-[10px] font-bold text-indigo-600">{studentID}</span>
          </div>
        </div>

        <div className="h-px bg-slate-100 mb-4" />

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${attendancePct >= 75 ? 'bg-blue-600' : 'bg-red-500'}`} style={{ width: `${attendancePct}%` }}></div>
              </div>
              <span className={`text-[11px] font-black ${attendancePct >= 75 ? 'text-blue-600' : 'text-red-500'}`}>{attendancePct}%</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Backlogs</p>
            <p className={`text-[11px] font-black ${record.kts?.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {record.kts?.length || 0} Subjects
            </p>
          </div>
        </div>

        {/* Compliance Icons/Chips */}
        <div className="flex gap-2 mb-4">
          <div className={`flex-1 px-2 py-1 rounded-md text-[9px] font-black italic text-center border ${record.journalTaken ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
            JRN: {record.journalTaken ? 'YES' : 'PEND'}
          </div>
          <div className={`flex-1 px-2 py-1 rounded-md text-[9px] font-black italic text-center border ${record.examFormFilled ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            EXM: {record.examFormFilled ? 'FILL' : 'PEND'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className=" space-y-2">
          <button
            onClick={() => onView && onView(record)}
            className="w-full px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View Evaluation
          </button>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onEdit && onEdit(record)}
              className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(record._id)}
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

// ─── Form Modal Component (Add / Edit) ────────────────────────────────────────────────────────
function SemInfoFormModal({ isOpen, onClose, record, onSave }) {
  const [formData, setFormData] = useState({
    studentId: "",
    semester: "",
    attendance: "",
    kts: [],
    marks: [],
    journalTaken: false,
    examFormFilled: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        // Ensure kts and marks are copied properly
        const initialKts = Array.isArray(record.kts) ? [...record.kts] : [];
        const initialMarks = Array.isArray(record.marks)
          ? record.marks.map((m) => ({ ...m }))
          : [];

        setFormData({
          studentId:
            record?.studentID ||
            record?.stuID?.studentID ||
            record?.studentId ||
            (typeof record?.stuID === "string" && record.stuID.length !== 24 ? record.stuID : ""),
          semester: record.semester || "",
          attendance: record.attendance || "",
          kts: initialKts,
          marks: initialMarks,
          journalTaken: record.journalTaken || false,
          examFormFilled: record.examFormFilled || false,
        });
      } else {
        setFormData({
          studentId: "",
          semester: "",
          attendance: "",
          kts: [],
          marks: [],
          journalTaken: false,
          examFormFilled: false,
        });
      }
    }
  }, [isOpen, record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // KT Handlers
  const handleAddKt = () => {
    setFormData((prev) => ({ ...prev, kts: [...prev.kts, ""] }));
  };
  const handleKtChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      kts: prev.kts.map((kt, i) => (i === index ? value : kt)),
    }));
  };
  const handleRemoveKt = (index) => {
    setFormData((prev) => ({
      ...prev,
      kts: prev.kts.filter((_, i) => i !== index),
    }));
  };

  // Marks Handlers
  const handleAddMark = () => {
    setFormData((prev) => ({ ...prev, marks: [...prev.marks, { subject: "", score: "", outOf: "" }] }));
  };
  const handleMarkChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      marks: prev.marks.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };
  const handleRemoveMark = (index) => {
    setFormData((prev) => ({
      ...prev,
      marks: prev.marks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean payload
      const payload = {
        semester: Number(formData.semester),
        attendance: Number(formData.attendance),
        kts: formData.kts.filter(kt => kt.trim() !== ""),
        marks: formData.marks.filter(m => m.subject.trim() !== "").map(m => ({
          subject: m.subject.trim(),
          score: Number(m.score),
          outOf: Number(m.outOf)
        })),
        journalTaken: formData.journalTaken,
        examFormFilled: formData.examFormFilled
      };

      if (!record) { payload.studentId = formData.studentId; }

      if (record) {
        await semInfoService.updateSemInfo(record._id, payload);
        toast.success("Semester Info updated successfully!");
      } else {
        await semInfoService.addSemInfo(payload);
        toast.success("Semester Info added successfully!");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving SemInfo:", err);
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
            {record ? "Edit Semester Info" : "Add New Semester Info"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Basic Info */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Basic Info</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className={labelClass}>Student ID *</label>
                <input
                  type="text"
                  name="studentId"
                  required={!record}
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 2024COMP123"
                  disabled={!!record}
                  className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                />
              </div>
              <div>
                <label className={labelClass}>Semester (1-8) *</label>
                <input
                  type="number"
                  name="semester"
                  required
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Attendance (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="attendance"
                    required
                    min="0"
                    max="100"
                    value={formData.attendance}
                    onChange={handleChange}
                    className={`${inputClass} pr-8`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Subject Marks Array Builder */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Subject Marks</h4>
              </div>
              <button type="button" onClick={handleAddMark} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm">
                + Add Subject
              </button>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {formData.marks.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No subjects added yet. Click "+ Add Subject" to begin.</p>
              ) : (
                <div className="space-y-4">
                  {formData.marks.map((mark, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                      <div className="flex-1 w-full md:w-auto">
                        <label className={`${labelClass} hidden md:block opacity-0 group-hover:opacity-100 transition-opacity`}>Subject Name</label>
                        <input
                          type="text"
                          placeholder="Subject Name"
                          required
                          value={mark.subject}
                          onChange={(e) => handleMarkChange(index, "subject", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="w-1/3 md:w-32">
                        <label className={`${labelClass} hidden md:block opacity-0 group-hover:opacity-100 transition-opacity`}>Score</label>
                        <input
                          type="number"
                          placeholder="Score"
                          required
                          min="0"
                          value={mark.score}
                          onChange={(e) => handleMarkChange(index, "score", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <span className="text-slate-300 font-extrabold text-2xl hidden md:block mt-[1.3rem]">/</span>
                      <div className="w-1/3 md:w-32">
                        <label className={`${labelClass} hidden md:block opacity-0 group-hover:opacity-100 transition-opacity`}>Out Of</label>
                        <input
                          type="number"
                          placeholder="Out Of"
                          required
                          min="1"
                          value={mark.outOf}
                          onChange={(e) => handleMarkChange(index, "outOf", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveMark(index)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors md:mt-[1.3rem]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* KTs Array Builder */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 bg-orange-500 rounded-full"></div>
                <h4 className="text-lg font-bold text-slate-800">Active KTs</h4>
              </div>
              <button type="button" onClick={handleAddKt} className="px-4 py-2 bg-orange-50 text-orange-700 text-sm font-bold rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors shadow-sm">
                + Add KT
              </button>
            </div>

            <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100">
              {formData.kts.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No KTs recorded.</p>
              ) : (
                <div className="space-y-4">
                  {formData.kts.map((kt, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Failed Subject Name"
                        required
                        value={kt}
                        onChange={(e) => handleKtChange(index, e.target.value)}
                        className={`${inputClass} border-orange-200 focus:ring-orange-500/50 focus:border-orange-500`}
                      />
                      <button type="button" onClick={() => handleRemoveKt(index)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Status & Compliance */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Requirements & Compliance</h4>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="flex flex-col sm:flex-row gap-8">
                <label className="flex items-center gap-4 cursor-pointer group bg-white p-4 pr-6 border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.journalTaken}
                      onChange={(e) => setFormData(prev => ({ ...prev, journalTaken: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Journal Verification</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">{formData.journalTaken ? 'Verified' : 'Pending'}</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer group bg-white p-4 pr-6 border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.examFormFilled}
                      onChange={(e) => setFormData(prev => ({ ...prev, examFormFilled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Exam Form Submission</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">{formData.examFormFilled ? 'Submitted' : 'Not Filled'}</span>
                  </div>
                </label>
              </div>
            </div>
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
              disabled={loading}
              className="px-10 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                record ? "Update Semester Info" : "Add Semester Info"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function AdminSemesterInfo() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [filterDefaulter, setFilterDefaulter] = useState(""); // "" or "true"
  const [minAttendance, setMinAttendance] = useState("");
  const [maxAttendance, setMaxAttendance] = useState("");
  const [selectedJournal, setSelectedJournal] = useState(""); // "" or "true" or "false"
  const [selectedExamForm, setSelectedExamForm] = useState(""); // "" or "true" or "false"

  // Applied Filters State (Snapshot for WYSIWYG)
  const [appliedFilters, setAppliedFilters] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to get full record since list API lacks marks
  const fetchFullRecord = async (record) => {
    const studentDbId = record.stuID?._id || record.stuID;
    if (!studentDbId) return record;

    try {
      setRefreshing(true);
      // Fetch sem info and student profile details (to get readable studentID)
      const [semRes, studentRes] = await Promise.all([
        semInfoService.getStudentSemInfo(studentDbId),
        studentService.getSingleStudent(studentDbId)
      ]);

      const fullRecords = semRes.data || [];
      let matchingRecord = fullRecords.find(r => r._id === record._id);

      if (matchingRecord) {
        // Ensure the readable studentID is available at the top level for the form
        matchingRecord.studentID = studentRes.data?.studentID;
      }

      return matchingRecord || record;
    } catch (err) {
      console.error("Error refetching full record:", err);
      return record;
    } finally {
      setRefreshing(false);
    }
  };

  const handleView = async (record) => {
    const full = await fetchFullRecord(record);
    setSelectedItem(full);
  };

  const handleEdit = async (record) => {
    const full = await fetchFullRecord(record);
    setRecordToEdit(full);
    setIsFormModalOpen(true);
  };

  useEffect(() => {
    fetchAll(currentPage);
  }, [currentPage, limit, appliedFilters]);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...appliedFilters
      };
      const response = await semInfoService.getAllSemInfo(params);

      const data = response.data || [];
      const total = response.total || 0;
      const totalP = response.totalPages || 1;

      setRecords(data);
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching semester info:", err);
      setError("Failed to load semester info. Backend might not be running!");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this semester record?")) return;
    setDeletingId(id);
    try {
      await semInfoService.deleteSemInfo(id);
      toast.success("Semester record deleted successfully!");
      fetchAll(currentPage);
    } catch (err) {
      console.error("Error deleting semester info:", err);
      toast.error("Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    if (filtered.length === 0) { toast.warn("No data to export."); return; }
    try {
      setLoading(true);
      const params = {
        ...appliedFilters
      };

      const blob = await semInfoService.exportSemInfo(params);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `SemesterInfo_Export_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("✅ Exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // We now use server-side filtering, so filtered is just the records list
  const filtered = records;

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen relative">
      {/* Loading Overlay for Refetching */}
      {refreshing && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-slate-700 font-sans">Syncing Detailed Records...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Semester Information</h1>
        <p className="text-slate-600 mt-2">
          Showing <span className="font-semibold text-blue-600">{totalRecords}</span> records
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-normal"
            />
            <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
              <span className="font-semibold text-blue-600">Note:</span> The search box filters by <strong className="text-slate-700">Student Name</strong> and <strong className="text-slate-700">Student ID</strong>.
            </p>
          </div>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">All Years</option>
            <option value="FE">First Year (FE)</option>
            <option value="SE">Second Year (SE)</option>
            <option value="TE">Third Year (TE)</option>
            <option value="BE">Final Year (BE)</option>
          </select>

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">All Divs</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>

          {/* Defaulter Toggle */}
          <select
            value={filterDefaulter}
            onChange={(e) => setFilterDefaulter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">All Students</option>
            <option value="true">Defaulters Only</option>
          </select>

          {/* Journal Status Filter */}
          <select
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">All Journals</option>
            <option value="true">Completed (YES)</option>
            <option value="false">Pending (PEND)</option>
          </select>

          {/* Exam Form Status Filter */}
          <select
            value={selectedExamForm}
            onChange={(e) => setSelectedExamForm(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">All Exam Forms</option>
            <option value="true">Filled (FILL)</option>
            <option value="false">Pending (PEND)</option>
          </select>

          {/* Attendance Range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min %"
              min="0"
              max="100"
              value={minAttendance}
              onChange={(e) => setMinAttendance(e.target.value)}
              className="w-20 px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <span className="text-slate-400 font-medium">-</span>
            <input
              type="number"
              placeholder="Max %"
              min="0"
              max="100"
              value={maxAttendance}
              onChange={(e) => setMaxAttendance(e.target.value)}
              className="w-20 px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAppliedFilters({
                  search: searchQuery || undefined,
                  semester: selectedSem || undefined,
                  year: selectedYear || undefined,
                  division: selectedDivision || undefined,
                  isDefaulter: filterDefaulter || undefined,
                  journalTaken: selectedJournal || undefined,
                  examFormFilled: selectedExamForm || undefined,
                  minAttendance: minAttendance || undefined,
                  maxAttendance: maxAttendance || undefined,
                });
                setCurrentPage(1);
              }}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Records
            </button>

            {(searchQuery || selectedSem || selectedYear || selectedDivision || filterDefaulter || minAttendance || maxAttendance) && (
              <button
                onClick={() => {
                  setSearchQuery(""); setSelectedSem(""); setSelectedYear("");
                  setSelectedDivision(""); setFilterDefaulter("");
                  setSelectedJournal(""); setSelectedExamForm("");
                  setMinAttendance(""); setMaxAttendance("");
                }}
                className="px-4 py-2.5 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 ml-auto">
            <button
              onClick={handleExport}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
            <div className="text-[11px] text-slate-600 leading-tight">
              <span className="font-semibold text-slate-800 block mb-0.5">How to export:</span>
              1. Click <span className="font-semibold text-blue-600">Find Records</span> to apply filters.<br />
              2. Click <span className="font-semibold text-green-600">Export</span> to download the data.
            </div>
          </div>
          <button
            onClick={() => { setRecordToEdit(null); setIsFormModalOpen(true); }}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center">
            + Add Semester Info
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="min-h-[60vh]">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading semester info...</p>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-slate-600 text-lg font-medium">
              {searchQuery || selectedSem ? "No records match your filters." : "No semester info recorded yet."}
            </p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((record) => (
              <SemInfoCard
                key={record._id}
                record={record}
                isDeleting={deletingId === record._id}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination Component */}
        {!loading && !error && filtered.length > 0 && (
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

      {selectedItem && <DetailModal record={selectedItem} onClose={() => setSelectedItem(null)} />}

      <SemInfoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        record={recordToEdit}
        onSave={() => fetchAll(currentPage)}
      />
    </main>
  );
}