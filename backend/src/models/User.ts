import { Schema, model } from "mongoose";
import { AuthRole } from "../types/auth";

interface UserDocument {
  fullName: string;
  email: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  role: AuthRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: { type: String, default: null },
    role: {
      type: String,
      enum: ["Student", "Professional", "Writer"],
      default: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<UserDocument>("User", userSchema);
