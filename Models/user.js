import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;
//צריך????
const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  courseIds: {
    type: [ObjectId],
    ref: "courses",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});
export default mongoose.model("users", UserSchema);
