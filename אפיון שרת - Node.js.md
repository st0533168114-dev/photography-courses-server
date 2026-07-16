# מסמך אפיון – שרת (Server)
### פרויקט גמר: אתר רכישת קורסים דיגיטליים
**טכנולוגיה:** Node.js | Express 5 | MongoDB (Mongoose) | JWT  
**תאריך:** יוני 2026

---

## 1. סקירה כללית

השרת מספק REST API מלא לאתר רכישת קורסים דיגיטליים.  
הוא אחראי על ניהול משתמשים, קורסים, קטגוריות, סל קניות, הזמנות, תשלומים ו-FAQ.  
השרת מאזין על **פורט 1234** ומתחבר למסד נתונים MongoDB דרך Mongoose.

---

## 2. סטאק טכנולוגי

| רכיב | גרסה | תפקיד |
|------|------|--------|
| Node.js | LTS | סביבת ריצה |
| Express | 5.x | framework לניהול routes |
| Mongoose | 9.x | ODM למסד נתונים MongoDB |
| jsonwebtoken | 9.x | אימות משתמשים (JWT) |
| dotenv | 17.x | ניהול משתני סביבה |
| cors | 2.x | אפשור גישה מהלקוח |
| axios | 1.x | קריאות HTTP פנימיות |

---

## 3. מבנה הפרויקט

```
Server/
├── app.js               # נקודת כניסה – הגדרת express, חיבור DB, הרשמת routers
├── config.js            # הגדרות סביבה
├── .env                 # משתני סביבה (MONGO_URI, JWT_SECRET)
├── Models/
│   ├── user.js
│   ├── course.js
│   ├── category.js
│   ├── order.js
│   ├── shoppingCart.js
│   ├── payment.js
│   └── faq.js
├── Routers/
│   ├── users.router.js
│   ├── courses.router.js
│   ├── categories.router.js
│   ├── orders.router.js
│   ├── shoppingCart.router.js
│   ├── payments.router.js
│   └── faq.router.js
├── Controllers/
│   ├── users.controller.js
│   ├── courses.controller.js
│   ├── category.controller.js
│   ├── orders.controller.js
│   ├── shoppingCarts.controller.js
│   ├── payments.controller.js
│   └── faq.controller.js
├── Middlewares/
│   ├── jwt.middleware.js
│   └── isAdmin.middleware.js
└── Images/
```

---

## 4. אבטחה – JWT Middleware

כל נתיב מוגן עובר דרך `jwt.middleware.js`.  
הלוגיקה:
1. קורא את ה-header: `Authorization: Bearer <token>`
2. מאמת את הטוקן מול `JWT_SECRET`
3. מוסיף לבקשה את `req.user = { userId, role }`
4. אם הטוקן חסר או לא תקף – מחזיר `401 Unauthorized`

עבור פעולות ניהוליות (כגון הוספה/עדכון/מחיקה של FAQ), נעשה שימוש גם ב-`isAdmin.middleware.js` כדי לאפשר גישה רק למשתמשים עם role `admin`.

---

## 5. מודלים (Schema)

### 5.1 User

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| firstName | String | כן | |
| lastName | String | כן | |
| email | String | כן | ייחודי |
| userName | String | כן | ייחודי |
| password | String | כן | |
| phoneNumber | String | כן | |
| role | String | לא | enum: `admin` / `user`, ברירת מחדל: `user` |
| courseIds | [ObjectId] | לא | ref: courses |
| status | String | לא | enum: `active` / `inactive`, ברירת מחדל: `active` |

### 5.2 Course

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| courseName | String | כן | |
| price | Number | כן | min: 0 |
| youtubeLink | String | לא | |
| courseImage | String | כן | ברירת מחדל: תמונה גנרית |
| categoryId | ObjectId | כן | ref: categories |
| status | String | לא | enum: `available` / `notAvailable` |
| courseDescription | String | לא | |
| courseContent | [String] | לא | תוכן הקורס – רשימת נושאים |
| images | [String] | לא | תמונות נוספות |

### 5.3 Category

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| categoryName | String | כן | ייחודי |

### 5.4 Order

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| userId | ObjectId | כן | ref: users |
| coursesList | [{ courseId, price }] | כן | |
| totalAmount | Number | כן | |
| paymentsList | [ObjectId] | לא | ref: payments |
| orderDate | Date | לא | ברירת מחדל: Date.now |
| status | String | לא | enum: `completed` / `incomplete` |

### 5.5 ShoppingCart

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| userId | ObjectId | כן | ref: users |
| subtotal | Number | כן | ברירת מחדל: 0 |
| courseList | [{ courseId, courseName, price, courseImage }] | לא | |

