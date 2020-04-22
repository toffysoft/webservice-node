const Joi = require("@hapi/joi");
const { isEmail, isPhoneNumber, isPassword } = require("../utils");
const errors = require("../utils/errors");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  refreshValidate: async (req, res, next) => {
    const data = req.body;

    try {
      // define the validation schema
      const schema = Joi.object().keys({
        refresh_token: Joi.string()
          .required()
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "refresh_token is invalid format",
              th: "ข้อมูล refresh_token ไม่ถูกต้อง",
            });
          }),
      });

      const value = await schema.validateAsync(data);

      return next();
    } catch (error) {
      return next(error);
    }
  },
  registerValidate: async (req, res, next) => {
    const data = req.body;

    try {
      // define the validation schema
      const schema = Joi.object().keys({
        email: Joi.string()
          .regex(isEmail)
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "email is invalid format",
              th: "ข้อมูล email ไม่ถูกต้อง",
            });
          }),
        first_name: Joi.string()
          .required()
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "first_name is invalid format",
              th: "ข้อมูล first_name ไม่ถูกต้อง",
            });
          }),
        last_name: Joi.string()
          .required()
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "last_name is invalid format",
              th: "ข้อมูล last_name ไม่ถูกต้อง",
            });
          }),
        username: Joi.string()
          .min(8)
          .required()
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "username is invalid format (8 letters)",
              th: "ข้อมูล username ไม่ถูกต้อง (8 ตัวอักษรขึ้นไป)",
            });
          }),
        password: Joi.string()
          .regex(isPassword)
          .required()
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en:
                "password must be least 8 chars and must be lower case chars and upper case chars and digit and required",
              th:
                "ข้อมูล password ต้องไม่น้อยกว่า8ตัวอักษร ประกอบด้วยตัวใหญ่,ตัวเล็ก,และตัวเลข หรือ ไม่ส่งมา",
            });
          }),
        telephone: Joi.string()
          .regex(isPhoneNumber)
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "telephone is invalid format",
              th: "ข้อมูล telephone ไม่ถูกต้อง",
            });
          }),
      });

      const value = await schema.validateAsync(data);

      return next();
    } catch (error) {
      return next(error);
    }
  },
  updateProfileValidate: async (req, res, next) => {
    const data = req.body;

    try {
      // define the validation schema
      const schema = Joi.object().keys({
        first_name: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "first_name is invalid format",
            th: "ข้อมูล first_name ไม่ถูกต้อง",
          });
        }),
        last_name: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "last_name is invalid format",
            th: "ข้อมูล last_name ไม่ถูกต้อง",
          });
        }),
        telephone: Joi.string()
          .regex(isPhoneNumber)
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "telephone is invalid format",
              th: "ข้อมูล telephone ไม่ถูกต้อง",
            });
          }),
      });

      const value = await schema.validateAsync(data);

      return next();
    } catch (error) {
      return next(error);
    }
  },
};
