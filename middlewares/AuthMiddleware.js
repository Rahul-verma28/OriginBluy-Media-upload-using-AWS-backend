import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by decoded userId
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // Attach user object to request

      next();
    } catch (error) {
      console.error("JWT verification error:", error);
      res.status(401).json({ message: "Not authorized, token failed." });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token." });
  }
};

export { protect };
