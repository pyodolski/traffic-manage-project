const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// 회원가입
router.post("/signup", async (req, res) => {
  const { email, password, name, phone } = req.body;

  try {
    // 이메일 중복 체크
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 이메일입니다.",
      });
    }

    // 사용자 생성
    const [result] = await pool.query(
      "INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)",
      [email, password, name, phone]
    );

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT id, email, name, phone FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const user = users[0];
    res.json({
      success: true,
      message: "로그인 성공",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
