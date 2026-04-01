const express = require("express");
const {
  bootstrapAdmin,
  register,
  login,
  getCurrentUser
} = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  bootstrapAdminSchema
} = require("../validations/auth.validation");

const router = express.Router();

router.get("/login", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Use POST /api/auth/login with JSON body { email, password }."
  });
});

router.post("/bootstrap-admin", validate(bootstrapAdminSchema), bootstrapAdmin);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", auth, getCurrentUser);

module.exports = router;
