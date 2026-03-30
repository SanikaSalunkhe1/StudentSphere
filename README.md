# StudentSphere
# 🎓 Student Information Management System (SIMS)

A centralized, full-stack platform for streamlined academic record handling, student management, and administrative tracking. This project consists of a modern **React Frontend** and a robust **Node.js/Express Backend**.

---

## 🚀 Overview

The Student Information Management System is designed to bridge the gap between students, division incharges, and administrators. It provides a "single source of truth" for academic achievements, internships, placements, and semester-wise data.

### 👥 User Roles
-   **Student**: Track progress, submit achievements, and view academic records.
-   **Admin**: Full system control, student management, and global data access.
-   **Division Incharge**: Manage specific division records and verify student data.

---

## 🛠️ Tech Stack

### Frontend
-   **Core**: [React 19](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Icons**: Heroicons, Lucide-React, React Icons
-   **Networking**: Axios
-   **Routing**: React Router 7
-   **Notifications**: React Hot Toast, React Toastify
-   **Reporting**: ExcelJS (for data exports)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
-   **Authentication**: JWT (JSON Web Tokens) & Bcryptjs
-   **Email Services**: SendGrid, Brevo, Nodemailer
-   **Media Management**: Cloudinary
-   **Security**: Express-mongo-sanitize, Helmet, CORS, Rate Limiting
-   **File Handling**: Multer

---

## 📂 Project Structure

```text
Student-Website/
├── Frontend/           # React Client Application
│   ├── src/
│   │   ├── Pages/      # Main UI Views
│   │   ├── components/ # Reusable UI Modules
│   │   ├── layouts/    # Page Shells (Admin/Student)
│   │   └── api/        # Axios configurations
│   └── vercel.json     # Vercel Deployment Config
└── Backend/            # Node.js API Server
    ├── controllers/    # Request Handlers
    ├── models/         # Database Schemas
    ├── routes/         # API Endpoints
    ├── middlewares/    # Custom Logic (Auth, Error)
    └── config/         # DB & Environment setup
```

---

## ⚙️ Setup & Installation

### Prerequisites
-   Node.js (v18+ recommended)
-   MongoDB Atlas account or local MongoDB
-   Cloudinary Account (for uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/TechMe103/Student_Website.git
cd Student-Website
```

### 2. Backend Configuration
Navigate to the `Backend` directory:
```bash
cd Backend
npm install
```
Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
# ... (see .env.example for more)
```
Run the server:
```bash
npm start   # or npm run dev if nodemon is configured
```

### 3. Frontend Configuration
Navigate to the `Frontend` directory:
```bash
cd ../Frontend
npm install
```
Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the client:
```bash
npm run dev
```

---

## 📡 API Endpoints (Brief)

| Endpoint | Description |
| :--- | :--- |
| `/api/auth` | User authentication & password reset |
| `/api/student` | Profile management & info |
| `/api/internship` | Internship tracking |
| `/api/achievements` | Student achievements management |
| `/api/activities` | Extracurricular activity tracking |
| `/api/placement` | Placement records |
| `/api/dashboard` | Analytics & Summary data |

---

## 🌐 Deployment

-   **Frontend**: Optimized for [Vercel](https://vercel.com).
-   **Backend**: Deployed via [Render](https://render.com) or similar Node-friendly hosts.

---

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License
_
Distributed under the ISC License.

