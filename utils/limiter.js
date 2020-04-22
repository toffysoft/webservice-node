const RateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const _ = require("lodash");
const redisClient = require("../config/redis");
const {
  REGISTER_RATE_LIMIT_COUNT,
  REGISTER_RATE_LIMIT_TIME,
  LOGIN_RATE_LIMIT_COUNT,
  LOGIN_RATE_LIMIT_TIME,
} = require("../config/vars");

function rateLimit(count, time) {
  return new RateLimit({
    store: new RedisStore({
      client: redisClient,
      expiry: time * 60 * 1000, // minutes
    }),
    statusCode: 429,
    message: {
      code: 429,
      title: {
        en: "Too Many Requests",
        th: "Too Many Requests",
      },
      errors: [],
      message: {
        en: "please try again later.",
        th: "please try again later.",
      },
    },
    windowMs: _.toSafeInteger(time) * 60 * 1000, // minutes
    max: _.toSafeInteger(count), // limit each IP to REGISTER_RATE_LIMIT_COUNT requests per windowMs
  });
}

module.exports = {
  login() {
    return rateLimit(LOGIN_RATE_LIMIT_COUNT, LOGIN_RATE_LIMIT_TIME);
  },
  register() {
    return rateLimit(REGISTER_RATE_LIMIT_COUNT, REGISTER_RATE_LIMIT_TIME);
  },
  newLimiter(count, time) {
    return rateLimit(count, time);
  },
};
