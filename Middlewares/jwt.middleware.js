import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;
const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
};
export default jwtMiddleware;
