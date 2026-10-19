const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch (error) {
      // token galat ho to bhi aage badho, user bina login maana jayega
    }
  }
  next();
};

module.exports = optionalAuth;