import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
const CategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("categories", CategorySchema);
