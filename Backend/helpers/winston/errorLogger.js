const logger = require("./logger");
const getRequestIdentity = require("../common/getRequestIdentity")

const errorLogger = (err, req, context = "Unknown") => {
  const identity = getRequestIdentity(req);

  logger.error({
    message: err.message,
    stack: err.stack,
    context,

    route: req?.originalUrl || "no-route",
    method: req?.method || "no-method",

    userId: req?.user?.id || "guest",
    role: req?.user?.role || "guest",


    // For auth related stuff
    identityType: identity.type,
    identityValue: identity.value,

    ip: req?.ip || "no-ip",
  });
};

module.exports = errorLogger;
