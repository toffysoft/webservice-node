const _ = require("lodash");

const Message = require("../../models/message.model");

const errors = require("../../utils/errors");
const logger = require("../../config/logger");

const Logger = logger.setLogger("app", "controller.message");

exports.list = async (req, res, next) => {
  try {
    const { query } = req;
    let result = {};
    let currentPage = query.page || 1;
    let perPage = query.per_page || 10;

    const messages = await Message.list(query);

    if (messages.length === 0) {
      return next(
        errors.create(errors.BAD_REQUEST, "ไม่พบ message ที่ต้องการ")
      );
    }

    const messagesTransform = messages.map((message) =>
      message.transform(query)
    );

    result.results = messagesTransform;

    result.per_page = perPage;
    result.current_page = currentPage;

    const totalMessages = await Message.totalDataCount(query);
    result.total_data = totalMessages;

    return res.json(result);
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { params } = req;

    const message = await Message.findById(params.message_id).populate({
      path: "author._id",
      select:
        "-password_hash -salt -tmp_email -tmp_username -updated -deleted -__v",
    });

    if (!message) {
      return next(
        errors.create(errors.BAD_REQUEST, "ไม่พบ message ที่ต้องการ")
      );
    }

    return res.json({ result: message.transform({ includes: ["author"] }) });
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};
