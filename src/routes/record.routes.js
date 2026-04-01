const express = require("express");
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  restoreRecord
} = require("../controllers/record.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { ROLES } = require("../constants/roles");
const {
  createRecordSchema,
  listRecordsSchema,
  recordIdParamSchema,
  updateRecordSchema
} = require("../validations/record.validation");

const router = express.Router();

router.use(auth);

router.get("/", authorize(ROLES.ANALYST, ROLES.ADMIN), validate(listRecordsSchema), getRecords);
router.get("/:id", authorize(ROLES.ANALYST, ROLES.ADMIN), validate(recordIdParamSchema), getRecordById);
router.post("/", authorize(ROLES.ADMIN), validate(createRecordSchema), createRecord);
router.patch("/:id", authorize(ROLES.ADMIN), validate(updateRecordSchema), updateRecord);
router.delete("/:id", authorize(ROLES.ADMIN), validate(recordIdParamSchema), deleteRecord);
router.patch("/:id/restore", authorize(ROLES.ADMIN), validate(recordIdParamSchema), restoreRecord);

module.exports = router;
