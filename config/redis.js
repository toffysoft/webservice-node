const Redis = require("ioredis");
const { redis } = require("./vars");

const redisClient = new Redis(redis.uri);

redisClient.on("connect", () => {
  console.info("redis connected");
});

redisClient.on("error", err => {
  console.error("RedisClientError " + err);
});

module.exports = redisClient;
