import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import dotenv from "dotenv"
import authRoutes from "./routes/AuthRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

mongoose.connect(databaseUrl).then(() => {
    console.log("DB connection sucessfully");
}).catch((err) => {
    console.log("DB connection failed : ", err.message);
})

app.use(
    cors({
        origin: [process.env.ORIGIN],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    })
);

app.use(cookieParser())
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);


app.get("/", (req, res) => {
    res.send("Nice working");
});


const server = app.listen(port,() => {
    console.log(`Server is running on port http://localhost:${port}`);
});

