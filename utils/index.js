const _ = require("lodash");
const ms = require("ms");

const crypto = require("crypto");

const chalk = require("chalk");
const { PAYLOAD_ENCRYPTION_KEY } = require("../config/vars");

exports.asyncForEach = async function (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.getIP = (req) => {
  if (!req) return null;
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  ).split(",")[0];
};

exports.isEmail = (email) => {
  let format = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,10}$/;
  return format.test(email);
};

exports.isPhoneNumber = (phoneNumber) => {
  let format = /0[0-9]{9}/;
  return format.test(phoneNumber);
};

exports.toCamel = (obj) => {
  const camelObj = {};

  for (let key in obj) {
    if (typeof obj[key] === "object" && !_.isArray(obj[key])) {
      camelObj[_.camelCase(key)] = toCamel(obj[key]);
    } else {
      camelObj[_.camelCase(key)] = obj[key];
    }
  }
  return camelObj;
};

exports.toSnake = (obj) => {
  const camelObj = {};

  for (let key in obj) {
    if (typeof obj[key] === "object" && !_.isArray(obj[key])) {
      camelObj[_.snakeCase(key)] = toSnake(obj[key]);
    } else {
      camelObj[_.snakeCase(key)] = obj[key];
    }
  }
  return camelObj;
};

exports.required = (text = "params") => {
  throw new Error(`${text} is required`);
};

exports.isPinOrOtp = /^[0-9]{6}$/;

exports.dateFormat = "YYYY-MM-DD";

exports.parseDesc = (val) => (val === "true" || val === true ? -1 : 1);

exports.isValidAvailableDate = /(\d{4})-(((0)[0-9])|((1)[0-2]))-([0-2][0-9]|(3)[0-1])$/;

exports.isBranchCode = /^[A-Z]{3}[0-9]{3}$/;

exports.isEndpointsPath = /\/(\w+)/i;

exports.isUsername = /^[A-Z]{2}[0-9]{5}$/;

exports.isEmail = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,10}$/;

exports.isPhoneNumber = /0[0-9]{8,9}$/;

exports.isPassword = /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}/;

const debug = (data) => {
  console.log(`
  ${chalk.white.bgMagenta(
    "================================================================================================================================"
  )}
  ${chalk.white.bgMagenta(
    "================================================================================================================================"
  )}
  `);
  console.log(data);
  console.log(`
  ${chalk.white.bgMagenta(
    "================================================================================================================================"
  )}
  ${chalk.white.bgMagenta(
    "================================================================================================================================"
  )}
  `);
};

exports.debug = debug;

exports.setConnectionTimeout = (time) => (req, res, next) => {
  res.connection.setTimeout(
    typeof time === "string" ? ms(time) : Number(time || 5000)
  );

  return next();
};
