const mongoose = require("mongoose");

const baseModel = require("./basemodel");

const { parseDesc } = require("../utils");
const _ = require("lodash");
const { LOGGED_USER, ADMIN } = require("../middlewares/auth");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    no: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    author: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      username: {
        type: String,
      },
      email: {
        type: String,
      },
      first_name: {
        type: String,
      },
      last_name: {
        type: String,
      },
      role: {
        type: String,
      },
      telephone: {
        type: String,
      },
    },
    ...baseModel.schema,
  },
  { toJSON: { virtuals: true } }
);

messageSchema.pre("save", async function save(next) {
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

messageSchema.pre("findOne", function () {
  this.where({ deleted: { $exists: false } });
});

messageSchema.pre("find", function () {
  this.where({ deleted: { $exists: false } });
});

messageSchema.method({
  transform({ includes = [] }) {
    const transformed = {};

    const availableOption = ["author"];

    let opts = [];

    _.forEach(includes, (val) => {
      if (_.includes(availableOption, val)) {
        opts = [...opts, val];
      }
    });

    const fields = [
      "id",
      "no",
      "title",
      "message",
      "created",
      "updated",
      ...opts,
    ];

    fields.forEach((field) => {
      if (field === "author") {
        _.set(transformed, ["author"], _.get(this, ["author", "_id"], null));
        return;
      }
      transformed[field] = _.isNil(this[field]) ? "" : this[field];
    });

    if (!_.includes(fields, "author")) {
      _.set(
        transformed,
        ["author", "username"],
        _.get(this, ["author", "username"], "")
      );
      _.set(
        transformed,
        ["author", "first_name"],
        _.get(this, ["author", "first_name"], "")
      );
      _.set(
        transformed,
        ["author", "last_name"],
        _.get(this, ["author", "last_name"], "")
      );
      _.set(
        transformed,
        ["author", "email"],
        _.get(this, ["author", "email"], "")
      );
      _.set(
        transformed,
        ["author", "telephone"],
        _.get(this, ["author", "telephone"], "")
      );
    }

    return transformed;
  },
});

messageSchema.statics = {
  list({
    page = 1,
    per_page = 10,
    sort = { key: "created", desc: false },
    includes = [],
    id,
    no,
    title,
    author_name,
    author_username,
  }) {
    page = parseInt(page);
    per_page = parseInt(per_page);

    let options = {};

    if (!_.isNil(title)) {
      title = new RegExp(title, "i");
    }

    if (!_.isNil(author_name)) {
      options["author.first_name"] = new RegExp(author_name, "i");
    }

    if (!_.isNil(author_username)) {
      options["author.username"] = new RegExp(author_username, "i");
    }

    options = _.omitBy({ _id: id, no, title, ...options }, _.isNil);

    let sortOption = {};

    if (_.includes(["created", "updated"], _.get(sort, "key"))) {
      sortOption[sort["key"]] = parseDesc(sort["desc"]);
    }

    let includeOpts = [];

    _.forEach(includes, (val) => {
      switch (val) {
        case "author":
          let opts = {
            path: "author._id",
            select:
              "-password_hash -salt -tmp_email -tmp_username -updated -deleted -__v",
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

  totalDataCount({ id, no, title, author_name, author_username }) {
    let options = {};

    if (!_.isNil(title)) {
      title = new RegExp(title, "i");
    }

    if (!_.isNil(author_name)) {
      _.set(options, ["author", "first_name"], new RegExp(author_name, "i"));
    }

    if (!_.isNil(author_username)) {
      _.set(options, ["author", "username"], new RegExp(author_username, "i"));
    }

    options = _.omitBy({ _id: id, no, title, ...options }, _.isNil);

    return this.countDocuments({
      ...options,
      deleted: { $exists: false },
    }).exec();
  },
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
