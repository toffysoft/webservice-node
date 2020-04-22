const mongoose = require("mongoose");
const crypto = require("crypto");
const _ = require("lodash");

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  created: {
    type: Date,
    index: true,
  },
  updated: {
    type: Date,
    index: true,
  },
  expireAt: {
    type: Date,
    validate: {
      validator: function (v) {
        const month = 1000 * 60 * 60 * 24 * 30;
        return v - new Date() <= month;
      },
      message: (props) => ({
        en: "Cannot expire more than 30 days in the future.",
        th: "Cannot expire more than 30 days in the future.",
      }),
    },
    default: null,
  },
});

// Expire at the time indicated by the expireAt field
refreshTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.pre("save", async function save(next) {
  try {
    if (!this.created) {
      this.created = new Date();
      this.expireAt = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
    }

    this.updated = new Date();

    next();
  } catch (error) {
    next(error);
  }
});

refreshTokenSchema.method({
  refresh() {
    const token = crypto.randomBytes(40).toString("hex");
    this.token = token;
    this.expireAt = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 7); // 7 days from now

    return this.save();
  },
});

refreshTokenSchema.statics = {
  generate(user) {
    const token = crypto.randomBytes(40).toString("hex");

    const tokenObject = new RefreshToken({
      token,
      userId: _.get(user, ["id"], _.get(user, ["_id"])),
    });

    return tokenObject.save();
  },
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
