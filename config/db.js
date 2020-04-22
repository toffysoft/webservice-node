const mongoose = require("mongoose");

const { mongo, isProd } = require("./vars");

const options = {
  numberOfRetries: Number.MAX_VALUE, // Never stop trying to reconnect
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};

let gracefulShutdown;

if (!isProd) {
  mongoose.set("debug", true);
}

mongoose.connection.on("reconnected", async function() {
  console.info("Mongoose reconnected");
});

mongoose.connection.on("error", async function(err) {
  console.error("Mongoose connection error: " + err);
});

mongoose.connection.on("disconnected", async function() {
  console.info("Mongoose disconnected");
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(async function() {
    console.info("Mongoose disconnected through  " + msg);

    callback();
  });
};
// For nodemon restarts
process.once("SIGUSR2", function() {
  gracefulShutdown("nodemon restart", function() {
    process.kill(process.pid, "SIGUSR2");
  });
});
// For app termination
process.on("SIGINT", function() {
  gracefulShutdown("app termination", function() {
    process.exit(0);
  });
});
// For Heroku app termination
process.on("SIGTERM", function() {
  gracefulShutdown("Heroku app termination", function() {
    process.exit(0);
  });
});

exports.connect = async (cb = async () => {}) => {
  try {
    const connection = await mongoose.connect(mongo.uri, options);

    await cb(connection);

    return connection;
  } catch (connectionError) {
    console.error("Error creating a mongoose connection", connectionError);
    if (!isProd) {
      process.kill(process.pid, "SIGUSR2");
    } else {
      process.exit(0);
    }
  }
};

exports.connection = mongoose.connection;