### 5.6 Payment

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| orderId | ObjectId | כן | ref: orders |
| paymentDate | Date | לא | ברירת מחדל: Date.now |
| status | String | לא | enum: `success` / `failed` |
| paymentNumber | Number | כן | ברירת מחדל: 1 |
| paymentMethod | String | כן | |
| transactionId | String | כן | ייחודי |

### 5.7 FAQ

| שדה | סוג | חובה | הערות |
|-----|-----|------|-------|
| question | String | כן | שאלה נפוצה |
| answer | String | כן | תשובה לשאלה |

> בעת ביצוע עדכונים באמצעות `findByIdAndUpdate`, `findOneAndUpdate`, `updateOne` או `updateMany`, נעשה שימוש ב-`runValidators: true` כדי להפעיל ולידציה לפי הסכמה של Mongoose.

---

## 6. נתיבי API (Endpoints)

### 6.1 Users – `/users`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| POST | `/users/login` | פתוח | התחברות – מחזיר JWT |
| POST | `/users/register` | פתוח | הרשמת משתמש חדש |
| GET | `/users/profile` | JWT | קבלת פרופיל המשתמש המחובר |
| GET | `/users/` | JWT | קבלת כל המשתמשים (אדמין) |
| GET | `/users/:id` | JWT | קבלת משתמש לפי ID |
| POST | `/users/` | פתוח | יצירת משתמש |
| PUT | `/users/:id` | JWT | עדכון משתמש |
| DELETE | `/users/:id` | JWT | מחיקת משתמש |

### 6.2 Courses – `/courses`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| GET | `/courses/` | פתוח | קבלת כל הקורסים |
| GET | `/courses/category/:id` | פתוח | קורסים לפי קטגוריה |
| GET | `/courses/:id` | פתוח | קורס לפי ID |
| POST | `/courses/` | JWT | הוספת קורס (אדמין) |
| PUT | `/courses/:id` | JWT | עדכון קורס (אדמין) |
| DELETE | `/courses/:id` | JWT | מחיקת קורס (אדמין) |

### 6.3 Categories – `/categories`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| GET | `/categories/` | פתוח | קבלת כל הקטגוריות |
| GET | `/categories/:id` | פתוח | קטגוריה לפי ID |
| POST | `/categories/` | JWT | הוספת קטגוריה |
| PUT | `/categories/:id` | JWT | עדכון קטגוריה |
| DELETE | `/categories/:id` | JWT | מחיקת קטגוריה |

### 6.4 Orders – `/orders`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| GET | `/orders/` | JWT | כל ההזמנות (אדמין) |
| GET | `/orders/user-orders` | JWT | הזמנות המשתמש המחובר |
| GET | `/orders/:id` | JWT | הזמנה לפי ID |
| POST | `/orders/` | JWT | יצירת הזמנה |
| PUT | `/orders/:id` | JWT | עדכון הזמנה |
| DELETE | `/orders/:id` | JWT | מחיקת הזמנה |

### 6.5 ShoppingCart – `/shoppingCarts`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| GET | `/shoppingCarts/admin/all` | פתוח | כל עגלות הקניות (אדמין) |
| GET | `/shoppingCarts/` | JWT | עגלת הקניות של המשתמש המחובר |
| POST | `/shoppingCarts/items` | JWT | הוספת קורס לעגלה |
| DELETE | `/shoppingCarts/items/:courseId` | JWT | הסרת קורס מהעגלה |

### 6.6 Payments – `/payments`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| GET | `/payments/` | JWT | כל התשלומים |
| GET | `/payments/:id` | JWT | תשלום לפי ID |
| POST | `/payments/` | JWT | יצירת תשלום |
| PUT | `/payments/:id` | JWT | עדכון תשלום |
| DELETE | `/payments/:id` | JWT | מחיקת תשלום |

### 6.7 FAQ – `/faq`

| Method | Endpoint | הגנה | תיאור |
|--------|----------|------|-------|
| GET | `/faq/` | פתוח | שליפת כל השאלות והתשובות |
| POST | `/faq/` | JWT + Admin | הוספת FAQ חדשה |
| PUT | `/faq/:id` | JWT + Admin | עדכון FAQ |
| DELETE | `/faq/:id` | JWT + Admin | מחיקת FAQ |

---

## 7. תרשים זרימה – רכישת קורס

```
משתמש → הוסף לעגלה (POST /shoppingCarts/items)
       → צפה בעגלה (GET /shoppingCarts/)
       → בצע הזמנה (POST /orders/)
       → בצע תשלום (POST /payments/)
       → עדכן סטטוס הזמנה ל-completed (PUT /orders/:id)
```

---

## 8. משתני סביבה (.env)

```
MONGO_URI=<מחרוזת חיבור ל-MongoDB>
JWT_SECRET=<מפתח סודי לחתימת טוקנים>
```

---

## 9. הרצת השרת

```bash
node app.js
```

השרת מאזין על: `http://localhost:1234`
