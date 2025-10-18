# 🚀 دليل بناء Backend لمشكاة - خطوة بخطوة

## 📋 نظرة عامة

سنبني Backend احترافي باستخدام:

- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الـ API
- **قاعدة بيانات** (PostgreSQL أو MongoDB)
- **JWT** - للتوثيق
- **Multer** - لرفع الصور
- **Bcrypt** - لتشفير كلمات المرور

---

## 🏗️ هيكل المشروع

```
mishkat-backend/
├── src/
│   ├── config/
│   │   ├── database.js         ← إعداد قاعدة البيانات
│   │   └── config.js           ← الإعدادات العامة
│   ├── models/
│   │   ├── User.js             ← نموذج المستخدم
│   │   ├── Product.js          ← نموذج المنتج
│   │   ├── Order.js            ← نموذج الطلب
│   │   ├── Category.js         ← نموذج التصنيف
│   │   ├── Coupon.js           ← نموذج القسيمة
│   │   └── Review.js           ← نموذج المراجعة
│   ├── controllers/
│   │   ├── authController.js   ← منطق التوثيق
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js       ← مسارات التوثيق
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js             ← التحقق من التوثيق
│   │   ├── errorHandler.js     ← معالجة الأخطاء
│   │   └── validation.js       ← التحقق من البيانات
│   ├── utils/
│   │   ├── jwt.js              ← دوال JWT
│   │   └── email.js            ← إرسال البريد
│   └── app.js                  ← التطبيق الرئيسي
├── uploads/                    ← الصور المرفوعة
├── .env                        ← المتغيرات البيئية
├── .gitignore
├── package.json
└── server.js                   ← نقطة البداية
```

---

## 📦 الخطوة 1: إنشاء المشروع

### **1.1 إنشاء المجلد:**

```bash
# أنشئ مجلد Backend
mkdir mishkat-backend
cd mishkat-backend

# ابدأ مشروع Node.js جديد
npm init -y
```

---

### **1.2 تثبيت المكتبات الأساسية:**

```bash
# Express وأدوات أساسية
npm install express cors dotenv

# Database (اختر واحدة)
npm install pg pg-hstore sequelize        # PostgreSQL
# أو
npm install mongoose                       # MongoDB

# Authentication & Security
npm install bcryptjs jsonwebtoken express-validator

# File Upload
npm install multer

# Development Tools
npm install --save-dev nodemon
```

---

### **1.3 إنشاء الهيكل:**

```bash
# إنشاء المجلدات
mkdir -p src/{config,models,controllers,routes,middleware,utils}
mkdir uploads

# إنشاء الملفات الأساسية
touch .env .gitignore
touch server.js
touch src/app.js
```

---

## 📝 الخطوة 2: إعداد الملفات الأساسية

### **2.1 ملف .env:**

```bash
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mishkat_db
DB_USER=postgres
DB_PASSWORD=your_password

# أو MongoDB
# MONGODB_URI=mongodb://localhost:27017/mishkat_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

### **2.2 ملف .gitignore:**

```bash
node_modules/
.env
uploads/
*.log
.DS_Store
```

---

### **2.3 تحديث package.json:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 🗄️ الخطوة 3: إعداد قاعدة البيانات

### **خيار 1: PostgreSQL**

#### **3.1.1 تثبيت PostgreSQL:**

**على Windows:**

```bash
# حمّل من: https://www.postgresql.org/download/
# أو استخدم Docker:
docker run --name mishkat-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

**على macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**على Linux:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### **3.1.2 إنشاء قاعدة البيانات:**

```bash
# ادخل لـ PostgreSQL
psql -U postgres

# أنشئ قاعدة البيانات
CREATE DATABASE mishkat_db;

# اخرج
\q
```

---

### **خيار 2: MongoDB**

#### **3.2.1 تثبيت MongoDB:**

**على Windows:**

```bash
# حمّل من: https://www.mongodb.com/try/download/community
# أو استخدم MongoDB Atlas (مجاني في السحابة)
```

**على macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**على Linux:**

```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

#### **3.2.2 أو استخدم MongoDB Atlas (موصى به):**

1. اذهب إلى: https://www.mongodb.com/atlas
2. أنشئ حساب مجاني
3. أنشئ Cluster مجاني
4. احصل على Connection String
5. ضعه في `.env`:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mishkat_db
```

---

## 🔧 الخطوة 4: كتابة الكود الأساسي

سأعطيك الكود الكامل في Artifacts منفصلة:

1. **server.js** - نقطة البداية
2. **src/app.js** - إعداد Express
3. **src/config/database.js** - اتصال قاعدة البيانات
4. **Models** - نماذج قاعدة البيانات
5. **Controllers** - منطق الـ API
6. **Routes** - المسارات
7. **Middleware** - الحماية والتحقق

---

## 📊 الخطوة 5: تصميم قاعدة البيانات

### **الجداول/Collections الرئيسية:**

1. **users** - المستخدمين

   - id, name, email, password, role, phone, avatar

2. **products** - المنتجات

   - id, title, description, price, stock, category_id, images

3. **categories** - التصنيفات

   - id, name, slug, description

4. **orders** - الطلبات

   - id, user_id, total, status, address

5. **order_items** - عناصر الطلب

   - id, order_id, product_id, quantity, price

6. **reviews** - المراجعات

   - id, user_id, product_id, rating, comment

7. **coupons** - القسائم
   - id, code, type, value, min_purchase, expires_at

---

## 🚀 الخطوة 6: إنشاء الـ API Routes

سنبني:

- ✅ `POST /api/auth/register` - تسجيل
- ✅ `POST /api/auth/login` - دخول
- ✅ `GET /api/products` - قائمة المنتجات
- ✅ `POST /api/products` - إضافة منتج (Admin)
- ✅ `GET /api/orders` - طلبات المستخدم
- ✅ `POST /api/orders` - إنشاء طلب
- ✅ وأكثر...

---

## 🧪 الخطوة 7: اختبار الـ API

### **7.1 تثبيت Postman:**

```bash
# حمّل من: https://www.postman.com/downloads/
```

### **7.2 اختبر الـ Endpoints:**

```bash
# تسجيل مستخدم جديد
POST http://localhost:5000/api/auth/register
Body: {
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123"
}

# تسجيل الدخول
POST http://localhost:5000/api/auth/login
Body: {
  "email": "ahmed@example.com",
  "password": "password123"
}
```

---

## 🔗 الخطوة 8: ربط Frontend بـ Backend

في React Frontend:

```javascript
// src/services/api.js
const API_URL = "http://localhost:5000/api";

// استبدل mockAuthAPI بـ:
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};
```

---

## 📋 الخطوات التالية

الآن سأعطيك الكود الكامل لكل جزء:

1. **Server Setup** - server.js & app.js
2. **Database Connection** - PostgreSQL أو MongoDB
3. **Models** - نماذج قاعدة البيانات الكاملة
4. **Authentication** - تسجيل الدخول والتوثيق
5. **Products API** - إدارة المنتجات
6. **Orders API** - إدارة الطلبات
7. **Upload Images** - رفع الصور

---

## 🎯 اختر الآن

أخبرني:

1. **PostgreSQL** - وسأعطيك كود SQL كامل
2. **MongoDB** - وسأعطيك كود Mongoose كامل

وسأبدأ فوراً بإنشاء الكود! 🚀
