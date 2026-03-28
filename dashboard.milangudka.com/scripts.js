/* CLOCK */
function formatFullDate(date) {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function updateClock() {
    const now = new Date();
    document.getElementById('time').textContent =
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date').textContent = formatFullDate(now);
}
setInterval(updateClock, 1000);
updateClock();

/* WEATHER */
async function getWeather() {
    try {
        const res = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=50.82&longitude=-0.14&current_weather=true'
        );
        const data = await res.json();
        const w = data.current_weather;

        document.getElementById('temp').textContent = w.temperature + '°C';

        const iconEl = document.getElementById('icon');
        if (w.weathercode === 0) iconEl.textContent = '☀️';
        else if (w.weathercode < 4) iconEl.textContent = '⛅';
        else if (w.weathercode < 60) iconEl.textContent = '☁️';
        else iconEl.textContent = '🌧️';
    } catch (e) {
        console.error(e);
    }
}
getWeather();

/* NOTES */
function loadNotes() {
    const box = document.getElementById("notes-box");
    box.value = localStorage.getItem("notesContent") || "";
    box.addEventListener("input", () => {
        localStorage.setItem("notesContent", box.value);
    });
}
loadNotes();

/* NEWS */
const NEWS_MASTER = [
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/rss.xml", color: "#bb1919" },
    { name: "NY Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", color: "#000000" },
    { name: "MSN", url: "https://www.msn.com/en-us/feed", color: "#0078d4" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss", color: "#cc0000" },
    { name: "Guardian", url: "https://www.theguardian.com/world/rss", color: "#005689" },
    { name: "Google News", url: "https://news.google.com/rss", color: "#34a853" },
    { name: "Fox News", url: "http://feeds.foxnews.com/foxnews/latest", color: "#003366" },
    { name: "Daily Mail", url: "https://www.dailymail.co.uk/news/index.rss", color: "#004db3" },
    { name: "Telegraph", url: "https://www.telegraph.co.uk/news/rss.xml", color: "#1a1a1a" }
];

function getNewsSources() {
    const saved = JSON.parse(localStorage.getItem("newsSources") || "null");
    if (!saved) return NEWS_MASTER.map(s => ({ ...s, enabled: true }));
    return NEWS_MASTER.map(src => {
        const match = saved.find(s => s.url === src.url);
        return {
            ...src,
            enabled: match?.enabled ?? true,
            color: match?.color ?? src.color
        };
    });
}

function saveNewsSources(list) {
    localStorage.setItem("newsSources", JSON.stringify(list));
}

async function fetchRSS(url) {
    const api = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url);
    try {
        const res = await fetch(api);
        const data = await res.json();
        if (!data.items) return [];
        return data.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            source: url
        }));
    } catch {
        return [];
    }
}

async function loadNews() {
    const container = document.getElementById("news-articles");
    const sources = getNewsSources().filter(s => s.enabled);

    if (sources.length === 0) {
        container.innerHTML = "No news sources selected";
        return;
    }

    container.innerHTML = "Loading…";

    try {
        const results = await Promise.all(sources.map(src => fetchRSS(src.url)));
        const all = results.flat().slice(0, 20);
        container.innerHTML = "";

        all.forEach(item => {
            const src = getNewsSources().find(s => s.url === item.source);
            const color = src?.color || "#ffffff";

            const div = document.createElement("div");
            div.className = "news-item";
            div.style.borderLeft = `4px solid ${color}`;
            div.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
            container.appendChild(div);
        });

        if (all.length === 0) container.innerHTML = "No articles available";
    } catch (e) {
        console.error(e);
        container.innerHTML = "Failed to load news";
    }
}
loadNews();

document.getElementById("news-settings-btn").addEventListener("click", () => {
    const view = document.getElementById("news-view");
    const settings = document.getElementById("news-settings");

    const showing = settings.style.display === "block";
    settings.style.display = showing ? "none" : "block";
    view.style.display = showing ? "block" : "none";

    if (!showing) renderNewsSources();
});

