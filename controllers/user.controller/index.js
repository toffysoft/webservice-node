const _ = require("lodash");

const User = require("../../models/user.model");

const errors = require("../../utils/errors");
const logger = require("../../config/logger");

const Logger = logger.setLogger("controller", "user");

exports.list = async (req, res, next) => {
  try {
    const { query } = req;
    let result = {};
    let currentPage = query.page || 1;
    let perPage = query.per_page || 10;

    const users = await User.list(query);

    if (users.length === 0) {
      return next(errors.create(errors.BAD_REQUEST, "ไม่พบ user ที่ต้องการ"));
    }

    const usersTransform = users.map((user) => user.transform(query));

    result.results = usersTransform;

    result.per_page = perPage;
    result.current_page = currentPage;

    const totalUsers = await User.totalDataCount(query);
    result.total_data = totalUsers;

    return res.json(result);
  } catch (error) {
    Logger.error(error);
    return next(error);
  }
};
