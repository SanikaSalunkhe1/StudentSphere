import React, { useState, useEffect } from "react";
import { semInfoService } from "../services/semInfoService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Semester Info Card ───────────────────────────────────────────────────────
function SemInfoCard({ record, onEdit, onDelete, isDeleting }) {
    const totalScore = record.marks?.reduce((sum, m) => sum + m.score, 0) ?? 0;
    const totalOutOf = record.marks?.reduce((sum, m) => sum + m.outOf, 0) ?? 0;
    const percentage = totalOutOf > 0 ? ((totalScore / totalOutOf) * 100).toFixed(1) : "N/A";

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
            {/* Header strip */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="p-4 flex flex-col flex-grow">
                {/* Semester & Defaulter */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                        Semester {record.semester}
                    </span>
                    {record.isDefaulter && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                            Defaulter
                        </span>
                    )}
                </div>

                {/* Attendance */}
                <div className="mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Attendance</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all ${record.attendance >= 75 ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(record.attendance, 100)}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold ${record.attendance >= 75 ? "text-green-600" : "text-red-600"}`}>
                            {record.attendance}%
                        </span>
                    </div>
                </div>

                {/* Score */}
                <div className="mb-3 pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">End Sem Marks</p>
                    <p className="text-sm font-bold text-slate-800">
                        {totalScore} / {totalOutOf}
                        <span className="ml-1 text-xs font-medium text-slate-500">({percentage}%)</span>
                    </p>
                </div>

                {/* KTs */}
                <div className="mb-4">
                    {record.kts && record.kts.length > 0 ? (
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                KTs ({record.kts.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {record.kts.map((kt, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                                        {kt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-green-600 font-medium">✓ No KTs</p>
                    )}
                </div>

                {/* Academic Status */}
                <div className="mb-4 grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Exam Form</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${record.examFormFilled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                            {record.examFormFilled ? "✓ FILLED" : "PENDING"}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Journal</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${record.journalTaken ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                            {record.journalTaken ? "✓ TAKEN" : "PENDING"}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onEdit(record)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(record._id)}
                        disabled={isDeleting}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${isDeleting
                            ? "bg-red-200 text-red-500 cursor-not-allowed"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentSemesterInfo() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list"); // "list" | "form"
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const emptyForm = {
        semester: "",
        attendance: "",
        kts: [],
        marks: [{ subject: "", score: "", outOf: "" }],
        journalTaken: false,
        examFormFilled: false,
    };
    const [formData, setFormData] = useState(emptyForm);
    const [ktInput, setKtInput] = useState(""); // current KT being typed

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await semInfoService.getOwnSemInfo();
            const data = response.data || response;
            setRecords(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching semester info:", err);
            toast.error("Failed to load semester info");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setKtInput("");
        setEditingId(null);
    };

    const openFormForAdd = () => {
        resetForm();
        setView("form");
    };

    const openFormForEdit = (record) => {
        setEditingId(record._id);
        setFormData({
            semester: record.semester?.toString() || "",
            attendance: record.attendance?.toString() || "",
            kts: record.kts || [],
            marks: record.marks?.map((m) => ({
                subject: m.subject || "",
                score: m.score?.toString() || "",
                outOf: m.outOf?.toString() || "",
            })) || [{ subject: "", score: "", outOf: "" }],
            journalTaken: record.journalTaken || false,
            examFormFilled: record.examFormFilled || false,
        });
        setKtInput("");
        setView("form");
    };

    const backToList = () => {
        resetForm();
        setView("list");
    };

    // ── Marks helpers ──
    const addMarkRow = () =>
        setFormData((prev) => ({
            ...prev,
            marks: [...prev.marks, { subject: "", score: "", outOf: "" }],
        }));

    const removeMarkRow = (idx) =>
        setFormData((prev) => ({
            ...prev,
            marks: prev.marks.filter((_, i) => i !== idx),
        }));

    const handleMarkChange = (idx, field, value) =>
        setFormData((prev) => {
            const updated = [...prev.marks];
            updated[idx] = { ...updated[idx], [field]: value };
            return { ...prev, marks: updated };
        });

    // ── KT helpers ──
    const addKt = () => {
        const trimmed = ktInput.trim();
        if (!trimmed) return;
        setFormData((prev) => ({ ...prev, kts: [...prev.kts, trimmed] }));
        setKtInput("");
    };

    const removeKt = (idx) =>
        setFormData((prev) => ({
            ...prev,
            kts: prev.kts.filter((_, i) => i !== idx),
        }));

    // ── Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        if (!formData.semester) {
            toast.error("Please select a semester");
            setFormLoading(false);
            return;
        }
        if (formData.attendance === "") {
            toast.error("Please enter attendance");
            setFormLoading(false);
            return;
        }

        // Filter out empty mark rows.
        const filteredMarks = formData.marks
            .filter(m => m.subject.trim() || m.score.toString().trim() || m.outOf.toString().trim())
            .map(m => ({
                subject: m.subject.trim(),
                score: Number(m.score),
                outOf: Number(m.outOf),
            }));

        // Validate that if a mark row was started, it is complete (matching backend requirements)
        const hasIncompleteMark = formData.marks.some(m => {
            const hasAny = m.subject.trim() || m.score.toString().trim() || m.outOf.toString().trim();
            const hasAll = m.subject.trim() && m.score.toString().trim() !== "" && m.outOf.toString().trim() !== "";
            return hasAny && !hasAll;
        });

        if (hasIncompleteMark) {
            toast.error("Please complete all fields for each subject or clear the row.");
            setFormLoading(false);
            return;
        }

        const payload = {
            semester: Number(formData.semester),
            attendance: Number(formData.attendance),
            kts: formData.kts,
            marks: filteredMarks,
            journalTaken: formData.journalTaken,
            examFormFilled: formData.examFormFilled,
        };

        try {
            if (editingId) {
                await semInfoService.updateSemInfo(editingId, payload);
                toast.success("Semester info updated!");
            } else {
                // Workaround: Backend currently ignores journal/exam fields on create.
                // If they are checked, follow up with an update.
                const response = await semInfoService.addSemInfo(payload);
                const newRecord = response.data || response;

                const createdId = newRecord?.data?._id || newRecord?._id;
                if (createdId && (payload.journalTaken || payload.examFormFilled)) {
                    await semInfoService.updateSemInfo(createdId, {
                        journalTaken: payload.journalTaken,
                        examFormFilled: payload.examFormFilled
                    });
                }
                toast.success("Semester info added!");
            }
            resetForm();
            await fetchRecords();
            setTimeout(() => setView("list"), 500);
        } catch (err) {
            const resData = err.response?.data;
            if (resData?.errors && Array.isArray(resData.errors)) {
                resData.errors.forEach(e => toast.error(e.message || "Validation Error"));
            } else {
                toast.error(resData?.message || "Failed to save");
            }
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this semester record?")) return;
        setDeletingId(id);
        try {
            await semInfoService.deleteSemInfo(id);
            toast.success("Record deleted");
            fetchRecords();
        } catch (err) {
            toast.error("Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    // ─────────────────────────────── FORM VIEW ───────────────────────────────
    if (view === "form") {
        return (
            <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
                <ToastContainer position="top-right" autoClose={3000} theme="light" />
                <button
                    onClick={backToList}
                    className="mb-6 px-4 py-2.5 rounded-lg bg-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-400 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {editingId ? "Edit Semester Info" : "Add Semester Info"}
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm">
                        {editingId ? "Update your semester details" : "Record your semester academic details"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 sm:p-8 space-y-10">

                            {/* ── Basic Info ── */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-blue-500">
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Semester <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.semester}
                                            onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value }))}
                                            disabled={!!editingId}
                                            className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${editingId ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
                                            required
                                        >
                                            <option value="">Select Semester</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                <option key={s} value={s}>Semester {s}</option>
                                            ))}
                                        </select>
                                        {editingId && (
                                            <p className="text-[10px] text-slate-500 mt-1 italic">
                                                * Semester cannot be changed once created.
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Attendance (%) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.attendance}
                                            onChange={(e) => setFormData((p) => ({ ...p, attendance: e.target.value }))}
                                            placeholder="e.g. 85"
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Additional Status ── */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-blue-500">
                                    Academic Status
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.examFormFilled}
                                            onChange={(e) => setFormData(p => ({ ...p, examFormFilled: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Exam Form Filled</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Check if you have submitted the semester exam form</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.journalTaken}
                                            onChange={(e) => setFormData(p => ({ ...p, journalTaken: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Journal Taken</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Check if the engineering journal has been collected</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* ── KTs ── */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-blue-500">
                                    KTs (if any)
                                </h2>
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={ktInput}
                                        onChange={(e) => setKtInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKt(); } }}
                                        placeholder="e.g. Mathematics"
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addKt}
                                        className="px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        + Add KT
                                    </button>
                                </div>
                                {formData.kts.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.kts.map((kt, i) => (
                                            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                                                {kt}
                                                <button type="button" onClick={() => removeKt(i)} className="text-orange-400 hover:text-orange-700 ml-1">✕</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {formData.kts.length === 0 && (
                                    <p className="text-xs text-slate-400 italic">No KTs added. Leave empty if no KTs.</p>
                                )}
                            </div>

                            {/* ── Marks ── */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 pb-3 border-b-2 border-blue-500">
                                    End Semester Marks
                                    <span className="text-slate-400 text-xs font-normal ml-2 uppercase">(Optional)</span>
                                </h2>
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 px-1">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</span>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">End Sem Score</span>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Out Of</span>
                                        <span />
                                    </div>
                                    {formData.marks.map((mark, idx) => (
                                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <input
                                                type="text"
                                                value={mark.subject}
                                                onChange={(e) => handleMarkChange(idx, "subject", e.target.value)}
                                                placeholder="Subject name"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                value={mark.score}
                                                onChange={(e) => handleMarkChange(idx, "score", e.target.value)}
                                                placeholder="End Sem"
                                                min="0"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                value={mark.outOf}
                                                onChange={(e) => handleMarkChange(idx, "outOf", e.target.value)}
                                                placeholder="Out of"
                                                min="1"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeMarkRow(idx)}
                                                disabled={formData.marks.length === 1}
                                                className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Remove subject"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addMarkRow}
                                        className="w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 text-sm font-semibold hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                    >
                                        + Add Subject
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
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
                                {formLoading ? "Submitting..." : editingId ? "Update" : "Submit"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        );
    }

    // ─────────────────────────────── LIST VIEW ───────────────────────────────
    return (
        <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} theme="light" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Semester Records</h1>
                    <p className="text-slate-600 mt-1 text-sm sm:text-base">
                        Showing{" "}
                        <span className="font-semibold text-blue-600">{records.length}</span> semester records
                    </p>
                </div>
                <button
                    onClick={openFormForAdd}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
                >
                    + Add Semester Info
                </button>
            </div>

            <div className="min-h-[60vh]">
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                            <p className="text-slate-600">Loading...</p>
                        </div>
                    </div>
                )}

                {!loading && records.length === 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-10 sm:p-16 text-center">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-slate-600 text-lg font-medium">No semester records yet. Click "Add Semester Info" to get started!</p>
                    </div>
                )}

                {!loading && records.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {records.map((record) => (
                            <SemInfoCard
                                key={record._id}
                                record={record}
                                onEdit={openFormForEdit}
                                onDelete={handleDelete}
                                isDeleting={deletingId === record._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}