// import React, { useState, useEffect } from "react";
// import { placementService } from "../services/placementService";
// import { higherStudiesService } from "../services/higherStudiesService";
// import { studentService } from "../services/studentService";
// import { toast } from "react-toastify";
// import Pagination from "../components/Common/Pagination";

// // Placement Card Component - COMPACT
// function PlacementCard({ placement, onView, onDelete, onEdit, isDeleting }) {
//   // Student info from projected fields
//   const studentNameRaw = placement.studentName;
//   const studentName = studentNameRaw &&
//     (studentNameRaw.firstName || studentNameRaw.lastName) &&
//     `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim() !== "N/A"
//     ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim()
//     : null;
//   const studentID = placement.studentID && placement.studentID !== "N/A" ? placement.studentID : null;
//   const studentYear = placement.studentYear && placement.studentYear !== "N/A" ? placement.studentYear : null;

//   return (
//     <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
//       {/* Document/Image Preview Section */}
//       <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
//         {(() => {
//           const proofUrl = typeof placement?.placementProof === 'string'
//             ? placement.placementProof
//             : placement?.placementProof?.url;

//           if (!proofUrl) return (
//             <div className="text-slate-300 text-5xl font-bold">
//               {placement?.companyName?.charAt(0) || "?"}
//             </div>
//           );

//           return proofUrl.toLowerCase().endsWith(".pdf") ? (
//             <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
//               <iframe
//                 src={`${proofUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
//                 title="PDF Preview"
//                 className="w-full h-full border-none pointer-events-none"
//                 scrolling="no"
//                 tabIndex="-1"
//               />
//               <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
//                 <span className="bg-black/50 text-white text-xs px-2 py-1 rounded shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">PDF Preview</span>
//               </div>
//             </div>
//           ) : (
//             <img
//               src={proofUrl}
//               alt={placement?.companyName || "Placement"}
//               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             />
//           );
//         })()}

//         {/* Top Overlay: ID & Year */}
//         <div className="absolute top-2 left-2 flex gap-1">
//           {studentID && (
//             <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 rounded shadow-sm border border-white/20 uppercase tracking-tighter">
//               {studentID}
//             </span>
//           )}
//           {studentYear && (
//             <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white rounded shadow-sm border border-blue-500/20 uppercase tracking-tighter font-mono">
//               {studentYear}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 flex flex-col flex-grow">

//         {/* Student Name */}
//         {studentName && (
//           <div className="mb-2">
//             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
//             <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
//           </div>
//         )}

//         <div className="h-px bg-slate-100 mb-3" />

//         {/* Company Name */}
//         <h3 className="text-sm font-bold text-blue-600 mb-1 line-clamp-2">
//           {placement?.companyName || "N/A"}
//         </h3>

//         {/* Job Role */}
//         <p className="text-xs text-slate-600 mb-2 line-clamp-1">
//           {placement?.role || "N/A"}
//         </p>

//         {/* CTC */}
//         <div className="mb-2 pb-2 border-b border-slate-200">
//           <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
//             Package
//           </p>
//           <p className="text-lg font-bold text-green-600">
//             ₹{placement?.package ? `${placement.package} LPA` : "N/A"}
//           </p>
//         </div>

//         {/* Placement Type */}
//         <div className="mb-2">
//           <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
//             {placement?.placementType || "N/A"}
//           </span>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-auto space-y-2">
//           <button
//             onClick={() => onView && onView(placement)}
//             className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//           >
//             View Details
//           </button>

//           <div className="flex gap-2 w-full mt-2">
//             <button
//               onClick={() => onEdit && onEdit(placement)}
//               className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => onDelete && onDelete(placement._id)}
//               disabled={isDeleting}
//               className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${isDeleting
//                 ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                 : "bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
//                 }`}
//             >
//               {isDeleting ? "Deleting..." : "Delete"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Higher Studies Card Component - COMPACT
// function HigherStudyCard({ higherStudy, onView, onDelete, onEdit, isDeleting }) {
//   // Student info from projected fields
//   const studentNameRaw = higherStudy.studentName;
//   const studentName = studentNameRaw
//     ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim()
//     : "N/A";
//   const studentID = higherStudy.studentID || "N/A";
//   const studentYear = higherStudy.studentYear || "N/A";

//   return (
//     <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
//       {/* Document/Image Preview Section */}
//       <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
//         {higherStudy?.marksheet?.url ? (
//           higherStudy.marksheet.url.toLowerCase().endsWith(".pdf") ? (
//             <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
//               <iframe
//                 src={`${higherStudy.marksheet.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
//                 title="PDF Preview"
//                 className="w-full h-full border-none pointer-events-none"
//                 scrolling="no"
//                 tabIndex="-1"
//               />
//               <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
//                 <span className="bg-black/50 text-white text-xs px-2 py-1 rounded shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">PDF Preview</span>
//               </div>
//             </div>
//           ) : (
//             <img
//               src={higherStudy.marksheet.url}
//               alt={higherStudy?.examName || "Higher Study"}
//               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             />
//           )
//         ) : (
//           <div className="text-slate-300 text-5xl font-bold">
//             {higherStudy?.examName?.charAt(0) || "?"}
//           </div>
//         )}

//         {/* Top Overlay: ID & Year */}
//         <div className="absolute top-2 left-2 flex gap-1">
//           <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 rounded shadow-sm border border-white/20 uppercase tracking-tighter">
//             {studentID}
//           </span>
//           <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white rounded shadow-sm border border-blue-500/20 uppercase tracking-tighter font-mono">
//             {studentYear}
//           </span>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 flex flex-col flex-grow">

//         {/* Student Name */}
//         <div className="mb-2">
//           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
//           <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
//         </div>

//         <div className="h-px bg-slate-100 mb-3" />

//         {/* Exam Name */}
//         <h3 className="text-sm font-bold text-blue-600 mb-1 line-clamp-2">
//           {higherStudy?.examName || "N/A"}
//         </h3>

//         {/* Score */}
//         <div className="mb-3">
//           <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Exam Score</p>
//           <p className="text-lg font-black text-slate-900">{higherStudy?.score || "N/A"}</p>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-auto space-y-2">
//           <button
//             onClick={() => onView && onView(higherStudy)}
//             className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//           >
//             View Details
//           </button>

//           <div className="flex gap-2 w-full mt-2">
//             <button
//               onClick={() => onEdit && onEdit(higherStudy)}
//               className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => onDelete && onDelete(higherStudy._id)}
//               disabled={isDeleting}
//               className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${isDeleting
//                 ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
//                 : "bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
//                 }`}
//             >
//               {isDeleting ? "Deleting..." : "Delete"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Detail View Modal Component
// function DetailModal({ item, type, onClose }) {
//   const [studentDetails, setStudentDetails] = useState(null);
//   const [loadingStudent, setLoadingStudent] = useState(false);

