const Joi = require("@hapi/joi");
const _ = require("lodash");

const errors = require("../utils/errors");

Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  listUserValidate: async (req, res, next) => {
    const data = req.query;

    try {
      // define the validation schema
      const schema = Joi.object().keys({
        page: Joi.number()
          .min(1)
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "page is invalid format",
              th: "ข้อมูล page ไม่ถูกต้อง",
            });
          }),
        per_page: Joi.number()
          .min(1)
          .max(100)
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "per_page is invalid format",
              th: "ข้อมูล per_page ไม่ถูกต้อง",
            });
          }),
        id: Joi.objectId().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "id is invalid format",
            th: "ข้อมูล id ไม่ถูกต้อง",
          });
        }),
        username: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "username is invalid format  ",
            th: "ข้อมูล username ไม่ถูกต้อง ",
          });
        }),
        first_name: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "first_name is invalid format  ",
            th: "ข้อมูล first_name ไม่ถูกต้อง ",
          });
        }),
        last_name: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "last_name is invalid format  ",
            th: "ข้อมูล last_name ไม่ถูกต้อง ",
          });
        }),
        email: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "email is invalid format  ",
            th: "ข้อมูล email ไม่ถูกต้อง ",
          });
        }),
        sort: Joi.object()
          .keys({
            key: Joi.string()
              .valid("created", "updated")
              .error((err) => {
                return errors.create(errors.BAD_REQUEST, {
                  en: 'sort.key must one of "created"',
                  th: 'ข้อมูล sort.key ต้องเป็น "created"',
                });
              }),
            desc: Joi.boolean()
              .required()
              .error((err) => {
                return errors.create(errors.BAD_REQUEST, {
                  en: "sort.desc is invalid format",
                  th: "ข้อมูล sort.desc ไม่ถูกต้อง",
                });
              }),
          })
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "sort is invalid format",
              th: "ข้อมูล sort ไม่ถูกต้อง",
            });
          }),
        includes: Joi.array()
          .items(Joi.string().valid("messages"))
          .max(1)
          .error((err) => {
            if (_.get(err, [0, "code"]) === "any.only")
              return errors.create(errors.BAD_REQUEST, {
                en: "includes must one of 'messages'",
                th: "ข้อมูล includes ต้อง เป็น 'messages'",
              });

            return errors.create(errors.BAD_REQUEST, {
              en: "includes is invalid format",
              th: "ข้อมูล includes ไม่ถูกต้อง",
            });
          }),
      });

      const value = await schema.validateAsync(data);

      return next();
    } catch (error) {
      return next(errors.create(errors.BAD_REQUEST, error.message));
    }
  },
};
