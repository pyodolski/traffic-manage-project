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
      // JWT 토큰과 사용자 정보 저장
      localStorage.setItem("token", data.token);
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

  // 데이터 로드
  loadMatches();
  loadMyBookings(user.id);

  // 모니터링 시작
  startMonitoring();
}

// 경기 목록 로드
async function loadMatches() {
  try {
    const response = await fetch(`${API_URL}/matches`);
    const data = await response.json();

    const matchesList = document.getElementById("matches-list");
    if (data.matches.length === 0) {
      matchesList.innerHTML =
        '<p class="empty-message">예매 가능한 경기가 없습니다.</p>';
      return;
    }

    matchesList.innerHTML = data.matches
      .map(
        (match) => `
      <div class="match-card">
        <div class="match-info">
          <div class="match-teams">${match.home_team} vs ${
          match.away_team
        }</div>
          <div class="match-details">
            <span>📅 ${new Date(match.match_date).toLocaleString(
              "ko-KR"
            )}</span>
            <span>🏟️ ${match.stadium}</span>
            <span>💰 ${match.price.toLocaleString()}원</span>
            <span>🪑 ${match.available_seats}/${match.total_seats}석 (${(
          ((match.total_seats - match.available_seats) / match.total_seats) *
          100
        ).toFixed(0)}% 예매)</span>
          </div>
        </div>
        <button onclick="openStadiumModal(${match.id}, '${match.home_team}', '${
          match.away_team
        }', '${match.stadium}', '${match.match_date}', ${
          match.price
        })" class="book-btn">좌석 선택</button>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("경기 목록 로드 오류:", error);
  }
}

// 티켓 예매
async function bookTicket(matchId, price) {
  const user = JSON.parse(localStorage.getItem("user"));
  const seatNumber = `${String.fromCharCode(
    65 + Math.floor(Math.random() * 5)
  )}-${Math.floor(Math.random() * 100) + 1}`;

  try {
    const response = await fetch(`${API_URL}/matches/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        matchId,
        seatNumber,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`예매 완료! 좌석: ${seatNumber}`, "success");
      loadMatches();
      loadMyBookings(user.id);
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    showMessage("예매 실패", "error");
  }
}

