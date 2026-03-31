const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupLimiter, emailVerificationLimiter, resetPasswordLimiter, forgotPasswordLimiter, emailLoginLimiter, studentLoginLimiter, adminLoginLimiter, adminForgotPassLimiter, adminResetPassLimiter,  divisionInchargeLoginLimiter, divisionInchargeForgotPassLimiter, divisionInchargeResetPassLimiter,} = require('../middlewares/rateLimiter/authLimiter');
// const upload = require("../middlewares/multer");

//student auth routes
router.post('/signup' , signupLimiter, authController.signup);     
router.post('/login', studentLoginLimiter, authController.login);

// For Email varification
router.post('/verify-email/:token', emailVerificationLimiter, authController.verifyEmail);
//admin auth routes
router.post('/admin-login', adminLoginLimiter , authController.adminLogin);

//division incharge auth routes
router.post('/division-incharge', divisionInchargeLoginLimiter , authController.divisionInchargeLogin);

//logout route
router.get('/logout', authController.logout);

//forget and reset password routes -> for students
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, authController.resetPassword);

//forget and reset password routes -> for admins
router.post("/admin/forgot-password", adminForgotPassLimiter, authController.adminForgotPassword);
router.post("/admin/reset-password/:token", adminResetPassLimiter, authController.adminResetPassword);

//forget and reset password routes -> for division incharge
router.post("/division-incharge/forgot-password", divisionInchargeForgotPassLimiter, authController.divisionInchargeForgotPassword);
router.post("/division-incharge/reset-password/:token", divisionInchargeResetPassLimiter, authController.divisionInchargeResetPassword);

module.exports = router;
