# מירלה כהן - קורסי צילום | שרת

שרת REST API עבור אתר מכירת קורסי צילום דיגיטליים. כולל ניהול משתמשים עם אימות JWT, קטלוג קורסים וקטגוריות, עגלת קניות, הזמנות ותשלומים, ופאנל ניהול למנהלים.

## טכנולוגיות

Node.js · Express 5 · MongoDB (Mongoose) · JWT · bcrypt · cors · dotenv

## התקנה והרצה

```bash
git clone https://github.com/st0533168114-dev/photography-courses-server.git
cd photography-courses-server
npm install
npm start
```

השרת יאזין בכתובת `http://localhost:1234`.

## משתני סביבה

יש ליצור קובץ `.env` בתיקיית השרת:

```
MONGO_URI=<connection string ל-MongoDB>
JWT_SECRET=<סוד לחתימת טוקנים>
```

## מבנה עיקרי

```
├── app.js          # נקודת כניסה: express, DB, CORS, ראוטרים
├── Routers/        # הגדרת נתיבי API
├── Controllers/     # לוגיקה עסקית
├── Models/          # סכמות Mongoose
├── Middlewares/      # אימות JWT והרשאות אדמין
└── Images/           # תמונות קורסים
```

## נתיבי API עיקריים

`/users` · `/courses` · `/categories` · `/shoppingCarts` · `/orders` · `/payments` · `/faq`
