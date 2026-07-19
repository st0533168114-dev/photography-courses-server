import mongoose from "mongoose";
import courses from "../Models/course.js";

const CoursesController = {
  get: async (req, res) => {
    try {
      const coursesList = await courses.find({});
      res.status(200).json(coursesList);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  getById: async (req, res) => {
    const id = req.params.id;
    try {
      const course = await courses.findById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  post: async (req, res) => {
    const {
      courseName,
      price,
      youtubeLink,
      courseImage,
      categoryId,
      status,
      courseDescription,
      courseContent,
      images,
    } = req.body;
    try {
      const newCourse = new courses({
        courseName,
        price,
        youtubeLink,
        courseImage,
        categoryId,
        status,
        courseDescription,
        courseContent,
        images,
      });
      await newCourse.save();
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  put: async (req, res) => {
    const { id } = req.params;
    const course = req.body;
    try {
      const updatedCourse = await courses.findByIdAndUpdate(id, course, {
        new: true,
        runValidators: true, // כדי לבצע ולידציה - זה לא קורה אוטומטית בעדכון
      });

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Course update failed" + error });
    }
  },
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const deletedCourse = await courses.findByIdAndDelete(id);
      if (!deletedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.status(200).json(deletedCourse);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
//כרגע לא בשמוש
  getByCategoryId: async (req, res) => {
    const id = req.params.id;
    try {
      const coursesList = await courses.find({ categoryId: id });
      res.status(200).json(coursesList);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};
export default CoursesController;
