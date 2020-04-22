const express = require("express");

const { authorizeUser, ADMIN } = require("../../../../middlewares/auth");

const { list } = require("../../../../controllers/user.controller");
const { listUserValidate } = require("../../../../validations/user.validation");

const router = express.Router();

router.get("/", authorizeUser([ADMIN]), listUserValidate, list);

module.exports = router;
