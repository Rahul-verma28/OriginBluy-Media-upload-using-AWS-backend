import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";

const maxAge = 3 * 24 * 60 * 60; // Token expiration (3 days)

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

export const signup = async (req, res) => {
    try {
        const { email, password, username } = req.body; // Ensure username is included
        if (!email || !password || !username) {  // Check for username
            return res.status(400).send({ message: 'Email, Password, and Username are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already exists.' });
        }

        const existingUsername = await User.findOne({ username }); // Check if username already exists
        if (existingUsername) {
            return res.status(400).send({ message: 'Username already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, username });

        res.cookie("jwt", createToken(email, user._id), {
            maxAge: maxAge * 1000,
            secure: true,
            sameSite: "None",
        });

        return res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.error("Signup error", error);
        return res.status(500).send("Internal server error");
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: 'Email and Password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: 'Email not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ message: 'Incorrect password' });
        }

        res.cookie("jwt", createToken(email, user._id), {
            maxAge: maxAge * 1000,
            secure: true,
            sameSite: "None",
        }); 

        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                friends: user.friends,
                friendRequests: user.friendRequests,
                profilePicture: user.profilePicture,
                isProfileSet: user.isProfileSet,
                bio: user.bio,
            },
        });
    } catch (error) {
        console.error("Login error", error);
        return res.status(500).send("Internal server error");
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            friends: user.friends,
            friendRequests: user.friendRequests,
            profilePicture: user.profilePicture,
            interests: user.interests,
            bio: user.bio,
        });
    } catch (error) {
        console.error("Get user by ID error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password"); // Use req.userId from middleware

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            friends: user.friends,
            friendRequests: user.friendRequests,
            profilePicture: user.profilePicture,
            interests: user.interests,
            bio: user.bio,
        });
    } catch (error) {
        console.error("Get user info error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const { username, bio, interests, profilePicture } = req.body;

        // Check if the new username is already taken
        let existingUsername;
        try {
            existingUsername = await User.findOne({ username, _id: { $ne: req.userId } });
        } catch (err) {
            return res.status(500).json({ message: "Error checking username availability" });
        }

        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken." });
        }

        // Prepare update object to avoid overwriting with undefined
        const updates = {};
        if (username) updates.username = username;
        if (bio) updates.bio = bio;
        if (interests) updates.interests = interests;
        if (profilePicture) updates.profilePicture = profilePicture;
        updates.isProfileSet = true;

        // Update the user's profile
        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            id: user._id,
            username: user.username,
            bio: user.bio,
            interests: user.interests,
            email: user.email,
            profilePicture: user.profilePicture, // Now included
        });

    } catch (error) {
        console.error("Update profile error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
        return res.status(200).send("Logged out successfully");
    } catch (error) {
        console.error("Logout error", error);
        return res.status(500).send("Internal server error");
    }
};
