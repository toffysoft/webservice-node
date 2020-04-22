const mongoose = require("mongoose");

const _ = require("lodash");

const { required } = require("../utils");

const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    namespace: {
      type: String
    },
    label: {
      type: String
    },
    type: {
      type: String
    },
    detail: {
      type: String
    },
    created: {
      type: Date,
      index: true
    }
  },
  {
    capped: { size: 5242880 }
  }
);

// logSchema.method({});

logSchema.statics = {
  setLogger(nameSpace, label = required()) {
    return {
      error(detail) {
        return createNewLog({ nameSpace, label, type: "error", detail });
      },
      info(detail) {
        if (_.isObject(detail)) detail = JSON.stringify(detail);
        return createNewLog({ nameSpace, label, type: "info", detail });
      }
    };
  }
};

const Log = mongoose.model("Log", logSchema);

function createNewLog({ nameSpace, label, type, detail }) {
  const newLog = new Log();
  newLog.nameSpace = nameSpace;
  newLog.label = label;
  newLog.type = type;
  newLog.detail = detail;
  newLog.created = new Date();
  return newLog.save();
}

module.exports = Log;
