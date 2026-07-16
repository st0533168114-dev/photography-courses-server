import mongoose from "mongoose";
import categories from "../Models/category.js";

const CategoriesController = {
  get: async (req, res) => {
    try {
      const categoriesList = await categories.find({});
      res.status(200).json(categoriesList);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  getById: async (req, res) => {
    const id = req.params.id;
    try {
      const category = await categories.findById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  post: async (req, res) => {
    const { categoryName } = req.body;
    try {
      const newCategory = new categories({
        categoryName,
      });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  put: async (req, res) => {
    const { id } = req.params;
    const category = req.body;
    try {
      const updatedCategory = await categories.findByIdAndUpdate(id, category, {
        new: true,
        runValidators: true, // כדי לבצע ולידציה - זה לא קורה אוטומטית בעדכון
      });

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(404).json({ error: "Category update failed" + error });
    }
  },
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const deletedCategory = await categories.findByIdAndDelete(id);
      if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(200).json(deletedCategory);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};
export default CategoriesController;
