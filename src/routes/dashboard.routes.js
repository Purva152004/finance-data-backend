const express = require("express");
const {
  getOverview,
  getTrends,
  getRecentActivity
} = require("../controllers/dashboard.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { ROLES } = require("../constants/roles");
const {
  overviewSchema,
  trendsSchema,
  recentActivitySchema
} = require("../validations/dashboard.validation");

const router = express.Router();

router.use(auth);
router.use(authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN));

router.get("/overview", validate(overviewSchema), getOverview);
router.get("/trends", validate(trendsSchema), getTrends);
router.get("/recent-activity", validate(recentActivitySchema), getRecentActivity);

module.exports = router;
