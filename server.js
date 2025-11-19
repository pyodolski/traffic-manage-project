require("dotenv").config();
const express = require("express");
const { pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json());
app.use(express.static("public"));

// 라우트
const authRoutes = require("./routes/auth");
const monitorRoutes = require("./routes/monitor");
app.use("/api/auth", authRoutes);
app.use("/api/monitor", monitorRoutes);

// 헬스체크
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// DB 연결 테스트
app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT VERSION() as version");
    res.json({
      status: "OK",
      database: "Connected",
      version: rows[0].version,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 DB test: http://localhost:${PORT}/db-test`);
  console.log(`📍 회원가입: POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`📍 로그인: POST http://localhost:${PORT}/api/auth/login`);
});
