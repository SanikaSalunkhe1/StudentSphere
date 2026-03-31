const rateLimit = require("express-rate-limit");

const keyGen2 = (req) => {
    if (req.user?.id) return req.user.id.toString();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
};
const keyGen = (req) => {


    if (req.user?.id) return `user-${req.user.id}`;

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const cleanIP = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

    // For auth routes → differentiate users
    if (req.originalUrl.startsWith("/api/auth")) {
        const identifier =
            req.body?.email ||
            req.body?.studentID ||
            "unknown";

        return `${cleanIP}-${identifier}`;
    }

    return cleanIP;
};

const makeHandler = (limitName) => (req, res, next, options) => {
    console.warn(
        `[RATE LIMIT] ${limitName} exceeded | user: ${req.user?.id || "unauthenticated"} | IP: ${req.ip} | path: ${req.path}`
    );
    res.status(options.statusCode).json(options.message);
};

const limiterDefaults = {
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGen,
    validate: { 
        keyGeneratorIpFallback: false,
    },
    skip: (req) => req.path === "/health" 
};

const generalLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 100,  // ⬇ was 200. On 512MB, this halves memory pressure from tracked IPs
    message: { success: false, message: "Too many requests, please try again later." },
    handler: makeHandler("generalLimiter"),
});

const readLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 100,  // ⬇ was 150. Students browsing dashboards don't need 150 GETs per 15min
    message: { success: false, message: "Too many requests, please slow down." },
    handler: makeHandler("readLimiter"),
});

const writeLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 30,  // ⬇ was 50. 30 writes/15min is generous for a student records app
    message: { success: false, message: "Too many write requests, please try again later." },
    handler: makeHandler("writeLimiter"),
});

const uploadLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 60 * 60 * 1000,
    max: 10,  // ⬇ was 15. Uploads are heavy — 10/hr per user is enough
    message: { success: false, message: "Too many upload requests, please try again after an hour." },
    handler: makeHandler("uploadLimiter"),
});

const exportLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 60 * 60 * 1000,
    max: 5,   // ⬇ was 15. Excel exports are CPU/memory heavy on a shared 0.5 vCPU
    message: { success: false, message: "Too many export requests, please try again after an hour." },
    handler: makeHandler("exportLimiter"),
});

module.exports = {
    generalLimiter,
    readLimiter,
    writeLimiter,
    uploadLimiter,
    exportLimiter,
};