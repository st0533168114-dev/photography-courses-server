//לכאורה בגוט נשאר רק המידלוור
import mongoose from "mongoose";
import users from "../Models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const secretKey = process.env.JWT_SECRET;
//לצורך אבטחה-כדי שאם המשתמש לא קיים זמן התגובה יהיה זהה לזמן התגובה של סיסמה שגויה וכך תוקף לא יוכל להבדיל בינהם ש
const DUMMY_HASH = "$2b$10$cvyu/pR27Zu4Y0L1H4Dp/u8KNKlHjvgKH9uJVk6vh9zQqMA6NEEkG";

const SALT_ROUNDS = 10;
const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

const UsersController = {
  get: async (req, res) => {
    try {
      const usersList = await users.find({}).select("-password");
      res.status(200).json(usersList);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  getById: async (req, res) => {
    const id = req.params.id;
    try {
      const user = await users.findById(id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  getProfile: async (req, res) => {
    try {
      const user = await users.findById(req.user.userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  post: async (req, res) => {
    const { firstName, lastName, email, userName, password, phoneNumber, courseIds } = req.body;

    if (!firstName || !lastName || !email || !userName || !password || !phoneNumber) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    try {
      const existingUser = await users.findOne({ $or: [{ email }, { userName }] });
      if (existingUser) {
        //  שגיאה - האימייל או שם המשתמש כבר תפוסים
        return res.status(400).json({ message: "Email or username already exists" });
      }

      const newUser = new users({
        firstName,
        lastName,
        email,
        userName,
        password: await hashPassword(password),
        phoneNumber,
        courseIds,
      });
      await newUser.save();
      const token = jwt.sign(
        {
          userId: newUser._id,
          role: newUser.role,
        },
        secretKey,
        { expiresIn: "2h" }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          userName: newUser.userName,
          phoneNumber: newUser.phoneNumber,
          courseIds: newUser.courseIds,
          role: newUser.role,
          status: newUser.status,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  put: async (req, res) => {
    const { id } = req.params;
    const user = req.body;
    try {
      if (req.user.userId !== id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (user.password) {
        user.password = await hashPassword(user.password);
      }
      const updatedUser = await users.findByIdAndUpdate(id, user, {
        new: true,
        runValidators: true, // כדי לבצע ולידציה - זה לא קורה אוטומטית בעדכון
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "User update failed" + error.message });
    }
  },
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      if (req.user.userId !== id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const deletedUser = await users.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  login: async (req, res) => {
    const { userName, password } = req.body;
    const user = await users.findOne({ userName });
    const isValidPassword = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH);

    if (!user || !isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      secretKey,
      { expiresIn: "2h" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        courseIds: user.courseIds,
        role: user.role,
        status: user.status,
      },
    });
  },
};
export default UsersController;
