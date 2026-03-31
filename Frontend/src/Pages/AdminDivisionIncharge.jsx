import React, { useState, useEffect, useRef } from "react";
import { divisionInchargeService } from "../services/divisionInchargeService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";

// ── Helpers ─────────────────────────────────────────────────────────────────
const YEARS = ["SE", "TE", "BE"];
const DIVISIONS = ["A", "B", "C"];

// ── Card ────────────────────────────────────────────────────────────────────
function DivisionInchargeCard({ incharge, onView, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col gap-3">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg border-2 border-violet-200 flex-shrink-0">
                    {incharge.name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{incharge.name || "—"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {[incharge.year, incharge.division && `Div ${incharge.division}`].filter(Boolean).join(" · ")}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{incharge.email || "—"}</div>
                </div>
            </div>
            <div className="border-t border-slate-100" />
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onView(incharge)}
                    className="px-2 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition">
                    View
                </button>
                <button onClick={() => onEdit(incharge)}
                    className="px-2 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition">
                    Edit
                </button>
                <button onClick={() => onDelete(incharge._id)}
                    className="px-2 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition">
                    Delete
                </button>
            </div>
        </div>
    );
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ incharge, onClose, onEditEmail }) {
    if (!incharge) return null;
    const [newEmail, setNewEmail] = useState("");
    const [changingEmail, setChangingEmail] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) return;
        try {
            setChangingEmail(true);
            await divisionInchargeService.changeEmail(incharge._id, newEmail.trim());
            toast.success("✅ Email changed successfully. New password sent to the new email.");
            onEditEmail();
            onClose();
        } catch (err) {
            const resData = err.response?.data;
            if (resData?.errors && Array.isArray(resData.errors)) {
                resData.errors.forEach(e => toast.error(e.message || "Validation Error"));
            } else {
                toast.error(resData?.message || "Failed to change email.");
            }
        } finally {
            setChangingEmail(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Incharge Details</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-2xl border-2 border-violet-200">
                            {incharge.name?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">{incharge.name}</div>
                            <div className="text-sm text-slate-500">{incharge.year} · Division {incharge.division}</div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Email</span>
                            <span className="text-slate-800 font-semibold">{incharge.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Year</span>
                            <span className="text-slate-800 font-semibold">{incharge.year}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Division</span>
                            <span className="text-slate-800 font-semibold">{incharge.division}</span>
                        </div>
                    </div>

                    {/* Change Email Section */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                        <button onClick={() => setShowEmailForm(!showEmailForm)}
                            className="text-sm font-semibold text-violet-700 hover:underline flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {showEmailForm ? "Cancel Email Change" : "Change Email"}
                        </button>
                        {showEmailForm && (
                            <form onSubmit={handleChangeEmail} className="mt-3 flex gap-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="New email address"
                                    required
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                                <button type="submit" disabled={changingEmail}
                                    className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition disabled:opacity-60">
                                    {changingEmail ? "Saving..." : "Save"}
                                </button>
                            </form>
                        )}
                        {showEmailForm && (
                            <p className="text-xs text-amber-600 mt-2">⚠️ A new password will be sent to the new email address.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ incharge, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: incharge?.name || "",
        year: incharge?.year || "",
        division: incharge?.division || "",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name && !form.year && !form.division) return toast.warn("Provide at least one field.");
        try {
            setSaving(true);
            await divisionInchargeService.updateDetails(incharge._id, form);
            toast.success("✅ Details updated successfully.");
            onSaved();
            onClose();
        } catch (err) {
            const resData = err.response?.data;
            if (resData?.errors && Array.isArray(resData.errors)) {
                resData.errors.forEach(e => toast.error(e.message || "Validation Error"));
            } else {
                toast.error(resData?.message || "Failed to update details.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-white leading-tight">Edit Incharge</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
                        <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none bg-white">
                            <option value="">Select Year</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Division</label>
                        <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none bg-white">
                            <option value="">Select Division</option>
                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-60">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Add Modal ────────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdded }) {
    const [form, setForm] = useState({ name: "", year: "", division: "", email: "" });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await divisionInchargeService.addSingle(form);
            toast.success("✅ Division Incharge added. Password sent via email.");
            onAdded();
            onClose();
        } catch (err) {
            const resData = err.response?.data;
            if (resData?.errors && Array.isArray(resData.errors)) {
                resData.errors.forEach(e => toast.error(e.message || "Validation Error"));
            } else {
                toast.error(resData?.message || "Failed to add Division Incharge.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-white leading-tight">Add Incharge</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm" placeholder="e.g. Prof. Rahul Sharma" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year <span className="text-red-500">*</span></label>
                            <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm appearance-none bg-white">
                                <option value="">Year</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Division <span className="text-red-500">*</span></label>
                            <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} required
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm appearance-none bg-white">
                                <option value="">Division</option>
                                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm" placeholder="incharge@college.edu" />
                    </div>
                    <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                        ℹ️ A login password will be auto-generated and sent to the provided email.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-60">
                            {saving ? "Adding..." : "Add Incharge"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDivisionIncharge() {
    const [incharges, setIncharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Applied Filters State (Snapshot for WYSIWYG)
    const [appliedFilters, setAppliedFilters] = useState({});

    // Modal state
    const [viewTarget, setViewTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);



    useEffect(() => {
        fetchIncharges(currentPage);
    }, [currentPage, limit, appliedFilters]);

    const fetchIncharges = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page,
                limit,
                ...appliedFilters
            };
            const response = await divisionInchargeService.getAll(params);

            const data = response?.data || [];
            const total = response?.total ?? data.length; // Fallback to array length if no pagination
            const totalP = response?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1);

            setIncharges(data);
            setTotalRecords(total);
            setTotalPages(totalP);
            if (page === 1) setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching division incharges:", err);
            setError("Failed to load Division Incharges. Please try again.");
            setIncharges([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this Division Incharge? This cannot be undone.")) return;
        try {
            await divisionInchargeService.delete(id);
            toast.success("✅ Division Incharge deleted.");
            fetchIncharges(currentPage);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete.");
        }
    };

    const handleFind = () => {
        setAppliedFilters({
            search: searchQuery || undefined,
        });
        setCurrentPage(1);
    };






    return (
        <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Division Incharges</h1>
                <p className="text-slate-600 mt-2">
                    <span className="font-semibold text-violet-600">{totalRecords}</span> incharges
                </p>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-8 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="relative flex-1 min-w-[220px]">
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-4 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm font-bold placeholder:font-normal"
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 ml-1">
                        <span className="font-semibold text-violet-600">Note:</span> Search box scans for <strong className="text-slate-700">Name</strong> and <strong className="text-slate-700">Email</strong>.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleFind}
                        className="px-6 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find Incharges
                    </button>

                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(""); }}
                            className="px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Clear All
                        </button>
                    )}
                </div>

                {/* Add Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Incharge
                </button>




            </div>

            {/* Content */}
            <div className="min-h-[50vh]">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {!loading && !error && incharges.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center border-dashed">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-50 mb-4">
                            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            {searchQuery ? "No results found" : "No Division Incharges Yet"}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {searchQuery ? "Try a different search term." : "Click \"Add Incharge\" to create the first one."}
                        </p>
                    </div>
                )}

                {!loading && !error && incharges.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {incharges.map((incharge) => (
                            <DivisionInchargeCard
                                key={incharge._id}
                                incharge={incharge}
                                onView={setViewTarget}
                                onEdit={setEditTarget}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Component */}
                {!loading && !error && incharges.length > 0 && (
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

            {/* Modals */}
            {showAddModal && (
                <AddModal
                    onClose={() => setShowAddModal(false)}
                    onAdded={fetchIncharges}
                />
            )}
            {viewTarget && (
                <DetailModal
                    incharge={viewTarget}
                    onClose={() => setViewTarget(null)}
                    onEditEmail={fetchIncharges}
                />
            )}
            {editTarget && (
                <EditModal
                    incharge={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={() => fetchIncharges(currentPage)}
                />
            )}
        </main>
    );
}