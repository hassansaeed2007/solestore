# 👟 SoleStore — MERN Shoe E-Commerce

Full-stack shoe store with Admin, Seller, and Customer roles.

## Tech Stack
- **Frontend**: React 18, Redux Toolkit, React Router v6, Axios, React Toastify
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI and Cloudinary credentials in .env
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

---

## Environment Variables (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:3000`) |

---

## Roles

| Role | Access |
|---|---|
| **Customer** | Browse, cart, checkout, orders, reviews |
| **Seller** | Seller dashboard, add/edit/delete own products |
| **Admin** | All users, all orders, dashboard stats |

To create an admin, register normally then update the role directly in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
