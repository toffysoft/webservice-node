const express = require("express");

const userRoutes = require("./user");
const authRoutes = require("./auth");
const messageRoutes = require("./message");

const router = express.Router();

router.get("/", (req, res) => res.json({ message: "OK" }));

router.use("/users", userRoutes);
router.use("/messages", messageRoutes);
router.use("/auth", authRoutes);

module.exports = router;
