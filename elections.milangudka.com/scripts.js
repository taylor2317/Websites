const DATA_URL =
"https://static.files.bbci.co.uk/elections/data/news/election/2026/england/results";

/* STATE */
const previousValues = {};
const previousSnapshot = {};
const updates = [];
const MAX_UPDATES = 200;

/* TIME */
function updateTime() {
  const now = new Date();

  document.getElementById("time").textContent =
    now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

/* ANIMATION */
function animateChange(el, newValue, key) {
  const oldValue = previousValues[key];

  el.textContent = newValue;

  if (oldValue === undefined || oldValue === newValue) {
    previousValues[key] = newValue;
    return;
  }

  el.classList.remove("updated");
  void el.offsetWidth;
  el.classList.add("updated");

  previousValues[key] = newValue;
}

/* FORMAT CHANGE */
function formatChange(value) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return { text: "--", type: "neutral" };

  if (num > 0) return { text: `+${num}`, type: "pos" };
  if (num < 0) return { text: `${num}`, type: "neg" };

  return { text: "0", type: "neutral" };
}

/* RECENT UPDATES */
function addUpdate(party, currentSeats, key) {
  const now = Date.now();

  const curr = parseInt(currentSeats, 10);
  if (isNaN(curr)) return;

  const prev = previousSnapshot[party];

  if (prev === undefined) {
    previousSnapshot[party] = curr;
    return;
  }

  const delta = curr - prev;
  if (delta === 0) return;

  updates.unshift({
    time: now,
    displayTime: new Date(now).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    party,
    delta,
    key
  });

  if (updates.length > MAX_UPDATES) updates.pop();

  previousSnapshot[party] = curr;

  renderUpdates();
}

/* RENDER UPDATES */
function renderUpdates() {
  const list = document.getElementById("updatesList");
  if (!list) return;

  const cutoff = Date.now() - 5 * 60 * 1000;

  list.innerHTML = "";

  updates
    .filter(u => u.time >= cutoff)
    .reverse()
    .forEach(u => {
      const div = document.createElement("div");

      const sign = u.delta > 0 ? "+" : "";
      div.className = `update-item ${u.key}`;

      div.innerHTML = `
        <span>${u.displayTime}</span>
        <span>${u.party}: ${sign}${u.delta}</span>
      `;

      list.appendChild(div);
    });
}

/* PARSE */
function parseBBC(data) {
  const cards = data?.scoreboard?.groups?.[0]?.scorecards || [];

  const get = (title) => cards.find(c => c.title === title);

  function extract(card) {
    if (!card) return { seats: "--", councils: "--", change: "--" };

    return {
      seats: card.dataColumnsFormatted?.[1]?.[0] ?? "--",
      councils: card.dataColumnsFormatted?.[0]?.[0] ?? "--",
      change: card.dataColumnsFormatted?.[1]?.[1] ?? "--"
    };
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
function sortDescending(data) {
  return data.sort((a, b) =>
    (parseInt(b.data.seats, 10) || 0) - (parseInt(a.data.seats, 10) || 0)
  );
}

/* CARD */
function createCard(p) {
  const card = document.createElement("section");
  card.className = `card ${p.key}`;

  const change = formatChange(p.data.change);

  card.innerHTML = `
    <div class="name">${p.name}</div>

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
        <div class="value change ${change.type}"></div>
      </div>
    </div>
  `;

  const seatsEl = card.querySelector(".seats");
  const councilsEl = card.querySelector(".councils");
  const changeEl = card.querySelector(".change");

  animateChange(seatsEl, p.data.seats, p.key + "_seats");
  animateChange(councilsEl, p.data.councils, p.key + "_councils");
  animateChange(changeEl, change.text, p.key + "_change");

  addUpdate(p.name, p.data.seats, p.key);

  return card;
}

/* RENDER */
function render(data) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  data.forEach(p => grid.appendChild(createCard(p)));
}

/* FETCH LOOP */
async function fetchData() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    const json = await res.json();

    let data = parseBBC(json);
    data = sortDescending(data);

    render(data);
  } catch (e) {
    console.error(e);
  }
}

function tick() {
  updateTime();
  fetchData();
}

tick();
setInterval(tick, 3000);

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