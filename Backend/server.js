const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
require("dotenv").config();
const errorHandler = require("./middlewares/errorHandler");
const {generalLimiter} = require("./middlewares/rateLimiter/rateLimiter");

// ✅ ADD THIS DEBUG CHECK
// console.log("🔍 ENVIRONMENT VARIABLES CHECK:");
// console.log("EMAIL_USER loaded:", process.env.EMAIL_USER ? "✅ YES" : "❌ NO");
// console.log(
//   "EMAIL_PASSWORD loaded:",
//   process.env.EMAIL_PASSWORD ? "✅ YES" : "❌ NO"
// );
// console.log(
//   "ADMIN_EMAIL loaded:",
//   process.env.ADMIN_EMAIL ? "✅ YES" : "❌ NO"
// );

// ✅ ADDED PORT CONFIG
const PORT = process.env.PORT || 5000;
const app = express();
app.set("trust proxy", true); // because render sits behind a reverse proxy - so all IPs might turn out to be same - req.ip maybe same - hence rate limiting might treat all users as same IP. - to avoid this trust proxy needs to be set

connectDB();

// ✅ FIXED CORS - More permissive for dev
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://student-website-seven.vercel.app", "https://student-website-frontend.vercel.app","https://computer-department-student-sphere.vercel.app",
      process.env.FRONTEND_URL // Support env-based URL
    ].filter(Boolean), // Remove undefined/null if env var is missing
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(generalLimiter); //always used just before routes

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/internship", require("./routes/internRoutes"));
app.use("/api/achievements", require("./routes/achievementRoutes"));
app.use("/api/activities", require("./routes/activitiesRoutes"));
app.use("/api/semesterInfo", require("./routes/semInfoRoutes"));
app.use("/api/admission", require("./routes/admissionRoutes"));
app.use("/api/placement", require("./routes/PlacementRoutes"));
app.use("/api/higherStudies", require("./routes/HigherStudiesRoutes"));
app.use("/api/student", require("./routes/StudentRoutes"));
app.use("/api/divisionIncharge", require("./routes/divisionInchargeRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// after all routes
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
