import { Router } from "express";
import { acceptFriendRequest, declineFriendRequest, getAllFriendRequests, recommendations, search, sendFriendRequest } from "../controllers/FriendsControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const friendRoutes = Router();

friendRoutes.get("/search", verifyToken, search);
friendRoutes.post("/sendFriendRequest", verifyToken, sendFriendRequest);
friendRoutes.post("/acceptFriendRequest", verifyToken, acceptFriendRequest);
friendRoutes.get("/recommendations", verifyToken, recommendations);
friendRoutes.post("/declineFriendRequest", verifyToken, declineFriendRequest);
friendRoutes.get("/allFriendRequests", verifyToken, getAllFriendRequests);


export default friendRoutes;
