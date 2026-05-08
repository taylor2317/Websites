const DATA_URL =
"https://static.files.bbci.co.uk/elections/data/news/election/2026/england/results";

/* TIME */
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString("en-GB");
}

/* FORMAT */
function formatChange(value) {
  if (value === null || value === undefined) return "--";
  const num = parseInt(value, 10);
  if (isNaN(num)) return "--";
  return (num > 0 ? "+" : "") + num;
}

/* PARSE BBC */
function parseBBC(data) {
  const cards = data?.scoreboard?.groups?.[0]?.scorecards || [];

  const get = (title) => cards.find(c => c.title === title);

  function extract(card) {
    if (!card) return { seats: "--", councils: "--", change: "--" };

    const seats = card.dataColumnsFormatted?.[1]?.[0] ?? "--";
    const change = card.dataColumnsFormatted?.[1]?.[1] ?? "--";

    // councils not clearly defined in source → fallback safe attempt
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

/* SORT */
function sortDescending(parties) {
  return parties.sort((a, b) => {
    const aSeats = parseInt(a.data.seats, 10) || 0;
    const bSeats = parseInt(b.data.seats, 10) || 0;
    return bSeats - aSeats;
  });
}

/* CARD */
function createCard(party) {
  const card = document.createElement("section");
  card.className = `card ${party.key}`;

  card.innerHTML = `
    <div class="name">${party.name}</div>

    <div class="metrics">
        <div class="metric">
            <div class="label">Seats</div>
            <div class="value">${party.data.seats}</div>
        </div>

        <div class="metric">
            <div class="label">Councils</div>
            <div class="value">${party.data.councils}</div>
        </div>

        <div class="metric">
            <div class="label">Change</div>
            <div class="value change">${formatChange(party.data.change)}</div>
        </div>
    </div>
  `;

  const changeEl = card.querySelector(".change");
  const num = parseInt(party.data.change, 10);

  changeEl.classList.remove("pos", "neg", "neutral");
  if (isNaN(num)) changeEl.classList.add("neutral");
  else if (num > 0) changeEl.classList.add("pos");
  else if (num < 0) changeEl.classList.add("neg");
  else changeEl.classList.add("neutral");

  return card;
}

/* RENDER */
function render(parties) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  parties.forEach(p => {
    grid.appendChild(createCard(p));
  });
}

/* FETCH */
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

/* LOOP */
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

/* CURSOR HIDE */
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