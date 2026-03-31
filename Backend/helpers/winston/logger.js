// helpers/winston/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(), // 🌈 colors even in prod
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      let log = `${timestamp} [${level}]:`;

      // message handling
      if (stack) {
        log += ` ${stack}`;
      } else if (typeof message === "object") {
        log += ` ${JSON.stringify(message, null, 2)}`;
      } else {
        log += ` ${message}`;
      }

      // extra metadata
      if (Object.keys(meta).length) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
      }

      return log;
    })
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;