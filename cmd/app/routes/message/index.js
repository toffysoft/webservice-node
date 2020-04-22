const express = require("express");

const { authorizeUser, ADMIN } = require("../../../../middlewares/auth");

const { list, getById } = require("../../../../controllers/message.controller");
const {
  listMessageValidate,
  messageDetailValidate,
} = require("../../../../validations/message.validate");

const router = express.Router();

router.get("/", authorizeUser(), listMessageValidate, list);
router.get("/:message_id", authorizeUser(), messageDetailValidate, getById);

module.exports = router;
