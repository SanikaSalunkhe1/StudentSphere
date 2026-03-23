const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRoles = require('../middlewares/authorizeRoles');

// Ensure only admins and division incharges can view this overarching report
router.get('/', authenticateToken, authorizeRoles('admin', 'divisionIncharge'), reportController.getAccreditationReport);

module.exports = router;
