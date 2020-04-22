const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const crypto = require("crypto");

const baseModel = require("./basemodel");
const {
  JWT_SECRET,
  JWT_EXPIRATION_MINUTES,
  JWT_ISSUER,
  JWT_AUDIENCE,
} = require("../config/vars");
const {
  parseDesc,
  isEmail,

  isPhoneNumber,
  required,
} = require("../utils");
const { encrypt } = require("../utils/encryption");
const _ = require("lodash");
const { LOGGED_USER, ADMIN } = require("../middlewares/auth");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    email: {
      type: String,
      match: isEmail,
      index: {
        unique: true,
        partialFilterExpression: { email: { $type: "string" } },
      },
      default: null,
    },
    password_hash: {
      type: String,
    },
    salt: {
      type: String,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    telephone: {
      type: String,
      match: isPhoneNumber,
    },
    tmp_email: {
      type: String,
      default: null,
    },
    tmp_username: {
      type: String,
      default: null,
    },
    ...baseModel.schema,
  },
  { toJSON: { virtuals: true } }
);

userSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "author._id",
  justOne: false, // set true for one-to-one relationship
});

userSchema.pre("save", async function save(next) {
  try {
    this.updated = new Date();

    if (!this.created) {
      this.created = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("findOne", function () {
  this.where({ deleted: { $exists: false } });
});

userSchema.pre("find", function () {
  this.where({ deleted: { $exists: false } });
});

userSchema.method({
  transform({ includes = [] }) {
    const transformed = {};

    const availableOption = ["messages"];

    let opts = [];

    _.forEach(includes, (val) => {
      if (_.includes(availableOption, val)) {
        opts = [...opts, val];
      }
    });

    const fields = [
      "id",
      "username",
      "role",
      "first_name",
      "last_name",
      "email",
      "telephone",
      "created",
      "updated",
      ...opts,
    ];

    fields.forEach((field) => {
      transformed[field] = _.isNil(this[field]) ? "" : this[field];
    });

    return transformed;
  },

  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password_hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex");
  },

  validPassword(password) {
    let password_hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex");
    return this.password_hash === password_hash;
  },

  token(refreshTokenObj = required()) {
    const payload = {
      iss: JWT_ISSUER /** (issuer): Issuer of the JWT */,
      sub: encrypt(
        _.toString(this._id)
      ) /* (subject): Subject of the JWT (the user) */,
      //   u: encrypt(this.username),
      at: encrypt(this.role === "admin" ? ADMIN : LOGGED_USER),
      aud: JWT_AUDIENCE /* (audience): Recipient for which the JWT is intended ผู้รับ token */,
      exp: moment()
        .add(JWT_EXPIRATION_MINUTES, "minutes")
        .unix() /* (expiration time): Time after which the JWT expires */,
      nbf: moment().unix() /* (not before time): Time before which the JWT must not be accepted for processing */,
      iat: moment().unix() /*  (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT */,
      jti:
        refreshTokenObj._id /*  (JWT ID): Unique identifier; can be used to prevent the JWT from being replayed (allows a token to be used only once) */,
    };

    return jwt.sign(payload, JWT_SECRET);
  },
});

userSchema.statics = {
  list({
    page = 1,
    per_page = 10,
    sort = { key: "created", desc: false },
    includes = [],
    id,
    first_name,
    last_name,
    email,
    username,
  }) {
    page = parseInt(page);
    per_page = parseInt(per_page);

    if (!_.isNil(email)) {
      email = new RegExp(email, "i");
    }

    if (!_.isNil(first_name)) {
      first_name = new RegExp(first_name, "i");
    }

    if (!_.isNil(last_name)) {
      last_name = new RegExp(last_name, "i");
    }

    if (!_.isNil(username)) {
      username = new RegExp(username, "i");
    }

    const options = _.omitBy(
      { _id: id, first_name, last_name, email, username },
      _.isNil
    );

    let sortOption = {};

    if (_.includes(["created", "updated"], _.get(sort, "key"))) {
      sortOption[sort["key"]] = parseDesc(sort["desc"]);
    }

    let includeOpts = [];

    _.forEach(includes, (val) => {
      switch (val) {
        case "messages":
          let opts = {
            path: "messages",
            select: "_id no title detail author._id created updated",
          };
          includeOpts = [...includeOpts, { ...opts }];
          break;
        default:
          break;
      }
    });

    return this.find({ ...options })
      .skip(per_page * (page - 1))
      .limit(per_page)
      .populate(includeOpts)
      .sort(sortOption)
      .exec();
  },

  totalDataCount({ id, first_name, last_name, email, username }) {
    if (!_.isNil(email)) {
      email = new RegExp(email, "i");
    }

    if (!_.isNil(first_name)) {
      first_name = new RegExp(first_name, "i");
    }

    if (!_.isNil(last_name)) {
      last_name = new RegExp(last_name, "i");
    }

    if (!_.isNil(username)) {
      username = new RegExp(username, "i");
    }

    const options = _.omitBy(
      { _id: id, first_name, last_name, email, username },
      _.isNil
    );

    return this.countDocuments({
      ...options,
      deleted: { $exists: false },
    }).exec();
  },
};

const User = mongoose.model("User", userSchema);

module.exports = User;