function renderNewsSources() {
    const list = document.getElementById("news-source-list");
    const sources = getNewsSources();
    list.innerHTML = "";

    sources.forEach((src, index) => {
        const div = document.createElement("div");
        div.className = "calendar-item";
        div.innerHTML = `
            <label>
                <input type="checkbox" data-index="${index}" ${src.enabled ? "checked" : ""}>
                ${src.name}
            </label>
            <input type="color" value="${src.color}" data-color-index="${index}">
        `;
        list.appendChild(div);
    });

    list.querySelectorAll("input[type=checkbox]").forEach(box => {
        box.addEventListener("change", () => {
            const sources = getNewsSources();
            sources[box.dataset.index].enabled = box.checked;
            saveNewsSources(sources);
            loadNews();
        });
    });

    list.querySelectorAll("input[type=color]").forEach(picker => {
        picker.addEventListener("input", () => {
            const sources = getNewsSources();
            sources[picker.dataset.colorIndex].color = picker.value;
            saveNewsSources(sources);
            loadNews();
        });
    });
}

/* CALENDAR */
function getSavedCalendars() {
    return JSON.parse(localStorage.getItem("uploadedCalendars") || "[]");
}

function saveCalendars(list) {
    localStorage.setItem("uploadedCalendars", JSON.stringify(list));
}

function parseICS(text) {
    const events = [];
    const lines = text.split(/\r?\n/);
    let current = null;

    for (let line of lines) {
        if (line.startsWith("BEGIN:VEVENT")) current = {};
        else if (line.startsWith("END:VEVENT")) {
            if (current.start) events.push(current);
            current = null;
        } else if (current) {
            if (line.startsWith("SUMMARY:"))
                current.summary = line.replace("SUMMARY:", "").trim();
            if (line.startsWith("DTSTART")) {
                const dt = line.split(":")[1].trim();
                current.start = parseICSTime(dt);
            }
        }
    }
    return events;
}

function parseICSTime(dt) {
    return new Date(
        `${dt.slice(0,4)}-${dt.slice(4,6)}-${dt.slice(6,8)}T${dt.slice(9,11)}:${dt.slice(11,13)}:00`
    );
}

function groupEvents(events) {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    const groups = { today: [], tomorrow: [], week: [] };

    events.forEach(ev => {
        const d = ev.start;
        if (d.toDateString() === today.toDateString()) groups.today.push(ev);
        else if (d.toDateString() === tomorrow.toDateString()) groups.tomorrow.push(ev);
        else if (d <= endOfWeek) groups.week.push(ev);
    });

    return groups;
}

async function loadCalendar() {
    const container = document.getElementById("events");
    const calendars = getSavedCalendars();

    if (calendars.length === 0) {
        container.innerHTML = "No calendars added";
        return;
    }

    let allEvents = [];

    for (const cal of calendars) {
        const events = parseICS(cal.data).map(ev => ({
            ...ev,
            color: cal.color || "#4da3ff"
        }));
        allEvents = allEvents.concat(events);
    }

    const upcoming = allEvents
        .filter(ev => ev.start >= new Date())
        .sort((a, b) => a.start - b.start)
        .slice(0, 50);

    const groups = groupEvents(upcoming);

    container.innerHTML = "";

    function renderGroup(title, list) {
        if (list.length === 0) return;

        const header = document.createElement("h4");
        header.textContent = title;
        container.appendChild(header);

        list.forEach(ev => {
            const div = document.createElement("div");
            div.className = "event";
            div.style.borderLeft = `4px solid ${ev.color}`;
            div.style.paddingLeft = `10px`;
            div.innerHTML = `<strong>${ev.summary}</strong><br>${ev.start.toLocaleString()}`;
            container.appendChild(div);
        });
    }

    renderGroup("Today", groups.today);
    renderGroup("Tomorrow", groups.tomorrow);
    renderGroup("This Week", groups.week);

    if (!groups.today.length && !groups.tomorrow.length && !groups.week.length)
        container.textContent = "No upcoming events";
}
loadCalendar();

