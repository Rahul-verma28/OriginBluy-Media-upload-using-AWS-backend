import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  interests: [{ type: String }],
  profilePicture: { type: String },
  isProfileSet: { type: Boolean, default: false },
  bio: { type: String },
});

// Create the User model
const User = model('User', userSchema);

export default User;