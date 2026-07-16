const isAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).send({ message: "Forbidden" });
  }
  next();
};
export default isAdminMiddleware;
//פונקציות שהן רק למנהל עוברות דרך זה
//פונקציות שהן גם למנהל וגם למשתמש רגיל-בדיקה בפונקציה עצמה בקונטרולר
