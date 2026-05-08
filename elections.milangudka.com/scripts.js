const DATA_URL =
"https://static.files.bbci.co.uk/elections/data/news/election/2026/england/results";

/* STORE PREVIOUS VALUES FOR ANIMATION */
const previousValues = {};

/* TIME */
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString("en-GB");
}

/* FORMAT CHANGE */
function formatChange(value) {
  if (value === null || value === undefined) return "--";
  const num = parseInt(value, 10);
  if (isNaN(num)) return "--";
  return (num > 0 ? "+" : "") + num;
}

/* ANIMATE NUMBER CHANGES */
function animateChange(el, newValue, key) {
  const oldValue = previousValues[key];

  if (oldValue !== undefined && oldValue === newValue) {
    el.textContent = newValue;
    return;
  }

  el.textContent = newValue;

  el.classList.remove("updated");

  // re-trigger animation
  void el.offsetWidth;
  el.classList.add("updated");

  previousValues[key] = newValue;
}

/* APPLY CHANGE COLOURS */
function applyChangeClass(el, value) {
  el.classList.remove("pos", "neg", "neutral");

  const num = parseInt(value, 10);

  if (isNaN(num)) el.classList.add("neutral");
  else if (num > 0) el.classList.add("pos");
  else if (num < 0) el.classList.add("neg");
  else el.classList.add("neutral");
}

/* PARSE BBC DATA */
function parseBBC(data) {
  const cards = data?.scoreboard?.groups?.[0]?.scorecards || [];

  const get = (title) => cards.find(c => c.title === title);

  function extract(card) {
    if (!card) return { seats: "--", councils: "--", change: "--" };

    const seats = card.dataColumnsFormatted?.[1]?.[0] ?? "--";
    const change = card.dataColumnsFormatted?.[1]?.[1] ?? "--";
    const councils = card.dataColumnsFormatted?.[0]?.[0] ?? "--";

    return { seats, councils, change };
  }

  return [
    { name: "Reform UK", key: "reform", data: extract(get("Reform UK")) },
    { name: "Conservative", key: "conservative", data: extract(get("Conservative")) },
    { name: "Labour", key: "labour", data: extract(get("Labour")) },
    { name: "Liberal Democrats", key: "libdem", data: extract(get("Liberal Democrat")) },
    { name: "Green", key: "green", data: extract(get("Green")) },
    { name: "Independent", key: "independent", data: extract(get("Independents and others")) }
  ];
}

/* SORT BY SEATS DESCENDING */
function sortDescending(parties) {
  return parties.sort((a, b) => {
    const aSeats = parseInt(a.data.seats, 10) || 0;
    const bSeats = parseInt(b.data.seats, 10) || 0;
    return bSeats - aSeats;
  });
}

/* CREATE CARD */
function createCard(party) {
  const card = document.createElement("section");
  card.className = `card ${party.key}`;

  card.innerHTML = `
    <div class="name">${party.name}</div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Seats</div>
            <div class="value seats"></div>
        </div>

        <div class="metric">
            <div class="label">Councils</div>
            <div class="value councils"></div>
        </div>

        <div class="metric">
            <div class="label">Change</div>
            <div class="value change"></div>
        </div>
    </div>
  `;

  return card;
}

/* RENDER DASHBOARD */
function render(parties) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  parties.forEach(p => {
    const card = createCard(p);

    const seatsEl = card.querySelector(".seats");
    const councilsEl = card.querySelector(".councils");
    const changeEl = card.querySelector(".change");

    const k = p.key;

    animateChange(seatsEl, p.data.seats, k + "_seats");
    animateChange(councilsEl, p.data.councils, k + "_councils");

    const formattedChange = formatChange(p.data.change);
    animateChange(changeEl, formattedChange, k + "_change");
    applyChangeClass(changeEl, p.data.change);

    grid.appendChild(card);
  });
}

/* FETCH DATA */
async function fetchData() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    const json = await res.json();

    let data = parseBBC(json);
    data = sortDescending(data);

    render(data);

  } catch (e) {
    console.error("Fetch error:", e);
  }
}

/* MAIN LOOP */
function update() {
  updateTime();
  fetchData();
}

update();
setInterval(update, 3000);

/* FULLSCREEN */
const fsBtn = document.getElementById("fsBtn");
const icon = fsBtn.querySelector("i");

fsBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    icon.classList.replace("fa-expand", "fa-compress");
  } else {
    await document.exitFullscreen();
    icon.classList.replace("fa-compress", "fa-expand");
  }
});

/* CURSOR HIDE AFTER IDLE */
let idleTimer;

function resetIdleTimer() {
  document.body.style.cursor = "default";
  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    document.body.style.cursor = "none";
  }, 3000);
}

window.addEventListener("mousemove", resetIdleTimer);
window.addEventListener("keydown", resetIdleTimer);
window.addEventListener("mousedown", resetIdleTimer);

resetIdleTimer();