//   useEffect(() => {
//     const fetchStudent = async () => {
//       if (!item?.stuID) return;
//       setLoadingStudent(true);
//       try {
//         const studentId = typeof item.stuID === 'string' ? item.stuID : item.stuID._id;
//         const res = await studentService.getSingleStudent(studentId);
//         if (res.success) {
//           setStudentDetails(res.data);
//         }
//       } catch (err) {
//         console.error("Error fetching student details for modal:", err);
//       } finally {
//         setLoadingStudent(false);
//       }
//     };

//     fetchStudent();
//   }, [item]);

//   if (!item) return null;

//   // Format student name (prefer fetched details, fallback to item data)
//   const studentNameRaw = studentDetails?.name || item.studentName;
//   const studentName = studentNameRaw
//     ? `${studentNameRaw.firstName || ""} ${studentNameRaw.middleName || ""} ${studentNameRaw.lastName || ""}`.trim()
//     : "N/A";

//   const studentID = studentDetails?.studentID || (typeof item.stuID === 'string' ? item.stuID : item.stuID?.studentID) || "N/A";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
//       <div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal Header */}
//         <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-lg sm:text-xl font-bold text-slate-900">
//               {type === "placement" ? "Placement Details" : "Higher Study Details"}
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Modal Content */}
//         <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">

//           {/* Top Info Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//             {/* Student Info Card */}
//             <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
//               {loadingStudent && (
//                 <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
//                   <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//               )}
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold uppercase">
//                   {studentName.charAt(0)}
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-slate-900 text-lg">{studentName}</h3>
//                   <p className="text-blue-600 font-semibold text-sm">{studentID}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-2">
//                 <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
//                   <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Year</p>
//                   <p className="text-sm font-bold text-slate-800">{studentDetails?.year || item.studentYear || "N/A"}</p>
//                 </div>
//                 <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
//                   <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Division</p>
//                   <p className="text-sm font-bold text-slate-800">{studentDetails?.division || "N/A"}</p>
//                 </div>
//                 <div className="bg-white/80 p-2 rounded-lg border border-blue-100 text-center">
//                   <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Branch</p>
//                   <p className="text-sm font-bold text-slate-800 truncate px-1">{studentDetails?.branch || "N/A"}</p>
//                 </div>
//               </div>

//               <div className="mt-4 pt-4 border-t border-blue-100/50 flex flex-col gap-2">
//                 <div className="flex items-center gap-2 text-xs text-slate-600">
//                   <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" /></svg>
//                   {studentDetails?.email || "N/A"}
//                 </div>
//                 <div className="flex items-center gap-2 text-xs text-slate-600">
//                   <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
//                   {studentDetails?.mobileNo || "N/A"}
//                 </div>
//               </div>
//             </div>

//             {/* Summary Card */}
//             <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
//               <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
//                 {type === "placement" ? "Placement Overview" : "Exam Details"}
//               </h3>
//               <div className="space-y-4">
//                 {type === "placement" ? (
//                   <>
//                     <div>
//                       <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Company & Role</p>
//                       <p className="text-base font-bold text-slate-900">{item.companyName}</p>
//                       <p className="text-sm font-medium text-slate-600 italic">{item.role}</p>
//                     </div>

//                     <div className="flex gap-4">
//                       <div className="flex-1">
//                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Package</p>
//                         <p className="text-sm font-bold text-blue-600">₹ {item.package} LPA</p>
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Type</p>
//                         <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">{item.placementType}</span>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50">
//                       <div>
//                         <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Placement</p>
//                         <p className="text-xs font-bold text-slate-800">{item.placementYear}</p>
//                       </div>
//                       <div>
//                         <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Passout</p>
//                         <p className="text-xs font-bold text-slate-800">{item.passoutYear}</p>
//                       </div>
//                       <div>
//                         <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Joining</p>
//                         <p className="text-xs font-bold text-slate-800">{item.joiningYear}</p>
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div>
//                       <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Exam Name</p>
//                       <p className="text-lg font-bold text-slate-900">{item.examName}</p>
//                     </div>
//                     <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block px-8 text-center">
//                       <p className="text-xs text-slate-500 font-bold uppercase mb-1">Score</p>
//                       <p className="text-2xl font-black text-blue-600">{item.score}</p>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Document Preview Section */}
//           <div className="space-y-4">
//             <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
//               <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
//               Document Previews
//             </h4>

//             <div className={`grid grid-cols-1 ${type === "higherStudy" && item.idCardPhoto?.url ? 'lg:grid-cols-2' : ''} gap-6`}>
//               {/* Primary Preview (Placement Proof / Marksheet) */}
//               <div className="flex flex-col">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-bold text-slate-700">
//                     {type === "placement" ? "Placement Proof (PDF)" : "Marksheet"}
//                   </span>
//                   {(type === "placement" ? item.placementProof : item.marksheet?.url) && (
//                     <a href={type === "placement" ? item.placementProof : item.marksheet.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
//                       Open Original <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
//                     </a>
//                   )}
//                 </div>
//                 {(type === "placement" ? item.placementProof : item.marksheet?.url) ? (
//                   <div className="h-[450px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner">
//                     {(type === "placement" ? item.placementProof : item.marksheet.url).toLowerCase().endsWith(".pdf") ? (
//                       <iframe
//                         src={`${type === "placement" ? item.placementProof : item.marksheet.url}#view=FitH`}
//                         className="w-full h-full border-none"
//                         title="Document Preview"
//                       />
//                     ) : (
//                       <img
//                         src={type === "placement" ? item.placementProof : item.marksheet.url}
//                         alt="Preview"
//                         className="w-full h-full object-contain p-2"
//                       />
//                     )}
//                   </div>
//                 ) : (
//                   <div className="h-64 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 italic text-sm">
//                     No document uploaded
//                   </div>
//                 )}
//               </div>

//               {/* Secondary Preview (Higher Studies ID Card) */}
//               {type === "higherStudy" && item.idCardPhoto?.url && (
//                 <div className="flex flex-col">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-bold text-slate-700">ID Card Photo</span>
//                     <a href={item.idCardPhoto.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
//                       View Full <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
//                     </a>
//                   </div>
//                   <div className="h-[450px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
//                     <img
//                       src={item.idCardPhoto.url}
//                       alt="ID Card"
//                       className="max-w-full max-h-full object-contain p-2 hover:scale-105 transition-transform"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Modal Footer */}
//         <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Form Modal Component (Add / Edit) for PLACEMENTS
// function PlacementFormModal({ isOpen, onClose, placement, onSave }) {
//   const [formData, setFormData] = useState({
//     studentId: "",
//     companyName: "",
//     role: "",
//     placementType: "Campus",
//     package: "",
//     placementYear: "",
//     passoutYear: "",
//     joiningYear: "",
//   });

