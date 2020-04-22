const Joi = require("@hapi/joi");
const _ = require("lodash");

const errors = require("../utils/errors");

Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  listMessageValidate: async (req, res, next) => {
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
        no: Joi.number().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "no is invalid format  ",
            th: "ข้อมูล no ไม่ถูกต้อง ",
          });
        }),
        title: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "title is invalid format  ",
            th: "ข้อมูล title ไม่ถูกต้อง ",
          });
        }),
        author_username: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "author_username is invalid format  ",
            th: "ข้อมูล author_username ไม่ถูกต้อง ",
          });
        }),
        author_name: Joi.string().error((err) => {
          return errors.create(errors.BAD_REQUEST, {
            en: "author_name is invalid format  ",
            th: "ข้อมูล author_name ไม่ถูกต้อง ",
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
          .items(Joi.string().valid("author"))
          .max(1)
          .error((err) => {
            if (_.get(err, [0, "code"]) === "any.only")
              return errors.create(errors.BAD_REQUEST, {
                en: "includes must one of 'author'",
                th: "ข้อมูล includes ต้อง เป็น 'author'",
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
  addMessageValidate: async (req, res, next) => {
    const data = req.body;

    try {
      // define the validation schema
      const schema = Joi.object().keys({});

      const value = await schema.validateAsync(data);

      return next();
    } catch (error) {
      return next(errors.create(errors.BAD_REQUEST, error.message));
    }
  },
  editMessageValidate: async (req, res, next) => {
    const data = req.body;
    data.MessageId = req.params.MessageId;
    // MessageId
    try {
      // define the validation schema
      const schema = Joi.object().keys({});

      const value = await schema.validateAsync(data);

      return next();
    } catch (error) {
      return next(errors.create(errors.BAD_REQUEST, error.message));
    }
  },
  messageDetailValidate: async (req, res, next) => {
    const data = { ...req.params };

    try {
      // define the validation schema
      const schema = Joi.object().keys({
        message_id: Joi.objectId()
          .required()
          .error((err) => {
            return errors.create(errors.BAD_REQUEST, {
              en: "message_id is invalid format",
              th: "ข้อมูล message_id ไม่ถูกต้อง",
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
