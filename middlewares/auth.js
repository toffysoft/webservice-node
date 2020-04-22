const _ = require("lodash");
const passport = require("passport");
const redis = require("../config/redis");
const errors = require("../utils/errors");
const { decrypt } = require("../utils/encryption");
const { isProd } = require("../config/vars");

const ADMIN = "admin";
const LOGGED_USER = "_loggedUser";

const handleJWT = (req, res, next, allowRole = [LOGGED_USER, ADMIN]) => async (
  err,
  user,
  info
) => {
  const error = err || info;

  const apiError = errors.create(
    errors.UNAUTHORIZED,
    !isProd ? _.get(err || info, ["message"]) : null
  );

  if (error || !user) return next(apiError);

  try {
    if (!_.includes(allowRole, decrypt(user.at)))
      return next(
        errors.create(errors.FORBIDDEN, {
          en: `permission denied (require ${allowRole})`,
          th: `ระดับของสมาชิกไม่มีสิทธ์เข้าถึง (ต้องการสิทธ์ ${allowRole})`,
        })
      );

    const bl = await redis.get(`blacklist:${user.jti}`);

    if (bl) return next(apiError);

    req.user = {
      ...user,
      sub: decrypt(user.sub),
    };

    return next();
  } catch (error) {
    return next(apiError);
  }
};

exports.ADMIN = ADMIN;
exports.LOGGED_USER = LOGGED_USER;

exports.authorizeUser = (allowRole = [LOGGED_USER, ADMIN]) =>
  !_.isArray(allowRole)
    ? new Error("allowRole must be array")
    : (req, res, next) =>
        passport.authenticate(
          "app-jwt",
          { session: false },
          handleJWT(req, res, next, allowRole)
        )(req, res, next);