//   const [placementProof, setPlacementProof] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;
//     if (placement) {
//       setFormData({
//         studentId: placement.studentID || "",
//         companyName: placement.companyName || "",
//         role: placement.role || "",
//         placementType: placement.placementType || "Campus",
//         package: placement.package || "",
//         placementYear: placement.placementYear || "",
//         passoutYear: placement.passoutYear || "",
//         joiningYear: placement.joiningYear || "",
//       });
//     } else {
//       setFormData({
//         studentId: "",
//         companyName: "",
//         role: "",
//         placementType: "Campus",
//         package: "",
//         placementYear: "",
//         passoutYear: "",
//         joiningYear: "",
//       });
//     }
//     setPlacementProof(null);
//   }, [isOpen, placement]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Size Validation (500KB)
//     if (file.size > 500 * 1024) {
//       toast.error("File size exceeds 500KB limit!");
//       e.target.value = "";
//       return;
//     }

//     // Type Validation (PDF/JPG/PNG)
//     if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
//       toast.error("Please upload a PDF or image file (JPG/PNG)!");
//       e.target.value = "";
//       return;
//     }

//     setPlacementProof(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = new FormData();
//       Object.keys(formData).forEach((key) => {
//         payload.append(key, formData[key]);
//       });

//       if (placementProof) {
//         payload.append("placementProof", placementProof);
//       }

//       let response;
//       if (placement) {
//         response = await placementService.updatePlacement(placement._id, payload);
//         toast.success("Placement updated successfully!");
//       } else {
//         if (!placementProof) {
//           toast.error("Placement proof (PDF/Image) is required for new records.");
//           setLoading(false);
//           return;
//         }
//         response = await placementService.createPlacement(payload);
//         toast.success("Placement added successfully!");
//       }

//       onSave(response.data || response);
//       onClose();
//     } catch (err) {
//       console.error("Error saving placement:", err);
//       const errorMessage =
//         err.response?.data?.errors?.map(e => e.message).join(", ") ||
//         err.response?.data?.error ||
//         err.response?.data?.message ||
//         "Failed to save record.";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm";
//   const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp">
//         <div className="sticky top-0 z-20 px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md">
//           <h2 className="text-2xl font-black text-slate-900 tracking-tight">
//             {placement ? "Edit Placement Details" : "Add New Placement"}
//           </h2>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-8">

//           <section>
//             <div className="flex items-center gap-2 mb-6">
//               <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
//               <h4 className="text-lg font-bold text-slate-800">Primary Details</h4>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
//               <div>
//                 <label className={labelClass}>Student ID *</label>
//                 <input type="text" name="studentId" required={!placement} disabled={!!placement} value={formData.studentId} onChange={handleChange} placeholder="e.g. 2024COMP123" className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`} />
//               </div>
//               <div>
//                 <label className={labelClass}>Company Name *</label>
//                 <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="e.g. Google, Microsoft, TCS" className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Job Role *</label>
//                 <input type="text" name="role" required value={formData.role} onChange={handleChange} placeholder="e.g. Software Engineer" className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Placement Type *</label>
//                 <select name="placementType" required value={formData.placementType} onChange={handleChange} className={inputClass}>
//                   <option value="Campus">Campus</option>
//                   <option value="Off-Campus">Off-Campus</option>
//                 </select>
//               </div>
//             </div>
//           </section>

//           <section>
//             <div className="flex items-center gap-2 mb-6">
//               <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
//               <h4 className="text-lg font-bold text-slate-800">Compensation & Timeline</h4>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
//               <div>
//                 <label className={labelClass}>Package (LPA) *</label>
//                 <div className="relative">
//                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
//                   <input type="number" step="0.01" min="1" max="100" name="package" required value={formData.package} onChange={handleChange} placeholder="e.g. 12.5" className={`${inputClass} pl-8`} />
//                 </div>
//               </div>
//               <div>
//                 <label className={labelClass}>Placement Year *</label>
//                 <input type="text" name="placementYear" placeholder="e.g. 2023-24" required value={formData.placementYear} onChange={handleChange} className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Passout Year *</label>
//                 <input type="text" name="passoutYear" placeholder="e.g. 2023-24" required value={formData.passoutYear} onChange={handleChange} className={inputClass} />
//               </div>
//               <div>
//                 <label className={labelClass}>Joining Year *</label>
//                 <input type="text" name="joiningYear" placeholder="e.g. 2024-25" required value={formData.joiningYear} onChange={handleChange} className={inputClass} />
//               </div>
//             </div>
//           </section>

//           <section>
//             <div className="flex items-center gap-2 mb-6">
//               <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
//               <h4 className="text-lg font-bold text-slate-800">Verification Proof</h4>
//             </div>

//             <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
//               <label className={labelClass}>
//                 Placement Proof (.pdf / image) {!placement && "*"}
//                 <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
//                   * Max 500KB, PDF/JPG/PNG only
//                 </span>
//               </label>
//               <input type="file" accept=".pdf, image/jpeg, image/png, image/jpg" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none transition-all cursor-pointer" />
//               {!placement && <p className="text-xs text-amber-600 mt-3 font-semibold px-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Placement Proof is strictly required when adding a new placement.</p>}
//             </div>
//           </section>

//           <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-6 flex justify-end gap-4 mt-8">
//             <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">Cancel</button>
//             <button type="submit" disabled={loading} className="px-10 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
//               {loading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Saving Changes...
//                 </>
//               ) : (
//                 placement ? "Update Placement" : "Add Placement"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // Main Admin Placement Component
// export default function AdminPlacement() {
//   const [activeTab, setActiveTab] = useState("placements");
//   const [placements, setPlacements] = useState([]);
//   const [higherStudies, setHigherStudies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [deletingId, setDeletingId] = useState(null);

//   // ── Shared filter ───────────────────────────────────────────────────────────
//   const [searchQuery, setSearchQuery] = useState("");

//   // ── Placement-specific filters ──────────────────────────────────────────────
//   const [filterYear, setFilterYear] = useState("");
//   const [filterDivision, setFilterDivision] = useState("");
//   const [filterPlacementType, setFilterPlacementType] = useState("");
//   const [filterPlacementYear, setFilterPlacementYear] = useState("");
//   const [filterPassoutYear, setFilterPassoutYear] = useState("");
//   const [filterJoiningYear, setFilterJoiningYear] = useState("");
//   const [filterPackageMin, setFilterPackageMin] = useState("");
//   const [filterPackageMax, setFilterPackageMax] = useState("");

