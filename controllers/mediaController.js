import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import Media from "../models/MediaModel.js";
import { s3 } from "../middlewares/uploadMiddleware.js";

// Upload media to AWS S3
// export const uploadMedia = async (req, res) => {
//   const { type } = req.body;

//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded." });
//     }

//     const media = await Media.create({
//       user: req.user._id, // Get user from authenticated request
//       filename: req.file.originalname,
//       url: req.file.location, // AWS S3 URL
//       type,
//     });

//     res.status(201).json(media);
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };


export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." })
    }

    const type = req.file.mimetype.startsWith("image") ? "image" : "video"

    const media = await Media.create({
      user: req.user._id,
      filename: req.file.originalname,
      url: req.file.location,
      type,
    })

    res.status(201).json(media)
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Server error." })
  }
}

// Get user's media
export const getMedia = async (req, res) => {
  const { userId } = req.params;

  try {
    const media = await Media.find({ user: userId });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMedia = async (req, res) => {
  const { mediaId } = req.params;

  try {
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Extract file key from S3 URL
    const fileKey = media.url.split(".com/")[1];
    
    // Delete file from S3
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    }));

    // Remove from database
    await Media.findByIdAndDelete(mediaId);
    res.json({ message: "Media deleted from S3" });
  } catch (error) {
    console.error("Media deletion error", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchMedia = async (req, res) => {
  try {
    const { filename, type, startDate, endDate, sortBy, order } = req.query;
    let query = {};

    // Filter by type (image or video)
    if (type) {
      query.type = type;
    }

    // Search by filename (case insensitive)
    if (filename) {
      query.filename = { $regex: filename, $options: "i" };
    }

    // Filter by date range
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    console.log("Generated Query:", query); // ✅ LOG QUERY BEFORE EXECUTING

    // Sorting logic
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === "asc" ? 1 : -1;
    }

    const media = await Media.find(query).sort(sortOptions);
    console.log("Found Media:", media); // ✅ LOG RESULT

    res.json(media);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error yes" });
  }
};

