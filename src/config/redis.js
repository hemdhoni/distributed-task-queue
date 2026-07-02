const IORedis = require("ioredis");

const redis = new IORedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redis.on("connect", () => {
    console.log("Redis Connected");
});

redis.on("error", (err) => {
    console.log(err);
});

module.exports = redis;