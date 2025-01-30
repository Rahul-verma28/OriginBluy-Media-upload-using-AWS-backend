import User from "../models/UserModel.js";

// Search users by username
export const search = async (req, res) => {
    const { query } = req.query;
    try {
        if (typeof query === "string") {
            const users = await User.find({ username: new RegExp(query, "i") }, "username email profilePicture bio");
            res.status(200).json(users);
        } else {
            res.status(400).json({ message: "Invalid query parameter" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error searching users", error });
    }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const targetUser = await User.findById(targetUserId);


        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        if (targetUser.friendRequests.includes(req.userId)) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        targetUser.friendRequests.push(req.userId);
        console.log(targetUser);
        await targetUser.save();

        return res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.error("Send friend request error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const requester = await User.findById(requestId);
        const currentUser = await User.findById(req.userId);
        
        if (!requester || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(currentUser)

        if (!currentUser.friendRequests.includes(requestId)) {
            return res.status(400).json({ message: "No friend request from this user" });
        }

        currentUser.friendRequests = currentUser.friendRequests.filter(
            (id) => id.toString() !== requestId
        );
        currentUser.friends.push(requester);
        requester.friends.push(currentUser);

        await currentUser.save();
        await requester.save();

        return res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Accept friend request error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Friend recommendations based on mutual friends
export const recommendations = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("friends");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const mutuals = await User.find({
            _id: { $nin: [...user.friends, req.userId] },
            friends: { $in: user.friends },
        }, "username email profilePicture bio");

        res.status(200).json(mutuals);
    } catch (error) {
        console.error("Error fetching recommendations", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Decline a friend request
export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body; // requestId is the ID of the user who sent the request
        const currentUser = await User.findById(req.userId);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.friendRequests.includes(requestId)) {
            return res.status(400).json({ message: "No friend request from this user" });
        }

        // Remove the requestId from the friendRequests array
        currentUser.friendRequests = currentUser.friendRequests.filter(
            (id) => id.toString() !== requestId
        );
        
        await currentUser.save();

        return res.status(200).json({ message: "Friend request declined" });
    } catch (error) {
        console.error("Decline friend request error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Get all friend requests for the current user
export const getAllFriendRequests = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get all users who have sent friend requests to the current user
        const friendRequests = await User.find({
            _id: { $in: currentUser.friendRequests },
        }, "username email profilePicture bio");

        res.status(200).json(friendRequests);
    } catch (error) {
        console.error("Error fetching friend requests", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
