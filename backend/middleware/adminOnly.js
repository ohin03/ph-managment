const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN")
    return res.status(403).json({ message: "Access Denied" });
  next();
};

module.exports = adminOnly;
