const express = require("express");
const router = express.Router();
const heatmapController = require("../controllers/heatmapController");
const authMiddleware = require("../middlewares/authenticateToken");

// Both admin & division incharge should have access
router.get("/data", authMiddleware, heatmapController.getHeatmapData);
router.post("/insight", authMiddleware, heatmapController.getHeatmapInsight);
router.patch("/:id/toggle", authMiddleware, heatmapController.toggleRisk);
router.post("/nudge", authMiddleware, heatmapController.sendNudgeEmail);

module.exports = router;
