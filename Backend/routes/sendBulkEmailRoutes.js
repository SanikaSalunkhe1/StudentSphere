const express = require("express");
const router = express.Router();
const { sendBulkEmailController } = require("../controllers/bulkEmailController");

router.post("/send-email", sendBulkEmailController);

module.exports = router;