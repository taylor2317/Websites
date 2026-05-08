const DATA_URL =
"https://static.files.bbci.co.uk/elections/data/news/election/2026/england/results";

/* STATE */
const previousValues = {};
const previousSnapshot = {};
let updates = [];

const KEEP_MS = 2 * 60 * 1000;

/* NUMBER PARSER */
function toNumber(value) {
  return parseInt(String(value).replace(/,/g, ""), 10) || 0;
}

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

/* CARD ANIMATION */
function animateChange(el, value, key) {
  const old = previousValues[key];

  el.textContent = value;

  if (old !== undefined && old !== value) {
    el.classList.remove("updated");
    void el.offsetWidth;
    el.classList.add("updated");
  }

  previousValues[key] = value;
}

/* FORMAT CHANGE */
function formatChange(v) {
  const n = toNumber(v);

  if (isNaN(n)) return { text: "--", type: "neutral" };
  if (n > 0) return { text: `+${n}`, type: "pos" };
  if (n < 0) return { text: `${n}`, type: "neg" };
  return { text: "0", type: "neutral" };
}

/* UPDATE TRACKING */
function addUpdate(party, seats, key) {
  const now = Date.now();
  const curr = toNumber(seats);

  const prev = previousSnapshot[party];

  if (prev === undefined) {
    previousSnapshot[party] = curr;
    return;
  }

  const delta = curr - prev;

  if (delta === 0) return;

  updates.push({
    id: now + Math.random(),
    time: now,
    displayTime: new Date(now).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    party,
    delta,
    key
  });

  previousSnapshot[party] = curr;

  renderUpdates();
}

/* CLEAN OLD ENTRIES */
function cleanupUpdates() {
  const now = Date.now();

  updates = updates.filter(u => now - u.time < KEEP_MS + 4000);

  updates.forEach(u => {
    if (!u.el) return;

    if (now - u.time > KEEP_MS && !u.fading) {
      u.fading = true;
      u.el.classList.add("removing");

      setTimeout(() => {
        updates = updates.filter(x => x.id !== u.id);
        renderUpdates();
      }, 400);
    }
  });
}

/* RENDER UPDATES */
function renderUpdates() {
  const list = document.getElementById("updatesList");
  if (!list) return;

  list.innerHTML = "";

  updates
    .slice()
    .reverse()
    .forEach(u => {
      const div = document.createElement("div");

      div.className = `update-item ${u.key}`;

      const sign = u.delta > 0 ? "+" : "";

      div.innerHTML = `
        <span class="rt-time">${u.displayTime}</span>
        <span class="rt-party">${u.party}</span>
        <span class="rt-sep">:</span>
        <span class="rt-delta">${sign}${u.delta}</span>
      `;

      u.el = div;

      list.appendChild(div);
    });
}

/* BBC PARSE */
function parseBBC(data) {
  const cards = data?.scoreboard?.groups?.[0]?.scorecards || [];

  const get = t => cards.find(c => c.title === t);

  const extract = c => ({
    seats: c?.dataColumnsFormatted?.[1]?.[0] ?? "--",
    change: c?.dataColumnsFormatted?.[1]?.[1] ?? "--"
  });

  return [
    {
      name:"Reform UK",
      key:"reform",
      data:extract(get("Reform UK"))
    },

    {
      name:"Conservative",
      key:"conservative",
      data:extract(get("Conservative"))
    },

    {
      name:"Labour",
      key:"labour",
      data:extract(get("Labour"))
    },

    {
      name:"Liberal Democrats",
      key:"libdem",
      data:extract(get("Liberal Democrat"))
    },

    {
      name:"Green",
      key:"green",
      data:extract(get("Green"))
    },

    {
      name:"Independent",
      key:"independent",
      data:extract(get("Independents and others"))
    }
  ];
}

/* SORT */
function sortDescending(data) {
  return data.sort(
    (a, b) =>
      toNumber(b.data.seats) -
      toNumber(a.data.seats)
  );
}

/* CURSOR HIDE */
let idleTimer;

function resetCursor() {
  document.body.style.cursor = "default";

  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    document.body.style.cursor = "none";
  }, 3000);
}

["mousemove","mousedown","keydown","touchstart","scroll"]
  .forEach(e =>
    window.addEventListener(e, resetCursor, { passive:true })
  );

resetCursor();

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
        <div class="label">Change</div>
        <div class="value change ${change.type}"></div>
      </div>

    </div>
  `;

  animateChange(
    card.querySelector(".seats"),
    p.data.seats,
    p.key + "_s"
  );

  animateChange(
    card.querySelector(".change"),
    change.text,
    p.key + "_c"
  );

  addUpdate(p.name, p.data.seats, p.key);

  return card;
}

/* RENDER GRID */
function render(data) {
  const grid = document.getElementById("grid");

  grid.innerHTML = "";

  data.forEach(p => grid.appendChild(createCard(p)));
}

/* FETCH */
async function fetchData() {
  try {
    const res = await fetch(DATA_URL, {
      cache:"no-store"
    });

    const json = await res.json();

    let data = parseBBC(json);

    data = sortDescending(data);

    render(data);

  } catch (e) {
    console.error(e);
  }
}

/* LOOP */
function tick() {
  updateTime();
  fetchData();
  cleanupUpdates();
}

tick();

setInterval(tick, 3000);

/* FULLSCREEN */
const fsBtn = document.getElementById("fsBtn");

fsBtn.addEventListener("click", () => {
  const doc = document.documentElement;

  if (!document.fullscreenElement) {
    doc.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});