document.getElementById("calendar-settings-btn").addEventListener("click", () => {
    const view = document.getElementById("calendar-view");
    const settings = document.getElementById("calendar-settings");

    const showing = settings.style.display === "block";
    settings.style.display = showing ? "none" : "block";
    view.style.display = showing ? "block" : "none";

    if (!showing) renderCalendarList();
});

function renderCalendarList() {
    const list = document.getElementById("calendar-list");
    const calendars = getSavedCalendars();
    list.innerHTML = "";

    calendars.forEach((cal, index) => {
        const div = document.createElement("div");
        div.className = "calendar-item";
        div.innerHTML = `
            <span>${cal.name || "Calendar " + (index + 1)}</span>
            <input type="color" value="${cal.color || "#4da3ff"}" data-index="${index}" class="cal-color">
            <button class="cal-delete" data-del="${index}">❌</button>
        `;
        list.appendChild(div);
    });

    list.querySelectorAll(".cal-color").forEach(picker => {
        picker.addEventListener("input", () => {
            const calendars = getSavedCalendars();
            calendars[picker.dataset.index].color = picker.value;
            saveCalendars(calendars);
            loadCalendar();
        });
    });

    list.querySelectorAll(".cal-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const calendars = getSavedCalendars();
            calendars.splice(btn.dataset.del, 1);
            saveCalendars(calendars);
            renderCalendarList();
            loadCalendar();
        });
    });
}

/* DRAG & DROP */
let dragged = null;

function enableDrag() {
    const tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        tile.draggable = true;

        tile.addEventListener('dragstart', () => {
            dragged = tile;
            tile.classList.add('dragging');
        });

        tile.addEventListener('dragend', () => {
            tile.classList.remove('dragging');
            dragged = null;
            saveOrder();
        });

        tile.addEventListener('dragover', e => {
            e.preventDefault();
            const grid = document.getElementById('grid');
            const after = getDragAfterElement(grid, e.clientY);

            if (after == null) grid.appendChild(dragged);
            else grid.insertBefore(dragged, after);
        });
    });
}

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.tile:not(.dragging)')];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveOrder() {
    const ids = [...document.querySelectorAll('.tile')].map(t => t.dataset.id);
    localStorage.setItem('tileOrder', JSON.stringify(ids));
}

function restoreOrder() {
    const saved = JSON.parse(localStorage.getItem('tileOrder') || "null");
    if (!saved) return;

    const grid = document.getElementById('grid');
    saved.forEach(id => {
        const tile = document.querySelector(`.tile[data-id="${id}"]`);
        if (tile) grid.appendChild(tile);
    });
}

/* TILE BACKGROUNDS */
const TILE_PALETTE = [
    "#2E3A5C","#364A6D","#3F5A7F","#476A91","#2E4F5C","#36606D",
    "#3F7280","#478391","#2E5C5A","#366D6A","#3F807A","#47918A",
    "#2E4A5C","#365C6D","#3F6F80","#478191","#2E3F5C","#36506D",
    "#3F6280","#477491"
];

function randomTileColor() {
    return TILE_PALETTE[Math.floor(Math.random() * TILE_PALETTE.length)];
}

function applyRandomTileBackgrounds() {
    const tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        const id = tile.dataset.id;
        let color = localStorage.getItem("tileColor_" + id);
        if (!color) {
            color = randomTileColor();
            localStorage.setItem("tileColor_" + id, color);
        }

        tile.style.background = color + "CC";
        tile.style.border = "1px solid rgba(255,255,255,0.15)";
        tile.style.boxShadow = `
            0 4px 12px rgba(0,0,0,0.25),
            inset 0 0 20px rgba(255,255,255,0.05)
        `;
    });
}

/* CALCULATOR LOGIC */
let calcCurrent = "";
let calcStored = null;
let calcOperator = null;
let enteringNewOperand = false;

