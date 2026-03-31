const logger = require("../../helpers/winston/logger");
const getRequestIdentity = require("../../helpers/common/getRequestIdentity")
// lightweight in-memory tracking
const suspiciousIPs = {};

const MAX_ATTEMPTS = 5;
const WINDOW_TIME = 5 * 60 * 1000; // 5 minutes

const requestLogger = (req, res, next) => {
  const ip = req?.ip;
  const start = Date.now();

  const identity = getRequestIdentity(req);

  res.on("finish", () => {
    const log = {
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      ip,
      userId: req.user?.id || "guest",
      role: req.user?.role || "guest",
      identityType: identity.type,
      identityValue: identity.value,
      userAgent: req.headers["user-agent"],
      responseTime: `${Date.now() - start}ms`,
    };

    // 🔥 classify logs
    if (res.statusCode >= 500) {
      logger.error(log);
    } else if (res.statusCode >= 400) {
      logger.warn(log);
    } else {
      logger.info(log);
    }

    // 🚨 general suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn({
        type: "SECURITY_ALERT",
        ip,
        route: req.originalUrl,
        userId: req.user?.id || "guest",
      });
    }

    // 🔥 brute force detection (NO BLOCKING)
    if (
      req.originalUrl.includes("/admin-login") &&
      (res.statusCode === 401 || res.statusCode === 400)
    ) {
      if (!suspiciousIPs[ip]) {
        suspiciousIPs[ip] = { count: 0, firstAttempt: Date.now() };
      }

      const data = suspiciousIPs[ip];

      // reset window if expired
      if (Date.now() - data.firstAttempt > WINDOW_TIME) {
        suspiciousIPs[ip] = { count: 1, firstAttempt: Date.now() };
      } else {
        data.count++;
      }

      // 🚨 threshold reached → ALERT ONLY
      if (data.count >= MAX_ATTEMPTS) {
        logger.error({
          type: "BRUTE_FORCE_DETECTED",
          ip,
          attempts: data.count,
          window: "5min",
          route: req.originalUrl,
        });

        // optional: reset after alert
        delete suspiciousIPs[ip];
      }
    }
  });

  next();
};

module.exports = requestLogger;