const HttpStatus = require("http-status");
const APIError = require("./APIError");
const _ = require("lodash");
const UNAUTHORIZED = "unauthorized";
const FORBIDDEN = "forbidden";
const NOT_FOUND = "not found";
const BAD_REQUEST = "bad request";

const create = (type, message) => {
  let msg = null;

  if (message)
    msg = {
      en: _.get(message, ["en"], message),
      th: _.get(message, ["th"], message)
    };

  switch (type) {
    case UNAUTHORIZED:
      return new APIError({
        title: { en: "UNAUTHORIZED", th: "UNAUTHORIZED" },
        message: msg || {
          en: "unauthorized",
          th: "unauthorized"
        },
        status: HttpStatus.UNAUTHORIZED
      });
    case FORBIDDEN:
      return new APIError({
        title: { en: "FORBIDDEN", th: "FORBIDDEN" },
        message: msg || {
          en: "forbidden",
          th: "forbidden"
        },
        status: HttpStatus.FORBIDDEN
      });
    case NOT_FOUND:
      return new APIError({
        title: { en: "NOT_FOUND", th: "NOT_FOUND" },
        message: msg || {
          en: "not found",
          th: "not found"
        },
        status: HttpStatus.NOT_FOUND
      });
    case BAD_REQUEST:
      return new APIError({
        title: { en: "BAD_REQUEST", th: "BAD_REQUEST" },
        message: msg || {
          en: "bad request",
          th: "bad request"
        },
        status: HttpStatus.BAD_REQUEST
      });
    default:
      return new APIError({
        title: { en: "INTERNAL SERVER ERROR", th: "INTERNAL SERVER ERROR" },
        message: {
          en: "internal server error",
          th: "internal server error"
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
  }
};

exports.UNAUTHORIZED = UNAUTHORIZED;
exports.FORBIDDEN = FORBIDDEN;
exports.NOT_FOUND = NOT_FOUND;
exports.BAD_REQUEST = BAD_REQUEST;
exports.create = create;
