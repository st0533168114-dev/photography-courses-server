import mongoose from "mongoose";
import courses from "../Models/course.js";

const allowedTransitions = {
  publish: { from: ["draft", "notAvailable", "archived"], to: "available" },
  markUnavailable: { from: ["available"], to: "notAvailable" },
  archive: { from: ["available", "notAvailable"], to: "archived" },
};

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
    if (course.status !== undefined) {
      return res.status(400).json({ message: "שינוי סטטוס נעשה בנתיב PUT /courses/:id/status" });
    }
    try {
      const updatedCourse = await courses.findByIdAndUpdate(id, course, {
        new: true,
        runValidators: true, // Mongoose לא מריץ ולידציה בעדכון אלא אם מבקשים במפורש
      });

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Course update failed" + error });
    }
  },

  changeStatus: async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    const transition = allowedTransitions[action];
    if (!transition) {
      return res.status(400).json({ message: "פעולה לא מוכרת" });
    }

    try {
      const course = await courses.findById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (!transition.from.includes(course.status)) {
        return res.status(409).json({ message: "הפעולה אינה חוקית מהסטטוס הנוכחי של הקורס" });
      }

      course.status = transition.to;
      await course.save();
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const course = await courses.findById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (course.status !== "draft") {
        return res
          .status(409)
          .json({ message: "ניתן למחוק רק קורס בטיוטה. קורס שפורסם אפשר להעביר לארכיון" });
      }

      await courses.findByIdAndDelete(id);
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
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