//   // ── Higher Studies filters ─────────────────────────────────────────────
//   const [hsFilterYear, setHsFilterYear] = useState("");
//   const [hsFilterDivision, setHsFilterDivision] = useState("");
//   const [hsFilterExamName, setHsFilterExamName] = useState("");
//   const [hsFilterAcademicYear, setHsFilterAcademicYear] = useState("");
//   const [hsFilterScore, setHsFilterScore] = useState("");

//   // Modal State
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [modalType, setModalType] = useState(null);
//   const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
//   const [placementToEdit, setPlacementToEdit] = useState(null);
//   const [isHigherStudyModalOpen, setIsHigherStudyModalOpen] = useState(false);
//   const [higherStudyToEdit, setHigherStudyToEdit] = useState(null);

//   // Re-fetch whenever tab, page, or limit changes
//   useEffect(() => {
//     setCurrentPage(1); // Reset page when tab changes
//   }, [activeTab]);

//   useEffect(() => {
//     if (activeTab === "placements") {
//       fetchPlacements(currentPage);
//     } else {
//       fetchHigherStudies(currentPage);
//     }
//   }, [activeTab, currentPage, limit]);

//   const fetchPlacements = async (page = 1) => {
//     setLoading(true);
//     try {
//       const params = {
//         page,
//         limit,
//         search: searchQuery || undefined,
//         year: filterYear || undefined,
//         division: filterDivision || undefined,
//         placementType: filterPlacementType || undefined,
//         placementYear: filterPlacementYear || undefined,
//         passoutYear: filterPassoutYear || undefined,
//         joiningYear: filterJoiningYear || undefined,
//         packageMin: filterPackageMin ? Number(filterPackageMin) : undefined,
//         packageMax: filterPackageMax ? Number(filterPackageMax) : undefined,
//       };
//       const response = await placementService.getAllPlacements(params);

//       const data = response.data || [];
//       const total = response.total || 0;
//       const totalP = response.totalPages || 1;

//       setPlacements(data);
//       setTotalRecords(total);
//       setTotalPages(totalP);
//       if (page === 1) setCurrentPage(1);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching placements:", err);
//       setError("Failed to load placements!");
//       setPlacements([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHigherStudies = async (page = 1) => {
//     setLoading(true);
//     try {
//       const params = {
//         page,
//         limit,
//         search: searchQuery || undefined,
//         year: hsFilterYear || undefined,
//         division: hsFilterDivision || undefined,
//         examName: hsFilterExamName || undefined,
//         academicYear: hsFilterAcademicYear || undefined,
//         score: hsFilterScore || undefined,
//       };
//       const response = await higherStudiesService.getAllHigherStudies(params);

//       const data = response.data || [];
//       const total = response.total || 0;
//       const totalP = response.totalPages || 1;

//       setHigherStudies(data);
//       setTotalRecords(total);
//       setTotalPages(totalP);
//       if (page === 1) setCurrentPage(1);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching higher studies:", err);
//       setError("Failed to load higher studies!");
//       setHigherStudies([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewPlacement = (placement) => {
//     setSelectedItem(placement);
//     setModalType("placement");
//   };

//   const handleViewHigherStudy = (higherStudy) => {
//     setSelectedItem(higherStudy);
//     setModalType("higherStudy");
//   };

//   const handleCloseModal = () => {
//     setSelectedItem(null);
//     setModalType(null);
//   };

//   const handleSavePlacement = (updatedItem) => {
//     // ALWAYS refetch for both edit and new to ensure all 
//     // populated fields (student name, ID, year) are visible.
//     fetchPlacements(currentPage);
//   };

//   const handleSaveHigherStudy = (updatedItem) => {
//     // ALWAYS refetch for both edit and new to ensure all 
//     // populated fields (student name, ID, year) are visible.
//     fetchHigherStudies(currentPage);
//   };

//   const handleDeletePlacement = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this placement?"))
//       return;
//     setDeletingId(id);
//     try {
//       await placementService.deletePlacement(id);
//       // Remove from local state
//       setPlacements((prev) => prev.filter((p) => p._id !== id));
//       setTotalRecords((prev) => prev - 1);
//       toast.success("Placement deleted successfully!");
//     } catch (err) {
//       console.error("Error deleting placement:", err);
//       toast.error("Failed to delete placement.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const handleDeleteHigherStudy = async (id) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this higher study record?"
//       )
//     )
//       return;
//     setDeletingId(id);
//     try {
//       await higherStudiesService.deleteHigherStudy(id);
//       // Remove from local state
//       setHigherStudies((prev) => prev.filter((h) => h._id !== id));
//       setTotalRecords((prev) => prev - 1);
//       toast.success("Higher study record deleted successfully!");
//     } catch (err) {
//       console.error("Error deleting higher study:", err);
//       toast.error("Failed to delete higher study record.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const currentData =
//     activeTab === "placements" ? placements : higherStudies;

//   const handleExport = async () => {
//     try {
//       const isPlacement = activeTab === "placements";

//       if (currentData.length === 0) {
//         toast.warn("No data available to export.");
//         return;
//       }

//       setLoading(true);

//       const params = {
//         search: searchQuery || undefined,
//       };

//       if (isPlacement) {
//         params.year = filterYear || undefined;
//         params.division = filterDivision || undefined;
//         params.placementType = filterPlacementType || undefined;
//         params.placementYear = filterPlacementYear || undefined;
//         params.passoutYear = filterPassoutYear || undefined;
//         params.joiningYear = filterJoiningYear || undefined;
//         params.packageMin = filterPackageMin ? Number(filterPackageMin) : undefined;
//         params.packageMax = filterPackageMax ? Number(filterPackageMax) : undefined;
//       } else {
//         params.year = hsFilterYear || undefined;
//         params.division = hsFilterDivision || undefined;
//         params.examName = hsFilterExamName || undefined;
//         params.academicYear = hsFilterAcademicYear || undefined;
//         params.score = hsFilterScore || undefined;
//       }

//       const blob = isPlacement
//         ? await placementService.exportPlacements(params)
//         : await higherStudiesService.exportHigherStudies(params);

//       // Create download link
//       const url = window.URL.createObjectURL(new Blob([blob]));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${isPlacement ? "Placements" : "Higher_Studies"}_Export_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       toast.success("✅ Exported successfully!");
//     } catch (err) {
//       console.error("Error exporting data:", err);
//       toast.error("Failed to export data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
//       {/* Page Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-slate-900">Career Outcomes</h1>
//         <p className="text-slate-600 mt-2">
//           Manage{" "}
//           <span className="font-semibold text-blue-600">
//             {totalRecords}
//           </span>{" "}
//           {activeTab === "placements" ? "placements" : "higher studies"}
//         </p>
//       </div>

