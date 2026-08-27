// רק פעולות שמיועדות למנהל בלבד עוברות דרך כאן.
// פעולה שמותרת גם למשתמש על המשאב שלו נבדקת בקונטרולר עצמו ולא במידלוור
const isAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).send({ message: "Forbidden" });
  }
  next();
};
export default isAdminMiddleware;
