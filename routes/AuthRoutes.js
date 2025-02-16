import { Router } from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import { getUserInfo, login, logout, signup } from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/userinfo", protect, getUserInfo);

export default authRoutes;