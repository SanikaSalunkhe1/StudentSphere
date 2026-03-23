//Trigger vercel redployment2
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import AdminLoginPage from "./Pages/AdminLoginPage";
import DivisionInchargeLogin from "./Pages/DivisionInchargeLogin"; // ✅ IMPORTED
import SignupPage from "./Pages/SignupPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import VerifyEmail from "./Pages/VerifyEmail";

// Admin Pages
import AdminStudentSection from "./Pages/AdminStudentSection";
import AdminActivity from "./Pages/AdminActivity";
import AdminAchievements from "./Pages/AdminAchievement";
import AdminInternship from "./Pages/AdminInternship";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminPlacement from "./Pages/AdminPlacement";
import AdminAdmission from "./Pages/AdminAdmission";
import AdminSemesterInfo from "./Pages/AdminSemesterInfo";
import AdminDivisionIncharge from "./Pages/AdminDivisionIncharge";
import MeetDevelopers from "./Pages/MeetDevelopers";
import AccreditationReports from "./Pages/AccreditationReports";

// Student Pages
import StudentActivity from "./Pages/StudentActivity";
import StudentAdmission from "./Pages/StudentAdmission";
import StudentInformation from "./Pages/StudentInfromation";
import StudentAchievements from "./Pages/StudentAchievements";
import StudentInternship from "./Pages/StudentInternship";
import StudentPlacement from "./Pages/StudentPlacement";
import StudentDashboard from "./Pages/StudentDashboard";
import StudentSemesterInfo from "./Pages/StudentSemesterInfo";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage role="admin" />} />
        <Route path="/admin/reset-password/:token" element={<ResetPasswordPage role="admin" />} />
        <Route path="/division/login" element={<DivisionInchargeLogin />} />
        <Route path="/division-incharge/forgot-password" element={<ForgotPasswordPage role="division" />} />
        <Route path="/division-incharge/reset-password/:token" element={<ResetPasswordPage role="division" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage role="student" />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage role="student" />} />
        <Route path="/developers" element={<MeetDevelopers />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* Admin Routes - PROTECTED */}
        {/* Note: Updated requiredRole to allow 'division' role to access admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={["admin", "division", "divisionIncharge"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="admission" element={<AdminAdmission />} />
          <Route path="students" element={<AdminStudentSection />} />
          <Route path="activities" element={<AdminActivity />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="internships" element={<AdminInternship />} />
          <Route path="placements" element={<AdminPlacement />} />
          <Route path="reports" element={<AccreditationReports />} />
          <Route path="semester-info" element={<AdminSemesterInfo />} />
          <Route path="division-incharges" element={<AdminDivisionIncharge />} />
        </Route>

        {/* Student Routes - PROTECTED */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="admission" element={<StudentAdmission />} />
          <Route path="information" element={<StudentInformation />} />
          <Route path="activity" element={<StudentActivity />} />
          <Route path="achievements" element={<StudentAchievements />} />
          <Route path="internship" element={<StudentInternship />} />
          <Route path="placement" element={<StudentPlacement />} />
          <Route path="semester-info" element={<StudentSemesterInfo />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;