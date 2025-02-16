import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Create the User model
const User = model('User', userSchema);

export default User;