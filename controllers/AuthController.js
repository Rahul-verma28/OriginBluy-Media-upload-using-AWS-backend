import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import dotenv from "dotenv"

dotenv.config();

const maxAge = 7 * 24 * 60 * 60; // Token expiration (7 days)

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body; // Ensure name is included
        if (!email || !password || !name) {  // Check for name
            return res.status(400).send({ message: 'Email, Password, and name are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name });

        res.cookie("jwt", createToken(email, user._id), {
            httpOnly: true,
            maxAge: maxAge * 1000,
            secure: true,
            sameSite: "None",
        });

        return res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
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
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Login error", error);
        return res.status(500).send("Internal server error");
    }
};


export const getUserInfo = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        return res.status(200).json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        });
    } catch (error) {
        console.error("Get user info error", error);
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
