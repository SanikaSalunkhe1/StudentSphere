const getRequestIdentity = (req) => {
  // 1. Logged-in user (highest priority)
  if (req?.user?.id) {
    return {
      type: "user",
      value: req.user.id,
      role: req.user.role,
    };
  }

  // 2. Auth requests (before login)
  if (req?.body?.email) {
    return {
      type: "email",
      value: req.body.email,
    };
  }

  if (req?.body?.studentID) {
    return {
      type: "studentID",
      value: req.body.studentID,
    };
  }

  // 3. Fallback → IP
  return {
    type: "ip",
    value: req?.ip || "unknown",
  };
};

module.exports = getRequestIdentity;