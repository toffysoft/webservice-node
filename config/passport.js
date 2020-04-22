const _ = require("lodash");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");

const {
  JWT_SECRET,
  APP_HEADER_SCHEMA,
  JWT_AUDIENCE,
  JWT_ISSUER,
} = require("./vars");

const jwtOptions = {
  secretOrKey: JWT_SECRET,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(APP_HEADER_SCHEMA),
};

const app_jwt = async (payload, done) => {
  try {
    return done(false, payload);
  } catch (error) {
    return done(error, false);
  }
};

exports.appJwt = new JwtStrategy(jwtOptions, app_jwt);
