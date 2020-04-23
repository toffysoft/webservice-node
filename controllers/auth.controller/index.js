const _ = require("lodash");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const User = require("../../models/user.model");
const RefreshToken = require("../../models/refreshToken.model");
const redis = require("../../config/redis");
const errors = require("../../utils/errors");
const { decrypt } = require("../../utils/encryption");
const logger = require("../../config/logger");
const {
  APP_HEADER_SCHEMA,
  JWT_EXPIRATION_MINUTES,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
} = require("../../config/vars");

const Logger = logger.setLogger("controller", "auth");

function generateTokenResponse(refresh_token, access_token) {
  const token_type = APP_HEADER_SCHEMA;
  const expires = moment().add(JWT_EXPIRATION_MINUTES, "minutes");

  return {
    token_type,
    access_token,
    refresh_token,
    expires,
  };
}

exports.refresh = async (req, res, next) => {
  try {
    const { body, headers } = req;

    const authorization = _.get(
      headers,
      ["authorization"],
      _.get(headers, ["Authorization"], "")
    );
    if (!authorization) return next(errors.create(errors.UNAUTHORIZED));

    const [bearer, access_token] = _.split(authorization, " ");
    if (!access_token) return next(errors.create(errors.UNAUTHORIZED));

    let decoded = null;
    try {
      decoded = jwt.verify(access_token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        ignoreExpiration: true,
        complete: true,
      });
    } catch (error) {
      return next(errors.create(errors.UNAUTHORIZED));
    }

    const payload = decoded.payload;

    const refreshToken = await RefreshToken.findOne({
      token: body.refresh_token,
      userId: decrypt(payload.sub),
    }).populate("userId");

    if (!refreshToken) return next(errors.create(errors.UNAUTHORIZED));

    const user = refreshToken.userId;

    if (!user) return next(errors.create(errors.FORBIDDEN));

    const updatedRefreshToken = await refreshToken.refresh();

    return res.json({
      success: true,
      message: {
        en: "success",
        th: "สำเร็จ",
      },
      ...generateTokenResponse(
        updatedRefreshToken.token,
        user.token(updatedRefreshToken)
      ),
    });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { body } = req;
  try {
    const user = await User.findOne({
      username: body.username,
    });

    if (!user || !user.validPassword(body.password))
      return next(
        errors.create(errors.UNAUTHORIZED, "username or password is invalid.")
      );

    const userRefreshToken = await RefreshToken.generate(user);

    return res.json({
      success: true,
      message: {
        en: "login success",
        th: "เข้าสู่ระบบ สำเร็จ",
      },
      ...generateTokenResponse(
        userRefreshToken.token,
        user.token(userRefreshToken)
      ),
    });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  const reqUser = req.user;
  try {
    const user = await User.findOne({
      _id: reqUser.sub,
    });

    if (!user) return next(errors.create(errors.FORBIDDEN));

    RefreshToken.findByIdAndDelete({ _id: reqUser.jti });

    redis.set(`blacklist:${reqUser.jti}`, 1, "EX", JWT_EXPIRATION_MINUTES * 60); //EX seconds -- Set the specified expire time, in seconds.

    return res.json({
      success: true,
      message: {
        en: "logout success",
        th: "ออกจากระบบ สำเร็จ",
      },
    });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { body } = req;

    const user = new User();
    user.username = body.username;
    user.first_name = body.first_name;
    user.last_name = body.last_name;
    user.setPassword(body.password);
    if (!_.isNil(body.email)) user.email = body.email;

    if (!_.isNil(body.telephone)) user.telephone = body.telephone;

    await user.save();

    return res.status(201).json({
      success: true,
      message: {
        en: "registered success",
        th: "ลงทะเบียน สำเร็จ",
      },
    });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};

exports.profile = async (req, res, next) => {
  const reqUser = req.user;
  try {
    const user = await User.findOne({
      _id: reqUser.sub,
    });

    if (!user) return next(errors.create(errors.FORBIDDEN));

    return res.json({
      ...user.transform({}),
    });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  const { body } = req;
  const reqUser = req.user;
  try {
    const user = await User.findOne({
      _id: reqUser.sub,
    });

    if (!user) return next(errors.create(errors.FORBIDDEN));

    if (!_.isNil(body.first_name)) user.first_name = body.first_name;
    if (!_.isNil(body.last_name)) user.last_name = body.last_name;
    if (!_.isNil(body.telephone)) user.telephone = body.telephone;

    await user.save();

    return res.json({
      success: true,
      message: {
        en: "updated profile success",
        th: "แก้ไขข้อมูลส่วนตัว สำเร็จ",
      },
    });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};
