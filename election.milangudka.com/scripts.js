const DATA_URL =
  "https://r.jina.ai/https://www.bbc.co.uk/news/election/2026/england/results";

function formatChange(value) {
  if (value === "--" || value === null || value === undefined) return "--";
  const num = parseInt(value, 10);
  if (isNaN(num)) return "--";
  return (num > 0 ? "+" : "") + num;
}

function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString("en-GB");
}

function extractPartyData(text) {
  const get = (party) => {
    const regex = new RegExp(party + ".*?(\\d{1,4})\\s*\\(?([+-]?\\d+)?", "i");
    const match = text.match(regex);

    return {
      seats: match ? match[1] : "--",
      change: match && match[2] ? match[2] : "--"
    };
  };

  return {
    reform: get("Reform"),
    conservative: get("Conservative"),
    labour: get("Labour"),
    libdem: get("Liberal Democrat"),
    green: get("Green"),
    independent: get("Independent")
  };
}

function applyChange(id, value) {
  const el = document.getElementById(id);

  const formatted = formatChange(value);
  el.textContent = formatted;

  el.classList.remove("pos", "neg", "neutral");

  const num = parseInt(value, 10);
  if (isNaN(num)) {
    el.classList.add("neutral");
  } else if (num > 0) {
    el.classList.add("pos");
  } else if (num < 0) {
    el.classList.add("neg");
  } else {
    el.classList.add("neutral");
  }
}

async function fetchData() {
  try {
    const res = await fetch(DATA_URL);
    const text = await res.text();

    const data = extractPartyData(text);

    document.getElementById("reformSeats").textContent = data.reform.seats;
    document.getElementById("conSeats").textContent = data.conservative.seats;
    document.getElementById("labSeats").textContent = data.labour.seats;
    document.getElementById("ldSeats").textContent = data.libdem.seats;
    document.getElementById("greenSeats").textContent = data.green.seats;
    document.getElementById("indSeats").textContent = data.independent.seats;

    applyChange("reformChange", data.reform.change);
    applyChange("conChange", data.conservative.change);
    applyChange("labChange", data.labour.change);
    applyChange("ldChange", data.libdem.change);
    applyChange("greenChange", data.green.change);
    applyChange("indChange", data.independent.change);

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function updateData() {
  updateTime();
  fetchData();
}

updateData();
setInterval(updateData, 10000);

const fsBtn = document.getElementById("fsBtn");
const icon = fsBtn.querySelector("i");

fsBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    icon.classList.remove("fa-expand");
    icon.classList.add("fa-compress");
  } else {
    await document.exitFullscreen();
    icon.classList.remove("fa-compress");
    icon.classList.add("fa-expand");
  }
});

/* =========================
   AUTO-HIDE CURSOR AFTER 3s
========================= */

let idleTimer;

function showCursor() {
  document.body.style.cursor = "default";
}

function hideCursor() {
  document.body.style.cursor = "none";
}

function resetIdleTimer() {
  showCursor();
  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    hideCursor();
  }, 3000);
}

window.addEventListener("mousemove", resetIdleTimer);
window.addEventListener("keydown", resetIdleTimer);
window.addEventListener("mousedown", resetIdleTimer);

resetIdleTimer();