import courses from "../Models/course.js";

export const resolveCart = async (cart) => {
  const courseIds = cart.courseList.map((item) => item.courseId);
  const catalogCourses = await courses
    .find({ _id: { $in: courseIds } })
    .select("courseName price courseImage status");
  const courseById = new Map(catalogCourses.map((item) => [item._id.toString(), item]));

  const courseList = cart.courseList
    .map((item) => {
      const current = courseById.get(item.courseId.toString());
      // קורס חסר אפשרי רק אם נמחק מהמסד, ומדיניות המחיקה אוסרת זאת על קורס מפורסם
      // מסננים כדי שהעגלה לא תקרוס, במקום להציג פריט בלי שם ובלי מחיר
      if (!current) {
        return null;
      }
      return {
        courseId: item.courseId,
        courseName: current.courseName,
        price: current.price,
        courseImage: current.courseImage,
        isAvailable: current.status === "available",
        previousPrice: current.price !== item.price ? item.price : undefined,
      };
    })
    .filter((item) => item !== null);

  return {
    ...cart.toObject(),
    courseList,
    subtotal: courseList.reduce((sum, item) => (item.isAvailable ? sum + item.price : sum), 0),
  };
};
