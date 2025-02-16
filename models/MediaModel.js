import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
  },
  { timestamps: true }
);

const Media=  model("Media", mediaSchema);

export default Media;