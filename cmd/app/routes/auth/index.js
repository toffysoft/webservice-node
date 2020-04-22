const express = require("express");

const { authorizeUser } = require("../../../../middlewares/auth");
const {
  login,
  logout,
  refresh,
  register,
  profile,
  updateProfile,
} = require("../../../../controllers/auth.controller");

const {
  refreshValidate,
  registerValidate,
  updateProfileValidate,
} = require("../../../../validations/auth.validation");

const limiter = require("../../../../utils/limiter");

const router = express.Router();

router.post("/login", limiter.login(), login);
router.get("/logout", authorizeUser(), logout);
router
  .route("/profile")
  .get(authorizeUser(), limiter.newLimiter(5, 5), profile)
  .post(authorizeUser(), updateProfileValidate, updateProfile);
router.post("/register", limiter.register(), registerValidate, register);
router.post("/refresh", refreshValidate, refresh);

module.exports = router;
