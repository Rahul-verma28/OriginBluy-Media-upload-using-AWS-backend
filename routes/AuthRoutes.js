import { Router } from "express";
import { getUserById, getUserInfo, login, logout, signup, updateProfile } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/userinfo", verifyToken, getUserInfo);
authRoutes.get("/user/:id",verifyToken, getUserById);
authRoutes.post("/updateProfile", verifyToken, updateProfile);

export default authRoutes;