//       {/* Filters & Tabs */}
//       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">

//         {/* Row 1 — Search + Tab buttons + Export */}
//         <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-5">
//           <div className="flex-1 min-w-[240px]">
//             <input
//               type="text"
//               placeholder={`Search by ${activeTab === "placements" ? "company, role, or student name" : "exam name or student name"
//                 }...`}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             />
//             <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
//               <span className="font-semibold text-blue-600">Note:</span> {activeTab === "placements" ? (
//                 <>Search filters by <strong className="text-slate-700">Company Name</strong>, <strong className="text-slate-700">Role</strong>, <strong className="text-slate-700">Student ID</strong>, and <strong className="text-slate-700">Student Name</strong>.</>
//               ) : (
//                 <>Search filters by <strong className="text-slate-700">Exam Name</strong>, <strong className="text-slate-700">Student ID</strong>, and <strong className="text-slate-700">Student Name</strong>.</>
//               )}
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3 w-full md:w-auto md:ml-auto">
//             <button onClick={() => setActiveTab("placements")}
//               className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "placements" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
//                 }`}>Placements</button>

//             <button onClick={() => setActiveTab("higherStudies")}
//               className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "higherStudies" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
//                 }`}>Higher Studies</button>

//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 flex-1 sm:flex-none">
//               <button onClick={handleExport}
//                 className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                     d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 Export
//               </button>
//               <div className="text-[11px] text-slate-600 leading-tight">
//                 <span className="font-semibold text-slate-800 block mb-0.5">How to export:</span>
//                 1. Click <span className="font-semibold text-blue-600">Find</span> to apply filters.<br />
//                 2. Click <span className="font-semibold text-green-600">Export</span> to download the data.
//               </div>
//             </div>
//             {activeTab === "placements" && (
//               <button
//                 onClick={() => { setPlacementToEdit(null); setIsPlacementModalOpen(true); }}
//                 className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center">
//                 + Add Placement
//               </button>
//             )}
//             {activeTab === "higherStudies" && (
//               <button
//                 onClick={() => { setHigherStudyToEdit(null); setIsHigherStudyModalOpen(true); }}
//                 className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center">
//                 + Add Higher Study
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Row 2 — Advanced filters (placement tab only) */}
//         {activeTab === "placements" && (
//           <div>
//             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Advanced Filters</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

//               <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
//                 <option value="">Year (All)</option>
//                 <option value="SE">SE</option>
//                 <option value="TE">TE</option>
//                 <option value="BE">BE</option>
//               </select>

//               <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
//                 <option value="">Division (All)</option>
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//                 <option value="C">C</option>
//               </select>

//               <select value={filterPlacementType} onChange={(e) => setFilterPlacementType(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
//                 <option value="">Placement Type (All)</option>
//                 <option value="Campus">Campus</option>
//                 <option value="Off-Campus">Off-Campus</option>
//               </select>

//               <input type="text" placeholder="Placement Year (e.g. 2023-24)" value={filterPlacementYear}
//                 onChange={(e) => setFilterPlacementYear(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//               <input type="text" placeholder="Passout Year (e.g. 2023-24)" value={filterPassoutYear}
//                 onChange={(e) => setFilterPassoutYear(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//               <input type="text" placeholder="Joining Year (e.g. 2023-24)" value={filterJoiningYear}
//                 onChange={(e) => setFilterJoiningYear(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//               <input type="number" placeholder="Package Min (LPA)" value={filterPackageMin} min="1" max="100"
//                 onChange={(e) => setFilterPackageMin(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//               <input type="number" placeholder="Package Max (LPA)" value={filterPackageMax} min="1" max="100"
//                 onChange={(e) => setFilterPackageMax(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//             </div>

//             <div className="mt-3 flex gap-3">
//               <button
//                 onClick={() => fetchPlacements(1)}
//                 className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 Find Placements
//               </button>
//               <button
//                 onClick={() => {
//                   setFilterYear(""); setFilterDivision(""); setFilterPlacementType("");
//                   setFilterPlacementYear(""); setFilterPassoutYear(""); setFilterJoiningYear("");
//                   setFilterPackageMin(""); setFilterPackageMax("");
//                   fetchPlacements(1);
//                 }}
//                 className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Row 2 — Advanced filters (higher studies tab only) */}
//         {activeTab === "higherStudies" && (
//           <div>
//             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Advanced Filters</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

//               <select value={hsFilterYear} onChange={(e) => setHsFilterYear(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
//                 <option value="">Year (All)</option>
//                 <option value="SE">SE</option>
//                 <option value="TE">TE</option>
//                 <option value="BE">BE</option>
//               </select>

//               <select value={hsFilterDivision} onChange={(e) => setHsFilterDivision(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
//                 <option value="">Division (All)</option>
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//                 <option value="C">C</option>
//               </select>

//               <select value={hsFilterExamName} onChange={(e) => setHsFilterExamName(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
//                 <option value="">Exam (All)</option>
//                 <option value="GATE">GATE</option>
//                 <option value="CAT">CAT</option>
//                 <option value="GRE">GRE</option>
//                 <option value="TOEFL">TOEFL</option>
//                 <option value="IELTS">IELTS</option>
//                 <option value="UPSC">UPSC</option>
//               </select>

//               <input type="text" placeholder="Academic Year (e.g. 2024-2025)" value={hsFilterAcademicYear}
//                 onChange={(e) => setHsFilterAcademicYear(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//               <input type="text" placeholder="Score (Partial Match)" value={hsFilterScore}
//                 onChange={(e) => setHsFilterScore(e.target.value)}
//                 className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

//             </div>

//             <div className="mt-3 flex gap-3">
//               <button
//                 onClick={() => fetchHigherStudies(1)}
//                 className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 Find Higher Studies
//               </button>
//               <button
//                 onClick={() => {
//                   setHsFilterYear(""); setHsFilterDivision(""); setHsFilterExamName(""); setHsFilterAcademicYear(""); setHsFilterScore("");
//                   fetchHigherStudies(1);
//                 }}
//                 className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Cards Container */}
//       <div className="min-h-[60vh]">
//         {/* Loading State */}
//         {loading && (
//           <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-slate-600">Loading...</p>
//             </div>
//           </div>
//         )}

