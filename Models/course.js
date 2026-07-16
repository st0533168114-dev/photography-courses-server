import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
const CourseSchema = mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  youtubeLink: String,
  courseImage: {
    type: String,
    required: true,
    default: "ImagesOutImages0738_-canon_600.jpeg",
  },
  categoryId: {
    type: ObjectId,
    ref: "categories", // ????
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "notAvailable"],
    default: "available",
  },
  courseDescription: {
    type: String,
    // required: true//?????????????
     default: "",//?
  },
  courseContent: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
});
export default mongoose.model("courses", CourseSchema);
