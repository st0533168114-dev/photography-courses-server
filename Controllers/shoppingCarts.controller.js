import mongoose from "mongoose";
import shoppingCarts from "../Models/shoppingCart.js";
import course from "../Models/course.js";

const ShoppingCartsController = {
  //שינית אותה לבדוק שעובדת(אם אין עגלה יוצרת ריקה!)

  getAllCarts: async (req, res) => {
    try {
      const shoppingCartsList = await shoppingCarts.find({});
      res.status(200).json(shoppingCartsList);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  getByUserId: async (req, res) => {
    const userId = req.user.userId;
    try {
      const shoppingCart = await shoppingCarts.findOne({ userId: userId });
      if (!shoppingCart) {
        return res.status(200).json({ userId, subtotal: 0, courseList: [] });
      }
      res.status(200).json(shoppingCart);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  //כנראה מיותר כי יוצרים בגט עגלה ריקה אם צריך
  // post:async(req,res)=>{
  //     const {
  //         userId,
  //         courseList  }=req.body;
  //     try{
  // const calculatedSubtotal=courseList.reduce((sum,course)=>sum+course.price,0);

  //       const newShoppingCart = new shoppingCarts({
  //         userId,
  //         subtotal:calculatedSubtotal,
  //         courseList
  //       })
  //       await newShoppingCart.save();
  //     //   const shoppingCartsList= await shoppingCarts.find({})
  //       //res.status(200).json(shoppingCartsList)
  //       res.status(200).json(newShoppingCart )//?
  //     }
  //     catch(error){
  //      res.status(500).json({error:error})
  //     }
  // },

  //גם פוט לכאורה מיותר גם אם לא להתאים את המבנה שלו!!!
  // put: async (req, res) => {
  //   const { id } = req.params;
  //   const shoppingCart = req.body;
  //   try {
  //     if (shoppingCart.courseList) {
  //       shoppingCart.subtotal = shoppingCart.courseList.reduce(
  //         (sum, course) => sum + course.price,
  //         0
  //       );
  //     }
  //     const updateShoppingCart = await shoppingCarts.findByIdAndUpdate(id, shoppingCart, {
  //       new: true,
  //     });
  //     if (!updateShoppingCart) {
  //       return res.status(404).json({ message: "Shopping cart not found" });
  //     }
  //     //??
  //     // const shoppingCartsList=await shoppingCarts.find({});
  //     //res.status(200).json(shoppingCartsList);
  //     res.status(200).json(updateShoppingCart); //?
  //   } catch (error) {
  //     res.status(500).json({ error: "ShoppingCart update failed" + error });
  //   }
  // },

  // מוחקת את כל הקורסים מהעגלה (מרוקנת אותה)
  clearCart: async (req, res) => {
    const userId = req.user.userId;
    try {
      const updateShoppingCart = await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        { $set: { courseList: [], subtotal: 0 } }, //שינוי רק של הערכים האלו באוביקט:
        {
          new: true,
          runValidators: true, // כדי לבצע ולידציה- זה לא קורה אוטומטית בעדכון
        }
      );
      if (!updateShoppingCart) {
        return res.status(404).json({ message: "Shopping cart not found" });
      }
      res.status(200).json(updateShoppingCart);
    } catch (error) {
      res.status(500).json({ error: "clear cart failed" + error });
    }
  },


  addToCart: async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.body;
    try {
      const courseDetails = await course.findById(courseId);
      if (!courseDetails) {
        return res.status(404).json({ message: "Course not found" });
      }
      // בודק אם כבר קיימת עגלה למשתמש לפני שמוסיפים לקורס חדש
      const currentShoppingCart = await shoppingCarts.findOne({ userId: userId });

      if (currentShoppingCart) {
        // בודק אם הקורס כבר נמצא בעגלה כדי למנוע כפילות
        const isCourseInShoppingCart = currentShoppingCart.courseList.some(
          (course) => course.courseId.toString() === courseId
        );

        if (isCourseInShoppingCart) {
          // אם הקורס כבר קיים, מחזירים את העגלה בלי לבצע שינויים נוספים
          return res.status(200).json(currentShoppingCart);
        }

        // אם העגלה קיימת אבל הקורס עדיין לא בה, מוסיפים אותו אליה בלי ליצור עגלה חדשה
        const updatedShoppingCart = await shoppingCarts.findOneAndUpdate(
          { userId: userId },
          {
            $push: {
              courseList: {
                courseId: courseId,
                courseName: courseDetails.courseName,
                price: courseDetails.price,
                courseImage: courseDetails.courseImage,
              },
            },
            // מוסיף את מחיר הקורס לסכום הכולל של העגלה
            $inc: { subtotal: courseDetails.price },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        return res.status(200).json(updatedShoppingCart);
      }

      // אם לא קיימת עגלה בכלל, נוצרת עגלה חדשה רק כאשר באמת מתווסף קורס בפעם הראשונה
      const newShoppingCart = await shoppingCarts.create({
        userId,
        subtotal: courseDetails.price,
        courseList: [
          {
            courseId: courseId,
            courseName: courseDetails.courseName,
            price: courseDetails.price,
            courseImage: courseDetails.courseImage,
          },
        ],
      });

      res.status(200).json(newShoppingCart);
    } catch (error) {
      res.status(500).json({ error: "add to cart failed" + error });
    }
  },
  removeFromCart: async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.params;
    try {
      //מציאת העגלה כדי לדעת מה המחיר של הקורס שאני רוצה למחוק
      const currentShoppingCart = await shoppingCarts.findOne({ userId: userId });
      if (!currentShoppingCart) return res.status(404).json({ message: "Shopping cart not found" });
      const courseToRemove = currentShoppingCart.courseList.find(
        (course) => course.courseId.toString() === courseId
      );

      if (!courseToRemove) {
        return res.status(404).json({ message: "Course not found in cart" });
      }
      const updateShoppingCart = await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        {
          // מסיר את הפריט מהמערך courseList 
          $pull: {
            courseList: {
              courseId: new mongoose.Types.ObjectId(courseId),
            },
          },
          // מוריד את מחיר הקורס מהסכום הכולל של העגלה
          $inc: { subtotal: -courseToRemove.price },
        },
        {
          new: true,
          runValidators: true, // כדי לבצע ולידציה- זה לא קורה אוטומטית בעדכון
        }
      );

      res.status(200).json(updateShoppingCart);
    } catch (error) {
      res.status(500).json({ error: "remove from cart failed" + error });
    }
  },

};

export default ShoppingCartsController;
