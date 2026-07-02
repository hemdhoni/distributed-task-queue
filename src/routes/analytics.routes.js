const express = require("express");

const router = express.Router();

const analyticsController = require("../controllers/analytics.controller");

router.get(
  "/v1/analytics/summary",
  analyticsController.getSummary
);

module.exports = router;