//         {/* Error State */}
//         {error && !loading && (
//           <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && currentData.length === 0 && (
//           <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
//             <svg
//               className="w-16 h-16 text-slate-300 mx-auto mb-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <p className="text-slate-600 text-lg font-medium">
//               {searchQuery
//                 ? `No ${activeTab === "placements" ? "placements" : "higher studies"
//                 } match your search.`
//                 : `No ${activeTab === "placements" ? "placements" : "higher studies"
//                 } found!`}
//             </p>
//           </div>
//         )}

//         {/* Cards Grid - 4 Columns */}
//         {!loading && !error && currentData.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//             {activeTab === "placements"
//               ? placements.map((p) => (
//                 <PlacementCard
//                   key={p._id}
//                   placement={p}
//                   onView={handleViewPlacement}
//                   onEdit={(placement) => { setPlacementToEdit(placement); setIsPlacementModalOpen(true); }}
//                   onDelete={handleDeletePlacement}
//                   isDeleting={deletingId === p._id}
//                 />
//               ))
//               : higherStudies.map((h) => (
//                 <HigherStudyCard
//                   key={h._id}
//                   higherStudy={h}
//                   onView={handleViewHigherStudy}
//                   onEdit={(hs) => { setHigherStudyToEdit(hs); setIsHigherStudyModalOpen(true); }}
//                   onDelete={handleDeleteHigherStudy}
//                   isDeleting={deletingId === h._id}
//                 />
//               ))}
//           </div>
//         )}

//         {/* Pagination Component */}
//         {!loading && !error && currentData.length > 0 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             totalRecords={totalRecords}
//             limit={limit}
//             onPageChange={(page) => setCurrentPage(page)}
//             onLimitChange={(newLimit) => {
//               setLimit(newLimit);
//               setCurrentPage(1);
//             }}
//           />
//         )}
//       </div>

//       {/* Detail Modal */}
//       {selectedItem && (
//         <DetailModal
//           item={selectedItem}
//           type={modalType}
//           onClose={handleCloseModal}
//         />
//       )}

//       {/* Placement Form Modal */}
//       <PlacementFormModal
//         isOpen={isPlacementModalOpen}
//         placement={placementToEdit}
//         onClose={() => setIsPlacementModalOpen(false)}
//         onSave={handleSavePlacement}
//       />

//       {/* Higher Study Form Modal */}
//       <HigherStudyFormModal
//         isOpen={isHigherStudyModalOpen}
//         higherStudy={higherStudyToEdit}
//         onClose={() => setIsHigherStudyModalOpen(false)}
//         onSave={handleSaveHigherStudy}
//       />
//     </main>
//   );
// }

// // Form Modal Component (Add / Edit) for HIGHER STUDIES
// function HigherStudyFormModal({ isOpen, onClose, higherStudy, onSave }) {
//   const [formData, setFormData] = useState({
//     studentId: "",
//     examName: "GATE",
//     score: "",
//   });

//   const [marksheet, setMarksheet] = useState(null);
//   const [idCardPhoto, setIdCardPhoto] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;

//     if (higherStudy) {
//       setFormData({
//         studentId: higherStudy.studentID || "",
//         examName: higherStudy.examName || "GATE",
//         score: higherStudy.score || "",
//       });
//     } else {
//       setFormData({
//         studentId: "",
//         examName: "GATE",
//         score: "",
//       });
//     }
//     setMarksheet(null);
//     setIdCardPhoto(null);
//   }, [isOpen, higherStudy]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e, setter) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Size Validation (500KB)
//     if (file.size > 500 * 1024) {
//       toast.error("File size exceeds 500KB limit!");
//       e.target.value = "";
//       return;
//     }

//     // Type Validation (PDF/JPG/PNG)
//     if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
//       toast.error("Please upload a PDF or image file (JPG/PNG)!");
//       e.target.value = "";
//       return;
//     }

//     setter(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = new FormData();
//       Object.keys(formData).forEach((key) => {
//         payload.append(key, formData[key]);
//       });

//       if (marksheet) {
//         payload.append("marksheet", marksheet);
//       }
//       if (idCardPhoto) {
//         payload.append("idCardPhoto", idCardPhoto);
//       }

//       let response;
//       if (higherStudy) {
//         response = await higherStudiesService.updateHigherStudy(higherStudy._id, payload);
//         toast.success("Higher study record updated successfully!");
//       } else {
//         if (!marksheet || !idCardPhoto) {
//           toast.error("Both Marksheet and ID Card Photo are required for new records.");
//           setLoading(false);
//           return;
//         }
//         response = await higherStudiesService.createHigherStudy(payload);
//         toast.success("Higher study record added successfully!");
//       }

//       onSave(response.data || response);
//       onClose();
//     } catch (err) {
//       console.error("Error saving higher study:", err);
//       toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save record.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm";
//   const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp">
//         <div className="sticky top-0 z-20 px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-md">
//           <h2 className="text-2xl font-black text-slate-900 tracking-tight">
//             {higherStudy ? "Edit Higher Study Details" : "Add New Higher Study"}
//           </h2>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-8">

//           <section>
//             <div className="flex items-center gap-2 mb-6">
//               <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
//               <h4 className="text-lg font-bold text-slate-800">Exam Details</h4>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
//               <div>
//                 <label className={labelClass}>Student ID *</label>
//                 <input type="text" name="studentId" required={!higherStudy} disabled={!!higherStudy} value={formData.studentId} onChange={handleChange} placeholder="e.g. 2024COMP123" className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`} />
//               </div>
//               <div>
//                 <label className={labelClass}>Exam Name *</label>
//                 <select name="examName" required value={formData.examName} onChange={handleChange} className={inputClass}>
//                   <option value="GATE">GATE</option>
//                   <option value="CAT">CAT</option>
//                   <option value="GRE">GRE</option>
//                   <option value="TOEFL">TOEFL</option>
//                   <option value="IELTS">IELTS</option>
//                   <option value="UPSC">UPSC</option>
//                 </select>
//               </div>
//               <div className="md:col-span-2">
//                 <label className={labelClass}>Score *</label>
//                 <input type="text" name="score" required value={formData.score} onChange={handleChange} placeholder="e.g. 98.5% or 165/155" className={inputClass} />
//               </div>
//             </div>
//           </section>

//           <section>
//             <div className="flex items-center gap-2 mb-6">
//               <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
//               <h4 className="text-lg font-bold text-slate-800">Verification Proofs</h4>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
//               <div>
//                 <label className={labelClass}>
//                   Marksheet (.pdf / image) {!higherStudy && "*"}
//                   <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
//                     * Max 500KB, PDF/JPG/PNG only
//                   </span>
//                 </label>
//                 <input type="file" accept=".pdf, image/jpeg, image/png, image/jpg" onChange={(e) => handleFileChange(e, setMarksheet)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none transition-all cursor-pointer" />
//               </div>
//               <div>
//                 <label className={labelClass}>
//                   ID Card Photo {!higherStudy && "*"}
//                   <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
//                     * Max 500KB, JPG/PNG only
//                   </span>
//                 </label>
//                 <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => handleFileChange(e, setIdCardPhoto)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none transition-all cursor-pointer" />
//               </div>
//             </div>
//             {!higherStudy && <p className="text-xs text-amber-600 mt-3 font-semibold px-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Both Marksheet and ID Card Photo are strictly required when adding a new record.</p>}
//           </section>

