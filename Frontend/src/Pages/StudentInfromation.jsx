import React, { useState, useEffect } from "react";
import { studentService } from "../services/studentService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StudentInformation() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true); // Default to true, switch to false if data exists
  const [hasData, setHasData] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    motherName: "",
    PRN: "",
    branch: "",
    year: "",
    division: "",
    academicYear: "",
    dob: "",
    bloodGroup: "",
    currentStreet: "",
    currentCity: "",
    pincode: "",
    nativeStreet: "",
    nativeCity: "",
    nativePincode: "",
    category: "",
    mobileNo: "",
    parentMobileNo: "",
    parentEmail: "",
    abcId: "",
  });

  const [studentPhoto, setStudentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Pre-defined options based on validators
  const branches = ["Computer", "IT", "AIDS", "Civil", "Chemical", "Mechanical"];
  const years = ["SE", "TE", "BE"];
  const divisions = ["A", "B", "C"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const categories = ["Open", "EWS", "EBC", "OBC", "SC", "ST", "Other"];

  useEffect(() => {
    fetchStudentData();
  }, []);

  const copyCurrentAddress = () => {
    setFormData(prev => ({
      ...prev,
      nativeStreet: prev.currentStreet,
      nativeCity: prev.currentCity,
      nativePincode: prev.pincode
    }));
    toast.info("Address copied!");
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using Nominatim (OpenStreetMap) for better postcode retrieval
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
            const pincode = data.address.postcode || "";

            setFormData((prev) => ({
              ...prev,
              currentCity: city,
              pincode: pincode || prev.pincode, // Keep existing if new is empty
            }));

            if (city) {
              toast.success(`Location fetched: ${city}`);
            }
            if (!pincode) {
              toast.warning("Precise pincode not found. Please enter manually.");
            }
          }
        } catch (err) {
          console.error("Error fetching location:", err);
          toast.error("Failed to fetch location details.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeoLoading(false);
        toast.error(error.message || "Failed to get current position.");
      }
    );
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyData();
      if (data && data.success && data.data) {
        const s = data.data;

        // Define what constitutes "having data" - e.g. check if PRN exists
        // If data exists, show view mode by default
        setStudentId(s._id || s.id);

        if (s.PRN && s.branch) {
          setHasData(true);
          setIsEditMode(false);
        }

        // Map backend data structure to flat form state
        setFormData({
          firstName: s.name?.firstName || "",
          middleName: s.name?.middleName || "",
          lastName: s.name?.lastName || "",
          motherName: s.name?.motherName || "",
          PRN: s.PRN || "",
          branch: s.branch || "",
          year: s.year || "",
          division: s.division || "",
          academicYear: s.academicYear || "",
          dob: s.dob ? new Date(s.dob).toISOString().split("T")[0] : "",
          bloodGroup: s.bloodGroup || "",
          currentStreet: s.currentAddress?.street || "",
          currentCity: s.currentAddress?.city || "",
          pincode: s.currentAddress?.pincode || "",
          nativeStreet: s.nativeAddress?.street || "",
          nativeCity: s.nativeAddress?.city || "",
          nativePincode: s.nativeAddress?.nativePincode || "",
          category: s.category || "",
          mobileNo: s.mobileNo || "",
          parentMobileNo: s.parentMobileNo || "",
          parentEmail: s.parentEmail || "",
          abcId: s.abcId || "",
        });
        if (s.studentPhoto?.url) {
          setPhotoPreview(s.studentPhoto.url);
        }
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      // It's possible data doesn't exist yet, which is fine
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Enforce Capitalization for Name Fields
    if (["firstName", "middleName", "lastName", "motherName"].includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
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

    setStudentPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();

      // Append all text fields
      Object.keys(formData).forEach(key => {
        data.append(key, typeof formData[key] === 'string' ? formData[key].trim() : formData[key]);
      });

      // Append photo if selected
      if (studentPhoto) {
        data.append("studentPhoto", studentPhoto);
      }

      if (hasData && studentId) {
        await studentService.updateStudent(studentId, data);
        toast.success("Student information updated successfully!");
      } else {
        await studentService.addStudent(data);
        toast.success("Student information saved successfully!");
      }

      setHasData(true);

      // Delay switching to view mode slightly to let user see success message, or switch immediately
      // Let's re-fetch to ensure data consistency
      await fetchStudentData();
      setIsEditMode(false);
      window.scrollTo(0, 0);

    } catch (err) {
      console.error("Error saving student info:", err);
      const resData = err.response?.data;
      const errorMsg = resData?.message || err.message || "Failed to save information.";
      if (resData?.errors && Array.isArray(resData.errors)) {
        resData.errors.forEach((errObj) => {
          toast.error(errObj.message || "Validation error");
        });
      } else {
        toast.error(errorMsg);
      }
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    // Re-fetch data to reset form to saved state
    fetchStudentData();
    setIsEditMode(false);
  };

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading student details...</p>
        </div>
      </main>
    );
  }

  // =============== VIEW MODE (CARDS) ===============
  if (!isEditMode && hasData) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <ToastContainer position="top-right" autoClose={5000} theme="light" />
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Photo & Basic Info */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-slate-50 mx-auto mb-4 shadow-md">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {capitalize(formData.firstName)} {capitalize(formData.lastName)}
                </h2>
                <p className="text-slate-500 font-medium  mt-1">{formData.branch}</p>
                <p className="text-sm text-slate-400 mt-1">{formData.year} - {formData.division}</p>

                <button
                  onClick={() => setIsEditMode(true)}
                  className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                >
                  Edit Information
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Academic IDs</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">PRN</p>
                    <p className="text-base font-medium text-slate-800">{formData.PRN}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">ABC ID</p>
                    <p className="text-base font-medium text-slate-800">{formData.abcId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Academic Year</p>
                    <p className="text-base font-medium text-slate-800">{formData.academicYear || "N/A"}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Detailed Info */}
            <div className="w-full md:w-2/3 space-y-6">

              {/* Personal Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <InfoItem label="Full Name" value={`${capitalize(formData.firstName)} ${capitalize(formData.middleName)} ${capitalize(formData.lastName)}`} />
                  <InfoItem label="Mother's Name" value={capitalize(formData.motherName)} />
                  <InfoItem label="Date of Birth" value={formData.dob} />
                  <InfoItem label="Blood Group" value={formData.bloodGroup} />
                  <InfoItem label="Category" value={formData.category} />
                </div>
              </div>

              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <InfoItem label="Mobile Number" value={formData.mobileNo} />
                  <InfoItem label="Parent Mobile" value={formData.parentMobileNo} />
                  <InfoItem label="Parent Email" value={formData.parentEmail} fullWidth />
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                  Address Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-bold text-orange-900 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 shadow-sm inline-block mb-2">Current Address</h3>
                    <p className="text-base text-slate-800 ml-1 mt-1">{formData.currentStreet}, {formData.currentCity} - {formData.pincode}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-md font-bold text-orange-900 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 shadow-sm inline-block mb-2">Native Address</h3>
                    <p className="text-base text-slate-800 ml-1 mt-1">{formData.nativeStreet}, {formData.nativeCity} - {formData.nativePincode}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    );
  }

  // =============== EDIT/FORM MODE ===============
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <ToastContainer position="top-right" autoClose={5000} theme="light" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {hasData ? "Edit Information" : "Student Information"}
            </h1>
            <p className="mt-2 text-slate-600">
              {hasData ? "Update your personal and academic details." : "Please fill in your personal and academic details accurately."}
            </p>
          </div>
          {hasData && (
            <button
              onClick={handleEditCancel}
              className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Personal Details */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Photo Upload - Spans 2 cols on small, 1 on large, but let's make it sit nicely */}
              {/* Enhanced Photo Upload Section */}
              <div className="md:col-span-2 lg:col-span-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-4">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl ring-4 ring-blue-50 transition-transform duration-300 group-hover:scale-[1.02]">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                          <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full shadow-2xl cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 ring-4 ring-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>

                  <div className="text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Required Document
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Your Profile Photo</h3>
                    <p className="text-slate-600 mt-2 max-w-md">
                      Please upload a professional, clear passport-sized photograph. This photo will be used for your official identity card and academic records.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        Max Size: <span className="font-bold text-red-600 ml-1 italic underline">500 KB</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        Formats: <span className="font-bold text-red-600 ml-1 italic underline">JPG, PNG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required pattern="[A-Za-z]+" title="Only alphabets allowed" />
              <InputField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} required pattern="[A-Za-z]+" title="Only alphabets allowed" />
              <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required pattern="[A-Za-z]+" title="Only alphabets allowed" />
              <InputField label="Mother Name" name="motherName" value={formData.motherName} onChange={handleChange} required pattern="[A-Za-z]+" title="Only alphabets allowed" />

              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />

              <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={bloodGroups} required />
              <SelectField label="Category" name="category" value={formData.category} onChange={handleChange} options={categories} required />

            </div>
          </section>

          {/* Section 2: Academic Details */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
              Academic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="PRN" name="PRN" value={formData.PRN} onChange={handleChange} required pattern="[1-9][0-9]{15}" title="16 digits, cannot start with 0" maxLength={16} />
              <InputField label="ABC ID" name="abcId" value={formData.abcId} onChange={handleChange} required pattern="\d{12}" title="Exactly 12 digits" maxLength={12} />
              <SelectField label="Branch" name="branch" value={formData.branch} onChange={handleChange} options={branches} required />
              <SelectField label="Year" name="year" value={formData.year} onChange={handleChange} options={years} required />
              <SelectField label="Division" name="division" value={formData.division} onChange={handleChange} options={divisions} required />
              <InputField label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} required placeholder="e.g. 2024-2025" title="Format: YYYY-YYYY (e.g. 2024-2025)" />
            </div>
          </section>

          {/* Section 3: Contact Details */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded-full"></span>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Mobile Number" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required pattern="[6-9]\d{9}" title="10 digit Indian mobile number" maxLength={10} />
              <InputField label="Parent Mobile No" name="parentMobileNo" value={formData.parentMobileNo} onChange={handleChange} required pattern="[6-9]\d{9}" title="10 digit Indian mobile number" maxLength={10} />
              <InputField label="Parent Email" name="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} required />
            </div>
          </section>

          {/* Section 4: Address Details */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Address Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Address */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 shadow-sm">
                  <h3 className="text-md font-bold text-orange-900">Current Address</h3>
                  <button
                    type="button"
                    onClick={fetchCurrentLocation}
                    disabled={geoLoading}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {geoLoading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    FETCH LOCATION
                  </button>
                </div>
                <InputField label="Street / Building (Complete Address)" name="currentStreet" value={formData.currentStreet} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="City" name="currentCity" value={formData.currentCity} onChange={handleChange} required />
                  <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} required pattern="[1-9][0-9]{5}" title="6 digit pincode" maxLength={6} />
                </div>
              </div>

              {/* Native Address */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 shadow-sm">
                  <h3 className="text-md font-bold text-orange-900">Native Address</h3>
                  <button
                    type="button"
                    onClick={copyCurrentAddress}
                    className="text-xs bg-orange-200 hover:bg-orange-300 text-orange-800 px-3 py-1 rounded-md font-bold transition-all"
                  >
                    SAME AS CURRENT
                  </button>
                </div>
                <InputField label="Street / Building (Complete Address)" name="nativeStreet" value={formData.nativeStreet} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="City" name="nativeCity" value={formData.nativeCity} onChange={handleChange} required />
                  <InputField label="Pincode" name="nativePincode" value={formData.nativePincode} onChange={handleChange} required pattern="[1-9][0-9]{5}" title="6 digit pincode" maxLength={6} />
                </div>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 gap-4">
            {hasData && (
              <button
                type="button"
                onClick={handleEditCancel}
                className="px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Information"
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

// Reusable Components to keep code clean

function InfoItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "col-span-1 sm:col-span-2" : ""}>
      <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">{label}</p>
      <p className="text-base font-medium text-slate-800">{value || "N/A"}</p>
    </div>
  )
}

function InputField({ label, name, type = "text", value, onChange, required = false, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 appearance-none cursor-pointer"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}