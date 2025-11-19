const API_URL = "http://localhost:3000/api";

// 탭 전환
function showTab(tab) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const tabs = document.querySelectorAll(".tab");

  if (tab === "login") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    tabs[0].classList.remove("active");
    tabs[1].classList.add("active");
  }
  hideMessage();
}

// 메시지 표시
function showMessage(message, type) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = "block";
}

function hideMessage() {
  const messageEl = document.getElementById("message");
  messageEl.style.display = "none";
}

// 회원가입
async function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const name = document.getElementById("signup-name").value;
  const phone = document.getElementById("signup-phone").value;

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phone }),
    });

    const data = await response.json();

    if (data.success) {
      showMessage("회원가입 성공! 로그인해주세요.", "success");
      setTimeout(() => showTab("login"), 2000);
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    showMessage("서버 연결 오류", "error");
  }
}

// 로그인
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      showMainSection(data.user);
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    showMessage("서버 연결 오류", "error");
  }
}

// 메인 섹션 표시
function showMainSection(user) {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("main-section").style.display = "block";
  document.getElementById("user-info").style.display = "flex";
  document.getElementById("user-name").textContent = `${user.name}님`;
  hideMessage();

  // 모니터링 시작
  startMonitoring();
}

// 로그아웃
function logout() {
  stopMonitoring();
  localStorage.removeItem("user");
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("main-section").style.display = "none";
  document.getElementById("user-info").style.display = "none";
  showTab("login");
}

// 시스템 모니터링
let monitoringInterval;

async function updateMonitoring() {
  try {
    const response = await fetch(`${API_URL}/monitor/system`);
    const data = await response.json();

    // 위젯 업데이트
    document.getElementById("widget-cpu").textContent = `${data.cpu.usage}%`;
    document.getElementById(
      "widget-cpu-bar"
    ).style.width = `${data.cpu.usage}%`;
    document.getElementById(
      "widget-memory"
    ).textContent = `${data.memory.usagePercent}%`;
    document.getElementById(
      "widget-memory-bar"
    ).style.width = `${data.memory.usagePercent}%`;
    document.getElementById("widget-cores").textContent = `${data.cpu.cores}개`;
    document.getElementById(
      "widget-total-mem"
    ).textContent = `${data.memory.total} GB`;
    document.getElementById(
      "widget-uptime"
    ).textContent = `${data.system.uptime}분`;
    document.getElementById("widget-hostname").textContent =
      data.system.hostname;
  } catch (error) {
    console.error("모니터링 오류:", error);
  }
}

function startMonitoring() {
  const isCollapsed = localStorage.getItem("widgetCollapsed") === "true";
  if (isCollapsed) {
    document.getElementById("monitor-toggle-btn").style.display = "flex";
  } else {
    document.getElementById("monitor-widget").style.display = "block";
  }

  updateMonitoring();
  monitoringInterval = setInterval(updateMonitoring, 2000);
}

function stopMonitoring() {
  document.getElementById("monitor-widget").style.display = "none";
  document.getElementById("monitor-toggle-btn").style.display = "none";
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }
}

// 위젯 토글
function toggleWidget() {
  const widget = document.getElementById("monitor-widget");
  const toggleBtn = document.getElementById("monitor-toggle-btn");

  if (widget.style.display === "none") {
    widget.style.display = "block";
    toggleBtn.style.display = "none";
    localStorage.setItem("widgetCollapsed", "false");
  } else {
    widget.style.display = "none";
    toggleBtn.style.display = "flex";
    localStorage.setItem("widgetCollapsed", "true");
  }
}

// 페이지 로드 시 로그인 상태 확인
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    showMainSection(user);
  }
});