//           <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-6 flex justify-end gap-4 mt-8">
//             <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">Cancel</button>
//             <button type="submit" disabled={loading} className="px-10 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
//               {loading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Saving Changes...
//                 </>
//               ) : (
//                 higherStudy ? "Update Higher Study" : "Add Higher Study"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { placementService } from "../services/placementService";
import { studentService } from "../services/studentService";
import { toast } from "react-toastify";
import Pagination from "../components/Common/Pagination";

function PlacementCard({ placement, onView, onDelete, onEdit, isDeleting }) {
  const studentNameRaw = placement.studentName;
  const studentName =
    studentNameRaw &&
    (studentNameRaw.firstName || studentNameRaw.lastName) &&
    `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim() !== "N/A"
      ? `${studentNameRaw.firstName || ""} ${studentNameRaw.lastName || ""}`.trim()
      : null;

  const studentID = placement.studentID && placement.studentID !== "N/A" ? placement.studentID : null;
  const studentYear = placement.studentYear && placement.studentYear !== "N/A" ? placement.studentYear : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
        {(() => {
          const proofUrl = typeof placement?.placementProof === "string"
            ? placement.placementProof
            : placement?.placementProof?.url;

          if (!proofUrl) {
            return (
              <div className="text-slate-300 text-5xl font-bold">
                {placement?.companyName?.charAt(0) || "?"}
              </div>
            );
          }

          return proofUrl.toLowerCase().endsWith(".pdf") ? (
            <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
              <iframe
                src={`${proofUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
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
              src={proofUrl}
              alt={placement?.companyName || "Placement"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          );
        })()}

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

      <div className="p-4 flex flex-col flex-grow">
        {studentName && (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Student</p>
            <h4 className="text-sm font-black text-slate-900 line-clamp-1">{studentName}</h4>
          </div>
        )}

        <div className="h-px bg-slate-100 mb-3" />

        <h3 className="text-sm font-bold text-blue-600 mb-1 line-clamp-2">
          {placement?.companyName || "N/A"}
        </h3>

        <p className="text-xs text-slate-600 mb-2 line-clamp-1">
          {placement?.role || "N/A"}
        </p>

        <div className="mb-2 pb-2 border-b border-slate-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Package</p>
          <p className="text-lg font-bold text-green-600">
            ₹{placement?.package ? `${placement.package} LPA` : "N/A"}
          </p>
        </div>

        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
            {placement?.placementType || "N/A"}
          </span>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => onView && onView(placement)}
            className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => onEdit && onEdit(placement)}
              className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(placement._id)}
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

  const proofUrl = typeof item.placementProof === "string" ? item.placementProof : item.placementProof?.url || item.placementProof;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Placement Details</h2>
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
                Placement Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Company & Role</p>
                  <p className="text-base font-bold text-slate-900">{item.companyName}</p>
                  <p className="text-sm font-medium text-slate-600 italic">{item.role}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Package</p>
                    <p className="text-sm font-bold text-blue-600">₹ {item.package} LPA</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Type</p>
                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-full">{item.placementType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50">
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Placement</p>
                    <p className="text-xs font-bold text-slate-800">{item.placementYear}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Passout</p>
                    <p className="text-xs font-bold text-slate-800">{item.passoutYear}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Joining</p>
                    <p className="text-xs font-bold text-slate-800">{item.joiningYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Document Previews
            </h4>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">Placement Proof (PDF / Image)</span>
                  {proofUrl && (
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                      Open Original
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>

                {proofUrl ? (
                  <div className="h-[450px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shadow-inner">
                    {proofUrl.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={`${proofUrl}#view=FitH`}
                        className="w-full h-full border-none"
                        title="Document Preview"
                      />
                    ) : (
                      <img
                        src={proofUrl}
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

function PlacementFormModal({ isOpen, onClose, placement, onSave }) {
  const [formData, setFormData] = useState({
    studentId: "",
    companyName: "",
    role: "",
    placementType: "Campus",
    package: "",
    placementYear: "",
    passoutYear: "",
    joiningYear: "",
  });
  const [placementProof, setPlacementProof] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (placement) {
      setFormData({
        studentId: placement.studentID || "",
        companyName: placement.companyName || "",
        role: placement.role || "",
        placementType: placement.placementType || "Campus",
        package: placement.package || "",
        placementYear: placement.placementYear || "",
        passoutYear: placement.passoutYear || "",
        joiningYear: placement.joiningYear || "",
      });
    } else {
      setFormData({
        studentId: "",
        companyName: "",
        role: "",
        placementType: "Campus",
        package: "",
        placementYear: "",
        passoutYear: "",
        joiningYear: "",
      });
    }
    setPlacementProof(null);
  }, [isOpen, placement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
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

    setPlacementProof(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
      if (placementProof) payload.append("placementProof", placementProof);

      let response;
      if (placement) {
        response = await placementService.updatePlacement(placement._id, payload);
        toast.success("Placement updated successfully!");
      } else {
        if (!placementProof) {
          toast.error("Placement proof (PDF/Image) is required for new records.");
          setLoading(false);
          return;
        }
        response = await placementService.createPlacement(payload);
        toast.success("Placement added successfully!");
      }

      onSave(response.data || response);
      onClose();
    } catch (err) {
      console.error("Error saving placement:", err);
      const errorMessage =
        err.response?.data?.errors?.map((e) => e.message).join(", ") ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save record.";
      toast.error(errorMessage);
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
            {placement ? "Edit Placement Details" : "Add New Placement"}
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
              <div>
                <label className={labelClass}>Student ID *</label>
                <input type="text" name="studentId" required={!placement} disabled={!!placement} value={formData.studentId} onChange={handleChange} placeholder="e.g. 2024COMP123" className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Company Name *</label>
                <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="e.g. Google, Microsoft, TCS" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Job Role *</label>
                <input type="text" name="role" required value={formData.role} onChange={handleChange} placeholder="e.g. Software Engineer" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Placement Type *</label>
                <select name="placementType" required value={formData.placementType} onChange={handleChange} className={inputClass}>
                  <option value="Campus">Campus</option>
                  <option value="Off-Campus">Off-Campus</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Compensation & Timeline</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className={labelClass}>Package (LPA) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input type="number" step="0.01" min="1" max="100" name="package" required value={formData.package} onChange={handleChange} placeholder="e.g. 12.5" className={`${inputClass} pl-8`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Placement Year *</label>
                <input type="text" name="placementYear" placeholder="e.g. 2023-24" required value={formData.placementYear} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Passout Year *</label>
                <input type="text" name="passoutYear" placeholder="e.g. 2023-24" required value={formData.passoutYear} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Joining Year *</label>
                <input type="text" name="joiningYear" placeholder="e.g. 2024-25" required value={formData.joiningYear} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-800">Verification Proof</h4>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <label className={labelClass}>
                Placement Proof (.pdf / image) {!placement && "*"}
                <span className="block text-[10px] text-red-500 font-bold italic normal-case mt-1 leading-tight">
                  * Max 500KB, PDF/JPG/PNG only
                </span>
              </label>
              <input type="file" accept=".pdf, image/jpeg, image/png, image/jpg" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none transition-all cursor-pointer" />
              {!placement && <p className="text-xs text-amber-600 mt-3 font-semibold px-2 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Placement Proof is strictly required when adding a new placement.</p>}
            </div>
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
                placement ? "Update Placement" : "Add Placement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPlacement() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterPlacementType, setFilterPlacementType] = useState("");
  const [filterPlacementYear, setFilterPlacementYear] = useState("");
  const [filterPassoutYear, setFilterPassoutYear] = useState("");
  const [filterJoiningYear, setFilterJoiningYear] = useState("");
  const [filterPackageMin, setFilterPackageMin] = useState("");
  const [filterPackageMax, setFilterPackageMax] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [placementToEdit, setPlacementToEdit] = useState(null);

  const fetchPlacements = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        year: filterYear || undefined,
        division: filterDivision || undefined,
        placementType: filterPlacementType || undefined,
        placementYear: filterPlacementYear || undefined,
        passoutYear: filterPassoutYear || undefined,
        joiningYear: filterJoiningYear || undefined,
        packageMin: filterPackageMin ? Number(filterPackageMin) : undefined,
        packageMax: filterPackageMax ? Number(filterPackageMax) : undefined,
      };

      const response = await placementService.getAllPlacements(params);
      const data = response.data || [];
      const total = response.total || 0;
      const totalP = response.totalPages || 1;

      setPlacements(data);
      setTotalRecords(total);
      setTotalPages(totalP);
      if (page === 1) setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error("Error fetching placements:", err);
      setError("Failed to load placements!");
      setPlacements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const handleViewPlacement = (placement) => setSelectedItem(placement);
  const handleCloseModal = () => setSelectedItem(null);

  const handleSavePlacement = () => {
    fetchPlacements(currentPage);
  };

  const handleDeletePlacement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) return;
    setDeletingId(id);
    try {
      await placementService.deletePlacement(id);
      setPlacements((prev) => prev.filter((p) => p._id !== id));
      setTotalRecords((prev) => prev - 1);
      toast.success("Placement deleted successfully!");
    } catch (err) {
      console.error("Error deleting placement:", err);
      toast.error("Failed to delete placement.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    try {
      if (placements.length === 0) {
        toast.warn("No data available to export.");
        return;
      }

      setLoading(true);
      const params = {
        search: searchQuery || undefined,
        year: filterYear || undefined,
        division: filterDivision || undefined,
        placementType: filterPlacementType || undefined,
        placementYear: filterPlacementYear || undefined,
        passoutYear: filterPassoutYear || undefined,
        joiningYear: filterJoiningYear || undefined,
        packageMin: filterPackageMin ? Number(filterPackageMin) : undefined,
        packageMax: filterPackageMax ? Number(filterPackageMax) : undefined,
      };

      const blob = await placementService.exportPlacements(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Placements_Export_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`;
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
        <h1 className="text-3xl font-bold text-slate-900">Placements</h1>
        <p className="text-slate-600 mt-2">
          Manage <span className="font-semibold text-blue-600">{totalRecords}</span> placements
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
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
              <span className="font-semibold text-blue-600">Note:</span> Search filters by <strong className="text-slate-700">Company Name</strong>, <strong className="text-slate-700">Role</strong>, <strong className="text-slate-700">Student ID</strong>, and <strong className="text-slate-700">Student Name</strong>.
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
              onClick={() => { setPlacementToEdit(null); setIsPlacementModalOpen(true); }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center"
            >
              + Add Placement
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Year (All)</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>

            <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Division (All)</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>

            <select value={filterPlacementType} onChange={(e) => setFilterPlacementType(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
              <option value="">Placement Type (All)</option>
              <option value="Campus">Campus</option>
              <option value="Off-Campus">Off-Campus</option>
            </select>

            <input type="text" placeholder="Placement Year (e.g. 2023-24)" value={filterPlacementYear} onChange={(e) => setFilterPlacementYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Passout Year (e.g. 2023-24)" value={filterPassoutYear} onChange={(e) => setFilterPassoutYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Joining Year (e.g. 2023-24)" value={filterJoiningYear} onChange={(e) => setFilterJoiningYear(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Package Min (LPA)" value={filterPackageMin} min="1" max="100" onChange={(e) => setFilterPackageMin(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Package Max (LPA)" value={filterPackageMax} min="1" max="100" onChange={(e) => setFilterPackageMax(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mt-3 flex gap-3">
            <button onClick={() => fetchPlacements(1)} className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Placements
            </button>
            <button onClick={() => { setFilterYear(""); setFilterDivision(""); setFilterPlacementType(""); setFilterPlacementYear(""); setFilterPassoutYear(""); setFilterJoiningYear(""); setFilterPackageMin(""); setFilterPackageMax(""); fetchPlacements(1); }} className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition flex items-center gap-2">
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

        {!loading && !error && placements.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 text-lg font-medium">
              {searchQuery ? "No placements match your search." : "No placements found!"}
            </p>
          </div>
        )}

        {!loading && !error && placements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {placements.map((p) => (
              <PlacementCard
                key={p._id}
                placement={p}
                onView={handleViewPlacement}
                onEdit={(placement) => { setPlacementToEdit(placement); setIsPlacementModalOpen(true); }}
                onDelete={handleDeletePlacement}
                isDeleting={deletingId === p._id}
              />
            ))}
          </div>
        )}

        {!loading && !error && placements.length > 0 && (
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

      <PlacementFormModal
        isOpen={isPlacementModalOpen}
        placement={placementToEdit}
        onClose={() => setIsPlacementModalOpen(false)}
        onSave={handleSavePlacement}
      />
    </main>
  );
}
