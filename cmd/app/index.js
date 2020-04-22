const _ = require("lodash");
const http = require("http");
const favicon = require("express-favicon");
const passport = require("passport");

const strategies = require("../../config/passport");
const app = require("../../config/express");
const db = require("../../config/db");
const {
  port,
  env,
  ADMIN_NAME,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} = require("../../config/vars");
const utils = require("../../utils");
const error = require("../../middlewares/error");

// Import Json File
const users = require("../../utils/initialdata/users.json");

// Import model
const Message = require("../../models/message.model");
const User = require("../../models/user.model");

const routes = require("./routes");

global.debug = utils.debug;

// enable authentication
app.use(passport.initialize());
passport.use("app-jwt", strategies.appJwt);

//serve-favicon
app.use(favicon("./public/favicon.ico"));

// mount api routes
app.use("/api", routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

// open mongoose connection
db.connect(async (conn) => {
  try {
    let admin = await User.findOne({ username: ADMIN_USERNAME });

    if (admin) return;

    const [firstName, LastName] = _.split(ADMIN_NAME, " ");
    admin = new User();
    admin.username = ADMIN_USERNAME;
    admin.first_name = firstName;
    admin.last_name = LastName;
    admin.setPassword(ADMIN_PASSWORD);
    admin.role = "admin";
    const savedAdmin = await admin.save();

    await utils.asyncForEach(users, async (user) => {
      const newUser = new User();
      newUser.username = user.username;
      newUser.first_name = user.first_name;
      newUser.last_name = user.last_name;
      newUser.setPassword(user.password);

      const savedUser = await newUser.save();
      await utils.asyncForEach(user.messages, async (message) => {
        let newMessage = new Message({ ...message, author: newUser });

        const saveMessage = await newMessage.save();

        console.log(`Init message`, saveMessage.transform({}));
      });
    });
  } catch (e) {
    debug({ e });
  }
});

http.createServer(app).listen(port, () => {
  console.info(`HTTP  Server running on port ${port} (${env})`);
});

module.exports = app;
