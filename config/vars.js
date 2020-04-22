const path = require("path");

// import .env variables
require("dotenv-safe").config({
  allowEmptyValues: true,
  path: path.join(__dirname, "../.env"),
  example: path.join(__dirname, "../.env.example"),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYLOAD_ENCRYPTION_KEY: process.env.PAYLOAD_ENCRYPTION_KEY,
  JWT_EXPIRATION_MINUTES: process.env.JWT_EXPIRATION_MINUTES,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  APP_HEADER_SCHEMA: process.env.APP_HEADER_SCHEMA,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_NAME: process.env.ADMIN_NAME,
  mongo: {
    uri:
      process.env.NODE_ENV !== "production"
        ? process.env.MONGO_URI
        : process.env.MONGO_URI_PROD,
  },
  redis: {
    uri:
      process.env.NODE_ENV !== "production"
        ? process.env.REDIS_URI
        : process.env.REDIS_URI_PROD,
  },
  isProd: process.env.NODE_ENV === "production",
  BASE_URL: process.env.BASE_URL,
  REGISTER_RATE_LIMIT_COUNT: process.env.REGISTER_RATE_LIMIT_COUNT,
  REGISTER_RATE_LIMIT_TIME: process.env.REGISTER_RATE_LIMIT_TIME,
  LOGIN_RATE_LIMIT_COUNT: process.env.LOGIN_RATE_LIMIT_COUNT,
  LOGIN_RATE_LIMIT_TIME: process.env.LOGIN_RATE_LIMIT_TIME,
};