// 내 예매 내역 로드
async function loadMyBookings(userId) {
  try {
    const response = await fetch(`${API_URL}/matches/my-bookings/${userId}`);
    const data = await response.json();

    const bookingsList = document.getElementById("bookings-list");
    if (data.bookings.length === 0) {
      bookingsList.innerHTML =
        '<p class="empty-message">예매 내역이 없습니다.</p>';
      return;
    }

    bookingsList.innerHTML = data.bookings
      .map(
        (booking) => `
      <div class="booking-card">
        <div class="booking-info">
          <div class="booking-teams">${booking.home_team} vs ${
          booking.away_team
        }</div>
          <div class="booking-details">
            <span>📅 ${new Date(booking.match_date).toLocaleString(
              "ko-KR"
            )}</span>
            <span>🪑 ${booking.seat_number}</span>
            <span>💰 ${booking.total_price.toLocaleString()}원</span>
          </div>
        </div>
        <span class="booking-status">${
          booking.booking_status === "confirmed" ? "✅ 확정" : "⏳ 대기"
        }</span>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("예매 내역 로드 오류:", error);
  }
}

// 로그아웃
function logout() {
  stopMonitoring();
  localStorage.removeItem("token");
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

// 토큰 검증
async function verifyToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    } else {
      // 토큰 만료 또는 유효하지 않음
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
  } catch (error) {
    return false;
  }
}

// 페이지 로드 시 로그인 상태 확인
window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (user && token) {
    // 토큰 검증
    const isValid = await verifyToken();
    if (isValid) {
      showMainSection(user);
    } else {
      showMessage("세션이 만료되었습니다. 다시 로그인해주세요.", "error");
    }
  }
});

// 경기장 모달 관련
let currentMatchId = null;
let currentMatchPrice = 0;
let selectedSeat = null;
let bookedSeats = [];

// 경기장 모달 열기
async function openStadiumModal(
  matchId,
  homeTeam,
  awayTeam,
  stadium,
  matchDate,
  price
) {
  currentMatchId = matchId;
  currentMatchPrice = price;
  selectedSeat = null;

  // 모달 정보 업데이트
  document.getElementById(
    "modal-match-title"
  ).textContent = `${homeTeam} vs ${awayTeam}`;
  document.getElementById(
    "modal-match-info"
  ).textContent = `${stadium} | ${new Date(matchDate).toLocaleString("ko-KR")}`;

  // 예매된 좌석 조회
  await loadBookedSeats(matchId);

  // 좌석 생성
  generateSeats();

  // 모달 표시
  document.getElementById("stadium-modal").classList.add("active");
  document.body.style.overflow = "hidden";
}

// 경기장 모달 닫기
function closeStadiumModal() {
  document.getElementById("stadium-modal").classList.remove("active");
  document.body.style.overflow = "auto";
  selectedSeat = null;
  currentMatchId = null;
}

// 예매된 좌석 조회
async function loadBookedSeats(matchId) {
  try {
    const response = await fetch(`${API_URL}/matches/${matchId}/booked-seats`);
    const data = await response.json();
    bookedSeats = data.bookedSeats || [];
  } catch (error) {
    console.error("예매된 좌석 조회 오류:", error);
    bookedSeats = [];
  }
}

// 좌석 생성
function generateSeats() {
  const stands = [
    { id: "north-stand", prefix: "N", count: 8, label: "NORTH STAND" },
    { id: "west-stand", prefix: "W", count: 6, label: "WEST STAND" },
    { id: "east-stand", prefix: "E", count: 6, label: "EAST STAND" },
    {
      id: "south-stand",
      prefix: "S",
      count: 8,
      label: "SOUTH STAND",
    },
  ];

  stands.forEach((stand) => {
    const container = document.getElementById(stand.id);
    container.innerHTML = `<div class="stand-label">${stand.label}</div><div class="seats-row"></div>`;
    const seatsRow = container.querySelector(".seats-row");

    for (let i = 1; i <= stand.count; i++) {
      const seatNumber = `${stand.prefix}${i}`;
      const isBooked = bookedSeats.includes(seatNumber);

      const seat = document.createElement("div");
      seat.className = `seat ${isBooked ? "booked" : ""}`;
      seat.textContent = `${stand.prefix}${i}`;
      seat.dataset.seat = seatNumber;

      if (!isBooked) {
        seat.onclick = () => selectSeat(seatNumber);
      }

      seatsRow.appendChild(seat);
    }
  });
}

// 좌석 선택
function selectSeat(seatNumber) {
  // 이전 선택 해제
  document.querySelectorAll(".seat.selected").forEach((seat) => {
    seat.classList.remove("selected");
  });

  // 새로운 좌석 선택
  const seatElement = document.querySelector(`[data-seat="${seatNumber}"]`);
  seatElement.classList.add("selected");
  selectedSeat = seatNumber;

  // 예매 정보 업데이트
  document.getElementById("selected-seat-display").textContent = seatNumber;
  document.getElementById(
    "selected-price-display"
  ).textContent = `${currentMatchPrice.toLocaleString()}원`;

  // 버튼 활성화
  const confirmBtn = document.getElementById("confirm-booking-btn");
  confirmBtn.disabled = false;
  confirmBtn.textContent = "예매 확정";
}

// 예매 확정
async function confirmBooking() {
  if (!selectedSeat || !currentMatchId) return;

  const user = JSON.parse(localStorage.getItem("user"));

  try {
    const response = await fetch(`${API_URL}/matches/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        matchId: currentMatchId,
        seatNumber: selectedSeat,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`예매 완료! 좌석: ${selectedSeat}`, "success");
      closeStadiumModal();
      loadMatches();
      loadMyBookings(user.id);
    } else {
      showMessage(data.message, "error");
    }
  } catch (error) {
    showMessage("예매 실패", "error");
  }
}
