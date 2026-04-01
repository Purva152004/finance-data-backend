const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
} = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { ROLES } = require("../constants/roles");
const {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersSchema
} = require("../validations/user.validation");

const router = express.Router();

router.use(auth, authorize(ROLES.ADMIN));

router.post("/", validate(createUserSchema), createUser);
router.get("/", validate(listUsersSchema), getUsers);
router.get("/:id", validate(userIdParamSchema), getUserById);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", validate(userIdParamSchema), deactivateUser);

module.exports = router;