const calcDisplay = document.getElementById("calc-display");

/* Format numbers with commas */
function formatNumber(n) {
    if (n === "" || n === null || n === undefined) return "";
    const [int, dec] = n.toString().split(".");
    const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec ? `${formatted}.${dec}` : formatted;
}

/* Update display (empty = placeholder shows) */
function updateCalcDisplay() {
    if (calcCurrent !== "") {
        calcDisplay.value = formatNumber(calcCurrent);
    } else if (calcStored !== null) {
        calcDisplay.value = formatNumber(calcStored);
    } else {
        calcDisplay.value = ""; // placeholder "0" shows
    }
}

/* Apply pending operation */
function applyOperation() {
    if (calcStored === null) {
        calcStored = calcCurrent || "0";
    } else if (calcCurrent !== "") {
        calcStored = String(eval(`${calcStored} ${calcOperator} ${calcCurrent}`));
    }
}

/* ------------------------------
   BUTTON INPUT
------------------------------ */
document.querySelectorAll("[data-val]").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.dataset.val;

        if (enteringNewOperand) {
            calcCurrent = "";
            enteringNewOperand = false;
        }

        if (val === "." && calcCurrent.includes(".")) return;

        calcCurrent += val;
        updateCalcDisplay();
    });
});

/* ------------------------------
   BUTTON OPERATORS
------------------------------ */
document.querySelectorAll("[data-op]").forEach(btn => {
    btn.addEventListener("click", () => {
        if (calcCurrent === "" && calcStored === null) return;

        applyOperation();
        calcOperator = btn.dataset.op;
        calcCurrent = "";
        enteringNewOperand = true;
        updateCalcDisplay();
    });
});

/* ------------------------------
   EQUALS BUTTON
------------------------------ */
document.getElementById("calc-equals").addEventListener("click", () => {
    if (calcStored !== null && calcOperator && (calcCurrent !== "" || !enteringNewOperand)) {
        applyOperation();
        calcCurrent = "";
        calcOperator = null;
        enteringNewOperand = true;
        updateCalcDisplay();
    }
});

/* ------------------------------
   CLEAR BUTTON
------------------------------ */
document.getElementById("calc-clear").addEventListener("click", () => {
    calcCurrent = "";
    calcStored = null;
    calcOperator = null;
    enteringNewOperand = false;
    updateCalcDisplay();
});

/* ------------------------------
   TYPING INTO THE INPUT
------------------------------ */
calcDisplay.addEventListener("input", e => {
    let raw = e.target.value.replace(/,/g, "");

    if (enteringNewOperand) {
        raw = raw.slice(-1); // only the new char
        enteringNewOperand = false;
    }

    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
        calcCurrent = raw;
    }

    updateCalcDisplay();
});

/* ------------------------------
   KEYBOARD SUPPORT
------------------------------ */
document.addEventListener("keydown", e => {
    if (document.activeElement !== calcDisplay) return;

    const key = e.key;

    /* Operators */
    if (["+", "-", "*", "/"].includes(key)) {
        e.preventDefault();
        if (calcCurrent === "" && calcStored === null) return;

        applyOperation();
        calcOperator = key;
        calcCurrent = "";
        enteringNewOperand = true;
        updateCalcDisplay();
    }

    /* Enter = equals */
    if (key === "Enter") {
        e.preventDefault();
        if (calcStored !== null && calcOperator && (calcCurrent !== "" || !enteringNewOperand)) {
            applyOperation();
            calcCurrent = "";
            calcOperator = null;
            enteringNewOperand = true;
            updateCalcDisplay();
        }
    }

    /* Escape = clear */
    if (key === "Escape") {
        calcCurrent = "";
        calcStored = null;
        calcOperator = null;
        enteringNewOperand = false;
        updateCalcDisplay();
    }
});

/* INIT */
restoreOrder();
enableDrag();
applyRandomTileBackgrounds();