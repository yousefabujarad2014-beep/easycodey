/* EasyCodey — interactieve app-previews.
   Elk project krijgt een schone "app"-weergave die past bij wat het project is.
   De previews zijn kleine, offline demo's: geen Python nodig, geen externe libraries.
   De echte code blijft gewoon in de pagina staan (alleen visueel verborgen in de app-stand). */

import { IDEAS, CATEGORY_META } from "../data/index.js";

/* ------------------------------ kleine DOM-helper ------------------------------ */

function h(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs && attrs.nodeType) {
    children.unshift(attrs);
    attrs = {};
  }
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = String(value);
    else if (key === "html") node.innerHTML = value;
    else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

const rnd = (max) => Math.floor(Math.random() * max);
const pick = (list) => list[rnd(list.length)];

function btn(label, onclick, variant = "") {
  return h("button", { class: `pv-btn ${variant}`.trim(), type: "button", onclick }, label);
}

function chip(text, cls = "") {
  return h("span", { class: `pv-chip ${cls}`.trim() }, text);
}

function kv(label, value) {
  return h("div", { class: "pv-kv" }, h("span", { text: label }), h("strong", { text: value }));
}

function field(label, control) {
  return h("label", { class: "pv-field" }, h("span", { text: label }), control);
}

function input(props = {}) {
  return h("input", { class: "pv-input", ...props });
}

function textarea(props = {}) {
  return h("textarea", { class: "pv-input pv-textarea", ...props });
}

function select(options, props = {}) {
  return h(
    "select",
    { class: "pv-input", ...props },
    options.map((item) => h("option", { value: item.value ?? item, text: item.label ?? item }))
  );
}

function canvas(w, hgt, cls = "") {
  return h("canvas", { class: `pv-canvas ${cls}`.trim(), width: w, height: hgt });
}

function ctx2d(el) {
  return el.getContext("2d");
}

function loopWhile(el, fn) {
  let raf = 0;
  const tick = (time) => {
    if (!el.isConnected) return;
    fn(time);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

const THEME_LABELS = {
  game: "Spel",
  gui: "App",
  web: "Website",
  data: "Data",
  tool: "Tool",
  auto: "Automatisch",
  security: "Security",
  science: "Simulatie",
  art: "Creatief",
  school: "Oefenen",
  neutral: "Demo"
};

function frame(idea, { theme = "neutral", label, body = [], footer, className = "" } = {}) {
  return h(
    "div",
    { class: `pv pv--${theme} ${className}`.trim(), "data-pv-theme": theme },
    h(
      "div",
      { class: "pv-top" },
      h("span", { class: "pv-dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
      h(
        "span",
        { class: "pv-appname" },
        h("span", { class: "pv-appemoji", "aria-hidden": "true", text: idea.emoji || "✦" }),
        h("span", { class: "pv-apptitle", text: idea.title })
      ),
      h("span", { class: "pv-tag", text: label || THEME_LABELS[theme] || "Demo" })
    ),
    h("div", { class: "pv-main" }, ...[body].flat()),
    footer ? h("div", { class: "pv-footer" }, ...[footer].flat()) : null
  );
}

/* ------------------------------ Snake ------------------------------ */

function snakePreview(idea) {
  const N = 16;
  const CELL = 20;
  const W = N * CELL;
  const c = canvas(W, W, "pv-snake");
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar?" });
  const aiIdea = idea.id === "snake-ai";
  let aiOn = aiIdea;
  let snake = [];
  let dir = { x: 1, y: 0 };
  let queue = [];
  let food = { x: 10, y: 8 };
  let score = 0;
  let alive = true;
  let started = false;
  let timer = null;

  function placeFood() {
    let guard = 0;
    do {
      food = { x: rnd(N), y: rnd(N) };
      guard += 1;
    } while (guard < 500 && snake.some((s) => s.x === food.x && s.y === food.y));
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, W);
    g.strokeStyle = "rgba(126, 226, 184, 0.08)";
    g.lineWidth = 1;
    for (let i = 1; i < N; i += 1) {
      g.beginPath();
      g.moveTo(i * CELL + 0.5, 0);
      g.lineTo(i * CELL + 0.5, W);
      g.stroke();
      g.beginPath();
      g.moveTo(0, i * CELL + 0.5);
      g.lineTo(W, i * CELL + 0.5);
      g.stroke();
    }
    g.fillStyle = "#ff8a6b";
    g.beginPath();
    g.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.31, 0, Math.PI * 2);
    g.fill();
    snake.forEach((part, index) => {
      const pad = index === 0 ? 1.5 : 2.5;
      g.fillStyle = index === 0 ? "#e8c47c" : `rgba(126, 226, 184, ${0.95 - index * 0.018})`;
      g.beginPath();
      g.roundRect(part.x * CELL + pad, part.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 5);
      g.fill();
    });
    if (!alive) {
      g.fillStyle = "rgba(8, 14, 12, 0.72)";
      g.fillRect(0, 0, W, W);
      g.fillStyle = "#f6f0e3";
      g.font = "600 22px 'Plus Jakarta Sans', sans-serif";
      g.textAlign = "center";
      g.fillText("Game over", W / 2, W / 2 - 6);
      g.font = "500 14px 'Plus Jakarta Sans', sans-serif";
      g.fillStyle = "#b9c9c2";
      g.fillText(`Score: ${score}`, W / 2, W / 2 + 20);
    }
  }

  function aiDirection() {
    const head = snake[0];
    const options = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ].filter((d) => {
      if (d.x === -dir.x && d.y === -dir.y) return false;
      const nx = head.x + d.x;
      const ny = head.y + d.y;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) return false;
      return !snake.some((s, i) => i < snake.length - 1 && s.x === nx && s.y === ny);
    });
    options.sort(
      (a, b) =>
        Math.abs(head.x + a.x - food.x) +
        Math.abs(head.y + a.y - food.y) -
        (Math.abs(head.x + b.x - food.x) + Math.abs(head.y + b.y - food.y))
    );
    return options[0] || dir;
  }

  function step() {
    if (!c.isConnected) {
      clearInterval(timer);
      timer = null;
      return;
    }
    if (!alive) return;
    if (queue.length) dir = queue.shift();
    if (aiOn) dir = aiDirection();
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hitsWall = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N;
    const hitsSelf = snake.some(
      (part, index) => index < snake.length - 1 && part.x === head.x && part.y === head.y
    );
    if (hitsWall || hitsSelf) {
      alive = false;
      started = false;
      clearInterval(timer);
      timer = null;
      stateEl.textContent = "Game over";
      draw();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = String(score);
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function start() {
    if (!alive) reset();
    if (started) {
      clearInterval(timer);
      timer = null;
      started = false;
      stateEl.textContent = "Pauze";
      return;
    }
    started = true;
    stateEl.textContent = aiOn ? "AI speelt" : "Bezig…";
    if (!timer) timer = setInterval(step, 128);
  }

  function turn(x, y) {
    const last = queue.length ? queue[queue.length - 1] : dir;
    if (last.x === -x && last.y === -y) return;
    if (last.x === x && last.y === y) return;
    if (queue.length < 3) queue.push({ x, y });
  }

  function reset() {
    snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 }
    ];
    dir = { x: 1, y: 0 };
    queue = [];
    score = 0;
    alive = true;
    started = false;
    clearInterval(timer);
    timer = null;
    scoreEl.textContent = "0";
    stateEl.textContent = aiOn ? "Druk op Start" : "Druk op Start";
    placeFood();
    draw();
  }

  c.addEventListener("keydown", (event) => {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(key)) {
      event.preventDefault();
    }
    if (key === "ArrowUp" || key === "w" || key === "W") turn(0, -1);
    else if (key === "ArrowDown" || key === "s" || key === "S") turn(0, 1);
    else if (key === "ArrowLeft" || key === "a" || key === "A") turn(-1, 0);
    else if (key === "ArrowRight" || key === "d" || key === "D") turn(1, 0);
    else if (key === " " || key === "Enter") start();
    if (!started && alive) start();
  });
  c.addEventListener("pointerdown", () => c.focus());

  const dpad = h(
    "div",
    { class: "pv-dpad", "aria-label": "Besturing" },
    h("button", { class: "pv-dpad-btn pv-up", type: "button", "aria-label": "Omhoog", onclick: () => { turn(0, -1); if (!started && alive) start(); } }, "▲"),
    h("button", { class: "pv-dpad-btn pv-left", type: "button", "aria-label": "Links", onclick: () => { turn(-1, 0); if (!started && alive) start(); } }, "◀"),
    h("button", { class: "pv-dpad-btn pv-down", type: "button", "aria-label": "Omlaag", onclick: () => { turn(0, 1); if (!started && alive) start(); } }, "▼"),
    h("button", { class: "pv-dpad-btn pv-right", type: "button", "aria-label": "Rechts", onclick: () => { turn(1, 0); if (!started && alive) start(); } }, "▶")
  );

  const controls = [
    h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), stateEl),
    h("div", { class: "pv-canvas-wrap" }, c),
    h(
      "div",
      { class: "pv-snake-controls" },
      dpad,
      h(
        "div",
        { class: "pv-col" },
        btn("▶ Start / pauze", start, "pv-btn-primary"),
        aiIdea ? btn(aiOn ? "🤖 AI aan" : "🧠 AI uit", () => { aiOn = !aiOn; stateEl.textContent = aiOn ? "AI speelt" : "Jij speelt"; }, "pv-btn-ghost") : null,
        btn("↻ Opnieuw", reset, "pv-btn-ghost")
      )
    ),
    h("p", { class: "pv-hint", text: "Pijltjes, WASD of de knoppen. Eet de oranje bolletjes." })
  ].filter(Boolean);

  const root = frame(idea, { theme: "game", label: "Speelbaar", body: controls });
  reset();
  return root;
}

/* ------------------------------ Pong ------------------------------ */

function pongPreview(idea) {
  const W = 480;
  const H = 300;
  const c = canvas(W, H, "pv-pong");
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0 – 0" });
  const stateEl = h("span", { class: "pv-state", text: "Klik op Start" });
  let playerY = H / 2 - 34;
  let aiY = H / 2 - 34;
  let ball = { x: W / 2, y: H / 2, vx: 4.4, vy: 2.6, r: 6 };
  let score = [0, 0];
  let running = false;
  let keys = { up: false, down: false };
  const paddleH = 68;
  const paddleW = 9;

  function resetBall(direction = 1) {
    ball = { x: W / 2, y: H / 2, vx: 4.4 * direction, vy: (Math.random() * 2.4 + 1.5) * (Math.random() > 0.5 ? 1 : -1), r: 6 };
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(126, 226, 184, 0.18)";
    g.setLineDash([7, 12]);
    g.beginPath();
    g.moveTo(W / 2, 0);
    g.lineTo(W / 2, H);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#e8c47c";
    g.fillRect(16, playerY, paddleW, paddleH);
    g.fillStyle = "#7ee2b8";
    g.fillRect(W - 16 - paddleW, aiY, paddleW, paddleH);
    g.fillStyle = "#f6f0e3";
    g.beginPath();
    g.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    g.fill();
  }

  function update() {
    if (!c.isConnected) return;
    if (keys.up) playerY -= 6;
    if (keys.down) playerY += 6;
    playerY = Math.max(0, Math.min(H - paddleH, playerY));
    const target = ball.y - paddleH / 2;
    aiY += Math.max(-4.1, Math.min(4.1, target - aiY));
    aiY = Math.max(0, Math.min(H - paddleH, aiY));
    if (!running) {
      draw();
      return;
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.y - ball.r < 0 || ball.y + ball.r > H) {
      ball.vy *= -1;
      ball.y = Math.max(ball.r, Math.min(H - ball.r, ball.y));
    }
    if (ball.vx < 0 && ball.x - ball.r < 16 + paddleW && ball.y > playerY && ball.y < playerY + paddleH) {
      ball.vx = Math.abs(ball.vx) * 1.04;
      ball.vy += ((ball.y - (playerY + paddleH / 2)) / paddleH) * 3;
      ball.x = 16 + paddleW + ball.r;
    }
    if (ball.vx > 0 && ball.x + ball.r > W - 16 - paddleW && ball.y > aiY && ball.y < aiY + paddleH) {
      ball.vx = -Math.abs(ball.vx) * 1.04;
      ball.vy += ((ball.y - (aiY + paddleH / 2)) / paddleH) * 3;
      ball.x = W - 16 - paddleW - ball.r;
    }
    if (ball.x < -12) {
      score[1] += 1;
      resetBall(1);
      updateScore();
    } else if (ball.x > W + 12) {
      score[0] += 1;
      resetBall(-1);
      updateScore();
    }
    draw();
  }

  function updateScore() {
    scoreEl.textContent = `${score[0]} – ${score[1]}`;
    if (score[0] >= 5 || score[1] >= 5) {
      running = false;
      stateEl.textContent = score[0] >= 5 ? "Jij wint!" : "Computer wint";
    }
  }

  function start() {
    if (score[0] >= 5 || score[1] >= 5) {
      score = [0, 0];
      updateScore();
      resetBall(Math.random() > 0.5 ? 1 : -1);
    }
    running = !running;
    stateEl.textContent = running ? "Bezig…" : "Pauze";
  }

  c.addEventListener("pointermove", (event) => {
    const rect = c.getBoundingClientRect();
    playerY = ((event.clientY - rect.top) / rect.height) * H - paddleH / 2;
    playerY = Math.max(0, Math.min(H - paddleH, playerY));
  });
  c.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "w", "s", "W", "S"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") keys.up = true;
    if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") keys.down = true;
    if (event.key === " " || event.key === "Enter") start();
  });
  c.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") keys.up = false;
    if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") keys.down = false;
  });
  c.tabIndex = 0;

  loopWhile(c, update);

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, scoreEl), stateEl),
      h("div", { class: "pv-canvas-wrap" }, c),
      h(
        "div",
        { class: "pv-row pv-center pv-gap" },
        btn("▶ Start / pauze", start, "pv-btn-primary"),
        btn("↻ Opnieuw", () => { score = [0, 0]; updateScore(); resetBall(1); running = false; stateEl.textContent = "Klik op Start"; draw(); }, "pv-btn-ghost")
      ),
      h("p", { class: "pv-hint", text: "Beweeg met je muis of gebruik ↑ / ↓. Eerste bij 5 punten wint." })
    ]
  });
}

/* ------------------------------ 2048 ------------------------------ */

function game2048Preview(idea) {
  const grid = h("div", { class: "pv-2048-grid", "aria-label": "2048-bord" });
  const scoreEl = h("strong", { text: "0" });
  let board = [];
  let score = 0;
  let over = false;

  function newBoard() {
    board = Array.from({ length: 16 }, () => 0);
    score = 0;
    over = false;
    addTile();
    addTile();
    render();
  }

  function addTile() {
    const empty = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
    if (!empty.length) return;
    const index = pick(empty);
    board[index] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    grid.replaceChildren(
      ...board.map((value) =>
        h(
          "div",
          { class: `pv-2048-cell${value ? ` v${Math.min(value, 2048)}` : ""}` },
          value ? String(value) : ""
        )
      )
    );
    scoreEl.textContent = String(score);
  }

  function slideLine(line) {
    const values = line.filter((v) => v);
    const out = [];
    for (let i = 0; i < values.length; i += 1) {
      if (values[i] === values[i + 1]) {
        const merged = values[i] * 2;
        out.push(merged);
        score += merged;
        i += 1;
      } else {
        out.push(values[i]);
      }
    }
    while (out.length < 4) out.push(0);
    return out;
  }

  function move(direction) {
    if (over) return;
    const before = board.join(",");
    const next = Array(16).fill(0);
    for (let i = 0; i < 4; i += 1) {
      let line = [];
      for (let j = 0; j < 4; j += 1) {
        if (direction === "left") line.push(board[i * 4 + j]);
        if (direction === "right") line.push(board[i * 4 + (3 - j)]);
        if (direction === "up") line.push(board[j * 4 + i]);
        if (direction === "down") line.push(board[(3 - j) * 4 + i]);
      }
      line = slideLine(line);
      for (let j = 0; j < 4; j += 1) {
        if (direction === "left") next[i * 4 + j] = line[j];
        if (direction === "right") next[i * 4 + (3 - j)] = line[j];
        if (direction === "up") next[j * 4 + i] = line[j];
        if (direction === "down") next[(3 - j) * 4 + i] = line[j];
      }
    }
    board = next;
    if (board.join(",") !== before) addTile();
    if (!canMove()) over = true;
    render();
  }

  function canMove() {
    if (board.includes(0)) return true;
    for (let i = 0; i < 4; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        const value = board[i * 4 + j];
        if (j < 3 && value === board[i * 4 + j + 1]) return true;
        if (i < 3 && value === board[(i + 1) * 4 + j]) return true;
      }
    }
    return false;
  }

  const wrap = h(
    "div",
    {
      class: "pv-2048-wrap",
      tabindex: "0",
      onkeydown: (event) => {
        const map = {
          ArrowLeft: "left",
          ArrowRight: "right",
          ArrowUp: "up",
          ArrowDown: "down",
          a: "left",
          d: "right",
          w: "up",
          s: "down"
        };
        const direction = map[event.key];
        if (!direction) return;
        event.preventDefault();
        move(direction);
      }
    },
    grid
  );

  newBoard();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), h("span", { class: "pv-state", text: "Schuif de tegels" })),
      wrap,
      h(
        "div",
        { class: "pv-2048-keys" },
        btn("↑", () => move("up"), "pv-btn-ghost"),
        h("span", {}, btn("←", () => move("left"), "pv-btn-ghost"), btn("↓", () => move("down"), "pv-btn-ghost"), btn("→", () => move("right"), "pv-btn-ghost")),
        btn("↻ Nieuw", newBoard, "pv-btn-primary")
      ),
      h("p", { class: "pv-hint", text: "Pijltjes of WASD. Voeg gelijke getallen samen en haal 2048." })
    ]
  });
}

/* ------------------------------ Galgje ------------------------------ */

const GALGJE_WORDS = ["PYTHON", "SNAKE", "PROGRAMMA", "COMPUTER", "INTERNET", "ALGORITME", "FUNCTIE", "VARIABELE", "BIBLIOTHEEK", "TOETSENBORD"];

function galgjePreview(idea) {
  const wordEl = h("div", { class: "pv-word", "aria-live": "polite" });
  const lettersEl = h("div", { class: "pv-letters" });
  const stateEl = h("p", { class: "pv-status", text: "" });
  const svg = h("div", {
    class: "pv-gallows",
    html: `<svg viewBox="0 0 120 140" role="img" aria-label="Galgje-tekening">
      <line x1="10" y1="130" x2="80" y2="130" />
      <line x1="30" y1="130" x2="30" y2="15" />
      <line x1="30" y1="15" x2="82" y2="15" />
      <line x1="82" y1="15" x2="82" y2="32" data-part="rope" />
      <circle cx="82" cy="45" r="12" data-part="head" />
      <line x1="82" y1="57" x2="82" y2="93" data-part="body" />
      <line x1="82" y1="66" x2="64" y2="82" data-part="arm-l" />
      <line x1="82" y1="66" x2="100" y2="82" data-part="arm-r" />
      <line x1="82" y1="93" x2="66" y2="116" data-part="leg-l" />
      <line x1="82" y1="93" x2="98" y2="116" data-part="leg-r" />
    </svg>`
  });
  let word = "";
  let guessed = new Set();
  let wrong = 0;
  const maxWrong = 6;

  function render() {
    wordEl.replaceChildren(
      ...[...word].map((letter) =>
        h("span", { class: `pv-word-letter${guessed.has(letter) ? " found" : ""}`, text: guessed.has(letter) ? letter : "•" })
      )
    );
    lettersEl.querySelectorAll("button").forEach((button) => {
      const letter = button.dataset.letter;
      button.disabled = guessed.has(letter);
      button.classList.toggle("hit", guessed.has(letter) && word.includes(letter));
      button.classList.toggle("miss", guessed.has(letter) && !word.includes(letter));
    });
    svg.querySelectorAll("[data-part]").forEach((part, index) => {
      part.classList.toggle("show", index < wrong);
    });
    const won = [...word].every((letter) => guessed.has(letter));
    if (won) {
      stateEl.textContent = `Gewonnen! Het woord was ${word}.`;
      lettersEl.querySelectorAll("button").forEach((button) => (button.disabled = true));
    } else if (wrong >= maxWrong) {
      stateEl.textContent = `Helaas! Het woord was ${word}.`;
      lettersEl.querySelectorAll("button").forEach((button) => (button.disabled = true));
    } else {
      stateEl.textContent = `${maxWrong - wrong} pogingen over.`;
    }
  }

  function guess(letter) {
    if (guessed.has(letter)) return;
    guessed.add(letter);
    if (!word.includes(letter)) wrong += 1;
    render();
  }

  function reset() {
    word = pick(GALGJE_WORDS);
    guessed = new Set();
    wrong = 0;
    lettersEl.replaceChildren(
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) =>
        h("button", { type: "button", class: "pv-letter", "data-letter": letter, onclick: () => guess(letter) }, letter)
      )
    );
    render();
  }

  reset();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-galgje" }, svg, h("div", { class: "pv-galgje-side" }, wordEl, stateEl)),
      lettersEl,
      h("div", { class: "pv-row pv-center" }, btn("↻ Nieuw woord", reset, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Raad het woord letter voor letter. Je hebt 6 fouten." })
    ]
  });
}

/* ------------------------------ Raad het getal ------------------------------ */

function guessPreview(idea) {
  const secret = () => rnd(100) + 1;
  let target = secret();
  let tries = 0;
  const inputEl = input({ type: "number", min: "1", max: "100", placeholder: "1 – 100", "aria-label": "Jouw gok" });
  const feedback = h("p", { class: "pv-feedback", text: "Ik denk aan een getal tussen 1 en 100." });
  const triesEl = h("strong", { text: "0" });

  function check() {
    const value = Number(inputEl.value);
    if (!value || value < 1 || value > 100) {
      feedback.textContent = "Typ een getal tussen 1 en 100.";
      feedback.className = "pv-feedback warn";
      return;
    }
    tries += 1;
    triesEl.textContent = String(tries);
    if (value === target) {
      feedback.textContent = `Juist! Je had ${tries} ${tries === 1 ? "poging" : "pogingen"} nodig. 🎉`;
      feedback.className = "pv-feedback good";
    } else if (value < target) {
      feedback.textContent = "Te laag! Probeer een hoger getal.";
      feedback.className = "pv-feedback";
    } else {
      feedback.textContent = "Te hoog! Probeer een lager getal.";
      feedback.className = "pv-feedback";
    }
    inputEl.value = "";
    inputEl.focus();
  }

  function reset() {
    target = secret();
    tries = 0;
    triesEl.textContent = "0";
    feedback.textContent = "Ik denk aan een getal tussen 1 en 100.";
    feedback.className = "pv-feedback";
    inputEl.value = "";
  }

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") check();
  });

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-guess" }, h("span", { class: "pv-guess-icon", "aria-hidden": "true", text: "🔢" }), feedback),
      h("div", { class: "pv-row pv-center pv-gap" }, inputEl, btn("Raad", check, "pv-btn-primary")),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Pogingen ", triesEl), btn("↻ Opnieuw", reset, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Tip: begin in het midden (50) en halveer steeds." })
    ]
  });
}

/* ------------------------------ Hoger of lager ------------------------------ */

function higherLowerPreview(idea) {
  const SUITS = ["♠", "♥", "♦", "♣"];
  let current = rnd(13) + 1;
  let streak = 0;
  let best = 0;
  const cardEl = h("div", { class: "pv-card" });
  const resultEl = h("p", { class: "pv-feedback", text: "Is de volgende kaart hoger of lager?" });
  const streakEl = h("strong", { text: "0" });
  const bestEl = h("strong", { text: "0" });

  function card(value, suit) {
    return h(
      "div",
      { class: `pv-playing-card ${suit === "♥" || suit === "♦" ? "red" : ""}` },
      h("span", { class: "pv-card-suit", text: suit }),
      h("span", { class: "pv-card-value", text: String(value) }),
      h("span", { class: "pv-card-suit bottom", text: suit })
    );
  }

  function render() {
    cardEl.replaceChildren(card(current, pick(SUITS)));
    streakEl.textContent = String(streak);
    bestEl.textContent = String(best);
  }

  function guess(high) {
    const next = rnd(13) + 1;
    if (next === current) {
      resultEl.textContent = "Gelijk! Probeer opnieuw.";
      resultEl.className = "pv-feedback warn";
      current = next;
      render();
      return;
    }
    const correct = high ? next > current : next < current;
    if (correct) {
      streak += 1;
      best = Math.max(best, streak);
      resultEl.textContent = `Juist! ${current} → ${next}. Reeks: ${streak}.`;
      resultEl.className = "pv-feedback good";
    } else {
      streak = 0;
      resultEl.textContent = `Mis! ${current} → ${next}. Nieuwe reeks.`;
      resultEl.className = "pv-feedback warn";
    }
    current = next;
    render();
  }

  function reset() {
    current = rnd(13) + 1;
    streak = 0;
    resultEl.textContent = "Is de volgende kaart hoger of lager?";
    resultEl.className = "pv-feedback";
    render();
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Reeks ", streakEl), h("span", { class: "pv-score" }, "Beste ", bestEl)),
      h("div", { class: "pv-card-stage" }, cardEl),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("▲ Hoger", () => guess(true), "pv-btn-primary"), btn("▼ Lager", () => guess(false), "pv-btn-primary")),
      resultEl,
      h("div", { class: "pv-row pv-center" }, btn("↻ Opnieuw", reset, "pv-btn-ghost"))
    ]
  });
}

/* ------------------------------ Steen, papier, schaar ------------------------------ */

function rpsPreview(idea) {
  const options = [
    { key: "steen", emoji: "✊", beats: "schaar" },
    { key: "papier", emoji: "✋", beats: "steen" },
    { key: "schaar", emoji: "✌️", beats: "papier" }
  ];
  let wins = 0;
  let losses = 0;
  let draws = 0;
  const playerEl = h("span", { class: "pv-rps-hand", text: "❔" });
  const cpuEl = h("span", { class: "pv-rps-hand", text: "❔" });
  const resultEl = h("p", { class: "pv-feedback", text: "Kies je wapen!" });
  const scoreEl = h("strong", { text: "0 – 0 – 0" });

  function play(key) {
    const player = options.find((item) => item.key === key);
    const cpu = pick(options);
    playerEl.textContent = player.emoji;
    cpuEl.textContent = cpu.emoji;
    if (player.key === cpu.key) {
      draws += 1;
      resultEl.textContent = "Gelijk spel!";
      resultEl.className = "pv-feedback warn";
    } else if (player.beats === cpu.key) {
      wins += 1;
      resultEl.textContent = `${player.emoji} verslaat ${cpu.emoji}. Jij wint!`;
      resultEl.className = "pv-feedback good";
    } else {
      losses += 1;
      resultEl.textContent = `${cpu.emoji} verslaat ${player.emoji}. Computer wint.`;
      resultEl.className = "pv-feedback warn";
    }
    scoreEl.textContent = `${wins} – ${losses} – ${draws}`;
  }

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-rps-stage" }, h("div", { class: "pv-rps-side" }, h("span", { class: "pv-rps-label", text: "Jij" }), playerEl), h("span", { class: "pv-rps-vs", text: "VS" }), h("div", { class: "pv-rps-side" }, h("span", { class: "pv-rps-label", text: "Computer" }), cpuEl)),
      resultEl,
      h("div", { class: "pv-rps-buttons" }, ...options.map((item) => h("button", { type: "button", class: "pv-rps-btn", onclick: () => play(item.key) }, h("span", { text: item.emoji }), h("small", { text: item.key })))),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "W – V – G ", scoreEl), btn("↻ Reset", () => { wins = losses = draws = 0; scoreEl.textContent = "0 – 0 – 0"; playerEl.textContent = "❔"; cpuEl.textContent = "❔"; resultEl.textContent = "Kies je wapen!"; }, "pv-btn-ghost"))
    ]
  });
}

/* ------------------------------ Boter-kaas-en-eieren ------------------------------ */

function ticTacToePreview(idea) {
  const smart = idea.id === "slimme-boter-kaas-eieren";
  let board = Array(9).fill("");
  let over = false;
  const statusEl = h("p", { class: "pv-feedback", text: "Jij bent ✕. Klik op een vakje." });
  const grid = h("div", { class: "pv-ttt" });
  const scoreEl = h("strong", { text: "0 – 0" });
  let wins = 0;
  let losses = 0;

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function winner(b) {
    for (const line of lines) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return b.includes("") ? null : "draw";
  }

  function render() {
    grid.replaceChildren(
      ...board.map((value, index) =>
        h("button", { type: "button", class: `pv-ttt-cell${value ? ` mark-${value === "✕" ? "x" : "o"}` : ""}`, onclick: () => play(index) }, value)
      )
    );
    scoreEl.textContent = `${wins} – ${losses}`;
  }

  function finish(result) {
    over = true;
    if (result === "✕") {
      wins += 1;
      statusEl.textContent = "Jij wint! 🎉";
      statusEl.className = "pv-feedback good";
    } else if (result === "○") {
      losses += 1;
      statusEl.textContent = "Computer wint. Probeer opnieuw!";
      statusEl.className = "pv-feedback warn";
    } else {
      statusEl.textContent = "Gelijkspel.";
      statusEl.className = "pv-feedback warn";
    }
  }

  function bestMove() {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i += 1) {
      if (board[i]) continue;
      board[i] = "○";
      const value = minimax(false);
      board[i] = "";
      if (value > bestScore) {
        bestScore = value;
        move = i;
      }
    }
    return move;
  }

  function minimax(isMax) {
    const result = winner(board);
    if (result === "○") return 1;
    if (result === "✕") return -1;
    if (result === "draw") return 0;
    let bestValue = isMax ? -Infinity : Infinity;
    for (let i = 0; i < 9; i += 1) {
      if (board[i]) continue;
      board[i] = isMax ? "○" : "✕";
      const value = minimax(!isMax);
      board[i] = "";
      bestValue = isMax ? Math.max(bestValue, value) : Math.min(bestValue, value);
    }
    return bestValue;
  }

  function cpuMove() {
    let move = -1;
    if (smart) {
      move = bestMove();
    } else {
      const empty = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      const win = findWinning("○");
      const block = findWinning("✕");
      move = win ?? block ?? (empty.includes(4) ? 4 : pick(empty));
    }
    if (move >= 0) board[move] = "○";
  }

  function findWinning(mark) {
    for (const line of lines) {
      const values = line.map((i) => board[i]);
      if (values.filter((v) => v === mark).length === 2 && values.includes("")) {
        return line[values.indexOf("")];
      }
    }
    return null;
  }

  function play(index) {
    if (over || board[index]) return;
    board[index] = "✕";
    let result = winner(board);
    if (result) {
      finish(result);
      render();
      return;
    }
    cpuMove();
    result = winner(board);
    if (result) finish(result);
    render();
  }

  function reset() {
    board = Array(9).fill("");
    over = false;
    statusEl.textContent = "Jij bent ✕. Klik op een vakje.";
    statusEl.className = "pv-feedback";
    render();
  }

  render();

  return frame(idea, {
    theme: "game",
    label: smart ? "Slimme AI" : "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Jij – computer ", scoreEl), btn("↻ Nieuw", reset, "pv-btn-ghost")),
      statusEl,
      grid,
      h("p", { class: "pv-hint", text: smart ? "De computer zoekt altijd de beste zet. Kun je gelijkspelen?" : "Probeer drie op een rij te krijgen." })
    ]
  });
}

/* ------------------------------ Quiz ------------------------------ */

const PY_QUIZ = [
  { q: "Welke functie laat tekst op het scherm zien?", options: ["print()", "echo()", "say()", "show()"], answer: 0 },
  { q: "Waarmee maak je een lijst in Python?", options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "<1, 2, 3>"], answer: 0 },
  { q: "Welk woord herhaalt code?", options: ["for", "if", "def", "import"], answer: 0 },
  { q: "Hoe vraag je invoer aan de gebruiker?", options: ["input()", "read()", "ask()", "scan()"], answer: 0 },
  { q: "Wat doet len('hallo')?", options: ["5", "4", "hallo", "fout"], answer: 0 }
];

const EMOJI_QUIZ = [
  { q: "Welk woord zoek je? 🐍", options: ["Slang", "Vis", "Touw", "Kabel"], answer: 0 },
  { q: "Welk woord zoek je? ☀️🌧️", options: ["Weer", "Wolken", "Zomer", "Regenboog"], answer: 0 },
  { q: "Welk woord zoek je? 🍎🍌🍇", options: ["Fruit", "Groente", "Snoep", "Markt"], answer: 0 },
  { q: "Welk woord zoek je? 🚀🌌", options: ["Ruimte", "Vliegtuig", "Nacht", "Ster"], answer: 0 }
];

const SPELLING_QUIZ = [
  { q: "Wat is correct?", options: ["programmeren", "programeren", "programmmeren", "proggrameren"], answer: 0 },
  { q: "Wat is correct?", options: ["algoritme", "algorithme", "algoritm", "algorithme"], answer: 0 },
  { q: "Wat is correct?", options: ["variabele", "variable", "varabele", "variabel"], answer: 0 },
  { q: "Wat is correct?", options: ["functie", "funktie", "funktie", "funci"], answer: 0 }
];

const TIMELINE_QUIZ = [
  { q: "Wanneer werd de eerste computer geprogrammeerd?", options: ["1843", "1943", "1969", "1981"], answer: 0 },
  { q: "Wanneer kwam Python 1.0 uit?", options: ["1994", "1989", "2000", "2010"], answer: 0 },
  { q: "Wanneer werd de eerste iPhone uitgebracht?", options: ["2007", "2003", "2010", "2005"], answer: 0 }
];

function quizPreview(idea) {
  const bank =
    idea.id === "emoji-raden"
      ? EMOJI_QUIZ
      : idea.id === "spelling-quiz"
        ? SPELLING_QUIZ
        : idea.id === "tijdlijn-quiz"
          ? TIMELINE_QUIZ
          : PY_QUIZ;
  let index = 0;
  let score = 0;
  let locked = false;
  const progressEl = h("span", { class: "pv-state", text: "" });
  const scoreEl = h("strong", { text: "0" });
  const questionEl = h("h3", { class: "pv-question" });
  const optionsEl = h("div", { class: "pv-options" });
  const feedbackEl = h("p", { class: "pv-feedback", text: "" });

  function render() {
    const item = bank[index];
    progressEl.textContent = `Vraag ${index + 1} / ${bank.length}`;
    scoreEl.textContent = String(score);
    questionEl.textContent = item.q;
    feedbackEl.textContent = "";
    feedbackEl.className = "pv-feedback";
    optionsEl.replaceChildren(
      ...item.options.map((option, optionIndex) =>
        h("button", { type: "button", class: "pv-option", onclick: () => answer(optionIndex) }, option)
      )
    );
  }

  function answer(choice) {
    if (locked) return;
    locked = true;
    const item = bank[index];
    const buttons = [...optionsEl.children];
    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === item.answer) button.classList.add("correct");
      if (buttonIndex === choice && choice !== item.answer) button.classList.add("wrong");
    });
    if (choice === item.answer) {
      score += 1;
      scoreEl.textContent = String(score);
      feedbackEl.textContent = "Juist! ✓";
      feedbackEl.className = "pv-feedback good";
    } else {
      feedbackEl.textContent = `Bijna! Het juiste antwoord is: ${item.options[item.answer]}.`;
      feedbackEl.className = "pv-feedback warn";
    }
    window.setTimeout(() => {
      locked = false;
      index += 1;
      if (index >= bank.length) {
        questionEl.textContent = `Klaar! Je score is ${score} / ${bank.length}.`;
        optionsEl.replaceChildren();
        feedbackEl.textContent = score === bank.length ? "Perfect! 🏆" : "Goed gedaan! Speel opnieuw voor een betere score.";
        feedbackEl.className = "pv-feedback good";
        progressEl.textContent = "Klaar";
        optionsEl.append(btn("↻ Opnieuw", () => { index = 0; score = 0; render(); }, "pv-btn-primary"));
      } else {
        render();
      }
    }, 900);
  }

  render();

  return frame(idea, {
    theme: idea.category === "Onderwijs" ? "school" : "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, progressEl, h("span", { class: "pv-score" }, "Score ", scoreEl)),
      questionEl,
      optionsEl,
      feedbackEl
    ]
  });
}

/* ------------------------------ Dobbelsteen ------------------------------ */

function dieFace(value) {
  const pips = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };
  const cells = Array.from({ length: 9 }, (_, index) =>
    h("span", { class: `pv-pip${(pips[value] || []).includes(index) ? " on" : ""}` })
  );
  return h("div", { class: "pv-die", "data-value": String(value), "aria-label": `${value}` }, ...cells);
}

function dicePreview(idea) {
  const count = idea.id === "yahtzee-lite" ? 5 : 1;
  const diceEl = h("div", { class: "pv-dice" });
  const totalEl = h("strong", { text: "0" });
  const historyEl = h("span", { class: "pv-state", text: "Nog niet gegooid" });
  let values = Array(count).fill(1);
  let rolling = false;

  function render() {
    diceEl.replaceChildren(...values.map((value) => dieFace(value)));
    totalEl.textContent = String(values.reduce((sum, value) => sum + value, 0));
  }

  function roll() {
    if (rolling) return;
    rolling = true;
    let ticks = 0;
    const timer = window.setInterval(() => {
      values = values.map(() => rnd(6) + 1);
      render();
      ticks += 1;
      if (ticks >= 10) {
        window.clearInterval(timer);
        rolling = false;
        historyEl.textContent = `Laatste worp: ${values.join(" + ")}`;
      }
    }, 65);
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-dice-stage" }, diceEl),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Totaal ", totalEl), historyEl),
      h("div", { class: "pv-row pv-center" }, btn("🎲 Gooi", roll, "pv-btn-primary"), btn("↻ Reset", () => { values = Array(count).fill(1); historyEl.textContent = "Nog niet gegooid"; render(); }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: count > 1 ? "Gooi vijf dobbelstenen. Tel de ogen bij elkaar op." : "Gooi de dobbelsteen en kijk welke waarde je krijgt." })
    ]
  });
}

/* ------------------------------ Eenentwintigen ------------------------------ */

function blackjackPreview(idea) {
  const suits = ["♠", "♥", "♦", "♣"];
  let player = [];
  let dealer = [];
  let over = false;
  const playerEl = h("div", { class: "pv-hand" });
  const dealerEl = h("div", { class: "pv-hand" });
  const resultEl = h("p", { class: "pv-feedback", text: "Trek een kaart of blijf staan." });
  const scoreEl = h("span", { class: "pv-state", text: "" });

  function draw() {
    const value = rnd(10) + 1;
    return { value: Math.min(value, 10), suit: pick(suits), rank: value === 1 ? "A" : String(value) };
  }

  function total(hand) {
    let sum = hand.reduce((acc, card) => acc + card.value, 0);
    let aces = hand.filter((card) => card.rank === "A").length;
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces -= 1;
    }
    return sum;
  }

  function cardEl(card, hidden = false) {
    return h(
      "div",
      { class: `pv-mini-card${hidden ? " back" : ""} ${card && (card.suit === "♥" || card.suit === "♦") ? "red" : ""}` },
      hidden ? "🂠" : h("span", { text: `${card.rank}${card.suit}` })
    );
  }

  function render() {
    playerEl.replaceChildren(...player.map((card) => cardEl(card)));
    dealerEl.replaceChildren(...dealer.map((card, index) => cardEl(card, over ? false : index === 1)));
    scoreEl.textContent = `Jij: ${total(player)}${over ? ` · Dealer: ${total(dealer)}` : ""}`;
  }

  function finish(message, cls = "") {
    over = true;
    resultEl.textContent = message;
    resultEl.className = `pv-feedback ${cls}`.trim();
    render();
  }

  function hit() {
    if (over) return;
    player.push(draw());
    if (total(player) > 21) finish("Bust! Je hebt meer dan 21.", "warn");
    else if (total(player) === 21) stand();
    else render();
  }

  function stand() {
    if (over) return;
    while (total(dealer) < 17) dealer.push(draw());
    const p = total(player);
    const d = total(dealer);
    if (d > 21 || p > d) finish("Jij wint! 🎉", "good");
    else if (p === d) finish("Gelijkspel. De dealer wint bij gelijk.", "warn");
    else finish("De dealer wint. Probeer opnieuw!", "warn");
  }

  function reset() {
    player = [draw(), draw()];
    dealer = [draw(), draw()];
    over = false;
    resultEl.textContent = "Trek een kaart of blijf staan.";
    resultEl.className = "pv-feedback";
    render();
  }

  reset();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-blackjack" }, h("span", { class: "pv-hand-label", text: "Dealer" }), dealerEl, h("span", { class: "pv-hand-label", text: "Jij" }), playerEl),
      scoreEl,
      resultEl,
      h("div", { class: "pv-row pv-center pv-gap" }, btn("＋ Kaart", hit, "pv-btn-primary"), btn("Blijf staan", stand, "pv-btn-primary"), btn("↻ Nieuw", reset, "pv-btn-ghost"))
    ]
  });
}

/* ------------------------------ Memorie ------------------------------ */

function memoryPreview(idea) {
  const emojis = ["🐍", "🚀", "🎲", "🎨", "🧠", "⚙️", "🔐", "🌍"];
  let cards = [];
  let first = null;
  let second = null;
  let moves = 0;
  let found = 0;
  let locked = false;
  const grid = h("div", { class: "pv-memory" });
  const movesEl = h("strong", { text: "0" });
  const statusEl = h("span", { class: "pv-state", text: "Zoek de paren" });

  function reset() {
    cards = [...emojis, ...emojis]
      .map((emoji) => ({ emoji, open: false, done: false }))
      .sort(() => Math.random() - 0.5);
    first = null;
    second = null;
    moves = 0;
    found = 0;
    locked = false;
    statusEl.textContent = "Zoek de paren";
    render();
  }

  function render() {
    grid.replaceChildren(
      ...cards.map((card, index) =>
        h(
          "button",
          {
            type: "button",
            class: `pv-memory-card${card.open || card.done ? " open" : ""}${card.done ? " done" : ""}`,
            onclick: () => flip(index)
          },
          card.open || card.done ? card.emoji : "?"
        )
      )
    );
    movesEl.textContent = String(moves);
  }

  function flip(index) {
    if (locked) return;
    const card = cards[index];
    if (!card || card.open || card.done) return;
    card.open = true;
    if (!first) {
      first = index;
      render();
      return;
    }
    second = index;
    moves += 1;
    render();
    if (cards[first].emoji === cards[second].emoji) {
      cards[first].done = true;
      cards[second].done = true;
      first = null;
      second = null;
      found += 1;
      render();
      if (found === emojis.length) statusEl.textContent = `Gewonnen in ${moves} zetten! 🎉`;
    } else {
      locked = true;
      window.setTimeout(() => {
        cards[first].open = false;
        cards[second].open = false;
        first = null;
        second = null;
        locked = false;
        render();
      }, 700);
    }
  }

  reset();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Zetten ", movesEl), statusEl),
      grid,
      h("div", { class: "pv-row pv-center" }, btn("↻ Opnieuw", reset, "pv-btn-primary"))
    ]
  });
}

/* ------------------------------ Mijnenveger ------------------------------ */

function minesweeperPreview(idea) {
  const N = 8;
  const MINES = 10;
  let cells = [];
  let started = false;
  let over = false;
  const grid = h("div", { class: "pv-mines" });
  const statusEl = h("p", { class: "pv-feedback", text: "Klik op een vakje om te beginnen." });
  const flagsEl = h("strong", { text: "0" });

  function neighbors(index) {
    const x = index % N;
    const y = Math.floor(index / N);
    const list = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < N && ny < N) list.push(ny * N + nx);
      }
    }
    return list;
  }

  function reset() {
    cells = Array.from({ length: N * N }, () => ({ mine: false, open: false, flag: false, count: 0 }));
    started = false;
    over = false;
    statusEl.textContent = "Klik op een vakje om te beginnen.";
    statusEl.className = "pv-feedback";
    flagsEl.textContent = "0";
    render();
  }

  function plant(safeIndex) {
    let placed = 0;
    while (placed < MINES) {
      const index = rnd(N * N);
      if (index === safeIndex || cells[index].mine) continue;
      cells[index].mine = true;
      placed += 1;
    }
    cells.forEach((cell, index) => {
      if (cell.mine) return;
      cell.count = neighbors(index).filter((n) => cells[n].mine).length;
    });
    started = true;
  }

  function open(index) {
    if (over) return;
    const cell = cells[index];
    if (cell.open || cell.flag) return;
    if (!started) plant(index);
    cell.open = true;
    if (cell.mine) {
      over = true;
      cells.forEach((item) => { if (item.mine) item.open = true; });
      statusEl.textContent = "💥 Boem! Je raakte een mijn. Probeer opnieuw.";
      statusEl.className = "pv-feedback warn";
      render();
      return;
    }
    if (cell.count === 0) {
      neighbors(index).forEach((n) => {
        if (!cells[n].open && !cells[n].mine) open(n);
      });
    }
    checkWin();
    render();
  }

  function flag(index) {
    if (over) return;
    const cell = cells[index];
    if (cell.open) return;
    cell.flag = !cell.flag;
    flagsEl.textContent = String(cells.filter((item) => item.flag).length);
    render();
  }

  function checkWin() {
    const safeOpen = cells.filter((cell) => !cell.mine && cell.open).length;
    if (safeOpen === N * N - MINES) {
      over = true;
      statusEl.textContent = "🎉 Gewonnen! Alle veilige vakjes zijn open.";
      statusEl.className = "pv-feedback good";
    }
  }

  function render() {
    grid.replaceChildren(
      ...cells.map((cell, index) =>
        h(
          "button",
          {
            type: "button",
            class: `pv-mine${cell.open ? " open" : ""}${cell.mine && cell.open ? " boom" : ""}${cell.flag ? " flag" : ""}`,
            onclick: () => open(index),
            oncontextmenu: (event) => { event.preventDefault(); flag(index); }
          },
          cell.open ? (cell.mine ? "💥" : cell.count || "") : cell.flag ? "🚩" : ""
        )
      )
    );
  }

  reset();

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "🚩 ", flagsEl), statusEl),
      grid,
      h("div", { class: "pv-row pv-center" }, btn("↻ Nieuw spel", reset, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Rechtermuisknop (of lang indrukken) zet een vlag." })
    ]
  });
}

/* ------------------------------ Breakout ------------------------------ */

function breakoutPreview(idea) {
  const W = 420;
  const H = 300;
  const c = canvas(W, H, "pv-breakout");
  const g = ctx2d(c);
  const stateEl = h("span", { class: "pv-state", text: "Klik op Start" });
  const scoreEl = h("strong", { text: "0" });
  const paddle = { x: W / 2 - 36, y: H - 22, w: 72, h: 9 };
  let ball = { x: W / 2, y: H - 40, vx: 3.2, vy: -3.4, r: 5 };
  let bricks = [];
  let score = 0;
  let lives = 3;
  let running = false;

  function makeBricks() {
    bricks = [];
    const cols = 7;
    const rows = 4;
    const bw = 48;
    const bh = 14;
    const gap = 8;
    const offsetX = (W - (cols * bw + (cols - 1) * gap)) / 2;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        bricks.push({
          x: offsetX + col * (bw + gap),
          y: 34 + row * (bh + gap),
          w: bw,
          h: bh,
          color: ["#7ee2b8", "#e8c47c", "#ff8a6b", "#8ab4ff"][row],
          alive: true
        });
      }
    }
  }

  function resetBall() {
    ball = { x: W / 2, y: H - 40, vx: 3.2 * (Math.random() > 0.5 ? 1 : -1), vy: -3.4, r: 5 };
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, H);
    bricks.forEach((brick) => {
      if (!brick.alive) return;
      g.fillStyle = brick.color;
      g.beginPath();
      g.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
      g.fill();
    });
    g.fillStyle = "#f6f0e3";
    g.beginPath();
    g.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 4);
    g.fill();
    g.fillStyle = "#e8c47c";
    g.beginPath();
    g.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    g.fill();
  }

  function update() {
    if (!c.isConnected) return;
    if (!running) {
      draw();
      return;
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.x - ball.r < 0 || ball.x + ball.r > W) {
      ball.vx *= -1;
      ball.x = Math.max(ball.r, Math.min(W - ball.r, ball.x));
    }
    if (ball.y - ball.r < 0) {
      ball.vy *= -1;
      ball.y = ball.r;
    }
    if (
      ball.vy > 0 &&
      ball.y + ball.r > paddle.y &&
      ball.y < paddle.y + paddle.h &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.w
    ) {
      ball.vy = -Math.abs(ball.vy);
      ball.vx += ((ball.x - (paddle.x + paddle.w / 2)) / paddle.w) * 2.4;
      ball.y = paddle.y - ball.r;
    }
    bricks.forEach((brick) => {
      if (!brick.alive) return;
      if (
        ball.x + ball.r > brick.x &&
        ball.x - ball.r < brick.x + brick.w &&
        ball.y + ball.r > brick.y &&
        ball.y - ball.r < brick.y + brick.h
      ) {
        brick.alive = false;
        ball.vy *= -1;
        score += 1;
        scoreEl.textContent = String(score);
      }
    });
    if (ball.y - ball.r > H) {
      lives -= 1;
      if (lives <= 0) {
        running = false;
        stateEl.textContent = "Game over";
        makeBricks();
        score = 0;
        lives = 3;
        scoreEl.textContent = "0";
      } else {
        stateEl.textContent = `${lives} ${lives === 1 ? "leven" : "levens"} over`;
        resetBall();
      }
    }
    if (!bricks.some((brick) => brick.alive)) {
      running = false;
      stateEl.textContent = "🎉 Gewonnen!";
      makeBricks();
      score = 0;
      lives = 3;
      scoreEl.textContent = "0";
    }
    draw();
  }

  function start() {
    running = !running;
    stateEl.textContent = running ? "Bezig…" : "Pauze";
  }

  c.addEventListener("pointermove", (event) => {
    const rect = c.getBoundingClientRect();
    paddle.x = ((event.clientX - rect.left) / rect.width) * W - paddle.w / 2;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
  });
  c.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") paddle.x = Math.max(0, paddle.x - 24);
    if (event.key === "ArrowRight") paddle.x = Math.min(W - paddle.w, paddle.x + 24);
    if (event.key === " ") start();
    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  });
  c.tabIndex = 0;

  makeBricks();
  loopWhile(c, update);

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Stenen ", scoreEl), stateEl),
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-center" }, btn("▶ Start / pauze", start, "pv-btn-primary"), btn("↻ Opnieuw", () => { makeBricks(); score = 0; lives = 3; scoreEl.textContent = "0"; resetBall(); running = false; stateEl.textContent = "Klik op Start"; draw(); }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Beweeg je muis of gebruik ← / →. Breek alle stenen." })
    ]
  });
}

/* ------------------------------ Reactiespel ------------------------------ */

function reactionPreview(idea) {
  const pad = h("button", { type: "button", class: "pv-reaction-pad", "aria-live": "polite" }, "Klik om te starten");
  const resultEl = h("p", { class: "pv-feedback", text: "Wacht tot het groen wordt en klik zo snel mogelijk." });
  const bestEl = h("strong", { text: "–" });
  let state = "idle";
  let startTime = 0;
  let timeout = 0;
  let best = null;

  function begin() {
    if (state === "waiting") {
      window.clearTimeout(timeout);
      state = "idle";
      pad.className = "pv-reaction-pad";
      pad.textContent = "Te vroeg! Klik om opnieuw te starten";
      resultEl.textContent = "Je klikte te vroeg.";
      resultEl.className = "pv-feedback warn";
      return;
    }
    if (state === "ready") {
      const time = performance.now() - startTime;
      state = "idle";
      pad.className = "pv-reaction-pad";
      pad.textContent = `${Math.round(time)} ms`;
      resultEl.textContent = time < 250 ? "Bliksemsnel! ⚡" : time < 400 ? "Heel goed!" : "Blijf oefenen!";
      resultEl.className = "pv-feedback good";
      if (best === null || time < best) {
        best = time;
        bestEl.textContent = `${Math.round(best)} ms`;
      }
      return;
    }
    state = "waiting";
    pad.className = "pv-reaction-pad waiting";
    pad.textContent = "Wachten…";
    resultEl.textContent = "Nog even wachten…";
    resultEl.className = "pv-feedback";
    const delay = 900 + Math.random() * 2200;
    timeout = window.setTimeout(() => {
      if (!pad.isConnected) return;
      state = "ready";
      startTime = performance.now();
      pad.className = "pv-reaction-pad ready";
      pad.textContent = "KLIK!";
    }, delay);
  }

  pad.addEventListener("click", begin);

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      pad,
      resultEl,
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Beste tijd ", bestEl), btn("↻ Reset", () => { best = null; bestEl.textContent = "–"; state = "idle"; pad.className = "pv-reaction-pad"; pad.textContent = "Klik om te starten"; resultEl.textContent = "Wacht tot het groen wordt en klik zo snel mogelijk."; resultEl.className = "pv-feedback"; }, "pv-btn-ghost"))
    ]
  });
}

/* ------------------------------ Torens van Hanoi ------------------------------ */

function hanoiPreview(idea) {
  const disks = 4;
  let pegs = [[disks, disks - 1, disks - 2, disks - 3], [], []];
  let selected = null;
  let moves = 0;
  const board = h("div", { class: "pv-hanoi" });
  const statusEl = h("p", { class: "pv-feedback", text: "Verplaats alle schijven naar de derde toren." });
  const movesEl = h("strong", { text: "0" });

  function render() {
    board.replaceChildren(
      ...pegs.map((peg, pegIndex) =>
        h(
          "button",
          { type: "button", class: `pv-peg${selected === pegIndex ? " selected" : ""}`, onclick: () => clickPeg(pegIndex), "aria-label": `Toren ${pegIndex + 1}` },
          h("span", { class: "pv-peg-rod" }),
          ...peg.map((size) =>
            h("span", { class: `pv-disk d${size}`, style: { width: `${28 + size * 16}px` } })
          )
        )
      )
    );
    movesEl.textContent = String(moves);
  }

  function clickPeg(index) {
    if (selected === null) {
      if (!pegs[index].length) return;
      selected = index;
      render();
      return;
    }
    if (selected === index) {
      selected = null;
      render();
      return;
    }
    const from = pegs[selected];
    const to = pegs[index];
    const disk = from[from.length - 1];
    if (!to.length || to[to.length - 1] > disk) {
      from.pop();
      to.push(disk);
      moves += 1;
      selected = null;
      render();
      if (pegs[2].length === disks) {
        statusEl.textContent = `🎉 Opgelost in ${moves} zetten!`;
        statusEl.className = "pv-feedback good";
      }
      return;
    }
    statusEl.textContent = "Een grotere schijf mag niet op een kleinere.";
    statusEl.className = "pv-feedback warn";
    selected = null;
    render();
  }

  function reset() {
    pegs = [[disks, disks - 1, disks - 2, disks - 3], [], []];
    selected = null;
    moves = 0;
    statusEl.textContent = "Verplaats alle schijven naar de derde toren.";
    statusEl.className = "pv-feedback";
    render();
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Puzzel",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Zetten ", movesEl), btn("↻ Opnieuw", reset, "pv-btn-ghost")),
      board,
      statusEl,
      h("p", { class: "pv-hint", text: "Klik op een toren om de bovenste schijf op te pakken, klik daarna op een andere toren." })
    ]
  });
}

/* ------------------------------ Game of Life ------------------------------ */

function lifePreview(idea) {
  const COLS = 40;
  const ROWS = 24;
  const CELL = 10;
  const c = canvas(COLS * CELL, ROWS * CELL, "pv-life");
  const g = ctx2d(c);
  let cells = [];
  let running = true;
  let generation = 0;
  const genEl = h("strong", { text: "0" });
  let timer = null;

  function randomize() {
    cells = Array.from({ length: COLS * ROWS }, () => (Math.random() < 0.28 ? 1 : 0));
    generation = 0;
    draw();
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    cells.forEach((alive, index) => {
      if (!alive) return;
      const x = (index % COLS) * CELL;
      const y = Math.floor(index / COLS) * CELL;
      g.fillStyle = index % 7 === 0 ? "#e8c47c" : "#7ee2b8";
      g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    });
    genEl.textContent = String(generation);
  }

  function step() {
    const next = cells.map((alive, index) => {
      const x = index % COLS;
      const y = Math.floor(index / COLS);
      let count = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const nx = (x + dx + COLS) % COLS;
          const ny = (y + dy + ROWS) % ROWS;
          count += cells[ny * COLS + nx];
        }
      }
      return count === 3 || (alive && count === 2) ? 1 : 0;
    });
    cells = next;
    generation += 1;
    draw();
  }

  function toggle() {
    running = !running;
    if (running && !timer) timer = window.setInterval(() => { if (!c.isConnected) { window.clearInterval(timer); timer = null; return; } step(); }, 130);
    if (!running) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  randomize();
  timer = window.setInterval(() => { if (!c.isConnected) { window.clearInterval(timer); timer = null; return; } step(); }, 130);

  return frame(idea, {
    theme: "science",
    label: "Simulatie",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Generatie ", genEl), h("span", { class: "pv-state", text: "Conway's Game of Life" })),
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("▶ / ⏸", toggle, "pv-btn-primary"), btn("🎲 Nieuw", randomize, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Elke cel volgt drie regels. Ontdek hoe patronen ontstaan en verdwijnen." })
    ]
  });
}

/* ------------------------------ Simon Says ------------------------------ */

function simonPreview(idea) {
  const colors = [
    { key: "green", label: "Groen", tone: "#4ade80" },
    { key: "red", label: "Rood", tone: "#f87171" },
    { key: "yellow", label: "Geel", tone: "#facc15" },
    { key: "blue", label: "Blauw", tone: "#60a5fa" }
  ];
  let sequence = [];
  let inputIndex = 0;
  let playing = false;
  let score = 0;
  const statusEl = h("p", { class: "pv-feedback", text: "Klik op Start en herhaal de reeks." });
  const scoreEl = h("strong", { text: "0" });
  const pads = colors.map((color) =>
    h(
      "button",
      { type: "button", class: `pv-simon-pad ${color.key}`, style: { "--tone": color.tone }, "aria-label": color.label, onclick: () => press(color.key) },
      color.label
    )
  );
  const board = h("div", { class: "pv-simon" }, ...pads);

  function flash(key, duration = 420) {
    const pad = pads.find((item) => item.classList.contains(key));
    if (!pad) return;
    pad.classList.add("flash");
    window.setTimeout(() => pad.classList.remove("flash"), duration);
  }

  function playSequence() {
    playing = true;
    statusEl.textContent = "Kijk goed…";
    sequence.forEach((key, index) => {
      window.setTimeout(() => flash(key), index * 620);
    });
    window.setTimeout(() => {
      playing = false;
      inputIndex = 0;
      statusEl.textContent = "Jouw beurt!";
    }, sequence.length * 620 + 200);
  }

  function nextRound() {
    sequence.push(pick(colors).key);
    score = sequence.length - 1;
    scoreEl.textContent = String(score);
    playSequence();
  }

  function start() {
    sequence = [];
    score = 0;
    scoreEl.textContent = "0";
    nextRound();
  }

  function press(key) {
    if (playing || !sequence.length) return;
    flash(key, 220);
    if (sequence[inputIndex] !== key) {
      statusEl.textContent = `Fout! Je haalde reeks ${sequence.length - 1}.`;
      statusEl.className = "pv-feedback warn";
      playing = true;
      sequence = [];
      return;
    }
    inputIndex += 1;
    if (inputIndex === sequence.length) {
      statusEl.textContent = "Goed! Volgende ronde…";
      statusEl.className = "pv-feedback good";
      playing = true;
      window.setTimeout(nextRound, 700);
    }
  }

  return frame(idea, {
    theme: "game",
    label: "Speelbaar",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Reeks ", scoreEl), btn("▶ Start", start, "pv-btn-primary")),
      board,
      statusEl
    ]
  });
}

/* ------------------------------ Rekenmachine ------------------------------ */

function calculatorPreview(idea) {
  const display = h("div", { class: "pv-calc-display", "aria-live": "polite" }, "0");
  let expression = "";
  let justEvaluated = false;

  function update(value) {
    display.textContent = value || "0";
  }

  function press(key) {
    if (key === "C") {
      expression = "";
      justEvaluated = false;
      update("0");
      return;
    }
    if (key === "⌫") {
      expression = expression.slice(0, -1);
      update(expression);
      return;
    }
    if (key === "=") {
      if (!expression) return;
      try {
        if (!/^[0-9+\-*/.() ]+$/.test(expression)) throw new Error("invalid");
        const result = Function(`"use strict"; return (${expression})`)();
        if (!Number.isFinite(result)) throw new Error("invalid");
        expression = String(Math.round(result * 1e10) / 1e10);
        justEvaluated = true;
        update(expression);
      } catch (error) {
        update("Fout");
        expression = "";
      }
      return;
    }
    if (justEvaluated && /[0-9.]/.test(key)) expression = "";
    justEvaluated = false;
    expression += key;
    update(expression);
  }

  const keys = ["C", "⌫", "(", ")", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"];
  const grid = h(
    "div",
    { class: "pv-calc-keys" },
    ...keys.map((key) =>
      h(
        "button",
        {
          type: "button",
          class: `pv-calc-key${["÷", "×", "−", "+", "="].includes(key) ? " op" : ""}${key === "C" ? " clear" : ""}`,
          onclick: () => press(key === "÷" ? "/" : key === "×" ? "*" : key === "−" ? "-" : key)
        },
        key
      )
    )
  );

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-calc" }, display, grid),
      h("p", { class: "pv-hint", text: "Een echte rekenmachine: klik de knoppen of gebruik je toetsenbord." })
    ]
  });
}

/* ------------------------------ Digitale klok ------------------------------ */

function clockPreview(idea) {
  const timeEl = h("div", { class: "pv-clock-time", "aria-live": "polite" }, "--:--:--");
  const dateEl = h("p", { class: "pv-clock-date", text: "" });
  const tzEl = h("span", { class: "pv-state", text: "Lokale tijd" });
  let timer = null;

  function tick() {
    if (!timeEl.isConnected) {
      window.clearInterval(timer);
      timer = null;
      return;
    }
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    dateEl.textContent = now.toLocaleDateString("nl-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  tick();
  timer = window.setInterval(tick, 1000);

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-clock" }, timeEl, dateEl, tzEl),
      h("p", { class: "pv-hint", text: "De klok loopt elke seconde mee met jouw toestel." })
    ]
  });
}

/* ------------------------------ Stopwatch ------------------------------ */

function stopwatchPreview(idea) {
  const display = h("div", { class: "pv-watch-time", "aria-live": "polite" }, "00:00.00");
  const lapList = h("div", { class: "pv-laps" });
  let elapsed = 0;
  let startedAt = 0;
  let running = false;
  let timer = null;
  let laps = [];

  function format(ms) {
    const total = Math.max(0, ms);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const hundredths = Math.floor((total % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
  }

  function current() {
    return elapsed + (running ? performance.now() - startedAt : 0);
  }

  function render() {
    display.textContent = format(current());
    lapList.replaceChildren(...laps.map((lap, index) => h("div", { class: "pv-lap" }, h("span", { text: `Ronde ${index + 1}` }), h("strong", { text: format(lap) }))));
  }

  function tick() {
    if (!display.isConnected) {
      window.clearInterval(timer);
      timer = null;
      return;
    }
    render();
  }

  function toggle() {
    if (running) {
      elapsed = current();
      running = false;
      window.clearInterval(timer);
      timer = null;
    } else {
      startedAt = performance.now();
      running = true;
      timer = window.setInterval(tick, 31);
    }
    startBtn.textContent = running ? "⏸ Stop" : "▶ Start";
  }

  function lap() {
    if (!running && elapsed === 0) return;
    laps = [current(), ...laps].slice(0, 6);
    render();
  }

  function reset() {
    running = false;
    elapsed = 0;
    laps = [];
    window.clearInterval(timer);
    timer = null;
    startBtn.textContent = "▶ Start";
    render();
  }

  const startBtn = btn("▶ Start", toggle, "pv-btn-primary");
  render();

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-watch" }, display),
      h("div", { class: "pv-row pv-center pv-gap" }, startBtn, btn("Ronde", lap, "pv-btn-ghost"), btn("↻ Reset", reset, "pv-btn-ghost")),
      lapList
    ]
  });
}

/* ------------------------------ Pomodoro ------------------------------ */

function pomodoroPreview(idea) {
  const display = h("div", { class: "pv-pomo-time", "aria-live": "polite" }, "25:00");
  const phaseEl = h("span", { class: "pv-state", text: "Focus" });
  const bar = h("div", { class: "pv-progress" }, h("i"));
  let total = 25 * 60;
  let left = total;
  let running = false;
  let timer = null;

  function render() {
    const minutes = Math.floor(left / 60);
    const seconds = left % 60;
    display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    bar.firstChild.style.width = `${((total - left) / total) * 100}%`;
  }

  function tick() {
    if (!display.isConnected) {
      window.clearInterval(timer);
      timer = null;
      return;
    }
    left = Math.max(0, left - 1);
    render();
    if (left === 0) {
      running = false;
      window.clearInterval(timer);
      timer = null;
      startBtn.textContent = "▶ Start";
      phaseEl.textContent = "Klaar! Neem pauze.";
    }
  }

  function toggle() {
    if (running) {
      running = false;
      window.clearInterval(timer);
      timer = null;
    } else {
      running = true;
      timer = window.setInterval(tick, 1000);
    }
    startBtn.textContent = running ? "⏸ Pauze" : "▶ Start";
  }

  function setPhase(minutes, label) {
    running = false;
    window.clearInterval(timer);
    timer = null;
    total = minutes * 60;
    left = total;
    phaseEl.textContent = label;
    startBtn.textContent = "▶ Start";
    render();
  }

  const startBtn = btn("▶ Start", toggle, "pv-btn-primary");
  render();

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-pomo" }, phaseEl, display, bar),
      h("div", { class: "pv-row pv-center pv-gap" }, startBtn, btn("25 min", () => setPhase(25, "Focus"), "pv-btn-ghost"), btn("5 min", () => setPhase(5, "Pauze"), "pv-btn-ghost"), btn("↻", () => setPhase(25, "Focus"), "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Werk 25 minuten gefocust en neem daarna 5 minuten pauze." })
    ]
  });
}

/* ------------------------------ Kleurenkiezer ------------------------------ */

function colorPickerPreview(idea) {
  const picker = input({ type: "color", value: "#145c4b", class: "pv-color-input", "aria-label": "Kies een kleur" });
  const swatch = h("div", { class: "pv-color-swatch", style: { background: "#145c4b" } });
  const hexEl = h("code", { text: "#145c4b" });
  const rgbEl = h("code", { text: "rgb(20, 92, 75)" });
  const hslEl = h("code", { text: "hsl(166, 64%, 22%)" });
  const copyEl = h("span", { class: "pv-state", text: "Klik om te kopiëren" });

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
  }

  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hDeg = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hDeg = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) hDeg = (b - r) / d + 2;
      else hDeg = (r - g) / d + 4;
      hDeg /= 6;
    }
    return [Math.round(hDeg * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function update() {
    const hex = picker.value;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    swatch.style.background = hex;
    hexEl.textContent = hex;
    rgbEl.textContent = `rgb(${rgb.join(", ")})`;
    hslEl.textContent = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      copyEl.textContent = `Gekopieerd: ${text}`;
    } catch (error) {
      copyEl.textContent = text;
    }
  }

  picker.addEventListener("input", update);
  [hexEl, rgbEl, hslEl].forEach((element) => element.addEventListener("click", () => copy(element.textContent)));

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-color-stage" }, swatch, h("div", { class: "pv-color-values" }, h("div", { class: "pv-color-row" }, h("span", { text: "HEX" }), hexEl), h("div", { class: "pv-color-row" }, h("span", { text: "RGB" }), rgbEl), h("div", { class: "pv-color-row" }, h("span", { text: "HSL" }), hslEl))),
      h("div", { class: "pv-row pv-center pv-gap" }, field("Kies", picker), copyEl),
      h("p", { class: "pv-hint", text: "Klik op een kleurcode om die te kopiëren." })
    ]
  });
}

/* ------------------------------ BMI-app ------------------------------ */

function bmiPreview(idea) {
  const height = input({ type: "number", min: "80", max: "250", value: "175", "aria-label": "Lengte in cm" });
  const weight = input({ type: "number", min: "20", max: "300", value: "70", "aria-label": "Gewicht in kg" });
  const valueEl = h("strong", { class: "pv-bmi-value", text: "22,9" });
  const labelEl = h("span", { class: "pv-bmi-label", text: "Gezond gewicht" });
  const marker = h("i", { class: "pv-bmi-marker" });
  const bar = h("div", { class: "pv-bmi-bar" }, marker);

  function calc() {
    const hCm = Number(height.value);
    const wKg = Number(weight.value);
    if (!hCm || !wKg) return;
    const bmi = wKg / ((hCm / 100) ** 2);
    valueEl.textContent = bmi.toFixed(1).replace(".", ",");
    const pct = Math.max(0, Math.min(100, ((bmi - 14) / 24) * 100));
    marker.style.left = `${pct}%`;
    if (bmi < 18.5) {
      labelEl.textContent = "Ondergewicht";
      labelEl.className = "pv-bmi-label low";
    } else if (bmi < 25) {
      labelEl.textContent = "Gezond gewicht";
      labelEl.className = "pv-bmi-label good";
    } else if (bmi < 30) {
      labelEl.textContent = "Overgewicht";
      labelEl.className = "pv-bmi-label warn";
    } else {
      labelEl.textContent = "Obesitas";
      labelEl.className = "pv-bmi-label bad";
    }
  }

  height.addEventListener("input", calc);
  weight.addEventListener("input", calc);
  calc();

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-bmi" }, h("div", { class: "pv-bmi-head" }, valueEl, labelEl), bar, h("div", { class: "pv-bmi-scale" }, h("span", { text: "18,5" }), h("span", { text: "25" }), h("span", { text: "30" }))),
      h("div", { class: "pv-row pv-gap" }, field("Lengte (cm)", height), field("Gewicht (kg)", weight)),
      h("p", { class: "pv-hint", text: "BMI is een ruwe indicatie, geen medisch advies." })
    ]
  });
}

/* ------------------------------ Takenlijst ------------------------------ */

function todoPreview(idea) {
  const list = h("div", { class: "pv-todo-list" });
  const inputEl = input({ type: "text", placeholder: "Nieuwe taak…", "aria-label": "Nieuwe taak" });
  const countEl = h("span", { class: "pv-state", text: "0 taken" });
  let items = [
    { text: "Python installeren", done: true },
    { text: "Eerste project maken", done: false },
    { text: "Code delen met een vriend", done: false }
  ];

  function render() {
    list.replaceChildren(
      ...items.map((item, index) =>
        h("div", { class: `pv-todo${item.done ? " done" : ""}` },
          h("button", { type: "button", class: "pv-todo-check", "aria-pressed": String(item.done), onclick: () => { items[index].done = !items[index].done; render(); } }, "✓"),
          h("span", { class: "pv-todo-text", text: item.text }),
          h("button", { type: "button", class: "pv-todo-del", "aria-label": "Verwijderen", onclick: () => { items.splice(index, 1); render(); } }, "×")
        )
      )
    );
    countEl.textContent = `${items.filter((item) => !item.done).length} open`;
  }

  function add() {
    const text = inputEl.value.trim();
    if (!text) return;
    items.push({ text, done: false });
    inputEl.value = "";
    render();
  }

  inputEl.addEventListener("keydown", (event) => { if (event.key === "Enter") add(); });
  render();

  return frame(idea, {
    theme: "gui",
    label: "App",
    body: [
      h("div", { class: "pv-row pv-between" }, h("strong", { text: "Mijn taken" }), countEl),
      list,
      h("div", { class: "pv-row pv-gap" }, inputEl, btn("＋", add, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Vink af, voeg toe en verwijder. Alles blijft in deze demo." })
    ]
  });
}

/* ------------------------------ Weer-app ------------------------------ */

function weatherPreview(idea) {
  const cities = {
    Brussel: { temp: 14, icon: "⛅", wind: 12, rain: 20 },
    Antwerpen: { temp: 15, icon: "🌤️", wind: 18, rain: 10 },
    Gent: { temp: 13, icon: "🌧️", wind: 15, rain: 70 },
    Luik: { temp: 12, icon: "🌦️", wind: 10, rain: 45 },
    Oostende: { temp: 14, icon: "💨", wind: 28, rain: 25 }
  };
  const citySelect = select(Object.keys(cities), { "aria-label": "Kies een stad" });
  const hero = h("div", { class: "pv-weather-hero" });
  const forecast = h("div", { class: "pv-forecast" });
  const days = ["Ma", "Di", "Wo", "Do", "Vr"];

  function render() {
    const city = citySelect.value;
    const data = cities[city];
    hero.replaceChildren(
      h("span", { class: "pv-weather-icon", text: data.icon }),
      h("div", {}, h("strong", { class: "pv-weather-temp", text: `${data.temp}°` }), h("span", { class: "pv-weather-city", text: city })),
      h("div", { class: "pv-weather-meta" }, h("span", { text: `💨 ${data.wind} km/u` }), h("span", { text: `🌧 ${data.rain}%` }))
    );
    forecast.replaceChildren(
      ...days.map((day, index) =>
        h("div", { class: "pv-forecast-day" }, h("span", { text: day }), h("span", { text: ["⛅", "🌤️", "🌧️", "🌦️", "☀️"][index] }), h("strong", { text: `${data.temp - 2 + index}°` }))
      )
    );
  }

  citySelect.addEventListener("change", render);
  render();

  return frame(idea, {
    theme: "web",
    label: "Weer",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-web-badge", text: "🌍 Live weer" }), citySelect),
      hero,
      forecast,
      h("p", { class: "pv-hint", text: "Kies een stad. Dit is een demo met vaste voorbeelddata." })
    ]
  });
}

/* ------------------------------ Wachtwoord-generator ------------------------------ */

function passwordGeneratorPreview(idea) {
  const lengthInput = input({ type: "range", min: "8", max: "40", value: "18", "aria-label": "Lengte" });
  const lengthEl = h("strong", { text: "18" });
  const upper = input({ type: "checkbox", checked: true });
  const digits = input({ type: "checkbox", checked: true });
  const symbols = input({ type: "checkbox", checked: true });
  const output = h("code", { class: "pv-password", text: "Klik op Genereer" });
  const strengthEl = h("span", { class: "pv-state", text: "" });

  function randomIndex(max) {
    if (window.crypto?.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }
    return rnd(max);
  }

  function generate() {
    const length = Number(lengthInput.value);
    let chars = "abcdefghijkmnopqrstuvwxyz";
    if (upper.checked) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if (digits.checked) chars += "23456789";
    if (symbols.checked) chars += "!@#$%&*?+-_";
    let value = "";
    for (let i = 0; i < length; i += 1) value += chars[randomIndex(chars.length)];
    output.textContent = value;
    const score = (upper.checked ? 1 : 0) + (digits.checked ? 1 : 0) + (symbols.checked ? 1 : 0) + (length >= 16 ? 1 : 0);
    strengthEl.textContent = ["Zwak", "Matig", "Goed", "Sterk", "Zeer sterk"][Math.min(score, 4)];
  }

  lengthInput.addEventListener("input", () => { lengthEl.textContent = lengthInput.value; generate(); });
  [upper, digits, symbols].forEach((box) => box.addEventListener("change", generate));

  async function copy() {
    try {
      await navigator.clipboard.writeText(output.textContent);
      strengthEl.textContent = "Gekopieerd ✓";
    } catch (error) {}
  }

  generate();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      h("div", { class: "pv-password-box" }, output),
      h("div", { class: "pv-row pv-between" }, h("span", { text: "Lengte" }), lengthEl),
      lengthInput,
      h("div", { class: "pv-checks" },
        h("label", {}, upper, " Hoofdletters"),
        h("label", {}, digits, " Cijfers"),
        h("label", {}, symbols, " Symbolen")
      ),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("🎲 Genereer", generate, "pv-btn-primary"), btn("Kopieer", copy, "pv-btn-ghost")),
      strengthEl
    ]
  });
}

/* ------------------------------ Tekst-teller ------------------------------ */

function textCounterPreview(idea) {
  const area = textarea({ rows: "6", placeholder: "Typ of plak je tekst…" });
  area.value = "EasyCodey helpt je stap voor stap om Python te leren. Probeer gerust eens iets nieuws!";
  const charsEl = h("strong", { text: "0" });
  const wordsEl = h("strong", { text: "0" });
  const linesEl = h("strong", { text: "0" });
  const readEl = h("strong", { text: "0 min" });

  function update() {
    const text = area.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    charsEl.textContent = String(text.length);
    wordsEl.textContent = String(words);
    linesEl.textContent = String(text ? text.split(/\n/).length : 0);
    readEl.textContent = `${Math.max(1, Math.ceil(words / 200))} min`;
  }

  area.addEventListener("input", update);
  update();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      area,
      h("div", { class: "pv-stats" }, h("div", { class: "pv-stat" }, h("strong", { text: "0" }), h("span", { text: "tekens" })), h("div", { class: "pv-stat" }, wordsEl, h("span", { text: "woorden" })), h("div", { class: "pv-stat" }, linesEl, h("span", { text: "regels" })), h("div", { class: "pv-stat" }, readEl, h("span", { text: "leestijd" }))),
      h("p", { class: "pv-hint", text: "De telling gebeurt meteen terwijl je typt." })
    ]
  });
}

/* ------------------------------ Eenheden omrekenen ------------------------------ */

const UNIT_GROUPS = {
  Lengte: { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, mijl: 1609.34, voet: 0.3048 },
  Gewicht: { kilogram: 1, gram: 0.001, ton: 1000, pond: 0.453592, ons: 0.1 },
  Temperatuur: { Celsius: "C", Fahrenheit: "F", Kelvin: "K" },
  Snelheid: { "km/u": 1, "m/s": 3.6, "mijl/u": 1.60934 },
  Data: { byte: 1, kilobyte: 1024, megabyte: 1048576, gigabyte: 1073741824 }
};

function convertUnit(group, value, from, to) {
  if (group === "Temperatuur") {
    let celsius = value;
    if (from === "Fahrenheit") celsius = (value - 32) * 5 / 9;
    if (from === "Kelvin") celsius = value - 273.15;
    if (to === "Fahrenheit") return celsius * 9 / 5 + 32;
    if (to === "Kelvin") return celsius + 273.15;
    return celsius;
  }
  const table = UNIT_GROUPS[group];
  return (value * table[from]) / table[to];
}

function converterPreview(idea) {
  const groupSelect = select(Object.keys(UNIT_GROUPS), { "aria-label": "Soort eenheid" });
  const valueInput = input({ type: "number", value: "1", step: "any", "aria-label": "Waarde" });
  const fromSelect = select([], { "aria-label": "Van" });
  const toSelect = select([], { "aria-label": "Naar" });
  const resultEl = h("strong", { class: "pv-convert-result", text: "—" });

  function fillUnits() {
    const units = Object.keys(UNIT_GROUPS[groupSelect.value]);
    fromSelect.replaceChildren(...units.map((unit) => h("option", { value: unit, text: unit })));
    toSelect.replaceChildren(...units.map((unit) => h("option", { value: unit, text: unit })));
    toSelect.selectedIndex = Math.min(1, units.length - 1);
    update();
  }

  function update() {
    const value = Number(valueInput.value);
    if (!Number.isFinite(value)) {
      resultEl.textContent = "—";
      return;
    }
    const result = convertUnit(groupSelect.value, value, fromSelect.value, toSelect.value);
    resultEl.textContent = `${Number(result.toFixed(6))} ${toSelect.value}`;
  }

  groupSelect.addEventListener("change", fillUnits);
  [valueInput, fromSelect, toSelect].forEach((element) => element.addEventListener("input", update));
  fillUnits();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      field("Soort", groupSelect),
      h("div", { class: "pv-row pv-gap" }, field("Waarde", valueInput), field("Van", fromSelect), field("Naar", toSelect)),
      h("div", { class: "pv-tool-result" }, h("span", { class: "pv-state", text: "Resultaat" }), resultEl),
      h("p", { class: "pv-hint", text: "Kies een soort eenheid en typ een waarde." })
    ]
  });
}

/* ------------------------------ JSON-formatter ------------------------------ */

function jsonPreview(idea) {
  const area = textarea({ rows: "6", spellcheck: "false" });
  area.value = '{"naam":"EasyCodey","projecten":161,"talen":["Python","JavaScript"],"gratis":true}';
  const output = h("pre", { class: "pv-code-output", text: "" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar" });

  function format() {
    try {
      const parsed = JSON.parse(area.value);
      output.textContent = JSON.stringify(parsed, null, 2);
      stateEl.textContent = "Geldige JSON ✓";
      stateEl.className = "pv-state good";
    } catch (error) {
      output.textContent = error.message;
      stateEl.textContent = "Ongeldige JSON";
      stateEl.className = "pv-state warn";
    }
  }

  format();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      area,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("✨ Formatteer", format, "pv-btn-primary")),
      output,
      h("p", { class: "pv-hint", text: "Plak JSON en krijg meteen een nette, ingesprongen versie." })
    ]
  });
}

/* ------------------------------ QR-code ------------------------------ */

function qrPreview(idea) {
  const textInput = input({ type: "text", value: "easycodey.be", "aria-label": "Tekst voor de QR-code" });
  const grid = h("div", { class: "pv-qr", "aria-label": "QR-code demo" });
  const stateEl = h("span", { class: "pv-state", text: "Demo" });

  function hash(value) {
    let result = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      result ^= value.charCodeAt(i);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function render() {
    const size = 21;
    let seed = hash(textInput.value || "easycodey");
    const cells = [];
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const finder =
          (x < 7 && y < 7) ||
          (x >= size - 7 && y < 7) ||
          (x < 7 && y >= size - 7);
        let on;
        if (finder) {
          const localX = x >= size - 7 ? x - (size - 7) : x;
          const localY = y >= size - 7 ? y - (size - 7) : y;
          const ring = Math.min(localX, localY, 6 - localX, 6 - localY);
          on = ring !== 1;
        } else {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          on = (seed & 0x10000000) !== 0;
        }
        cells.push(h("i", { class: on ? "on" : "" }));
      }
    }
    grid.replaceChildren(...cells);
  }

  textInput.addEventListener("input", render);
  render();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      field("Tekst of link", textInput),
      h("div", { class: "pv-qr-stage" }, grid, h("div", { class: "pv-qr-info" }, h("strong", { text: "QR-code" }), h("span", { class: "pv-state", text: "Visuele demo" }), h("p", { text: "In het echte project gebruik je de qrcode-bibliotheek van Python." }))),
      h("div", { class: "pv-row pv-between" }, stateEl, btn("↻ Opnieuw", render, "pv-btn-ghost"))
    ]
  });
}

/* ------------------------------ Markdown ------------------------------ */

function markdownToHtml(markdown) {
  const escape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escape(markdown);
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/^\- (.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/\n{2,}/g, "</p><p>");
  return `<p>${html}</p>`;
}

function markdownPreview(idea) {
  const area = textarea({ rows: "7" });
  area.value = "# Hallo EasyCodey\n\nDit is **vet**, dit is *cursief* en dit is `code`.\n\n- Eerste punt\n- Tweede punt\n\n[Bezoek EasyCodey](https://easycodey.be)";
  const preview = h("div", { class: "pv-markdown" });

  function render() {
    preview.innerHTML = markdownToHtml(area.value);
  }

  area.addEventListener("input", render);
  render();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      h("div", { class: "pv-split" }, field("Markdown", area), h("div", { class: "pv-split-preview" }, h("span", { class: "pv-state", text: "Voorbeeld" }), preview)),
      h("p", { class: "pv-hint", text: "Typ links en zie rechts meteen het resultaat." })
    ]
  });
}

/* ------------------------------ Sudoku-oplosser ------------------------------ */

const SUDOKU_PUZZLE = [
  5, 3, 0, 0, 7, 0, 0, 0, 0,
  6, 0, 0, 1, 9, 5, 0, 0, 0,
  0, 9, 8, 0, 0, 0, 0, 6, 0,
  8, 0, 0, 0, 6, 0, 0, 0, 3,
  4, 0, 0, 8, 0, 3, 0, 0, 1,
  7, 0, 0, 0, 2, 0, 0, 0, 6,
  0, 6, 0, 0, 0, 0, 2, 8, 0,
  0, 0, 0, 4, 1, 9, 0, 0, 5,
  0, 0, 0, 0, 8, 0, 0, 7, 9
];

function sudokuPreview(idea) {
  const grid = h("div", { class: "pv-sudoku" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar om op te lossen" });
  let board = [...SUDOKU_PUZZLE];
  let solved = false;

  function render() {
    grid.replaceChildren(
      ...board.map((value, index) =>
        h("span", { class: `pv-sudoku-cell${SUDOKU_PUZZLE[index] ? " fixed" : ""}${index % 9 === 2 || index % 9 === 5 ? " br" : ""}${Math.floor(index / 9) === 2 || Math.floor(index / 9) === 5 ? " bb" : ""}` }, value || "")
      )
    );
  }

  function valid(index, value) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    for (let i = 0; i < 9; i += 1) {
      if (board[row * 9 + i] === value) return false;
      if (board[i * 9 + col] === value) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (board[(boxRow + r) * 9 + boxCol + c] === value) return false;
      }
    }
    return true;
  }

  function solve(position = 0) {
    if (position >= 81) return true;
    if (board[position]) return solve(position + 1);
    for (let value = 1; value <= 9; value += 1) {
      if (valid(position, value)) {
        board[position] = value;
        if (solve(position + 1)) return true;
        board[position] = 0;
      }
    }
    return false;
  }

  function run() {
    if (solved) {
      board = [...SUDOKU_PUZZLE];
      solved = false;
      stateEl.textContent = "Klaar om op te lossen";
      stateEl.className = "pv-state";
      render();
      return;
    }
    board = [...SUDOKU_PUZZLE];
    const ok = solve(0);
    solved = ok;
    stateEl.textContent = ok ? "Opgelost! ✓" : "Geen oplossing";
    stateEl.className = ok ? "pv-state good" : "pv-state warn";
    render();
  }

  render();

  return frame(idea, {
    theme: "data",
    label: "Algoritme",
    body: [
      h("div", { class: "pv-row pv-between" }, stateEl, btn("✨ Oplossen", run, "pv-btn-primary")),
      grid,
      h("p", { class: "pv-hint", text: "Backtracking vult het bord vakje voor vakje." })
    ]
  });
}

/* ------------------------------ Budget-tracker ------------------------------ */

function budgetPreview(idea) {
  const list = h("div", { class: "pv-budget-list" });
  const totalEl = h("strong", { class: "pv-budget-total", text: "€ 0" });
  const chart = h("div", { class: "pv-budget-chart" });
  const nameInput = input({ type: "text", placeholder: "Wat?", "aria-label": "Omschrijving" });
  const amountInput = input({ type: "number", placeholder: "€", step: "0.01", "aria-label": "Bedrag" });
  let items = [
    { name: "Boodschappen", amount: -42.5 },
    { name: "Zakgeld", amount: 25 },
    { name: "Bioscoop", amount: -12 }
  ];

  function render() {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    totalEl.textContent = `€ ${total.toFixed(2).replace(".", ",")}`;
    totalEl.className = `pv-budget-total ${total < 0 ? "bad" : "good"}`;
    list.replaceChildren(
      ...items.map((item, index) =>
        h("div", { class: "pv-budget-item" },
          h("span", { text: item.name }),
          h("strong", { class: item.amount < 0 ? "bad" : "good", text: `${item.amount < 0 ? "−" : "+"} € ${Math.abs(item.amount).toFixed(2).replace(".", ",")}` }),
          h("button", { type: "button", "aria-label": "Verwijderen", onclick: () => { items.splice(index, 1); render(); } }, "×")
        )
      )
    );
    const max = Math.max(1, ...items.map((item) => Math.abs(item.amount)));
    chart.replaceChildren(
      ...items.slice(0, 6).map((item) =>
        h("div", { class: "pv-budget-bar" }, h("i", { class: item.amount < 0 ? "neg" : "pos", style: { height: `${(Math.abs(item.amount) / max) * 100}%` } }), h("span", { text: item.name.slice(0, 3) }))
      )
    );
  }

  function add() {
    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    if (!name || !Number.isFinite(amount) || amount === 0) return;
    items.push({ name, amount });
    nameInput.value = "";
    amountInput.value = "";
    render();
  }

  render();

  return frame(idea, {
    theme: "data",
    label: "Overzicht",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-state", text: "Saldo" }), totalEl),
      h("div", { class: "pv-budget-main" }, list, chart),
      h("div", { class: "pv-row pv-gap" }, nameInput, amountInput, btn("＋", add, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Voeg inkomsten (positief) of uitgaven (negatief) toe." })
    ]
  });
}

/* ------------------------------ Sentiment-analyse ------------------------------ */

function sentimentPreview(idea) {
  const area = textarea({ rows: "5" });
  area.value = "Ik ben zo blij met dit project! Het werkt fantastisch en het is super leuk.";
  const meter = h("i");
  const scoreEl = h("strong", { class: "pv-sentiment-score", text: "0" });
  const labelEl = h("span", { class: "pv-state", text: "Neutraal" });
  const bar = h("div", { class: "pv-sentiment-bar" }, meter);

  const positive = ["blij", "goed", "geweldig", "fantastisch", "leuk", "super", "mooi", "top", "lief", "gewonnen", "trots", "heerlijk", "perfect", "snel"];
  const negative = ["slecht", "stom", "vervelend", "verdrietig", "boos", "fout", "moeilijk", "lelijk", "haat", "bang", "traag", "kapot", "helaas"];

  function analyse() {
    const words = area.value.toLowerCase().match(/[a-zà-ÿ]+/g) || [];
    let score = 0;
    words.forEach((word) => {
      if (positive.includes(word)) score += 1;
      if (negative.includes(word)) score -= 1;
    });
    const max = Math.max(1, words.length / 2);
    const pct = Math.max(-100, Math.min(100, Math.round((score / max) * 100)));
    scoreEl.textContent = String(score);
    meter.style.left = `${50 + pct / 2}%`;
    if (score > 0) {
      labelEl.textContent = "Positief 😊";
      labelEl.className = "pv-state good";
    } else if (score < 0) {
      labelEl.textContent = "Negatief 😟";
      labelEl.className = "pv-state warn";
    } else {
      labelEl.textContent = "Neutraal 😐";
      labelEl.className = "pv-state";
    }
  }

  area.addEventListener("input", analyse);
  analyse();

  return frame(idea, {
    theme: "data",
    label: "AI",
    body: [
      area,
      h("div", { class: "pv-sentiment" }, h("span", { text: "Negatief" }), bar, h("span", { text: "Positief" })),
      h("div", { class: "pv-row pv-between" }, labelEl, h("span", { class: "pv-score" }, "Score ", scoreEl)),
      h("p", { class: "pv-hint", text: "De demo telt positieve en negatieve woorden. Echte AI gebruikt een model." })
    ]
  });
}

/* ------------------------------ Lineaire regressie ------------------------------ */

function regressionPreview(idea) {
  const c = canvas(420, 230, "pv-regression");
  const g = ctx2d(c);
  const formulaEl = h("strong", { text: "" });
  let points = [];

  function generate() {
    points = Array.from({ length: 22 }, () => {
      const x = 20 + Math.random() * 380;
      const y = 190 - x * 0.32 + (Math.random() - 0.5) * 55;
      return { x, y: Math.max(16, Math.min(214, y)) };
    });
    draw();
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "rgba(126,226,184,.12)";
    for (let i = 1; i < 6; i += 1) {
      g.beginPath(); g.moveTo(0, i * 38); g.lineTo(c.width, i * 38); g.stroke();
    }
    const n = points.length;
    const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
    const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;
    let num = 0;
    let den = 0;
    points.forEach((p) => {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) ** 2;
    });
    const slope = num / den;
    const intercept = meanY - slope * meanX;
    g.strokeStyle = "#e8c47c";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(0, intercept);
    g.lineTo(c.width, intercept + slope * c.width);
    g.stroke();
    points.forEach((p) => {
      g.fillStyle = "#7ee2b8";
      g.beginPath();
      g.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
      g.fill();
    });
    formulaEl.textContent = `y = ${slope.toFixed(2)}x + ${intercept.toFixed(1)}`;
  }

  generate();

  return frame(idea, {
    theme: "data",
    label: "AI",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Model ", formulaEl), btn("🎲 Nieuwe data", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "De lijn wordt berekend met de kleinste-kwadratenmethode." })
    ]
  });
}

/* ------------------------------ Chatbot ------------------------------ */

function chatbotPreview(idea) {
  const log = h("div", { class: "pv-chat-log" });
  const inputEl = input({ type: "text", placeholder: "Typ een bericht…", "aria-label": "Bericht" });

  const replies = [
    { keys: ["hallo", "hoi", "hey"], reply: "Hoi! Waar kan ik je mee helpen?" },
    { keys: ["python", "code"], reply: "Python is een geweldige taal om mee te beginnen. Probeer eens print('Hallo!')." },
    { keys: ["project", "idee"], reply: "Er staan 161 projecten op EasyCodey. Begin met Snake of Raad het getal!" },
    { keys: ["snake", "spel"], reply: "Snake maak je met pygame. Je bestuurt de slang met de pijltjestoetsen." },
    { keys: ["fout", "error"], reply: "Lees de foutmelding van onder naar boven. Vaak staat de oplossing in de laatste regel." },
    { keys: ["bedankt", "thanks"], reply: "Graag gedaan! Veel plezier met programmeren. 🐍" }
  ];

  function add(text, who) {
    log.append(h("div", { class: `pv-chat-msg ${who}` }, h("span", { text: who === "bot" ? "🤖" : "🧑" }), h("p", { text })));
    log.scrollTop = log.scrollHeight;
  }

  function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    add(text, "user");
    inputEl.value = "";
    const lower = text.toLowerCase();
    const match = replies.find((item) => item.keys.some((key) => lower.includes(key)));
    window.setTimeout(() => {
      add(match ? match.reply : "Dat snap ik nog niet helemaal. Probeer iets over Python, een project of een foutmelding.", "bot");
    }, 450);
  }

  inputEl.addEventListener("keydown", (event) => { if (event.key === "Enter") send(); });
  add("Hoi! Ik ben de EasyCodey-coach. Vraag me iets over Python.", "bot");

  return frame(idea, {
    theme: "data",
    label: "Chatbot",
    body: [
      log,
      h("div", { class: "pv-row pv-gap" }, inputEl, btn("Stuur", send, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Dit is een regelgebaseerde chatbot: hij zoekt herkende woorden." })
    ]
  });
}

/* ------------------------------ Priemgetallen ------------------------------ */

function primesPreview(idea) {
  const limitInput = input({ type: "number", min: "10", max: "500", value: "100", "aria-label": "Tot welk getal" });
  const grid = h("div", { class: "pv-prime-grid" });
  const countEl = h("strong", { text: "0" });

  function generate() {
    const limit = Math.max(10, Math.min(500, Number(limitInput.value) || 100));
    const sieve = Array(limit + 1).fill(true);
    sieve[0] = sieve[1] = false;
    for (let i = 2; i * i <= limit; i += 1) {
      if (!sieve[i]) continue;
      for (let j = i * i; j <= limit; j += i) sieve[j] = false;
    }
    const primes = [];
    for (let i = 2; i <= limit; i += 1) if (sieve[i]) primes.push(i);
    countEl.textContent = String(primes.length);
    grid.replaceChildren(...primes.map((prime) => h("span", { class: "pv-prime", text: String(prime) })));
  }

  limitInput.addEventListener("input", generate);
  generate();

  return frame(idea, {
    theme: "science",
    label: "Wiskunde",
    body: [
      h("div", { class: "pv-row pv-between" }, field("Priemgetallen tot", limitInput), h("span", { class: "pv-score" }, "Gevonden ", countEl)),
      grid,
      h("p", { class: "pv-hint", text: "De zeef van Eratosthenes streept veelvouden weg." })
    ]
  });
}

/* ------------------------------ Fibonacci ------------------------------ */

function fibonacciPreview(idea) {
  const range = input({ type: "range", min: "5", max: "30", value: "12", "aria-label": "Aantal getallen" });
  const countEl = h("strong", { text: "12" });
  const list = h("div", { class: "pv-fib-list" });
  const ratioEl = h("strong", { text: "–" });
  const spiral = canvas(240, 150, "pv-fib-spiral");
  const g = ctx2d(spiral);

  function generate() {
    const n = Number(range.value);
    countEl.textContent = String(n);
    const values = [0, 1];
    while (values.length < n) values.push(values[values.length - 1] + values[values.length - 2]);
    const shown = values.slice(0, n);
    list.replaceChildren(...shown.map((value) => h("span", { class: "pv-fib", text: String(value) })));
    ratioEl.textContent = shown.length > 2 ? (shown[shown.length - 1] / shown[shown.length - 2]).toFixed(5) : "–";
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, spiral.width, spiral.height);
    g.strokeStyle = "#7ee2b8";
    g.lineWidth = 1.6;
    g.beginPath();
    for (let i = 0; i < 220; i += 1) {
      const angle = i * 0.22;
      const radius = 2 + angle * 2.2;
      const x = spiral.width / 2 + Math.cos(angle) * radius;
      const y = spiral.height / 2 + Math.sin(angle) * radius * 0.62;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }

  range.addEventListener("input", generate);
  generate();

  return frame(idea, {
    theme: "science",
    label: "Wiskunde",
    body: [
      h("div", { class: "pv-row pv-between" }, field("Aantal getallen", range), countEl),
      list,
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Gulden snede ≈ ", ratioEl), h("span", { class: "pv-state", text: "1,61803…" })),
      h("div", { class: "pv-canvas-wrap" }, spiral),
      h("p", { class: "pv-hint", text: "Elke volgende waarde is de som van de twee vorige." })
    ]
  });
}

/* ------------------------------ Mandelbrot ------------------------------ */

function mandelbrotPreview(idea) {
  const c = canvas(360, 240, "pv-mandelbrot");
  const g = ctx2d(c);
  const stateEl = h("span", { class: "pv-state", text: "Zoom 1×" });
  let zoom = 1;
  let centerX = -0.6;
  let centerY = 0;

  function render() {
    const width = c.width;
    const height = c.height;
    const image = g.createImageData(width, height);
    const scale = 3.2 / zoom;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const cr = centerX + (x / width - 0.5) * scale;
        const ci = centerY + (y / height - 0.5) * scale * (height / width);
        let zr = 0;
        let zi = 0;
        let iteration = 0;
        while (zr * zr + zi * zi < 4 && iteration < 60) {
          const temp = zr * zr - zi * zi + cr;
          zi = 2 * zr * zi + ci;
          zr = temp;
          iteration += 1;
        }
        const index = (y * width + x) * 4;
        if (iteration === 60) {
          image.data[index] = 8;
          image.data[index + 1] = 18;
          image.data[index + 2] = 14;
        } else {
          const t = iteration / 60;
          image.data[index] = Math.round(20 + t * 230);
          image.data[index + 1] = Math.round(70 + (1 - t) * 150);
          image.data[index + 2] = Math.round(80 + t * 60);
        }
        image.data[index + 3] = 255;
      }
    }
    g.putImageData(image, 0, 0);
    stateEl.textContent = `Zoom ${zoom.toFixed(0)}×`;
  }

  function zoomIn() {
    zoom = Math.min(zoom * 2.2, 400);
    render();
  }

  function reset() {
    zoom = 1;
    centerX = -0.6;
    centerY = 0;
    render();
  }

  c.addEventListener("click", (event) => {
    const rect = c.getBoundingClientRect();
    const scale = 3.2 / zoom;
    centerX += ((event.clientX - rect.left) / rect.width - 0.5) * scale;
    centerY += ((event.clientY - rect.top) / rect.height - 0.5) * scale * (c.height / c.width);
    zoom = Math.min(zoom * 2, 400);
    render();
  });

  render();

  return frame(idea, {
    theme: "science",
    label: "Fractal",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, stateEl, h("div", { class: "pv-row pv-gap" }, btn("＋ Zoom", zoomIn, "pv-btn-primary"), btn("↻ Reset", reset, "pv-btn-ghost"))),
      h("p", { class: "pv-hint", text: "Klik in de figuur om in te zoomen op een detail." })
    ]
  });
}

/* ------------------------------ Planeten ------------------------------ */

function planetsPreview(idea) {
  const c = canvas(420, 240, "pv-planets");
  const g = ctx2d(c);
  const planets = [
    { radius: 38, size: 4, speed: 1.7, color: "#c9c2b4" },
    { radius: 58, size: 6, speed: 1.2, color: "#e8c47c" },
    { radius: 82, size: 7, speed: 0.9, color: "#8ab4ff" },
    { radius: 108, size: 5, speed: 0.7, color: "#ff8a6b" },
    { radius: 132, size: 10, speed: 0.5, color: "#d8a7ff" }
  ];
  let t = 0;
  let paused = false;

  loopWhile(c, () => {
    if (!paused) t += 0.012;
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#e8c47c";
    g.beginPath();
    g.arc(c.width / 2, c.height / 2, 14, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(126,226,184,.14)";
    planets.forEach((planet) => {
      g.beginPath();
      g.arc(c.width / 2, c.height / 2, planet.radius, 0, Math.PI * 2);
      g.stroke();
      const angle = t * planet.speed;
      const x = c.width / 2 + Math.cos(angle) * planet.radius;
      const y = c.height / 2 + Math.sin(angle) * planet.radius * 0.55;
      g.fillStyle = planet.color;
      g.beginPath();
      g.arc(x, y, planet.size, 0, Math.PI * 2);
      g.fill();
    });
  });

  return frame(idea, {
    theme: "science",
    label: "Simulatie",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-center" }, btn("⏸ Pauze", () => { paused = !paused; }, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "De planeten draaien met verschillende snelheden rond de zon." })
    ]
  });
}

/* ------------------------------ DNA-analyse ------------------------------ */

function dnaPreview(idea) {
  const sequenceInput = input({ type: "text", value: "ATGCGTACGTTAGC", "aria-label": "DNA-sequentie" });
  const originalEl = h("div", { class: "pv-dna-strand" });
  const complementEl = h("div", { class: "pv-dna-strand" });
  const rnaEl = h("div", { class: "pv-dna-strand" });
  const countEl = h("strong", { text: "" });
  const map = { A: "T", T: "A", C: "G", G: "C" };

  function render() {
    const sequence = (sequenceInput.value.toUpperCase().replace(/[^ATCG]/g, "") || "ATGC").slice(0, 40);
    originalEl.replaceChildren(...[...sequence].map((base) => h("span", { class: `pv-base b-${base}`, text: base })));
    complementEl.replaceChildren(...[...sequence].map((base) => h("span", { class: `pv-base b-${base}`, text: map[base] })));
    rnaEl.replaceChildren(...[...sequence].map((base) => h("span", { class: `pv-base b-${base}`, text: base === "T" ? "U" : base })));
    const gc = [...sequence].filter((base) => base === "G" || base === "C").length;
    countEl.textContent = `${sequence.length} basen · GC ${Math.round((gc / sequence.length) * 100)}%`;
  }

  sequenceInput.addEventListener("input", render);
  render();

  return frame(idea, {
    theme: "science",
    label: "Biologie",
    body: [
      field("DNA-sequentie", sequenceInput),
      h("div", { class: "pv-dna" }, h("span", { class: "pv-state", text: "Origineel" }), originalEl, h("span", { class: "pv-state", text: "Complement" }), complementEl, h("span", { class: "pv-state", text: "RNA" }), rnaEl),
      h("div", { class: "pv-row pv-between" }, countEl, btn("↻ Voorbeeld", () => { sequenceInput.value = "ATGCGTACGTTAGC"; render(); }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "A paart met T, C met G. Bij RNA wordt T vervangen door U." })
    ]
  });
}

/* ------------------------------ Temperatuurgrafiek ------------------------------ */

function temperaturePreview(idea) {
  const c = canvas(420, 220, "pv-temp-chart");
  const g = ctx2d(c);
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  let temps = [];

  function generate() {
    temps = months.map((_, index) => Math.round(4 + Math.sin((index / 12) * Math.PI * 2 - 1.4) * 11 + Math.random() * 3));
    draw();
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    const min = Math.min(...temps) - 2;
    const max = Math.max(...temps) + 2;
    const pad = 24;
    g.strokeStyle = "rgba(126,226,184,.12)";
    for (let i = 0; i <= 4; i += 1) {
      const y = pad + (i / 4) * (c.height - pad * 2);
      g.beginPath();
      g.moveTo(pad, y);
      g.lineTo(c.width - pad, y);
      g.stroke();
    }
    g.strokeStyle = "#e8c47c";
    g.lineWidth = 2.4;
    g.beginPath();
    temps.forEach((temp, index) => {
      const x = pad + (index / (temps.length - 1)) * (c.width - pad * 2);
      const y = c.height - pad - ((temp - min) / (max - min)) * (c.height - pad * 2);
      if (index === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.stroke();
    temps.forEach((temp, index) => {
      const x = pad + (index / (temps.length - 1)) * (c.width - pad * 2);
      const y = c.height - pad - ((temp - min) / (max - min)) * (c.height - pad * 2);
      g.fillStyle = "#7ee2b8";
      g.beginPath();
      g.arc(x, y, 3.2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#b9c9c2";
      g.font = "10px 'Plus Jakarta Sans', sans-serif";
      g.textAlign = "center";
      g.fillText(months[index], x, c.height - 7);
    });
  }

  generate();

  return frame(idea, {
    theme: "science",
    label: "Grafiek",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-center" }, btn("🎲 Nieuwe metingen", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Gemiddelde temperatuur per maand, getekend met matplotlib-stijl." })
    ]
  });
}

/* ------------------------------ Statistiek ------------------------------ */

function statisticsPreview(idea) {
  const area = textarea({ rows: "3" });
  area.value = "12, 15, 11, 18, 14, 16, 13, 19";
  const meanEl = h("strong", { text: "–" });
  const medianEl = h("strong", { text: "–" });
  const minEl = h("strong", { text: "–" });
  const maxEl = h("strong", { text: "–" });
  const stdEl = h("strong", { text: "–" });

  function calc() {
    const values = area.value.split(/[^0-9.,-]+/).map((value) => Number(value.replace(",", "."))).filter((value) => Number.isFinite(value));
    if (!values.length) return;
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    meanEl.textContent = mean.toFixed(2).replace(".", ",");
    medianEl.textContent = median.toFixed(2).replace(".", ",");
    minEl.textContent = String(sorted[0]).replace(".", ",");
    maxEl.textContent = String(sorted[sorted.length - 1]).replace(".", ",");
    stdEl.textContent = Math.sqrt(variance).toFixed(2).replace(".", ",");
  }

  area.addEventListener("input", calc);
  calc();

  return frame(idea, {
    theme: "science",
    label: "Statistiek",
    body: [
      field("Getallen (komma of spatie)", area),
      h("div", { class: "pv-stats" }, h("div", { class: "pv-stat" }, meanEl, h("span", { text: "gemiddelde" })), h("div", { class: "pv-stat" }, medianEl, h("span", { text: "mediaan" })), h("div", { class: "pv-stat" }, minEl, h("span", { text: "minimum" })), h("div", { class: "pv-stat" }, maxEl, h("span", { text: "maximum" })), h("div", { class: "pv-stat" }, stdEl, h("span", { text: "std.afwijking" }))),
      h("p", { class: "pv-hint", text: "De waarden worden live herberekend." })
    ]
  });
}

/* ------------------------------ Periodiek systeem ------------------------------ */

const ELEMENTS = [
  ["H", "Waterstof", 1.008], ["He", "Helium", 4.003], ["Li", "Lithium", 6.94], ["Be", "Beryllium", 9.012],
  ["B", "Boor", 10.81], ["C", "Koolstof", 12.011], ["N", "Stikstof", 14.007], ["O", "Zuurstof", 15.999],
  ["F", "Fluor", 18.998], ["Ne", "Neon", 20.18], ["Na", "Natrium", 22.99], ["Mg", "Magnesium", 24.305],
  ["Al", "Aluminium", 26.982], ["Si", "Silicium", 28.085], ["P", "Fosfor", 30.974], ["S", "Zwavel", 32.06],
  ["Cl", "Chloor", 35.45], ["Ar", "Argon", 39.948], ["K", "Kalium", 39.098], ["Ca", "Calcium", 40.078]
];

function periodicPreview(idea) {
  const grid = h("div", { class: "pv-periodic" });
  const detail = h("div", { class: "pv-element-detail" }, h("strong", { text: "Kies een element" }), h("span", { text: "Klik op een vakje voor meer info." }));

  ELEMENTS.forEach(([symbol, name, mass], index) => {
    grid.append(
      h("button", { type: "button", class: "pv-element", onclick: () => {
        detail.replaceChildren(h("strong", { text: `${symbol} — ${name}` }), h("span", { text: `Atoomnummer ${index + 1} · atoommassa ${mass} u` }));
        grid.querySelectorAll(".pv-element").forEach((element, elementIndex) => element.classList.toggle("active", elementIndex === index));
      } },
        h("span", { class: "pv-element-num", text: String(index + 1) }),
        h("strong", { text: symbol }),
        h("span", { class: "pv-element-name", text: name })
      )
    );
  });

  return frame(idea, {
    theme: "science",
    label: "Chemie",
    body: [grid, detail, h("p", { class: "pv-hint", text: "De eerste 20 elementen van het periodiek systeem." })]
  });
}

/* ------------------------------ pH-simulator ------------------------------ */

function phPreview(idea) {
  const slider = input({ type: "range", min: "0", max: "14", step: "0.1", value: "7", "aria-label": "pH-waarde" });
  const valueEl = h("strong", { class: "pv-ph-value", text: "7,0" });
  const labelEl = h("span", { class: "pv-state", text: "Neutraal" });
  const liquid = h("div", { class: "pv-ph-liquid" });
  const exampleEl = h("p", { class: "pv-hint", text: "Puur water heeft pH 7." });

  function update() {
    const ph = Number(slider.value);
    valueEl.textContent = ph.toFixed(1).replace(".", ",");
    const hue = 200 - ph * 12;
    liquid.style.background = `linear-gradient(180deg, hsl(${Math.max(0, hue)}, 70%, 52%), hsl(${Math.max(0, hue)}, 70%, 38%))`;
    if (ph < 3) {
      labelEl.textContent = "Sterk zuur";
      exampleEl.textContent = "Citroensap of maagzuur zit hier in de buurt.";
    } else if (ph < 7) {
      labelEl.textContent = "Zwak zuur";
      exampleEl.textContent = "Koffie en melk zijn licht zuur.";
    } else if (ph === 7) {
      labelEl.textContent = "Neutraal";
      exampleEl.textContent = "Puur water heeft pH 7.";
    } else if (ph < 11) {
      labelEl.textContent = "Zwak basisch";
      exampleEl.textContent = "Zeep en baking soda zijn basisch.";
    } else {
      labelEl.textContent = "Sterk basisch";
      exampleEl.textContent = "Bleekmiddel heeft een hoge pH.";
    }
  }

  slider.addEventListener("input", update);
  update();

  return frame(idea, {
    theme: "science",
    label: "Chemie",
    body: [
      h("div", { class: "pv-ph" }, h("div", { class: "pv-ph-beaker" }, liquid), h("div", { class: "pv-ph-info" }, valueEl, labelEl, exampleEl)),
      slider,
      h("div", { class: "pv-ph-scale" }, h("span", { text: "0 · zuur" }), h("span", { text: "7 · neutraal" }), h("span", { text: "14 · basisch" }))
    ]
  });
}

/* ------------------------------ Projectielbaan ------------------------------ */

function projectilePreview(idea) {
  const c = canvas(420, 230, "pv-projectile");
  const g = ctx2d(c);
  const angle = input({ type: "range", min: "10", max: "80", value: "45", "aria-label": "Hoek" });
  const speed = input({ type: "range", min: "10", max: "60", value: "38", "aria-label": "Snelheid" });
  const angleEl = h("strong", { text: "45°" });
  const speedEl = h("strong", { text: "38 m/s" });
  let path = [];

  function calculate() {
    const radians = (Number(angle.value) * Math.PI) / 180;
    const v = Number(speed.value);
    const gravity = 9.81;
    const vx = Math.cos(radians) * v;
    const vy = Math.sin(radians) * v;
    const flight = (2 * vy) / gravity;
    path = [];
    for (let i = 0; i <= 60; i += 1) {
      const t = (i / 60) * flight;
      path.push({ x: vx * t, y: vy * t - 0.5 * gravity * t * t });
    }
    draw();
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    const maxX = Math.max(...path.map((point) => point.x), 1);
    const maxY = Math.max(...path.map((point) => point.y), 1);
    g.strokeStyle = "rgba(126,226,184,.15)";
    g.beginPath();
    g.moveTo(0, c.height - 20);
    g.lineTo(c.width, c.height - 20);
    g.stroke();
    g.strokeStyle = "#e8c47c";
    g.lineWidth = 2.4;
    g.beginPath();
    path.forEach((point, index) => {
      const x = 12 + (point.x / maxX) * (c.width - 24);
      const y = c.height - 20 - (point.y / maxY) * (c.height - 40);
      if (index === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.stroke();
    const last = path[path.length - 1];
    if (last) {
      g.fillStyle = "#7ee2b8";
      g.beginPath();
      g.arc(12 + (last.x / maxX) * (c.width - 24), c.height - 20 - (last.y / maxY) * (c.height - 40), 4, 0, Math.PI * 2);
      g.fill();
    }
  }

  angle.addEventListener("input", () => { angleEl.textContent = `${angle.value}°`; calculate(); });
  speed.addEventListener("input", () => { speedEl.textContent = `${speed.value} m/s`; calculate(); });
  calculate();

  return frame(idea, {
    theme: "science",
    label: "Natuurkunde",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Hoek ", angleEl), h("span", { class: "pv-score" }, "Snelheid ", speedEl)),
      h("div", { class: "pv-row pv-gap" }, field("Hoek", angle), field("Snelheid", speed)),
      h("p", { class: "pv-hint", text: "Sleep aan de schuifjes en zie de baan veranderen." })
    ]
  });
}

/* ------------------------------ Wachtwoordsterkte ------------------------------ */

function passwordStrengthPreview(idea) {
  const inputEl = input({ type: "text", value: "EasyCodey2026!", "aria-label": "Wachtwoord" });
  const bar = h("div", { class: "pv-strength-bar" }, h("i"));
  const scoreEl = h("strong", { text: "Sterk" });
  const tipsEl = h("ul", { class: "pv-tips" });

  function score(value) {
    let points = 0;
    if (value.length >= 8) points += 1;
    if (value.length >= 14) points += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) points += 1;
    if (/\d/.test(value)) points += 1;
    if (/[^A-Za-z0-9]/.test(value)) points += 1;
    return Math.min(points, 5);
  }

  function update() {
    const value = inputEl.value;
    const points = score(value);
    const labels = ["Zeer zwak", "Zwak", "Matig", "Goed", "Sterk", "Zeer sterk"];
    scoreEl.textContent = labels[points];
    bar.firstChild.style.width = `${(points / 5) * 100}%`;
    bar.firstChild.className = points < 2 ? "bad" : points < 4 ? "warn" : "good";
    const tips = [];
    if (value.length < 12) tips.push("Gebruik minstens 12 tekens.");
    if (!/[A-Z]/.test(value)) tips.push("Voeg een hoofdletter toe.");
    if (!/\d/.test(value)) tips.push("Voeg een cijfer toe.");
    if (!/[^A-Za-z0-9]/.test(value)) tips.push("Voeg een symbool toe.");
    if (!tips.length) tips.push("Sterk wachtwoord! Bewaar het veilig.");
    tipsEl.replaceChildren(...tips.map((tip) => h("li", { text: tip })));
  }

  inputEl.addEventListener("input", update);
  update();

  return frame(idea, {
    theme: "security",
    label: "Security",
    body: [
      field("Test een wachtwoord", inputEl),
      h("div", { class: "pv-strength" }, bar, scoreEl),
      tipsEl,
      h("p", { class: "pv-hint", text: "Deze demo blijft volledig in je browser. Er wordt niets verstuurd." })
    ]
  });
}

/* ------------------------------ Caesar-vercijfering ------------------------------ */

function caesarPreview(idea) {
  const textInput = input({ type: "text", value: "Hallo EasyCodey", "aria-label": "Tekst" });
  const shiftInput = input({ type: "range", min: "1", max: "25", value: "3", "aria-label": "Verschuiving" });
  const shiftEl = h("strong", { text: "3" });
  const output = h("code", { class: "pv-caesar-output", text: "" });
  let encode = true;

  function shift(value, amount) {
    return value.replace(/[a-z]/gi, (char) => {
      const base = char === char.toLowerCase() ? 97 : 65;
      return String.fromCharCode(((char.charCodeAt(0) - base + amount + 26) % 26) + base);
    });
  }

  function update() {
    const amount = Number(shiftInput.value) * (encode ? 1 : -1);
    output.textContent = shift(textInput.value, amount);
    shiftEl.textContent = shiftInput.value;
  }

  textInput.addEventListener("input", update);
  shiftInput.addEventListener("input", update);

  const toggle = btn("🔁 Ontcijferen", () => {
    encode = !encode;
    toggle.textContent = encode ? "🔁 Ontcijferen" : "🔁 Vercijferen";
    update();
  }, "pv-btn-ghost");

  update();

  return frame(idea, {
    theme: "security",
    label: "Security",
    body: [
      field("Tekst", textInput),
      h("div", { class: "pv-row pv-between" }, h("span", { text: "Verschuiving" }), shiftEl),
      shiftInput,
      h("div", { class: "pv-tool-result" }, h("span", { class: "pv-state", text: "Resultaat" }), output),
      h("div", { class: "pv-row pv-center" }, toggle),
      h("p", { class: "pv-hint", text: "Caesar verschuift elke letter. Probeer de tekst te ontcijferen." })
    ]
  });
}

/* ------------------------------ Hashes vergelijken ------------------------------ */

async function sha256(text) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const buffer = await window.crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0;
  return `demo-${(hash >>> 0).toString(16)}`;
}

function hashComparePreview(idea) {
  const first = input({ type: "text", value: "EasyCodey", "aria-label": "Eerste tekst" });
  const second = input({ type: "text", value: "EasyCodey", "aria-label": "Tweede tekst" });
  const firstHash = h("code", { class: "pv-hash", text: "…" });
  const secondHash = h("code", { class: "pv-hash", text: "…" });
  const resultEl = h("span", { class: "pv-state", text: "Vergelijk de hashes" });

  async function compare() {
    const [a, b] = await Promise.all([sha256(first.value), sha256(second.value)]);
    firstHash.textContent = a;
    secondHash.textContent = b;
    if (a === b) {
      resultEl.textContent = "De hashes zijn gelijk ✓";
      resultEl.className = "pv-state good";
    } else {
      resultEl.textContent = "De hashes verschillen ✗";
      resultEl.className = "pv-state warn";
    }
  }

  [first, second].forEach((element) => element.addEventListener("input", compare));
  compare();

  return frame(idea, {
    theme: "security",
    label: "Security",
    body: [
      field("Tekst 1", first),
      firstHash,
      field("Tekst 2", second),
      secondHash,
      h("div", { class: "pv-row pv-between" }, resultEl, btn("Vergelijk", compare, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Een hash is een vingerafdruk van tekst. Eén letter verschil geeft een andere hash." })
    ]
  });
}

/* ------------------------------ Phishing-quiz ------------------------------ */

const PHISHING_MAILS = [
  { from: "veiligheid@bank-verificatie.top", subject: "Dringend: je rekening wordt geblokkeerd", body: "Klik binnen 24 uur op deze link en vul je kaartnummer in.", phish: true, why: "Vreemde afzender, haast en vraag om kaartgegevens." },
  { from: "nieuwsbrief@easycodey.be", subject: "Nieuwe Python-projecten deze week", body: "Bekijk de nieuwe projecten op de website. Geen gegevens nodig.", phish: false, why: "Normale afzender en geen gevoelige gegevens." },
  { from: "support@paypa1.com", subject: "Je betaling is mislukt", body: "Log in via deze link om je account te herstellen.", phish: true, why: "De afzender lijkt op PayPal, maar met een '1' in plaats van 'l'." },
  { from: "leraar@school.be", subject: "Huiswerk voor vrijdag", body: "Vergeet je oefening niet. Je vindt ze op het leerplatform.", phish: false, why: "Bekende afzender en verwachte inhoud." }
];

function phishingPreview(idea) {
  let index = 0;
  let score = 0;
  const mailEl = h("div", { class: "pv-mail" });
  const resultEl = h("p", { class: "pv-feedback", text: "Verdacht of normaal?" });
  const scoreEl = h("strong", { text: "0" });

  function render() {
    if (index >= PHISHING_MAILS.length) {
      mailEl.replaceChildren(h("span", { class: "pv-mail-icon", text: score >= 3 ? "🏆" : "📬" }), h("strong", { text: `Klaar! ${score} / ${PHISHING_MAILS.length}` }), h("p", { text: score >= 3 ? "Je herkent phishing goed!" : "Oefen nog wat vaker." }), btn("↻ Opnieuw", () => { index = 0; score = 0; scoreEl.textContent = "0"; render(); }, "pv-btn-primary"));
      resultEl.textContent = "";
      return;
    }
    const mail = PHISHING_MAILS[index];
    mailEl.replaceChildren(
      h("div", { class: "pv-mail-head" }, h("span", { text: "✉️" }), h("div", {}, h("strong", { text: mail.subject }), h("span", { text: `Van: ${mail.from}` }))),
      h("p", { text: mail.body })
    );
    resultEl.textContent = "Verdacht of normaal?";
    resultEl.className = "pv-feedback";
  }

  function answer(phish) {
    const mail = PHISHING_MAILS[index];
    if (phish === mail.phish) {
      score += 1;
      scoreEl.textContent = String(score);
      resultEl.textContent = `Juist! ${mail.why}`;
      resultEl.className = "pv-feedback good";
    } else {
      resultEl.textContent = `Niet juist. ${mail.why}`;
      resultEl.className = "pv-feedback warn";
    }
    index += 1;
    window.setTimeout(render, 1300);
  }

  render();

  return frame(idea, {
    theme: "security",
    label: "Training",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-state", text: "Herken phishing" }), h("span", { class: "pv-score" }, "Score ", scoreEl)),
      mailEl,
      resultEl,
      h("div", { class: "pv-row pv-center pv-gap" }, btn("🚩 Verdacht", () => answer(true), "pv-btn-primary"), btn("✅ Normaal", () => answer(false), "pv-btn-primary"))
    ]
  });
}

/* ------------------------------ Logs maskeren ------------------------------ */

function logMaskPreview(idea) {
  const area = textarea({ rows: "5" });
  area.value = "2026-05-01 login van jan@example.com vanaf 192.168.1.24\n2026-05-01 betaling door piet@bedrijf.be, kaart 4111 1111 1111 1111\nBel +32 466 47 66 52 voor support.";
  const output = h("pre", { class: "pv-code-output" });
  const stateEl = h("span", { class: "pv-state", text: "Masker gevoelige data" });

  function mask() {
    const value = area.value
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[e-mail verborgen]")
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "[IP verborgen]")
      .replace(/\b(?:\d[ -]?){13,16}\b/g, "[kaart verborgen]")
      .replace(/(?:\+32|0)\s?\d{2,3}(?:\s?\d{2}){2,3}/g, "[telefoon verborgen]");
    output.textContent = value;
    stateEl.textContent = "Gemaskeerd ✓";
    stateEl.className = "pv-state good";
  }

  mask();

  return frame(idea, {
    theme: "security",
    label: "Security",
    body: [
      field("Logregels", area),
      h("div", { class: "pv-row pv-between" }, stateEl, btn("🛡 Maskeer", mask, "pv-btn-primary")),
      output,
      h("p", { class: "pv-hint", text: "Verwijder e-mails, IP's, kaartnummers en telefoonnummers uit logs." })
    ]
  });
}

/* ------------------------------ Veilige bestandsnaam ------------------------------ */

function safeFilenamePreview(idea) {
  const inputEl = input({ type: "text", value: "../../Mijn Foto (2026)!.JPG", "aria-label": "Bestandsnaam" });
  const output = h("code", { class: "pv-safe-name", text: "" });

  function clean() {
    const safe = inputEl.value
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^\.+/, "")
      .slice(0, 80) || "bestand";
    output.textContent = safe;
  }

  inputEl.addEventListener("input", clean);
  clean();

  return frame(idea, {
    theme: "security",
    label: "Security",
    body: [
      field("Onveilige naam", inputEl),
      h("div", { class: "pv-tool-result" }, h("span", { class: "pv-state", text: "Veilige naam" }), output),
      h("p", { class: "pv-hint", text: "Padtekens en rare symbolen worden verwijderd." })
    ]
  });
}

/* ------------------------------ Hash kraken (demo) ------------------------------ */

function hashCrackPreview(idea) {
  const words = ["python", "snake", "easycodey", "wachtwoord", "computer", "programmeren"];
  const target = pick(words);
  const hashEl = h("code", { class: "pv-hash", text: "berekenen…" });
  const progress = h("div", { class: "pv-progress" }, h("i"));
  const resultEl = h("span", { class: "pv-state", text: "Klaar om te proberen" });
  const list = h("div", { class: "pv-crack-list" });
  let running = false;

  sha256(target).then((hash) => { hashEl.textContent = hash; });

  function run() {
    if (running) return;
    running = true;
    resultEl.textContent = "Woordenlijst doorlopen…";
    resultEl.className = "pv-state";
    let index = 0;
    const timer = window.setInterval(async () => {
      if (!resultEl.isConnected) {
        window.clearInterval(timer);
        return;
      }
      if (index >= words.length) {
        window.clearInterval(timer);
        running = false;
        resultEl.textContent = `Gevonden: "${target}" ✓`;
        resultEl.className = "pv-state good";
        return;
      }
      const word = words[index];
      const hash = await sha256(word);
      const targetHash = await sha256(target);
      const match = hash === targetHash;
      list.prepend(h("div", { class: `pv-crack-row${match ? " match" : ""}` }, h("span", { text: word }), h("code", { text: hash.slice(0, 16) + "…" })));
      progress.firstChild.style.width = `${((index + 1) / words.length) * 100}%`;
      index += 1;
    }, 420);
  }

  return frame(idea, {
    theme: "security",
    label: "Demo",
    body: [
      h("div", { class: "pv-crack" }, h("span", { class: "pv-state", text: "Doel-hash" }), hashEl),
      progress,
      h("div", { class: "pv-row pv-between" }, resultEl, btn("▶ Start demo", run, "pv-btn-primary")),
      list,
      h("p", { class: "pv-hint", text: "Dit probeert alleen een kleine woordenlijst. Gebruik altijd lange, unieke wachtwoorden." })
    ]
  });
}

/* ------------------------------ Twee-factor demo ------------------------------ */

function twoFactorPreview(idea) {
  const codeEl = h("strong", { class: "pv-2fa-code", text: "------" });
  const ring = h("div", { class: "pv-2fa-ring" }, h("i"));
  const stateEl = h("span", { class: "pv-state", text: "Code verloopt over 30 s" });
  let left = 30;
  let timer = null;

  function code() {
    const step = Math.floor(Date.now() / 30000);
    let value = 0;
    for (let i = 0; i < 6; i += 1) value = (Math.imul(value, 31) + step + i * 17) >>> 0;
    return String(value % 1000000).padStart(6, "0");
  }

  function tick() {
    if (!codeEl.isConnected) {
      window.clearInterval(timer);
      timer = null;
      return;
    }
    const step = Math.floor(Date.now() / 1000) % 30;
    left = 30 - step;
    codeEl.textContent = code();
    stateEl.textContent = `Code verloopt over ${left} s`;
    ring.firstChild.style.width = `${(left / 30) * 100}%`;
  }

  tick();
  timer = window.setInterval(tick, 1000);

  return frame(idea, {
    theme: "security",
    label: "Security",
    body: [
      h("div", { class: "pv-2fa" }, h("span", { class: "pv-2fa-icon", text: "🔐" }), codeEl, ring, stateEl),
      h("p", { class: "pv-hint", text: "Een verificatiecode verandert elke 30 seconden. Dit is een demo, geen echte TOTP." })
    ]
  });
}

/* ------------------------------ Kleurenpalet ------------------------------ */

function palettePreview(idea) {
  const palette = h("div", { class: "pv-palette" });
  const stateEl = h("span", { class: "pv-state", text: "Klik op een kleur om te kopiëren" });

  function randomColor() {
    const hue = rnd(360);
    return `hsl(${hue}, ${55 + rnd(35)}%, ${40 + rnd(30)}%)`;
  }

  function hslToHex(value) {
    const match = value.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return value;
    const hDeg = Number(match[1]) / 360;
    const s = Number(match[2]) / 100;
    const l = Number(match[3]) / 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r;
    let g;
    let b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, hDeg + 1 / 3);
      g = hue2rgb(p, q, hDeg);
      b = hue2rgb(p, q, hDeg - 1 / 3);
    }
    return `#${[r, g, b].map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
  }

  async function generate() {
    const colors = Array.from({ length: 5 }, randomColor);
    palette.replaceChildren(
      ...colors.map((color) => {
        const hex = hslToHex(color);
        const swatch = h("button", { type: "button", class: "pv-palette-color", style: { background: color }, "aria-label": `Kleur ${hex}`, onclick: async () => {
          try {
            await navigator.clipboard.writeText(hex);
            stateEl.textContent = `${hex} gekopieerd ✓`;
          } catch (error) {
            stateEl.textContent = hex;
          }
        } }, h("span", { text: hex }));
        return swatch;
      })
    );
  }

  generate();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      palette,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("🎨 Genereer", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Elk palet krijgt vijf kleuren die bij elkaar passen." })
    ]
  });
}

/* ------------------------------ ASCII-kunst ------------------------------ */

function asciiPreview(idea) {
  const textInput = input({ type: "text", value: "EasyCodey", "aria-label": "Tekst" });
  const output = h("pre", { class: "pv-ascii" });
  const chars = " .:-=+*#%@";

  function render() {
    const off = document.createElement("canvas");
    off.width = 320;
    off.height = 110;
    const context = off.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, off.width, off.height);
    context.fillStyle = "#fff";
    context.font = "700 64px 'Plus Jakarta Sans', sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(textInput.value || "EasyCodey", off.width / 2, off.height / 2);
    const data = context.getImageData(0, 0, off.width, off.height).data;
    let result = "";
    const stepX = 4;
    const stepY = 8;
    for (let y = 0; y < off.height; y += stepY) {
      for (let x = 0; x < off.width; x += stepX) {
        const index = (y * off.width + x) * 4;
        const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3 / 255;
        result += chars[Math.min(chars.length - 1, Math.floor(brightness * chars.length))];
      }
      result += "\n";
    }
    output.textContent = result;
  }

  textInput.addEventListener("input", render);
  render();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      field("Tekst", textInput),
      output,
      h("p", { class: "pv-hint", text: "De tekst wordt omgezet in ASCII-tekens op basis van helderheid." })
    ]
  });
}

/* ------------------------------ Turtle-schilderij ------------------------------ */

function turtlePreview(idea) {
  const c = canvas(420, 240, "pv-turtle");
  const g = ctx2d(c);

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    const palette = ["#7ee2b8", "#e8c47c", "#ff8a6b", "#8ab4ff", "#d8a7ff"];
    let x = c.width / 2;
    let y = c.height / 2;
    let angle = 0;
    for (let i = 0; i < 240; i += 1) {
      g.strokeStyle = palette[i % palette.length];
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x, y);
      angle += 0.32;
      const length = 1 + i * 0.055;
      x += Math.cos(angle) * length;
      y += Math.sin(angle) * length;
      g.lineTo(x, y);
      g.stroke();
      if (x < 0 || y < 0 || x > c.width || y > c.height) {
        x = c.width / 2;
        y = c.height / 2;
      }
    }
  }

  draw();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-center" }, btn("🐢 Teken opnieuw", draw, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "De turtle draait en tekent tegelijk. Elke tekening is anders." })
    ]
  });
}

/* ------------------------------ Mozaïek ------------------------------ */

function mosaicPreview(idea) {
  const grid = h("div", { class: "pv-mosaic" });
  const palette = ["#145c4b", "#e8c47c", "#b85c3e", "#8ab4ff", "#d8a7ff", "#7ee2b8"];
  let cells = [];

  function generate() {
    cells = Array.from({ length: 100 }, () => pick(palette));
    render();
  }

  function render() {
    grid.replaceChildren(...cells.map((color, index) => h("button", { type: "button", class: "pv-mosaic-tile", style: { background: color }, "aria-label": `Tegel ${index + 1}`, onclick: () => { cells[index] = pick(palette); render(); } })));
  }

  generate();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      grid,
      h("div", { class: "pv-row pv-center" }, btn("🎲 Nieuw mozaïek", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Klik op een tegel om de kleur te veranderen." })
    ]
  });
}

/* ------------------------------ Fractal-kunst ------------------------------ */

function fractalPreview(idea) {
  const c = canvas(420, 240, "pv-fractal");
  const g = ctx2d(c);
  const hueInput = input({ type: "range", min: "0", max: "360", value: "160", "aria-label": "Kleurtint" });

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    const hue = Number(hueInput.value);
    function branch(x, y, angle, length, depth) {
      if (depth === 0 || length < 2) return;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      g.strokeStyle = `hsl(${(hue + depth * 18) % 360}, 70%, ${35 + depth * 4}%)`;
      g.lineWidth = Math.max(0.6, depth * 0.5);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x2, y2);
      g.stroke();
      branch(x2, y2, angle - 0.42, length * 0.72, depth - 1);
      branch(x2, y2, angle + 0.36, length * 0.68, depth - 1);
      if (depth > 3) branch(x2, y2, angle + 0.05, length * 0.5, depth - 2);
    }
    branch(c.width / 2, c.height - 10, -Math.PI / 2, 68, 9);
  }

  hueInput.addEventListener("input", draw);
  draw();

  return frame(idea, {
    theme: "art",
    label: "Fractal",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      field("Kleurtint", hueInput),
      h("p", { class: "pv-hint", text: "Een recursieve boom: elke tak splitst zich weer in tweeën." })
    ]
  });
}

/* ------------------------------ Pixel-art ------------------------------ */

function pixelPreview(idea) {
  const SIZE = 16;
  const grid = h("div", { class: "pv-pixel-grid" });
  const colorInput = input({ type: "color", value: "#e8c47c", class: "pv-color-input", "aria-label": "Penseelkleur" });
  let pixels = Array(SIZE * SIZE).fill("");
  let painting = false;

  function render() {
    grid.replaceChildren(...pixels.map((color, index) => h("button", { type: "button", class: "pv-pixel", style: { background: color || "transparent" }, "aria-label": `Pixel ${index + 1}`, onpointerdown: () => paint(index) })));
  }

  function paint(index) {
    pixels[index] = colorInput.value;
    render();
  }

  grid.addEventListener("pointerdown", () => { painting = true; });
  grid.addEventListener("pointerup", () => { painting = false; });
  grid.addEventListener("pointerleave", () => { painting = false; });
  grid.addEventListener("pointerover", (event) => {
    if (!painting) return;
    const index = [...grid.children].indexOf(event.target);
    if (index >= 0) paint(index);
  });

  render();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      h("div", { class: "pv-pixel-wrap" }, grid),
      h("div", { class: "pv-row pv-between" }, field("Kleur", colorInput), btn("🧹 Wissen", () => { pixels = Array(SIZE * SIZE).fill(""); render(); }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Klik of sleep over de vakjes om te tekenen." })
    ]
  });
}

/* ------------------------------ Gedichtengenerator ------------------------------ */

function poemPreview(idea) {
  const output = h("div", { class: "pv-poem" });
  const openers = ["In de stilte van de nacht", "Tussen regels code en licht", "De maan kijkt over mijn scherm", "Een slang glijdt door het groen", "De wereld wacht op één klik"];
  const middles = ["droom ik van een simpel plan", "groeit een idee stap voor stap", "tikt de tijd zachtjes verder", "zoek ik naar het juiste woord", "begint iets kleins te leven"];
  const closers = ["en alles valt op zijn plek.", "tot de code eindelijk werkt.", "een nieuw begin is genoeg.", "ik laat het los en glimlach.", "de toekomst begint vandaag."];

  function generate() {
    output.replaceChildren(
      h("p", { text: pick(openers) }),
      h("p", { text: pick(middles) }),
      h("p", { text: pick(closers) }),
      h("span", { class: "pv-poem-sign", text: "— EasyCodey" })
    );
  }

  generate();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      output,
      h("div", { class: "pv-row pv-center" }, btn("✨ Nieuw gedicht", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Combineert zinnen tot een klein gedicht." })
    ]
  });
}

/* ------------------------------ Poster-generator ------------------------------ */

function posterPreview(idea) {
  const titleInput = input({ type: "text", value: "Leer Python", "aria-label": "Titel" });
  const subtitleInput = input({ type: "text", value: "Met EasyCodey", "aria-label": "Ondertitel" });
  const palette = select(["Diepgroen", "Zonsondergang", "Nacht", "Citroen"], { "aria-label": "Kleurpalet" });
  const poster = h("div", { class: "pv-poster" });

  function render() {
    const themes = {
      Diepgroen: "linear-gradient(135deg,#0f3d31,#145c4b 55%,#e8c47c)",
      Zonsondergang: "linear-gradient(135deg,#3b1d3f,#b85c3e 60%,#f6c177)",
      Nacht: "linear-gradient(135deg,#0b1026,#1b2a5e 60%,#8ab4ff)",
      Citroen: "linear-gradient(135deg,#e8c47c,#f6e8c6 60%,#145c4b)"
    };
    poster.style.background = themes[palette.value];
    poster.replaceChildren(
      h("span", { class: "pv-poster-kicker", text: "EASYCODEY" }),
      h("strong", { class: "pv-poster-title", text: titleInput.value || "Titel" }),
      h("span", { class: "pv-poster-sub", text: subtitleInput.value || "Ondertitel" }),
      h("span", { class: "pv-poster-mark", text: "🐍" })
    );
  }

  [titleInput, subtitleInput].forEach((element) => element.addEventListener("input", render));
  palette.addEventListener("change", render);
  render();

  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      poster,
      h("div", { class: "pv-row pv-gap" }, field("Titel", titleInput), field("Ondertitel", subtitleInput), field("Palet", palette)),
      h("p", { class: "pv-hint", text: "Typ je eigen tekst en kies een kleurenpalet." })
    ]
  });
}

/* ------------------------------ Muziek-generator ------------------------------ */

function musicPreview(idea) {
  const notesEl = h("div", { class: "pv-notes" });
  const stateEl = h("span", { class: "pv-state", text: "Klik op Speel" });
  const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
  let context = null;

  function play() {
    try {
      context = context || new (window.AudioContext || window.webkitAudioContext)();
      const melody = Array.from({ length: 8 }, () => scale[rnd(scale.length)]);
      notesEl.replaceChildren(...melody.map((frequency, index) => h("span", { class: "pv-note", style: { animationDelay: `${index * 0.18}s` }, text: "♪" })));
      stateEl.textContent = "Bezig…";
      melody.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index % 2 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + index * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.18 + 0.16);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + index * 0.18);
        oscillator.stop(context.currentTime + index * 0.18 + 0.18);
      });
      window.setTimeout(() => { stateEl.textContent = "Klaar — probeer opnieuw!"; }, 8 * 180 + 200);
    } catch (error) {
      stateEl.textContent = "Audio niet beschikbaar";
    }
  }

  return frame(idea, {
    theme: "art",
    label: "Audio",
    body: [
      notesEl,
      h("div", { class: "pv-row pv-center pv-gap" }, btn("▶ Speel melodie", play, "pv-btn-primary"), stateEl),
      h("p", { class: "pv-hint", text: "Elke klik maakt een nieuwe melodie met de Web Audio API." })
    ]
  });
}

/* ------------------------------ Frame-animatie ------------------------------ */

function animationPreview(idea) {
  const c = canvas(420, 220, "pv-animation");
  const g = ctx2d(c);
  let running = true;
  let frame = 0;
  const frameEl = h("strong", { text: "0" });
  const shapes = Array.from({ length: 7 }, (_, index) => ({
    x: Math.random() * 380 + 20,
    y: Math.random() * 180 + 20,
    vx: (Math.random() - 0.5) * 2.4,
    vy: (Math.random() - 0.5) * 2.4,
    size: 8 + index * 3,
    color: ["#7ee2b8", "#e8c47c", "#ff8a6b", "#8ab4ff"][index % 4]
  }));

  loopWhile(c, () => {
    if (!running) return;
    frame += 1;
    frameEl.textContent = String(frame);
    g.fillStyle = "rgba(11, 21, 18, 0.32)";
    g.fillRect(0, 0, c.width, c.height);
    shapes.forEach((shape) => {
      shape.x += shape.vx;
      shape.y += shape.vy;
      if (shape.x < shape.size || shape.x > c.width - shape.size) shape.vx *= -1;
      if (shape.y < shape.size || shape.y > c.height - shape.size) shape.vy *= -1;
      g.fillStyle = shape.color;
      g.beginPath();
      g.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
      g.fill();
    });
  });

  return frame(idea, {
    theme: "art",
    label: "Animatie",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Frame ", frameEl), btn("▶ / ⏸", () => { running = !running; }, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Elke frame bewegen de vormen een stukje verder." })
    ]
  });
}

/* ------------------------------ Tafels oefenen ------------------------------ */

function tablesPreview(idea) {
  const tableSelect = select(Array.from({ length: 10 }, (_, index) => index + 1), { "aria-label": "Kies een tafel" });
  const questionEl = h("h3", { class: "pv-question", text: "" });
  const answerInput = input({ type: "number", placeholder: "Antwoord", "aria-label": "Antwoord" });
  const feedback = h("p", { class: "pv-feedback", text: "Kies je antwoord en druk op Enter." });
  const scoreEl = h("strong", { text: "0" });
  let score = 0;
  let a = 1;
  let b = 1;

  function next() {
    a = Number(tableSelect.value);
    b = rnd(10) + 1;
    questionEl.textContent = `${a} × ${b} = ?`;
    answerInput.value = "";
    answerInput.focus();
  }

  function check() {
    if (Number(answerInput.value) === a * b) {
      score += 1;
      scoreEl.textContent = String(score);
      feedback.textContent = "Juist! ✓";
      feedback.className = "pv-feedback good";
    } else {
      feedback.textContent = `Bijna! ${a} × ${b} = ${a * b}.`;
      feedback.className = "pv-feedback warn";
    }
    next();
  }

  tableSelect.addEventListener("change", () => { score = 0; scoreEl.textContent = "0"; next(); });
  answerInput.addEventListener("keydown", (event) => { if (event.key === "Enter") check(); });
  next();

  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      h("div", { class: "pv-row pv-between" }, field("Tafel van", tableSelect), h("span", { class: "pv-score" }, "Score ", scoreEl)),
      h("div", { class: "pv-flashcard" }, questionEl, h("div", { class: "pv-row pv-center pv-gap" }, answerInput, btn("✓", check, "pv-btn-primary"))),
      feedback
    ]
  });
}

/* ------------------------------ Flashcards ------------------------------ */

const FLASHCARDS = [
  { front: "apple", back: "appel" },
  { front: "bicycle", back: "fiets" },
  { front: "library", back: "bibliotheek" },
  { front: "weather", back: "weer" },
  { front: "science", back: "wetenschap" },
  { front: "keyboard", back: "toetsenbord" }
];

function flashcardsPreview(idea) {
  let index = 0;
  let flipped = false;
  let known = 0;
  const card = h("button", { type: "button", class: "pv-flashcard pv-flashcard-flip", onclick: () => { flipped = !flipped; render(); } });
  const countEl = h("span", { class: "pv-state", text: "" });

  function render() {
    const item = FLASHCARDS[index];
    card.replaceChildren(
      h("span", { class: "pv-flashcard-emoji", text: flipped ? "🇳🇱" : "🇬🇧" }),
      h("strong", { text: flipped ? item.back : item.front }),
      h("small", { text: flipped ? "Klik om terug te draaien" : "Klik om het antwoord te zien" })
    );
    countEl.textContent = `Kaart ${index + 1} / ${FLASHCARDS.length} · gekend ${known}`;
  }

  function next(wasKnown) {
    if (wasKnown) known += 1;
    index = (index + 1) % FLASHCARDS.length;
    flipped = false;
    render();
  }

  render();

  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      countEl,
      card,
      h("div", { class: "pv-row pv-center pv-gap" }, btn("↺ Nog eens", () => next(false), "pv-btn-ghost"), btn("✓ Gekend", () => next(true), "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Draai de kaart om en geef aan of je het woord kende." })
    ]
  });
}

/* ------------------------------ Rekenracer ------------------------------ */

function mathRacerPreview(idea) {
  const questionEl = h("h3", { class: "pv-question", text: "Klik op Start" });
  const answerInput = input({ type: "number", placeholder: "Antwoord", "aria-label": "Antwoord" });
  const scoreEl = h("strong", { text: "0" });
  const timeEl = h("strong", { text: "30" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar?" });
  let score = 0;
  let time = 30;
  let timer = null;
  let a = 0;
  let b = 0;
  let operator = "+";

  function next() {
    a = rnd(20) + 1;
    b = rnd(20) + 1;
    operator = pick(["+", "−", "×"]);
    const answer = operator === "+" ? a + b : operator === "−" ? a - b : a * b;
    questionEl.textContent = `${a} ${operator} ${b} = ?`;
    questionEl.dataset.answer = String(answer);
    answerInput.value = "";
    answerInput.focus();
  }

  function start() {
    score = 0;
    time = 30;
    scoreEl.textContent = "0";
    timeEl.textContent = "30";
    stateEl.textContent = "Bezig…";
    window.clearInterval(timer);
    next();
    timer = window.setInterval(() => {
      if (!timeEl.isConnected) {
        window.clearInterval(timer);
        return;
      }
      time -= 1;
      timeEl.textContent = String(time);
      if (time <= 0) {
        window.clearInterval(timer);
        questionEl.textContent = `Tijd! Je score is ${score}.`;
        stateEl.textContent = "Klaar";
      }
    }, 1000);
  }

  function check() {
    if (Number(answerInput.value) === Number(questionEl.dataset.answer)) {
      score += 1;
      scoreEl.textContent = String(score);
      next();
    } else {
      answerInput.value = "";
    }
  }

  answerInput.addEventListener("keydown", (event) => { if (event.key === "Enter") check(); });

  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), h("span", { class: "pv-score" }, "⏱ ", timeEl, " s"), stateEl),
      h("div", { class: "pv-flashcard" }, questionEl, h("div", { class: "pv-row pv-center pv-gap" }, answerInput, btn("✓", check, "pv-btn-primary"), btn("▶ Start", start, "pv-btn-ghost"))),
      h("p", { class: "pv-hint", text: "Los zoveel mogelijk sommen op in 30 seconden." })
    ]
  });
}

/* ------------------------------ Cijfer-checker ------------------------------ */

function gradePreview(idea) {
  const scoreInput = input({ type: "number", min: "0", value: "17", "aria-label": "Behaalde punten" });
  const maxInput = input({ type: "number", min: "1", value: "20", "aria-label": "Totaal punten" });
  const percentEl = h("strong", { class: "pv-grade-percent", text: "85%" });
  const gradeEl = h("strong", { class: "pv-grade-value", text: "17/20" });
  const messageEl = h("p", { class: "pv-feedback", text: "Goed gedaan!" });

  function calc() {
    const score = Number(scoreInput.value);
    const max = Number(maxInput.value) || 1;
    const pct = Math.max(0, Math.min(100, (score / max) * 100));
    percentEl.textContent = `${Math.round(pct)}%`;
    gradeEl.textContent = `${score} / ${max}`;
    if (pct >= 80) {
      messageEl.textContent = "Uitstekend! 🎉";
      messageEl.className = "pv-feedback good";
    } else if (pct >= 60) {
      messageEl.textContent = "Goed gedaan!";
      messageEl.className = "pv-feedback good";
    } else if (pct >= 50) {
      messageEl.textContent = "Net voldoende. Blijf oefenen.";
      messageEl.className = "pv-feedback warn";
    } else {
      messageEl.textContent = "Nog niet voldoende. Je kan het!";
      messageEl.className = "pv-feedback warn";
    }
  }

  [scoreInput, maxInput].forEach((element) => element.addEventListener("input", calc));
  calc();

  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      h("div", { class: "pv-grade" }, gradeEl, percentEl),
      h("div", { class: "pv-row pv-gap" }, field("Behaald", scoreInput), field("Totaal", maxInput)),
      messageEl,
      h("p", { class: "pv-hint", text: "Vul je punten in en zie meteen je percentage." })
    ]
  });
}

/* ------------------------------ Leesbaarheid ------------------------------ */

function readabilityPreview(idea) {
  const area = textarea({ rows: "5" });
  area.value = "EasyCodey maakt programmeren leuk. Je leert stap voor stap nieuwe dingen. Probeer het zelf eens!";
  const wordsEl = h("strong", { text: "0" });
  const sentencesEl = h("strong", { text: "0" });
  const avgEl = h("strong", { text: "0" });
  const levelEl = h("span", { class: "pv-state", text: "" });

  function calc() {
    const text = area.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
    const avg = words ? text.replace(/[^A-Za-zÀ-ÿ]/g, "").length / words : 0;
    wordsEl.textContent = String(words);
    sentencesEl.textContent = String(sentences);
    avgEl.textContent = avg.toFixed(1).replace(".", ",");
    if (avg < 5) {
      levelEl.textContent = "Heel makkelijk";
      levelEl.className = "pv-state good";
    } else if (avg < 6.5) {
      levelEl.textContent = "Makkelijk";
      levelEl.className = "pv-state good";
    } else if (avg < 8) {
      levelEl.textContent = "Gemiddeld";
      levelEl.className = "pv-state";
    } else {
      levelEl.textContent = "Moeilijk";
      levelEl.className = "pv-state warn";
    }
  }

  area.addEventListener("input", calc);
  calc();

  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      area,
      h("div", { class: "pv-stats" }, h("div", { class: "pv-stat" }, wordsEl, h("span", { text: "woorden" })), h("div", { class: "pv-stat" }, sentencesEl, h("span", { text: "zinnen" })), h("div", { class: "pv-stat" }, avgEl, h("span", { text: "letters/woord" }))),
      levelEl,
      h("p", { class: "pv-hint", text: "Korte woorden en zinnen maken tekst makkelijker." })
    ]
  });
}

/* ------------------------------ Dictee-generator ------------------------------ */

function dictationPreview(idea) {
  const words = ["programmeren", "bibliotheek", "toetsenbord", "algoritme", "variabele", "computer", "internet", "functie"];
  const list = h("div", { class: "pv-dictation" });
  const stateEl = h("span", { class: "pv-state", text: "Klik op een woord om het te horen" });
  let visible = false;

  function render() {
    list.replaceChildren(...words.map((word) => h("button", { type: "button", class: "pv-dictation-word", onclick: () => speak(word) }, visible ? word : "••••••")));
  }

  function speak(word) {
    stateEl.textContent = word;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "nl-BE";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  render();

  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      list,
      h("div", { class: "pv-row pv-between" }, stateEl, btn(visible ? "🙈 Verberg" : "👁 Toon", () => { visible = !visible; render(); }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Laat de woorden voorlezen en schrijf ze op. Klik daarna om te controleren." })
    ]
  });
}

/* ------------------------------ Huiswerkplanner ------------------------------ */

function plannerPreview(idea) {
  const subjectInput = input({ type: "text", placeholder: "Vak", "aria-label": "Vak" });
  const taskInput = input({ type: "text", placeholder: "Taak", "aria-label": "Taak" });
  const dateInput = input({ type: "date", "aria-label": "Datum" });
  const list = h("div", { class: "pv-planner" });
  let tasks = [
    { subject: "Wiskunde", task: "Oefening 4.2", date: "2026-05-14", done: false },
    { subject: "Nederlands", task: "Boekverslag", date: "2026-05-16", done: false }
  ];

  function render() {
    list.replaceChildren(
      ...tasks.map((task, index) =>
        h("div", { class: `pv-planner-item${task.done ? " done" : ""}` },
          h("button", { type: "button", class: "pv-todo-check", "aria-pressed": String(task.done), onclick: () => { tasks[index].done = !task.done; render(); } }, "✓"),
          h("div", { class: "pv-planner-text" }, h("strong", { text: task.subject }), h("span", { text: task.task })),
          h("span", { class: "pv-planner-date", text: task.date.slice(5) }),
          h("button", { type: "button", class: "pv-todo-del", "aria-label": "Verwijderen", onclick: () => { tasks.splice(index, 1); render(); } }, "×")
        )
      )
    );
  }

  function add() {
    const subject = subjectInput.value.trim();
    const task = taskInput.value.trim();
    if (!subject || !task) return;
    tasks.push({ subject, task, date: dateInput.value || "2026-05-20", done: false });
    subjectInput.value = "";
    taskInput.value = "";
    render();
  }

  render();

  return frame(idea, {
    theme: "school",
    label: "Planner",
    body: [
      list,
      h("div", { class: "pv-row pv-gap" }, subjectInput, taskInput, dateInput, btn("＋", add, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Voeg taken toe per vak en vink ze af." })
    ]
  });
}

/* ------------------------------ Linkverkorter ------------------------------ */

function urlShortenerPreview(idea) {
  const inputEl = input({ type: "url", placeholder: "https://example.com/een-heel-lange-link", "aria-label": "Lange link" });
  const result = h("div", { class: "pv-short-result", text: "" });
  const stateEl = h("span", { class: "pv-state", text: "Nog geen link" });

  function shorten() {
    const value = inputEl.value.trim();
    if (!value) return;
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
    const code = (hash >>> 0).toString(36).slice(0, 6) || "abc123";
    result.textContent = `easycodey.be/${code}`;
    stateEl.textContent = "Klaar! ✓";
    stateEl.className = "pv-state good";
  }

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: "easycodey.be/link" })),
        h("div", { class: "pv-webpage" },
          h("h3", { text: "Maak je link kort" }),
          h("p", { text: "Plak een lange URL en krijg een korte link." }),
          h("div", { class: "pv-row pv-gap" }, inputEl, btn("Verkort", shorten, "pv-btn-primary")),
          result,
          stateEl
        )
      ),
      h("p", { class: "pv-hint", text: "In het echte project worden links in een database bewaard." })
    ]
  });
}

/* ------------------------------ Login-systeem ------------------------------ */

function loginPreview(idea) {
  const email = input({ type: "email", placeholder: "jij@example.com", "aria-label": "E-mail" });
  const password = input({ type: "password", placeholder: "Wachtwoord", "aria-label": "Wachtwoord" });
  const stateEl = h("p", { class: "pv-feedback", text: "Nog niet ingelogd." });
  const panel = h("div", { class: "pv-login" });

  function login() {
    if (!email.value.includes("@") || password.value.length < 4) {
      stateEl.textContent = "Vul een geldig e-mailadres en een wachtwoord van minstens 4 tekens in.";
      stateEl.className = "pv-feedback warn";
      return;
    }
    panel.replaceChildren(h("span", { class: "pv-login-avatar", text: "🧑‍💻" }), h("strong", { text: "Welkom terug!" }), h("span", { text: email.value }), btn("Uitloggen", () => { panel.replaceChildren(); render(); }, "pv-btn-ghost"));
    stateEl.textContent = "Ingelogd ✓";
    stateEl.className = "pv-feedback good";
  }

  function render() {
    panel.replaceChildren(
      h("span", { class: "pv-login-avatar", text: "🔐" }),
      h("strong", { text: "Inloggen" }),
      field("E-mail", email),
      field("Wachtwoord", password),
      btn("Inloggen", login, "pv-btn-primary")
    );
  }

  render();

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: "easycodey.be/login" })),
        h("div", { class: "pv-webpage" }, panel, stateEl)
      ),
      h("p", { class: "pv-hint", text: "Dit is een demo. Gebruik nooit je echte wachtwoord in een voorbeeld." })
    ]
  });
}

/* ------------------------------ Contactformulier ------------------------------ */

function contactPreview(idea) {
  const name = input({ type: "text", placeholder: "Je naam", "aria-label": "Naam" });
  const email = input({ type: "email", placeholder: "jij@example.com", "aria-label": "E-mail" });
  const message = textarea({ rows: "3", placeholder: "Je bericht…", "aria-label": "Bericht" });
  const stateEl = h("p", { class: "pv-feedback", text: "" });

  function send(event) {
    event.preventDefault();
    if (!name.value.trim() || !email.value.includes("@") || !message.value.trim()) {
      stateEl.textContent = "Vul alle velden in.";
      stateEl.className = "pv-feedback warn";
      return;
    }
    stateEl.textContent = `Bedankt ${name.value.trim()}! Je bericht is verstuurd (demo).`;
    stateEl.className = "pv-feedback good";
    name.value = "";
    email.value = "";
    message.value = "";
  }

  const form = h("form", { class: "pv-form", onsubmit: send }, field("Naam", name), field("E-mail", email), field("Bericht", message), h("div", { class: "pv-row pv-center" }, h("button", { type: "submit", class: "pv-btn pv-btn-primary" }, "Verstuur")));

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: "easycodey.be/contact" })),
        h("div", { class: "pv-webpage" }, h("h3", { text: "Neem contact op" }), form, stateEl)
      )
    ]
  });
}

/* ------------------------------ Bezoekers-teller ------------------------------ */

function visitorPreview(idea) {
  const countEl = h("strong", { class: "pv-counter", text: "1 284" });
  const stateEl = h("span", { class: "pv-state", text: "Sinds 1 mei" });
  let count = 1284;

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-counter-card" }, h("span", { class: "pv-counter-icon", text: "👀" }), countEl, h("span", { text: "bezoekers" }), stateEl),
      h("div", { class: "pv-row pv-center" }, btn("＋ Bezoeker", () => { count += 1; countEl.textContent = count.toLocaleString("nl-BE"); }, "pv-btn-primary"), btn("↻ Reset", () => { count = 1284; countEl.textContent = "1 284"; }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "In het echte project wordt de teller in een database bewaard." })
    ]
  });
}

/* ------------------------------ Nieuwsbrief ------------------------------ */

function newsletterPreview(idea) {
  const email = input({ type: "email", placeholder: "jij@example.com", "aria-label": "E-mail" });
  const stateEl = h("p", { class: "pv-feedback", text: "" });
  const list = h("div", { class: "pv-subscribers" });
  let subscribers = ["jan@example.com", "lina@example.com"];

  function render() {
    list.replaceChildren(...subscribers.map((address) => h("span", { class: "pv-subscriber", text: address })));
  }

  function subscribe() {
    if (!email.value.includes("@")) {
      stateEl.textContent = "Vul een geldig e-mailadres in.";
      stateEl.className = "pv-feedback warn";
      return;
    }
    subscribers.push(email.value);
    stateEl.textContent = "Ingeschreven! ✓";
    stateEl.className = "pv-feedback good";
    email.value = "";
    render();
  }

  render();

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-newsletter" }, h("span", { class: "pv-newsletter-icon", text: "📬" }), h("h3", { text: "Blijf op de hoogte" }), h("p", { text: "Ontvang nieuwe projecten in je inbox." }), h("div", { class: "pv-row pv-gap" }, email, btn("Inschrijven", subscribe, "pv-btn-primary")), stateEl),
      list,
      h("p", { class: "pv-hint", text: "De lijst met inschrijvingen blijft in deze demo." })
    ]
  });
}

/* ------------------------------ Webscraper ------------------------------ */

function scraperPreview(idea) {
  const headlines = [
    "Nieuwe Python-versie brengt snellere start",
    "Studenten bouwen eerste game met pygame",
    "EasyCodey bereikt 161 projecten",
    "AI helpt beginners met debuggen",
    "Belgische school wint programmeerwedstrijd"
  ];
  const list = h("div", { class: "pv-headlines" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar om te scrapen" });

  function scrape() {
    stateEl.textContent = "Bezig…";
    list.replaceChildren();
    headlines.forEach((headline, index) => {
      window.setTimeout(() => {
        if (!list.isConnected) return;
        list.append(h("div", { class: "pv-headline" }, h("span", { text: "📰" }), h("span", { text: headline })));
        if (index === headlines.length - 1) {
          stateEl.textContent = `${headlines.length} koppen gevonden ✓`;
          stateEl.className = "pv-state good";
        }
      }, index * 320);
    });
  }

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-web-badge", text: "🌐 Nieuws" }), btn("▶ Scrape", scrape, "pv-btn-primary")),
      list,
      stateEl,
      h("p", { class: "pv-hint", text: "Een scraper haalt koppen uit de HTML van een nieuwssite." })
    ]
  });
}

/* ------------------------------ Fotogalerij ------------------------------ */

function galleryPreview(idea) {
  const photos = ["🌅", "🏔️", "🌊", "🌻", "🐈", "🌌", "🏛️", "🍂", "🌴"];
  const grid = h("div", { class: "pv-gallery" });
  const big = h("div", { class: "pv-gallery-big", text: "🌅" });

  function select(emoji) {
    big.textContent = emoji;
  }

  grid.replaceChildren(...photos.map((emoji) => h("button", { type: "button", class: "pv-gallery-thumb", onclick: () => select(emoji) }, emoji)));

  return frame(idea, {
    theme: "web",
    label: "Galerij",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: "easycodey.be/galerij" })),
        h("div", { class: "pv-webpage" }, big, grid)
      ),
      h("p", { class: "pv-hint", text: "Klik op een foto om die groot te bekijken." })
    ]
  });
}

/* ------------------------------ Taken-API ------------------------------ */

function tasksApiPreview(idea) {
  const list = h("div", { class: "pv-task-list" });
  const inputEl = input({ type: "text", placeholder: "Nieuwe taak…", "aria-label": "Nieuwe taak" });
  const stateEl = h("span", { class: "pv-state", text: "GET /api/taken" });
  let tasks = [
    { id: 1, title: "Python leren", done: true },
    { id: 2, title: "API bouwen", done: false }
  ];

  function render() {
    list.replaceChildren(...tasks.map((task, index) => h("div", { class: `pv-api-task${task.done ? " done" : ""}` }, h("code", { text: `#${task.id}` }), h("span", { text: task.title }), h("button", { type: "button", onclick: () => { tasks[index].done = !task.done; stateEl.textContent = `PATCH /api/taken/${task.id}`; render(); } }, task.done ? "✓" : "○"))));
  }

  function add() {
    const title = inputEl.value.trim();
    if (!title) return;
    tasks.push({ id: tasks.length + 1, title, done: false });
    inputEl.value = "";
    stateEl.textContent = "POST /api/taken";
    render();
  }

  inputEl.addEventListener("keydown", (event) => { if (event.key === "Enter") add(); });
  render();

  return frame(idea, {
    theme: "web",
    label: "API",
    body: [
      h("div", { class: "pv-api" }, h("div", { class: "pv-api-bar" }, h("span", { text: "REST" }), stateEl), list, h("div", { class: "pv-row pv-gap" }, inputEl, btn("Verstuur", add, "pv-btn-primary"))),
      h("p", { class: "pv-hint", text: "Elke actie komt overeen met een HTTP-methode." })
    ]
  });
}

/* ------------------------------ Stem-app ------------------------------ */

function pollPreview(idea) {
  const options = [
    { label: "Snake", votes: 14 },
    { label: "Pong", votes: 9 },
    { label: "2048", votes: 11 },
    { label: "Galgje", votes: 7 }
  ];
  const list = h("div", { class: "pv-poll" });
  const stateEl = h("span", { class: "pv-state", text: "Breng je stem uit" });

  function render() {
    const total = options.reduce((sum, option) => sum + option.votes, 0);
    list.replaceChildren(...options.map((option, index) => h("button", { type: "button", class: "pv-poll-option", onclick: () => { options[index].votes += 1; stateEl.textContent = `Gestemd op ${option.label} ✓`; stateEl.className = "pv-state good"; render(); } }, h("span", { text: option.label }), h("span", { class: "pv-poll-bar" }, h("i", { style: { width: `${(option.votes / total) * 100}%` } })), h("strong", { text: String(option.votes) }))));
  }

  render();

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: "easycodey.be/stem" })),
        h("div", { class: "pv-webpage" }, h("h3", { text: "Welk project is jouw favoriet?" }), list, stateEl)
      )
    ]
  });
}

/* ------------------------------ CSV uploaden ------------------------------ */

function csvPreview(idea) {
  const area = textarea({ rows: "4", spellcheck: "false" });
  area.value = "naam,leeftijd,stad\nYousef,12,Brussel\nLina,14,Antwerpen\nSam,13,Gent";
  const table = h("div", { class: "pv-csv" });
  const stateEl = h("span", { class: "pv-state", text: "Plak of sleep een CSV-bestand" });

  function parse() {
    const rows = area.value.trim().split(/\r?\n/).map((row) => row.split(","));
    table.replaceChildren(...rows.map((row, rowIndex) => h("div", { class: `pv-csv-row${rowIndex === 0 ? " head" : ""}` }, ...row.map((cell) => h("span", { text: cell })))));
    stateEl.textContent = `${rows.length - 1} rijen ingelezen ✓`;
    stateEl.className = "pv-state good";
  }

  area.addEventListener("input", parse);
  parse();

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-dropzone" }, h("span", { text: "📄" }), h("strong", { text: "CSV-bestand" }), stateEl),
      area,
      table,
      h("p", { class: "pv-hint", text: "De eerste rij wordt als kolomhoofd gebruikt." })
    ]
  });
}

/* ------------------------------ Webhook-ontvanger ------------------------------ */

function webhookPreview(idea) {
  const log = h("div", { class: "pv-webhook-log" });
  const stateEl = h("span", { class: "pv-state", text: "Wachten op events…" });
  let count = 0;

  function event() {
    count += 1;
    const payload = { event: "betaling", id: 1000 + count, bedrag: (Math.random() * 50 + 5).toFixed(2), status: "ok" };
    log.prepend(h("pre", { class: "pv-webhook-event", text: JSON.stringify(payload, null, 2) }));
    stateEl.textContent = `${count} event(s) ontvangen`;
    stateEl.className = "pv-state good";
  }

  return frame(idea, {
    theme: "web",
    label: "API",
    body: [
      h("div", { class: "pv-row pv-between" }, h("code", { class: "pv-endpoint", text: "POST /webhook" }), btn("▶ Stuur testevent", event, "pv-btn-primary")),
      log,
      stateEl,
      h("p", { class: "pv-hint", text: "Een webhook ontvangt berichten van een andere dienst." })
    ]
  });
}

/* ------------------------------ Sitemap ------------------------------ */

function sitemapPreview(idea) {
  const tree = h("div", { class: "pv-sitemap" });
  const pages = [
    { label: "Home", children: ["Projecten", "Over", "Contact"] },
    { label: "Projecten", children: ["Games", "Web", "GUI", "Data & AI"] },
    { label: "Privacy", children: [] }
  ];
  pages.forEach((page) => {
    tree.append(h("div", { class: "pv-sitemap-group" }, h("strong", { text: `🏠 /${page.label.toLowerCase()}` }), ...page.children.map((child) => h("span", { text: `↳ /${child.toLowerCase().replace(/[^a-z]+/g, "-")}` }))));
  });
  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [tree, h("p", { class: "pv-hint", text: "Een sitemap helpt zoekmachines alle pagina's te vinden." })]
  });
}

/* ------------------------------ Favorieten ------------------------------ */

function favoritesPreview(idea) {
  const projects = ["Snake", "Pong", "2048", "Galgje", "Rekenmachine"];
  const list = h("div", { class: "pv-favorites" });
  const saved = new Set(["Snake"]);
  const stateEl = h("span", { class: "pv-state", text: "1 favoriet" });

  function render() {
    list.replaceChildren(...projects.map((project) => h("button", { type: "button", class: `pv-favorite${saved.has(project) ? " saved" : ""}`, onclick: () => { if (saved.has(project)) saved.delete(project); else saved.add(project); stateEl.textContent = `${saved.size} favoriet${saved.size === 1 ? "" : "en"}`; render(); } }, h("span", { text: project }), h("span", { text: saved.has(project) ? "★" : "☆" }))));
  }

  render();

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [h("div", { class: "pv-row pv-between" }, h("strong", { text: "Mijn favorieten" }), stateEl), list, h("p", { class: "pv-hint", text: "Klik op de ster om een project te bewaren." })]
  });
}

/* ------------------------------ Blog / portfolio ------------------------------ */

function blogPreview(idea) {
  const isPortfolio = idea.id === "portfolio-generator";
  const cards = isPortfolio
    ? [["🐍", "Snake"], ["🎲", "2048"], ["🌐", "Weer-app"]]
    : [["🐍", "Waarom Snake een goed eerste project is"], ["🧠", "Zo debug je een foutmelding"], ["🎨", "Maak je eigen pixel-art"]];
  const cardEls = cards.map(([emoji, title]) => h("div", { class: "pv-blog-card" }, h("span", { class: "pv-blog-emoji", text: emoji }), h("strong", { text: title }), h("span", { class: "pv-state", text: isPortfolio ? "Project" : "Lees meer →" })));
  return frame(idea, {
    theme: "web",
    label: isPortfolio ? "Portfolio" : "Blog",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: isPortfolio ? "jouwnaam.be" : "easycodey.be/blog" })),
        h("div", { class: "pv-webpage" }, h("h3", { text: isPortfolio ? "Hallo, ik ben Yousef 👋" : "Nieuws & tutorials" }), h("p", { text: isPortfolio ? "Ik leer programmeren en bouw kleine projecten." : "Tips, uitleg en nieuwe projecten." }), h("div", { class: "pv-blog-grid" }, ...cardEls))
      ),
      h("p", { class: "pv-hint", text: "Een blog of portfolio bestaat uit herbruikbare kaarten." })
    ]
  });
}

/* ------------------------------ Recepten-app ------------------------------ */

function recipesPreview(idea) {
  const recipes = [
    { name: "Pasta pesto", emoji: "🍝", time: "20 min" },
    { name: "Wraps", emoji: "🌯", time: "15 min" },
    { name: "Fruit smoothie", emoji: "🥤", time: "5 min" },
    { name: "Pannenkoeken", emoji: "🥞", time: "30 min" }
  ];
  const list = h("div", { class: "pv-recipes" });
  const detail = h("div", { class: "pv-recipe-detail" }, h("strong", { text: "Kies een recept" }));

  list.replaceChildren(...recipes.map((recipe) => h("button", { type: "button", class: "pv-recipe", onclick: () => detail.replaceChildren(h("span", { class: "pv-recipe-emoji", text: recipe.emoji }), h("strong", { text: recipe.name }), h("span", { class: "pv-state", text: `⏱ ${recipe.time}` }), h("p", { text: "Een simpel recept dat je stap voor stap kan maken." })) }, h("span", { text: recipe.emoji }), h("span", { text: recipe.name }), h("small", { text: recipe.time }))));

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: "easycodey.be/recepten" })),
        h("div", { class: "pv-webpage" }, h("h3", { text: "Wat eten we vandaag?" }), list, detail)
      )
    ]
  });
}

/* ------------------------------ Klembord-tool ------------------------------ */

function clipboardPreview(idea) {
  const area = textarea({ rows: "4", placeholder: "Typ hier iets…" });
  area.value = "Dit is tekst die je kan kopiëren.";
  const stateEl = h("span", { class: "pv-state", text: "Klaar" });

  async function copy() {
    try {
      await navigator.clipboard.writeText(area.value);
      stateEl.textContent = "Gekopieerd naar je klembord ✓";
      stateEl.className = "pv-state good";
    } catch (error) {
      area.select();
      document.execCommand("copy");
      stateEl.textContent = "Gekopieerd ✓";
      stateEl.className = "pv-state good";
    }
  }

  async function paste() {
    try {
      area.value = await navigator.clipboard.readText();
      stateEl.textContent = "Geplakt ✓";
      stateEl.className = "pv-state good";
    } catch (error) {
      stateEl.textContent = "Je browser blokkeert plakken. Gebruik Ctrl+V.";
      stateEl.className = "pv-state warn";
    }
  }

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      area,
      h("div", { class: "pv-row pv-between" }, stateEl, h("div", { class: "pv-row pv-gap" }, btn("📋 Kopieer", copy, "pv-btn-primary"), btn("Plak", paste, "pv-btn-ghost"))),
      h("p", { class: "pv-hint", text: "Kopieer en plak tekst met één klik." })
    ]
  });
}

/* ------------------------------ Bestanden sorteren ------------------------------ */

function fileOrganizerPreview(idea) {
  const files = ["vakantie.jpg", "notities.txt", "script.py", "factuur.pdf", "foto.png", "rapport.docx"];
  const list = h("div", { class: "pv-files" });
  const stateEl = h("span", { class: "pv-state", text: "6 bestanden in Downloads" });
  let organized = false;

  function render() {
    list.replaceChildren(
      ...files.map((file) => {
        const ext = file.split(".").pop();
        const folder = organized ? { jpg: "Afbeeldingen", png: "Afbeeldingen", txt: "Documenten", pdf: "Documenten", docx: "Documenten", py: "Code" }[ext] || "Overig" : "Downloads";
        return h("div", { class: "pv-file" }, h("span", { class: "pv-file-icon", text: organized ? "📁" : "📄" }), h("span", { text: file }), h("code", { text: folder }));
      })
    );
  }

  function organize() {
    organized = !organized;
    stateEl.textContent = organized ? "Gesorteerd in mappen ✓" : "6 bestanden in Downloads";
    stateEl.className = organized ? "pv-state good" : "pv-state";
    render();
  }

  render();

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      h("div", { class: "pv-row pv-between" }, stateEl, btn(organized ? "↺ Ongedaan maken" : "▶ Sorteer", organize, "pv-btn-primary")),
      list,
      h("p", { class: "pv-hint", text: "Bestanden worden op basis van hun extensie in mappen geplaatst." })
    ]
  });
}

/* ------------------------------ Bestanden hernoemen ------------------------------ */

function renamePreview(idea) {
  const pattern = input({ type: "text", value: "vakantie_{n}", "aria-label": "Patroon" });
  const list = h("div", { class: "pv-files" });
  const stateEl = h("span", { class: "pv-state", text: "3 bestanden" });
  const files = ["IMG_2031.jpg", "IMG_2032.jpg", "IMG_2033.jpg"];
  let renamed = false;

  function render() {
    list.replaceChildren(...files.map((file, index) => h("div", { class: "pv-file" }, h("span", { class: "pv-file-icon", text: "🖼️" }), h("span", { text: renamed ? `${pattern.value.replace("{n}", String(index + 1))}.jpg` : file }))));
  }

  function apply() {
    renamed = true;
    stateEl.textContent = "Namen aangepast ✓";
    stateEl.className = "pv-state good";
    render();
  }

  pattern.addEventListener("input", () => { if (renamed) render(); });
  render();

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      field("Patroon ({n} = nummer)", pattern),
      h("div", { class: "pv-row pv-between" }, stateEl, btn("▶ Hernoem", apply, "pv-btn-primary")),
      list,
      h("p", { class: "pv-hint", text: "Hernoem honderden bestanden in één keer." })
    ]
  });
}

/* ------------------------------ Afbeeldingen verkleinen ------------------------------ */

function imageResizerPreview(idea) {
  const width = input({ type: "range", min: "20", max: "100", value: "60", "aria-label": "Breedte" });
  const widthEl = h("strong", { text: "60%" });
  const preview = h("div", { class: "pv-resize-stage" }, h("div", { class: "pv-resize-image", text: "🖼️" }));
  const stateEl = h("span", { class: "pv-state", text: "Kies een grootte" });

  function update() {
    const pct = Number(width.value);
    widthEl.textContent = `${pct}%`;
    preview.firstChild.style.transform = `scale(${pct / 100})`;
    stateEl.textContent = `${Math.round(1200 * (pct / 100))} × ${Math.round(800 * (pct / 100))} px`;
  }

  width.addEventListener("input", update);
  update();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { text: "Grootte" }), widthEl),
      width,
      preview,
      stateEl,
      h("p", { class: "pv-hint", text: "Sleep de schuif en zie hoe de afbeelding kleiner wordt." })
    ]
  });
}

/* ------------------------------ PDF's samenvoegen ------------------------------ */

function pdfPreview(idea) {
  const list = h("div", { class: "pv-files" });
  const stateEl = h("span", { class: "pv-state", text: "" });
  let files = ["verslag.pdf", "bijlage.pdf"];

  function render() {
    list.replaceChildren(...files.map((file, index) => h("div", { class: "pv-file" }, h("span", { class: "pv-file-icon", text: "📄" }), h("span", { text: file }), h("button", { type: "button", "aria-label": "Verwijderen", onclick: () => { files.splice(index, 1); render(); } }, "×"))));
    if (!stateEl.classList.contains("good")) {
      stateEl.textContent = files.length ? `${files.length} PDF${files.length === 1 ? "" : "'s"} geselecteerd` : "Nog geen PDF's";
    }
  }

  function add() {
    files.push(`document-${files.length + 1}.pdf`);
    stateEl.className = "pv-state";
    render();
  }

  function merge() {
    if (!files.length) {
      stateEl.textContent = "Voeg eerst een PDF toe";
      stateEl.className = "pv-state warn";
      return;
    }
    stateEl.textContent = `Samengevoegd: ${files.length} bestanden ✓`;
    stateEl.className = "pv-state good";
  }

  render();

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      h("div", { class: "pv-dropzone" }, h("span", { text: "📚" }), h("strong", { text: "PDF's samenvoegen" }), h("span", { class: "pv-state", text: "Sleep bestanden hierheen" })),
      list,
      h("div", { class: "pv-row pv-between" }, stateEl, h("div", { class: "pv-row pv-gap" }, btn("＋ Bestand", add, "pv-btn-ghost"), btn("Voeg samen", merge, "pv-btn-primary")))
    ]
  });
}

/* ------------------------------ Excel-rapport ------------------------------ */

function excelPreview(idea) {
  const rows = [
    ["Maand", "Omzet", "Kosten"],
    ["Jan", "€ 1.200", "€ 800"],
    ["Feb", "€ 1.450", "€ 820"],
    ["Mrt", "€ 1.680", "€ 900"],
    ["Apr", "€ 1.920", "€ 950"]
  ];
  const table = h("div", { class: "pv-sheet" }, ...rows.map((row, index) => h("div", { class: `pv-sheet-row${index === 0 ? " head" : ""}` }, ...row.map((cell) => h("span", { text: cell })))));
  const stateEl = h("span", { class: "pv-state", text: "Voorbeeld" });

  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      table,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("⬇ Exporteer .xlsx", () => { stateEl.textContent = "Rapport klaar (demo) ✓"; stateEl.className = "pv-state good"; }, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Openpyxl maakt van deze tabel een echt Excel-bestand." })
    ]
  });
}

/* ------------------------------ Back-up-script ------------------------------ */

function backupPreview(idea) {
  const bar = h("div", { class: "pv-progress" }, h("i"));
  const log = h("div", { class: "pv-backup-log" });
  const stateEl = h("span", { class: "pv-state", text: "Nog geen back-up" });
  let running = false;

  function run() {
    if (running) return;
    running = true;
    log.replaceChildren();
    stateEl.textContent = "Bezig…";
    const steps = ["Map scannen…", "Bestanden kopiëren…", "Controleren…", "Back-up klaar ✓"];
    let index = 0;
    const timer = window.setInterval(() => {
      if (!log.isConnected) {
        window.clearInterval(timer);
        return;
      }
      log.append(h("div", { class: "pv-backup-line", text: `> ${steps[index]}` }));
      bar.firstChild.style.width = `${((index + 1) / steps.length) * 100}%`;
      index += 1;
      if (index >= steps.length) {
        window.clearInterval(timer);
        running = false;
        stateEl.textContent = "Back-up voltooid ✓";
        stateEl.className = "pv-state good";
      }
    }, 650);
  }

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      h("div", { class: "pv-row pv-between" }, stateEl, btn("▶ Maak back-up", run, "pv-btn-primary")),
      bar,
      log,
      h("p", { class: "pv-hint", text: "Een script kopieert je bestanden naar een veilige map." })
    ]
  });
}

/* ------------------------------ Website-monitor ------------------------------ */

function monitorPreview(idea) {
  const urls = [
    { url: "easycodey.be", status: 200, ms: 124 },
    { url: "github.com", status: 200, ms: 210 },
    { url: "example.org", status: 200, ms: 98 }
  ];
  const list = h("div", { class: "pv-monitor" });
  const stateEl = h("span", { class: "pv-state", text: "Alles online" });

  function render() {
    list.replaceChildren(...urls.map((item) => h("div", { class: "pv-monitor-row" }, h("span", { class: `pv-dot-status ${item.status === 200 ? "ok" : "bad"}` }), h("span", { text: item.url }), h("code", { text: `${item.status}` }), h("span", { class: "pv-state", text: `${item.ms} ms` }))));
  }

  function check() {
    stateEl.textContent = "Controleren…";
    window.setTimeout(() => {
      urls.forEach((item) => { item.ms = 60 + rnd(260); });
      stateEl.textContent = "Alles online ✓";
      stateEl.className = "pv-state good";
      render();
    }, 700);
  }

  render();

  return frame(idea, {
    theme: "auto",
    label: "Monitoring",
    body: [
      h("div", { class: "pv-row pv-between" }, stateEl, btn("↻ Controleer", check, "pv-btn-primary")),
      list,
      h("p", { class: "pv-hint", text: "De monitor controleert of websites bereikbaar zijn." })
    ]
  });
}

/* ------------------------------ Factuurnummers ------------------------------ */

function invoicePreview(idea) {
  const year = input({ type: "number", value: "2026", "aria-label": "Jaar" });
  const next = h("strong", { class: "pv-invoice-number", text: "2026-004" });
  const list = h("div", { class: "pv-invoices" });
  let number = 4;

  function render() {
    next.textContent = `${year.value}-${String(number).padStart(3, "0")}`;
    list.replaceChildren(...Array.from({ length: Math.min(number - 1, 3) }, (_, index) => h("div", { class: "pv-invoice-row" }, h("span", { text: `${year.value}-${String(number - 1 - index).padStart(3, "0")}` }), h("span", { class: "pv-state", text: "verzonden" }))));
  }

  function create() {
    number += 1;
    render();
  }

  year.addEventListener("input", render);
  render();

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      h("div", { class: "pv-invoice" }, h("span", { class: "pv-state", text: "Volgend nummer" }), next),
      h("div", { class: "pv-row pv-between" }, field("Jaar", year), btn("＋ Nieuwe factuur", create, "pv-btn-primary")),
      list,
      h("p", { class: "pv-hint", text: "Factuurnummers lopen automatisch door per jaar." })
    ]
  });
}

/* ------------------------------ Screenshot-automatisering ------------------------------ */

function screenshotPreview(idea) {
  const stage = h("div", { class: "pv-shot-stage" }, h("div", { class: "pv-shot-window" }, h("span", { text: "🖥️" }), h("span", { text: "EasyCodey" })));
  const stateEl = h("span", { class: "pv-state", text: "Klaar om een screenshot te maken" });
  const countEl = h("strong", { text: "0" });
  let count = 0;

  function shoot() {
    count += 1;
    countEl.textContent = String(count);
    const flash = h("div", { class: "pv-shot-flash" });
    stage.append(flash);
    window.setTimeout(() => flash.remove(), 380);
    stateEl.textContent = `screenshot-${count}.png opgeslagen ✓`;
    stateEl.className = "pv-state good";
  }

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      stage,
      h("div", { class: "pv-row pv-between" }, stateEl, h("span", { class: "pv-score" }, "Gemaakt ", countEl)),
      h("div", { class: "pv-row pv-center" }, btn("📸 Maak screenshot", shoot, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Een script kan op vaste momenten een screenshot nemen." })
    ]
  });
}

/* ------------------------------ E-mailherinnering ------------------------------ */

function emailReminderPreview(idea) {
  const subject = input({ type: "text", value: "Vergeet je huiswerk niet!", "aria-label": "Onderwerp" });
  const time = select(["Vandaag 18:00", "Morgen 08:00", "Vrijdag 16:00"], { "aria-label": "Wanneer" });
  const stateEl = h("span", { class: "pv-state", text: "Nog geen herinnering" });
  const list = h("div", { class: "pv-reminders" });

  function add() {
    list.append(h("div", { class: "pv-reminder" }, h("span", { text: "⏰" }), h("div", {}, h("strong", { text: subject.value }), h("span", { class: "pv-state", text: time.value }))));
    stateEl.textContent = "Herinnering ingesteld ✓";
    stateEl.className = "pv-state good";
  }

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      field("Onderwerp", subject),
      h("div", { class: "pv-row pv-between" }, field("Wanneer", time), btn("＋ Plan", add, "pv-btn-primary")),
      list,
      stateEl,
      h("p", { class: "pv-hint", text: "Het script stuurt automatisch een e-mail op het juiste moment." })
    ]
  });
}

/* ------------------------------ Agenda-bestand ------------------------------ */

function agendaPreview(idea) {
  const title = input({ type: "text", value: "Python-les", "aria-label": "Afspraak" });
  const date = input({ type: "date", value: "2026-05-20", "aria-label": "Datum" });
  const output = h("pre", { class: "pv-code-output" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar" });

  function generate() {
    output.textContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title.value}\nDTSTART:${date.value.replace(/-/g, "")}T160000\nEND:VEVENT\nEND:VCALENDAR`;
    stateEl.textContent = "ICS-bestand klaar ✓";
    stateEl.className = "pv-state good";
  }

  [title, date].forEach((element) => element.addEventListener("input", generate));
  generate();

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      h("div", { class: "pv-row pv-gap" }, field("Afspraak", title), field("Datum", date)),
      output,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("⬇ Download .ics", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Een ICS-bestand kan je in je agenda importeren." })
    ]
  });
}

/* ------------------------------ Dubbele bestanden ------------------------------ */

function duplicatesPreview(idea) {
  const list = h("div", { class: "pv-files" });
  const stateEl = h("span", { class: "pv-state", text: "Scannen…" });
  const groups = [
    ["vakantie.jpg", "vakantie-kopie.jpg"],
    ["rapport.pdf", "rapport (1).pdf"],
    ["foto.png", "foto-oud.png"]
  ];
  let cleaned = false;

  function render() {
    list.replaceChildren(
      ...groups.map((group, index) =>
        h(
          "div",
          { class: "pv-dup-group" },
          h("strong", { text: `Duplicaat ${index + 1}` }),
          ...group.map((file, fileIndex) =>
            h(
              "div",
              { class: `pv-file${cleaned && fileIndex > 0 ? " removed" : ""}` },
              h("span", { class: "pv-file-icon", text: "📄" }),
              h("span", { text: file }),
              h("code", { text: cleaned && fileIndex > 0 ? "verwijderd" : "dubbel" })
            )
          )
        )
      )
    );
  }

  function scan() {
    stateEl.textContent = "3 duplicaten gevonden";
    stateEl.className = "pv-state warn";
    render();
  }

  function clean() {
    cleaned = true;
    stateEl.textContent = "3 duplicaten opgeruimd ✓";
    stateEl.className = "pv-state good";
    render();
  }

  render();

  return frame(idea, {
    theme: "auto",
    label: "Opruimen",
    body: [
      h("div", { class: "pv-row pv-between" }, stateEl, h("div", { class: "pv-row pv-gap" }, btn("🔍 Scan", scan, "pv-btn-ghost"), btn("🧹 Opruimen", clean, "pv-btn-primary"))),
      list,
      h("p", { class: "pv-hint", text: "Het script vergelijkt bestanden en stelt duplicaten voor om te verwijderen." })
    ]
  });
}

/* === MORE BUILDERS === */

/* === EXTRA PREVIEWS: games === */

function textAdventurePreview(idea) {
  const scenes = {
    start: { text: "Je staat voor een donker kasteel. De deur staat op een kier.", options: [["🚪 Naar binnen", "hall"], ["🌿 Om het kasteel lopen", "garden"]] },
    hall: { text: "In de hal ligt een gouden sleutel op de vloer.", options: [["🔑 Sleutel pakken", "tower"], ["🪜 Trap op", "tower"]] },
    garden: { text: "Achter het kasteel groeit een wonderlijke bloem.", options: [["🌸 Bloem plukken", "flower"], ["🚪 Toch naar binnen", "hall"]] },
    tower: { text: "Boven in de toren vind je een schatkist. Je wint! 🏆", options: [["↻ Opnieuw", "start"]] },
    flower: { text: "De bloem verandert in een vriendelijke draak. Je wint! 🐉", options: [["↻ Opnieuw", "start"]] }
  };
  const text = h("p", { class: "pv-feedback" });
  const options = h("div", { class: "pv-options" });
  const stepEl = h("span", { class: "pv-state", text: "Keuze 0" });
  let current = "start";
  let visits = 0;

  function render() {
    const scene = scenes[current];
    text.textContent = scene.text;
    options.replaceChildren(...scene.options.map(([label, target]) => btn(label, () => { current = target; visits += 1; render(); })));
    stepEl.textContent = `Keuze ${visits}`;
  }
  render();

  return frame(idea, {
    theme: "game",
    label: "Avontuur",
    body: [text, options, h("div", { class: "pv-row pv-between" }, stepEl, chip("📜 Tekstavontuur"))]
  });
}

function asteroidsPreview(idea) {
  const W = 420;
  const Hgt = 240;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const ship = { x: W / 2, y: Hgt / 2, a: -Math.PI / 2 };
  let rocks = [];
  let bullets = [];
  let score = 0;
  let last = 0;

  function newRock() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 0.9;
    return { x: rnd(W), y: rnd(Hgt), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 10 + rnd(11) };
  }
  for (let i = 0; i < 5; i += 1) rocks.push(newRock());

  function shoot() {
    bullets.push({ x: ship.x + Math.cos(ship.a) * 15, y: ship.y + Math.sin(ship.a) * 15, vx: Math.cos(ship.a) * 4.4, vy: Math.sin(ship.a) * 4.4 });
  }

  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, Hgt);
    g.strokeStyle = "rgba(126,226,184,.16)";
    g.lineWidth = 1;
    rocks.forEach((rock) => {
      g.beginPath();
      g.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
      g.stroke();
    });
    g.fillStyle = "#e8c47c";
    bullets.forEach((b) => {
      g.beginPath();
      g.arc(b.x, b.y, 2.4, 0, Math.PI * 2);
      g.fill();
    });
    g.save();
    g.translate(ship.x, ship.y);
    g.rotate(ship.a);
    g.fillStyle = "#7ee2b8";
    g.beginPath();
    g.moveTo(13, 0);
    g.lineTo(-9, 8);
    g.lineTo(-5, 0);
    g.lineTo(-9, -8);
    g.closePath();
    g.fill();
    g.restore();
  }

  loopWhile(c, (time) => {
    if (!last) last = time;
    const dt = Math.min(40, time - last) / 16;
    last = time;
    rocks.forEach((rock) => {
      rock.x += rock.vx * dt;
      rock.y += rock.vy * dt;
      if (rock.x < -20) rock.x = W + 20;
      if (rock.x > W + 20) rock.x = -20;
      if (rock.y < -20) rock.y = Hgt + 20;
      if (rock.y > Hgt + 20) rock.y = -20;
    });
    bullets.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; });
    bullets = bullets.filter((b) => b.x > -5 && b.x < W + 5 && b.y > -5 && b.y < Hgt + 5);
    bullets.forEach((b) => {
      rocks = rocks.filter((rock) => {
        if (Math.hypot(rock.x - b.x, rock.y - b.y) < rock.r) {
          score += 10;
          scoreEl.textContent = score;
          b.dead = true;
          return false;
        }
        return true;
      });
    });
    bullets = bullets.filter((b) => !b.dead);
    if (!rocks.length) {
      for (let i = 0; i < 4; i += 1) rocks.push(newRock());
    }
    draw();
  });

  c.tabIndex = 0;
  c.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { ship.a -= 0.28; event.preventDefault(); }
    if (event.key === "ArrowRight") { ship.a += 0.28; event.preventDefault(); }
    if (event.key === " ") { shoot(); event.preventDefault(); }
  });

  return frame(idea, {
    theme: "game",
    label: "Arcade",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), h("div", { class: "pv-row pv-gap" }, btn("↺", () => { ship.a -= 0.28; }, "pv-btn-ghost"), btn("🚀 Schiet", shoot, "pv-btn-primary"), btn("↻", () => { ship.a += 0.28; }, "pv-btn-ghost"))),
      h("p", { class: "pv-hint", text: "Klik op het speelveld en gebruik ← → en de spatiebalk, of tik op de knoppen." })
    ]
  });
}

function flappyPreview(idea) {
  const W = 420;
  const Hgt = 240;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Tik om te vliegen" });
  let birdY = Hgt / 2;
  let vy = 0;
  let pipes = [];
  let score = 0;
  let over = false;
  let started = false;
  let last = 0;

  function reset() {
    birdY = Hgt / 2;
    vy = 0;
    pipes = [];
    score = 0;
    over = false;
    started = false;
    scoreEl.textContent = "0";
    stateEl.textContent = "Tik om te vliegen";
    stateEl.className = "pv-state";
  }

  function flap() {
    if (over) { reset(); return; }
    started = true;
    vy = -3.4;
  }

  loopWhile(c, (time) => {
    if (!last) last = time;
    const dt = Math.min(40, time - last) / 16;
    last = time;
    if (started && !over) {
      vy += 0.26 * dt;
      birdY += vy * dt;
      pipes.forEach((p) => { p.x -= 2.1 * dt; });
      if (!pipes.length || pipes[pipes.length - 1].x < W - 170) {
        pipes.push({ x: W + 30, gap: 60 + rnd(80), scored: false });
      }
      pipes = pipes.filter((p) => p.x > -60);
      pipes.forEach((p) => {
        if (!p.scored && p.x + 34 < 78) { p.scored = true; score += 1; scoreEl.textContent = score; }
        const inPipe = 78 + 12 > p.x && 78 - 12 < p.x + 34;
        if (inPipe && (birdY - 11 < p.gap || birdY + 11 > p.gap + 92)) over = true;
      });
      if (birdY > Hgt - 26 || birdY < 8) over = true;
      if (over) { stateEl.textContent = "Botsing! Tik om opnieuw te starten."; stateEl.className = "pv-state warn"; }
    }
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, Hgt);
    g.fillStyle = "rgba(126,226,184,.16)";
    pipes.forEach((p) => {
      g.fillRect(p.x, 0, 34, p.gap);
      g.fillRect(p.x, p.gap + 92, 34, Hgt - p.gap - 92);
    });
    g.fillStyle = "#e8c47c";
    g.beginPath();
    g.arc(78, birdY, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#0b1512";
    g.beginPath();
    g.arc(82, birdY - 3, 2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ff8a6b";
    g.fillRect(86, birdY - 1, 8, 4);
    g.fillStyle = "rgba(255,255,255,.06)";
    g.fillRect(0, Hgt - 14, W, 14);
  });

  c.tabIndex = 0;
  c.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") { flap(); event.preventDefault(); }
  });

  return frame(idea, {
    theme: "game",
    label: "Arcade",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), btn("🪽 Vlieg", flap, "pv-btn-primary")),
      h("div", { class: "pv-row pv-between" }, stateEl, btn("↻ Opnieuw", reset, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Tik of druk op de spatiebalk. Ontwijk de buizen en verzamel punten." })
    ]
  });
}

function tetrisPreview(idea) {
  const COLS = 10;
  const ROWS = 16;
  const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
  ];
  const grid = h("div", { class: "pv-tetris-grid" });
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar?" });
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  let piece = null;
  let px = 3;
  let py = 0;
  let score = 0;
  let dropTimer = 0;
  let over = false;

  function spawn() {
    piece = pick(shapes).map((row) => row.slice());
    px = Math.floor((COLS - piece[0].length) / 2);
    py = 0;
    if (collides(px, py, piece)) {
      over = true;
      stateEl.textContent = "Game over! ↻";
      stateEl.className = "pv-state warn";
    }
  }

  function collides(x, y, shape) {
    return shape.some((row, ry) => row.some((value, rx) => {
      if (!value) return false;
      const bx = x + rx;
      const by = y + ry;
      return bx < 0 || bx >= COLS || by >= ROWS || (by >= 0 && board[by][bx]);
    }));
  }

  function merge() {
    piece.forEach((row, ry) => row.forEach((value, rx) => {
      if (value && py + ry >= 0) board[py + ry][px + rx] = 1;
    }));
    let cleared = 0;
    board = board.filter((row) => {
      if (row.every(Boolean)) { cleared += 1; return false; }
      return true;
    });
    while (board.length < ROWS) board.unshift(Array(COLS).fill(0));
    if (cleared) {
      score += cleared * 100;
      scoreEl.textContent = score;
    }
    spawn();
  }

  function move(dx, dy) {
    if (over || !piece) return;
    if (!collides(px + dx, py + dy, piece)) { px += dx; py += dy; }
    else if (dy > 0) merge();
    draw();
  }

  function rotate() {
    if (over || !piece) return;
    const turned = piece[0].map((_, index) => piece.map((row) => row[index]).reverse());
    if (!collides(px, py, turned)) piece = turned;
    draw();
  }

  function draw() {
    const view = board.map((row) => row.slice());
    if (piece) piece.forEach((row, ry) => row.forEach((value, rx) => {
      if (value && py + ry >= 0 && py + ry < ROWS) view[py + ry][px + rx] = 2;
    }));
    grid.replaceChildren(...view.flat().map((value) => h("div", { class: `pv-tetris-cell${value ? " on" : ""}${value === 2 ? " active" : ""}` })));
  }

  function reset() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    over = false;
    scoreEl.textContent = "0";
    stateEl.textContent = "Klaar?";
    stateEl.className = "pv-state";
    spawn();
    draw();
  }

  spawn();
  draw();

  loopWhile(grid, (time) => {
    if (!dropTimer) dropTimer = time;
    if (time - dropTimer > 650 && !over) {
      dropTimer = time;
      move(0, 1);
    }
  });

  return frame(idea, {
    theme: "game",
    label: "Puzzel",
    body: [
      grid,
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), stateEl),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("←", () => move(-1, 0)), btn("⟳", rotate), btn("→", () => move(1, 0)), btn("↓", () => move(0, 1)), btn("⤓", () => { while (!over && piece && !collides(px, py + 1, piece)) py += 1; merge(); draw(); }, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Vul rijen en laat blokken verdwijnen. Gebruik de knoppen of het toetsenbord." })
    ]
  });
}

function wordChainPreview(idea) {
  const entry = input({ type: "text", placeholder: "Typ een woord…", "aria-label": "Woord" });
  const list = h("div", { class: "pv-row" });
  const stateEl = h("span", { class: "pv-state", text: "Begin met een woord" });
  const words = ["appel"];

  function render() {
    list.replaceChildren(...words.map((word) => chip(word)));
    stateEl.textContent = words.length === 1 ? "Begin met een woord" : `Ketting van ${words.length} woorden`;
    stateEl.className = "pv-state good";
  }

  function submit() {
    const word = entry.value.trim().toLowerCase();
    if (!word) return;
    const last = words[words.length - 1];
    if (word[0] !== last[last.length - 1]) {
      stateEl.textContent = `Dat woord moet met “${last[last.length - 1]}” beginnen.`;
      stateEl.className = "pv-state warn";
      return;
    }
    if (words.includes(word)) {
      stateEl.textContent = "Dat woord is al gebruikt.";
      stateEl.className = "pv-state warn";
      return;
    }
    words.push(word);
    entry.value = "";
    render();
  }

  entry.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
  render();

  return frame(idea, {
    theme: "game",
    label: "Woordspel",
    body: [
      h("div", { class: "pv-row pv-gap" }, field("Volgend woord", entry), btn("➕ Voeg toe", submit, "pv-btn-primary")),
      stateEl,
      list,
      h("p", { class: "pv-hint", text: "Elk woord begint met de laatste letter van het vorige woord." })
    ]
  });
}

function bingoPreview(idea) {
  const pool = Array.from({ length: 75 }, (_, index) => index + 1);
  const card = [];
  for (let i = 0; i < 25; i += 1) card.push(i === 12 ? 0 : pool.splice(rnd(pool.length), 1)[0]);
  const grid = h("div", { class: "pv-bingo" });
  const stateEl = h("span", { class: "pv-state", text: "Nog geen balletjes" });
  const drawEl = h("strong", { class: "pv-score-value", text: "—" });
  let drawn = [];

  function render() {
    grid.replaceChildren(...card.map((number, index) => h("div", { class: `pv-bingo-cell${number === 0 ? " free" : ""}${number && drawn.includes(number) ? " marked" : ""}`, text: number === 0 ? "★" : number })));
  }

  function draw() {
    const left = pool.filter((number) => !drawn.includes(number) && !card.includes(number));
    if (!left.length) return;
    const number = left[rnd(left.length)];
    drawn.push(number);
    drawEl.textContent = number;
    const marked = card.filter((value) => value && drawn.includes(value)).length;
    stateEl.textContent = `${drawn.length} getrokken · ${marked}/24 vakjes`;
    stateEl.className = marked >= 5 ? "pv-state good" : "pv-state";
    render();
  }

  function reset() {
    const fresh = Array.from({ length: 75 }, (_, index) => index + 1);
    for (let i = 0; i < 25; i += 1) card[i] = i === 12 ? 0 : fresh.splice(rnd(fresh.length), 1)[0];
    drawn = [];
    drawEl.textContent = "—";
    stateEl.textContent = "Nog geen balletjes";
    stateEl.className = "pv-state";
    render();
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Bingo",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Balletje ", drawEl), stateEl),
      grid,
      h("div", { class: "pv-row pv-center pv-gap" }, btn("🎲 Trek balletje", draw, "pv-btn-primary"), btn("↻ Nieuwe kaart", reset, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Trek balletjes en kijk welke nummers op jouw kaart staan." })
    ]
  });
}

function mazePreview(idea) {
  const layout = [
    "#########",
    "#S..#...#",
    "#.#.#.#.#",
    "#.#...#.#",
    "#.#####.#",
    "#...#...#",
    "#.#.#.#.#",
    "#...#..G#",
    "#########"
  ];
  const grid = h("div", { class: "pv-maze", style: { gridTemplateColumns: "repeat(9, 1fr)" } });
  const stateEl = h("span", { class: "pv-state", text: "Zoek de gouden uitgang" });
  let player = { x: 1, y: 1 };
  const goal = { x: 7, y: 7 };

  function render() {
    const cells = [];
    layout.forEach((row, y) => [...row].forEach((cell, x) => {
      let cls = "pv-maze-cell";
      if (cell === "#") cls += " wall";
      if (x === goal.x && y === goal.y) cls += " goal";
      if (x === player.x && y === player.y) cls += " player";
      cells.push(h("div", { class: cls }));
    }));
    grid.replaceChildren(...cells);
  }

  function move(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (layout[ny] && layout[ny][nx] && layout[ny][nx] !== "#") {
      player = { x: nx, y: ny };
      if (nx === goal.x && ny === goal.y) {
        stateEl.textContent = "Je hebt de uitgang gevonden! 🏆";
        stateEl.className = "pv-state good";
      }
    }
    render();
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Doolhof",
    body: [
      grid,
      h("div", { class: "pv-row pv-between" }, stateEl, h("span", { class: "pv-hint", text: "Beweeg naar de gouden cel" })),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("←", () => move(-1, 0)), btn("↑", () => move(0, -1)), btn("↓", () => move(0, 1)), btn("→", () => move(1, 0)), btn("↻", () => { player = { x: 1, y: 1 }; stateEl.textContent = "Zoek de gouden uitgang"; stateEl.className = "pv-state"; render(); }, "pv-btn-ghost"))
    ]
  });
}

function platformerPreview(idea) {
  const W = 420;
  const Hgt = 240;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Spring en verzamel munten" });
  const platforms = [
    { x: 0, y: 214, w: W, h: 26 },
    { x: 60, y: 168, w: 90, h: 10 },
    { x: 190, y: 140, w: 80, h: 10 },
    { x: 310, y: 108, w: 90, h: 10 }
  ];
  const coins = [
    { x: 100, y: 148, got: false },
    { x: 230, y: 120, got: false },
    { x: 350, y: 88, got: false }
  ];
  const player = { x: 30, y: 180, vx: 0, vy: 0, w: 18, h: 22, grounded: false };
  let score = 0;
  let last = 0;

  function jump() {
    if (player.grounded) {
      player.vy = -6.2;
      player.grounded = false;
    }
  }

  function move(dx) {
    player.vx = dx * 2.6;
  }

  loopWhile(c, (time) => {
    if (!last) last = time;
    const dt = Math.min(40, time - last) / 16;
    last = time;
    player.vy += 0.34 * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.vx *= 0.82;
    if (player.x < 0) player.x = 0;
    if (player.x > W - player.w) player.x = W - player.w;
    player.grounded = false;
    platforms.forEach((p) => {
      const landing = player.x + player.w > p.x && player.x < p.x + p.w && player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 12 && player.vy >= 0;
      if (landing) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    });
    coins.forEach((coin) => {
      if (!coin.got && Math.abs(coin.x - (player.x + player.w / 2)) < 20 && Math.abs(coin.y - (player.y + player.h / 2)) < 22) {
        coin.got = true;
        score += 1;
        scoreEl.textContent = score;
        stateEl.textContent = score === coins.length ? "Alle munten! 🏆" : "Goed bezig!";
        stateEl.className = "pv-state good";
      }
    });
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, Hgt);
    g.fillStyle = "rgba(126,226,184,.18)";
    platforms.forEach((p) => g.fillRect(p.x, p.y, p.w, p.h));
    g.fillStyle = "#e8c47c";
    coins.forEach((coin) => {
      if (!coin.got) {
        g.beginPath();
        g.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
        g.fill();
      }
    });
    g.fillStyle = "#7ee2b8";
    g.fillRect(player.x, player.y, player.w, player.h);
    g.fillStyle = "#0b1512";
    g.fillRect(player.x + 4, player.y + 6, 3, 3);
    g.fillRect(player.x + 11, player.y + 6, 3, 3);
  });

  c.tabIndex = 0;
  c.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") { jump(); event.preventDefault(); }
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  return frame(idea, {
    theme: "game",
    label: "Platform",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Munten ", scoreEl), stateEl),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("←", () => move(-1)), btn("⬆ Spring", jump, "pv-btn-primary"), btn("→", () => move(1))),
      h("p", { class: "pv-hint", text: "Spring van platform naar platform en verzamel alle munten." })
    ]
  });
}

function fallingBallPreview(idea) {
  const W = 420;
  const Hgt = 240;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Vang de ballen" });
  const basket = { x: W / 2 - 30, y: Hgt - 34, w: 60, h: 14, speed: 5 };
  let balls = [];
  let score = 0;
  let missed = 0;
  let last = 0;

  function drop() {
    balls.push({ x: 20 + rnd(W - 40), y: -10, r: 7, speed: 1.2 + Math.random() * 1.2 });
  }

  loopWhile(c, (time) => {
    if (!last) last = time;
    const dt = Math.min(40, time - last) / 16;
    last = time;
    if (Math.random() < 0.035 * dt) drop();
    balls.forEach((ball) => { ball.y += ball.speed * dt; });
    balls = balls.filter((ball) => {
      if (ball.y + ball.r >= basket.y && ball.y - ball.r <= basket.y + basket.h && ball.x > basket.x && ball.x < basket.x + basket.w) {
        score += 1;
        scoreEl.textContent = score;
        return false;
      }
      if (ball.y - ball.r > Hgt) {
        missed += 1;
        if (missed >= 3) {
          stateEl.textContent = "3 gemist! Tik opnieuw.";
          stateEl.className = "pv-state warn";
        }
        return false;
      }
      return true;
    });
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, Hgt);
    g.fillStyle = "#ff8a6b";
    balls.forEach((ball) => {
      g.beginPath();
      g.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = "#7ee2b8";
    g.fillRect(basket.x, basket.y, basket.w, basket.h);
    g.fillStyle = "#e8c47c";
    g.fillRect(basket.x + 4, basket.y - 5, basket.w - 8, 5);
  });

  c.tabIndex = 0;
  c.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") basket.x = Math.max(0, basket.x - 26);
    if (event.key === "ArrowRight") basket.x = Math.min(W - basket.w, basket.x + 26);
  });

  return frame(idea, {
    theme: "game",
    label: "Behendigheid",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Gevangen ", scoreEl), stateEl),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("←", () => { basket.x = Math.max(0, basket.x - 26); }), btn("→", () => { basket.x = Math.min(W - basket.w, basket.x + 26); }), btn("↻ Opnieuw", () => { balls = []; score = 0; missed = 0; scoreEl.textContent = "0"; stateEl.textContent = "Vang de ballen"; stateEl.className = "pv-state"; }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "Beweeg de mand en vang de vallende ballen voordat ze de grond raken." })
    ]
  });
}

function wordSearchPreview(idea) {
  const letters = [
    "PYTHONABCD",
    "QWLERTOIJD",
    "AANAPPELKL",
    "SNELFIETSQ",
    "DBOOMZONMN",
    "KATTENHOND",
    "VRUCHTBAAR",
    "MAANSTERRE",
    "FIETSBELON",
    "ZONNEBLOEM"
  ];
  const words = ["APPEL", "FIETS", "BOOM", "ZON", "KAT", "MAAN"];
  const grid = h("div", { class: "pv-wordsearch" });
  const stateEl = h("span", { class: "pv-state", text: "Klik op een woord" });
  const found = new Set();

  function render(highlight = null) {
    grid.replaceChildren(...letters.flatMap((row, y) => [...row].map((letter, x) => h("div", { class: `pv-ws-cell${highlight && highlight.some(([hx, hy]) => hx === x && hy === y) ? " found" : ""}`, text: letter }))));
  }

  function find(word) {
    for (let y = 0; y < letters.length; y += 1) {
      const x = letters[y].indexOf(word);
      if (x >= 0) {
        found.add(word);
        render([...word].map((_, index) => [x + index, y]));
        stateEl.textContent = `${word} gevonden! (${found.size}/${words.length})`;
        stateEl.className = "pv-state good";
        return;
      }
    }
    stateEl.textContent = `${word} zit hier niet in.`;
    stateEl.className = "pv-state warn";
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Woordzoeker",
    body: [
      grid,
      stateEl,
      h("div", { class: "pv-row pv-gap" }, ...words.map((word) => btn(word, () => find(word), found.has(word) ? "pv-btn-ghost" : ""))),
      h("p", { class: "pv-hint", text: "Zoek de woorden horizontaal in het letterrooster." })
    ]
  });
}

function sokobanPreview(idea) {
  const layout = [
    "########",
    "#..####",
    "#..####",
    "#.@B..##",
    "###B..##",
    "###..G.##",
    "########"
  ];
  const grid = h("div", { class: "pv-sokoban", style: { gridTemplateColumns: "repeat(8, 1fr)" } });
  const stateEl = h("span", { class: "pv-state", text: "Schuif de dozen op de gouden vakken" });
  let player = { x: 2, y: 3 };
  let boxes = [{ x: 3, y: 3 }, { x: 3, y: 4 }];
  const targets = [{ x: 3, y: 3 }, { x: 3, y: 4 }];

  function render() {
    const cells = [];
    layout.forEach((row, y) => [...row].forEach((cell, x) => {
      let cls = "pv-sokoban-cell";
      if (cell === "#") cls += " wall";
      if (targets.some((t) => t.x === x && t.y === y)) cls += " target";
      if (boxes.some((b) => b.x === x && b.y === y)) cls += targets.some((t) => t.x === x && t.y === y) ? " done" : " box";
      if (player.x === x && player.y === y) cls += " player";
      cells.push(h("div", { class: cls }));
    }));
    grid.replaceChildren(...cells);
  }

  function walkable(x, y) {
    if (!layout[y] || layout[y][x] === "#" || layout[y][x] === undefined) return false;
    return !boxes.some((b) => b.x === x && b.y === y);
  }

  function move(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    const box = boxes.find((b) => b.x === nx && b.y === ny);
    if (box) {
      const bx = nx + dx;
      const by = ny + dy;
      if (!walkable(bx, by)) return;
      box.x = bx;
      box.y = by;
    } else if (!walkable(nx, ny)) {
      return;
    }
    player = { x: nx, y: ny };
    const done = boxes.every((b) => targets.some((t) => t.x === b.x && t.y === b.y));
    if (done) {
      stateEl.textContent = "Alle dozen staan goed! 🏆";
      stateEl.className = "pv-state good";
    }
    render();
  }

  render();

  return frame(idea, {
    theme: "game",
    label: "Puzzel",
    body: [
      grid,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("↻", () => { player = { x: 2, y: 3 }; boxes = [{ x: 3, y: 3 }, { x: 3, y: 4 }]; stateEl.textContent = "Schuif de dozen op de gouden vakken"; stateEl.className = "pv-state"; render(); }, "pv-btn-ghost")),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("←", () => move(-1, 0)), btn("↑", () => move(0, -1)), btn("↓", () => move(0, 1)), btn("→", () => move(1, 0)))
    ]
  });
}

function spaceShooterPreview(idea) {
  const W = 420;
  const Hgt = 240;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Verdedig de aarde" });
  let enemies = [];
  let bullets = [];
  let score = 0;
  let shipX = W / 2;
  let last = 0;
  let spawnTimer = 0;
  let gameOver = false;

  function fire() {
    if (gameOver) return;
    bullets.push({ x: shipX, y: Hgt - 42 });
  }

  loopWhile(c, (time) => {
    if (!last) last = time;
    const dt = Math.min(40, time - last) / 16;
    last = time;
    if (!gameOver) {
      spawnTimer += dt;
      if (spawnTimer > 40) {
        spawnTimer = 0;
        enemies.push({ x: 20 + rnd(W - 40), y: -12, speed: 0.7 + Math.random() * 0.9 });
      }
      enemies.forEach((enemy) => { enemy.y += enemy.speed * dt; });
      bullets.forEach((bullet) => { bullet.y -= 5 * dt; });
      bullets = bullets.filter((b) => b.y > -10);
      bullets.forEach((bullet) => {
        enemies = enemies.filter((enemy) => {
          if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < 14) {
            score += 10;
            scoreEl.textContent = score;
            bullet.dead = true;
            return false;
          }
          return true;
        });
      });
      bullets = bullets.filter((b) => !b.dead);
      enemies = enemies.filter((enemy) => {
        if (enemy.y > Hgt - 24) {
          gameOver = true;
          stateEl.textContent = "Doorgebroken! ↻";
          stateEl.className = "pv-state warn";
          return false;
        }
        return true;
      });
    }
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, Hgt);
    g.fillStyle = "#ff8a6b";
    enemies.forEach((enemy) => {
      g.beginPath();
      g.moveTo(enemy.x, enemy.y + 9);
      g.lineTo(enemy.x - 9, enemy.y - 7);
      g.lineTo(enemy.x + 9, enemy.y - 7);
      g.closePath();
      g.fill();
    });
    g.fillStyle = "#e8c47c";
    bullets.forEach((bullet) => g.fillRect(bullet.x - 1.5, bullet.y - 6, 3, 10));
    g.fillStyle = "#7ee2b8";
    g.beginPath();
    g.moveTo(shipX, Hgt - 40);
    g.lineTo(shipX - 12, Hgt - 18);
    g.lineTo(shipX + 12, Hgt - 18);
    g.closePath();
    g.fill();
  });

  c.tabIndex = 0;
  c.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") shipX = Math.max(16, shipX - 24);
    if (event.key === "ArrowRight") shipX = Math.min(W - 16, shipX + 24);
    if (event.key === " ") { fire(); event.preventDefault(); }
  });

  return frame(idea, {
    theme: "game",
    label: "Shooter",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), stateEl),
      h("div", { class: "pv-row pv-center pv-gap" }, btn("←", () => { shipX = Math.max(16, shipX - 24); }), btn("🔥 Schiet", fire, "pv-btn-primary"), btn("→", () => { shipX = Math.min(W - 16, shipX + 24); }), btn("↻", () => { enemies = []; bullets = []; score = 0; gameOver = false; scoreEl.textContent = "0"; stateEl.textContent = "Verdedig de aarde"; stateEl.className = "pv-state"; }, "pv-btn-ghost"))
    ]
  });
}

function catRunnerPreview(idea) {
  const W = 420;
  const Hgt = 220;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const scoreEl = h("strong", { class: "pv-score-value", text: "0" });
  const stateEl = h("span", { class: "pv-state", text: "Spring over de obstakels" });
  const cat = { x: 60, y: Hgt - 58, vy: 0, grounded: true };
  let obstacles = [];
  let score = 0;
  let last = 0;
  let spawn = 0;
  let over = false;

  function jump() {
    if (over) {
      obstacles = [];
      score = 0;
      over = false;
      scoreEl.textContent = "0";
      stateEl.textContent = "Spring over de obstakels";
      stateEl.className = "pv-state";
      return;
    }
    if (cat.grounded) {
      cat.vy = -7;
      cat.grounded = false;
    }
  }

  loopWhile(c, (time) => {
    if (!last) last = time;
    const dt = Math.min(40, time - last) / 16;
    last = time;
    if (!over) {
      cat.vy += 0.42 * dt;
      cat.y += cat.vy * dt;
      if (cat.y >= Hgt - 58) {
        cat.y = Hgt - 58;
        cat.vy = 0;
        cat.grounded = true;
      }
      spawn += dt;
      if (spawn > 55) {
        spawn = 0;
        obstacles.push({ x: W + 20, w: 16 + rnd(14), h: 20 + rnd(24) });
      }
      obstacles.forEach((obstacle) => { obstacle.x -= 3 * dt; });
      obstacles = obstacles.filter((obstacle) => {
        if (obstacle.x + obstacle.w < cat.x && !obstacle.passed) {
          obstacle.passed = true;
          score += 1;
          scoreEl.textContent = score;
        }
        const hit = obstacle.x < cat.x + 28 && obstacle.x + obstacle.w > cat.x && Hgt - 40 - obstacle.h < cat.y + 34;
        if (hit) {
          over = true;
          stateEl.textContent = "Botsing! Tik om opnieuw te rennen.";
          stateEl.className = "pv-state warn";
        }
        return obstacle.x > -40;
      });
    }
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, W, Hgt);
    g.fillStyle = "rgba(255,255,255,.06)";
    g.fillRect(0, Hgt - 24, W, 24);
    g.fillStyle = "#ff8a6b";
    obstacles.forEach((obstacle) => g.fillRect(obstacle.x, Hgt - 24 - obstacle.h, obstacle.w, obstacle.h));
    g.fillStyle = "#e8c47c";
    g.beginPath();
    g.arc(cat.x + 14, cat.y + 16, 15, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(cat.x + 2, cat.y + 4);
    g.lineTo(cat.x + 8, cat.y - 6);
    g.lineTo(cat.x + 14, cat.y + 4);
    g.fill();
    g.beginPath();
    g.moveTo(cat.x + 16, cat.y + 4);
    g.lineTo(cat.x + 22, cat.y - 6);
    g.lineTo(cat.x + 27, cat.y + 4);
    g.fill();
    g.fillStyle = "#0b1512";
    g.beginPath();
    g.arc(cat.x + 9, cat.y + 15, 2, 0, Math.PI * 2);
    g.arc(cat.x + 20, cat.y + 15, 2, 0, Math.PI * 2);
    g.fill();
  });

  c.tabIndex = 0;
  c.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") { jump(); event.preventDefault(); }
  });

  return frame(idea, {
    theme: "game",
    label: "Runner",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Afstand ", scoreEl), stateEl),
      h("div", { class: "pv-row pv-center" }, btn("🐱 Spring", jump, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Tik of druk op de spatiebalk om over de obstakels te springen." })
    ]
  });
}

/* === EXTRA PREVIEWS: wetenschap === */

function starMapPreview(idea) {
  const W = 420;
  const Hgt = 240;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const nameEl = h("strong", { class: "pv-state", text: "Klik op een ster" });
  const stars = [
    { x: 60, y: 60, name: "Sirius", size: 3.4 },
    { x: 130, y: 110, name: "Vega", size: 2.8 },
    { x: 220, y: 70, name: "Altair", size: 2.4 },
    { x: 300, y: 130, name: "Deneb", size: 3 },
    { x: 360, y: 60, name: "Polaris", size: 2.2 },
    { x: 180, y: 180, name: "Rigel", size: 2.6 },
    { x: 330, y: 195, name: "Betelgeuze", size: 3.6 },
    { x: 90, y: 200, name: "Proxima", size: 1.8 }
  ];
  const lines = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [5, 7]];

  function draw(active = -1) {
    g.fillStyle = "#07110d";
    g.fillRect(0, 0, W, Hgt);
    for (let i = 0; i < 60; i += 1) {
      g.fillStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.2})`;
      g.fillRect(rnd(W), rnd(Hgt), 1, 1);
    }
    g.strokeStyle = "rgba(232,196,124,.25)";
    g.lineWidth = 1;
    lines.forEach(([a, b]) => {
      g.beginPath();
      g.moveTo(stars[a].x, stars[a].y);
      g.lineTo(stars[b].x, stars[b].y);
      g.stroke();
    });
    stars.forEach((star, index) => {
      g.fillStyle = index === active ? "#e8c47c" : "#7ee2b8";
      g.beginPath();
      g.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      g.fill();
    });
  }

  draw();

  c.addEventListener("click", (event) => {
    const rect = c.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * Hgt;
    let best = -1;
    let bestDist = 24;
    stars.forEach((star, index) => {
      const dist = Math.hypot(star.x - x, star.y - y);
      if (dist < bestDist) { bestDist = dist; best = index; }
    });
    if (best >= 0) {
      nameEl.textContent = `⭐ ${stars[best].name}`;
      nameEl.className = "pv-state good";
      draw(best);
    }
  });

  return frame(idea, {
    theme: "science",
    label: "Sterrenhemel",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, nameEl, chip("🌌 8 sterren")),
      h("p", { class: "pv-hint", text: "Klik op een ster om de naam te zien. De lijnen tonen bekende sterrenbeelden." })
    ]
  });
}

function gravityPreview(idea) {
  const W = 420;
  const Hgt = 260;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const speed = input({ type: "range", min: "1", max: "10", value: "5", "aria-label": "Snelheid" });
  const mass = input({ type: "range", min: "1", max: "10", value: "6", "aria-label": "Massa" });
  const stateEl = h("span", { class: "pv-state", text: "Stabiele baan" });
  const cx = W / 2;
  const cy = Hgt / 2;
  let angle = 0;
  let radius = 88;

  loopWhile(c, () => {
    const v = Number(speed.value) * 0.0016;
    angle += v;
    const r = 88 + (10 - Number(mass.value)) * 4;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.62;
    g.fillStyle = "#07110d";
    g.fillRect(0, 0, W, Hgt);
    g.strokeStyle = "rgba(126,226,184,.14)";
    g.beginPath();
    g.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#e8c47c";
    g.beginPath();
    g.arc(cx, cy, 16 + Number(mass.value) * 1.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#7ee2b8";
    g.beginPath();
    g.arc(x, y, 7, 0, Math.PI * 2);
    g.fill();
  });

  speed.addEventListener("input", () => {
    stateEl.textContent = `Snelheid ${speed.value} · massa ${mass.value}`;
  });

  return frame(idea, {
    theme: "science",
    label: "Simulatie",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-gap" }, field("Snelheid", speed), field("Massa", mass)),
      h("div", { class: "pv-row pv-between" }, stateEl, chip("🪐 Zwaartekracht")),
      h("p", { class: "pv-hint", text: "De zwaartekracht houdt de satelliet in een baan. Verander de massa en zie wat er gebeurt." })
    ]
  });
}

function plantGrowthPreview(idea) {
  const water = input({ type: "range", min: "0", max: "10", value: "6", "aria-label": "Water" });
  const light = input({ type: "range", min: "0", max: "10", value: "7", "aria-label": "Licht" });
  const plantEl = h("div", { class: "pv-poem" });
  const stateEl = h("span", { class: "pv-state", text: "Groei" });
  const bar = h("div", { class: "pv-progress" }, h("i"));

  function render() {
    const score = Math.round((Number(water.value) * 0.5 + Number(light.value) * 0.5) * 10);
    const stage = score < 25 ? "🌱" : score < 50 ? "🌿" : score < 75 ? "🪴" : "🌳";
    plantEl.replaceChildren(h("p", { text: `${stage} ${stage} ${stage}` }), h("span", { class: "pv-poem-sign", text: `Gezondheid ${score}%` }));
    stateEl.textContent = score < 35 ? "Te weinig water of licht" : score < 70 ? "De plant groeit" : "Perfecte omstandigheden";
    stateEl.className = `pv-state ${score < 35 ? "warn" : score >= 70 ? "good" : ""}`.trim();
    bar.firstChild.style.width = `${score}%`;
  }

  [water, light].forEach((control) => control.addEventListener("input", render));
  render();

  return frame(idea, {
    theme: "science",
    label: "Biologie",
    body: [
      plantEl,
      bar,
      h("div", { class: "pv-row pv-gap" }, field("💧 Water", water), field("☀️ Licht", light)),
      h("div", { class: "pv-row pv-between" }, stateEl, chip("🌱 Plantengroei")),
      h("p", { class: "pv-hint", text: "Water en licht bepalen samen hoe snel de plant groeit." })
    ]
  });
}

function exoplanetPreview(idea) {
  const W = 420;
  const Hgt = 200;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const stateEl = h("span", { class: "pv-state", text: "Meting loopt…" });
  let t = 0;

  loopWhile(c, () => {
    t += 0.01;
    g.fillStyle = "#07110d";
    g.fillRect(0, 0, W, Hgt);
    g.strokeStyle = "rgba(126,226,184,.15)";
    for (let i = 0; i <= 4; i += 1) {
      const y = 20 + (i / 4) * (Hgt - 40);
      g.beginPath();
      g.moveTo(30, y);
      g.lineTo(W - 20, y);
      g.stroke();
    }
    g.strokeStyle = "#e8c47c";
    g.lineWidth = 2.2;
    g.beginPath();
    for (let x = 0; x <= W - 50; x += 2) {
      const phase = (x / (W - 50)) * Math.PI * 2;
      const dip = Math.abs(phase - Math.PI) < 0.22 ? 24 * (1 - Math.abs(phase - Math.PI) / 0.22) : 0;
      const y = Hgt / 2 + Math.sin(phase + t * 0.4) * 4 + dip;
      if (x === 0) g.moveTo(30 + x, y);
      else g.lineTo(30 + x, y);
    }
    g.stroke();
    g.fillStyle = "#7ee2b8";
    g.beginPath();
    g.arc(30 + ((t * 90) % (W - 50)), Hgt / 2, 5, 0, Math.PI * 2);
    g.fill();
  });

  return frame(idea, {
    theme: "science",
    label: "Astronomie",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, stateEl, chip("🪐 Transit")),
      h("p", { class: "pv-hint", text: "Als een planeet voor zijn ster schuift, wordt het licht even minder. Die dip zie je in de grafiek." })
    ]
  });
}

function ecosystemPreview(idea) {
  const W = 420;
  const Hgt = 200;
  const c = canvas(W, Hgt);
  const g = ctx2d(c);
  const prey = input({ type: "range", min: "1", max: "10", value: "6", "aria-label": "Prooien" });
  const hunter = input({ type: "range", min: "1", max: "10", value: "4", "aria-label": "Jagers" });
  const stateEl = h("span", { class: "pv-state", text: "Evenwicht" });
  let t = 0;

  loopWhile(c, () => {
    t += 0.02;
    const a = Number(prey.value);
    const b = Number(hunter.value);
    g.fillStyle = "#07110d";
    g.fillRect(0, 0, W, Hgt);
    g.strokeStyle = "rgba(126,226,184,.18)";
    g.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = Hgt / 2 + Math.sin((x / W) * Math.PI * 4 + t) * (a * 5);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.strokeStyle = "rgba(255,138,107,.6)";
    g.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = Hgt / 2 + Math.cos((x / W) * Math.PI * 4 + t) * (b * 5);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  });

  return frame(idea, {
    theme: "science",
    label: "Ecosysteem",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-gap" }, field("🐰 Prooien", prey), field("🦊 Jagers", hunter)),
      h("div", { class: "pv-row pv-between" }, stateEl, chip("🌿 Populaties")),
      h("p", { class: "pv-hint", text: "Meer prooien betekent meer jagers — en daarna weer minder prooien. Dat is een cyclus." })
    ]
  });
}

function moleculePreview(idea) {
  const formula = input({ type: "text", value: "H2O", "aria-label": "Molecuulformule" });
  const outputEl = h("div", { class: "pv-tool-result" }, h("span", { class: "pv-state", text: "Massa" }), h("strong", { class: "pv-output", text: "" }));
  const detailEl = h("p", { class: "pv-hint" });
  const masses = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.99, Cl: 35.45, S: 32.06, Ca: 40.078, Fe: 55.845 };
  const names = { H: "waterstof", C: "koolstof", N: "stikstof", O: "zuurstof", Na: "natrium", Cl: "chloor", S: "zwavel", Ca: "calcium", Fe: "ijzer" };

  function parse(text) {
    const tokens = [];
    const re = /([A-Z][a-z]?)(\d*)/g;
    let match;
    let used = 0;
    while ((match = re.exec(text))) {
      const symbol = match[1];
      if (!masses[symbol]) continue;
      const count = match[2] ? Number(match[2]) : 1;
      tokens.push([symbol, count]);
      used += match[0].length;
    }
    return used ? tokens : null;
  }

  function render() {
    const tokens = parse(formula.value);
    if (!tokens) {
      outputEl.lastChild.textContent = "—";
      detailEl.textContent = "Gebruik symbolen zoals H2O, CO2 of NaCl.";
      return;
    }
    const total = tokens.reduce((sum, [symbol, count]) => sum + masses[symbol] * count, 0);
    outputEl.lastChild.textContent = `${total.toFixed(2)} g/mol`;
    detailEl.textContent = tokens.map(([symbol, count]) => `${count}× ${names[symbol]} (${masses[symbol]})`).join(" + ");
  }

  formula.addEventListener("input", render);
  render();

  return frame(idea, {
    theme: "science",
    label: "Chemie",
    body: [
      field("Molecuulformule", formula),
      outputEl,
      detailEl,
      h("div", { class: "pv-row pv-gap" }, ...["H2O", "CO2", "NaCl", "C6H12O6"].map((item) => btn(item, () => { formula.value = item; render(); }, "pv-btn-ghost")))
    ]
  });
}

function heatPreview(idea) {
  const COLS = 12;
  const ROWS = 8;
  const grid = h("div", { class: "pv-heat", style: { gridTemplateColumns: `repeat(${COLS}, 1fr)` } });
  const stateEl = h("span", { class: "pv-state", text: "Warmte verspreidt zich" });
  let cells = Array.from({ length: ROWS }, (_, y) => Array.from({ length: COLS }, (_, x) => (Math.abs(x - 2) < 1 && Math.abs(y - 4) < 1 ? 1 : 0)));
  let timer = 0;

  function color(value) {
    if (value < 0.15) return "rgba(138,180,255,.14)";
    if (value < 0.4) return `rgba(126,226,184,${0.2 + value * 0.5})`;
    if (value < 0.7) return `rgba(232,196,124,${0.3 + value * 0.5})`;
    return `rgba(255,138,107,${0.45 + value * 0.5})`;
  }

  function render() {
    grid.replaceChildren(...cells.flat().map((value) => h("div", { class: "pv-heat-cell", style: { background: color(value) } })));
  }

  function step() {
    const next = cells.map((row) => row.slice());
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        let sum = 0;
        let count = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) { sum += cells[ny][nx]; count += 1; }
        }
        next[y][x] = cells[y][x] * 0.72 + (sum / Math.max(1, count)) * 0.28;
      }
    }
    cells = next;
    render();
  }

  loopWhile(grid, (time) => {
    if (!timer) timer = time;
    if (time - timer > 260) { timer = time; step(); }
  });
  render();

  return frame(idea, {
    theme: "science",
    label: "Simulatie",
    body: [
      grid,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("↻ Opnieuw", () => { cells = Array.from({ length: ROWS }, (_, y) => Array.from({ length: COLS }, (_, x) => (Math.abs(x - 2) < 1 && Math.abs(y - 4) < 1 ? 1 : 0))); render(); }, "pv-btn-ghost")),
      h("p", { class: "pv-hint", text: "De warme bron in het midden geeft zijn warmte stap voor stap door aan de buren." })
    ]
  });
}

/* === EXTRA PREVIEWS: security, automatisering en web === */

function portScannerPreview(idea) {
  const host = input({ type: "text", value: "192.168.1.1", "aria-label": "Host" });
  const list = h("div", { class: "pv-scan-list" });
  const stateEl = h("span", { class: "pv-state", text: "Klaar om te scannen" });
  const ports = [22, 80, 443, 3306, 8080, 5432, 21, 25];
  let results = [];

  function render() {
    list.replaceChildren(...ports.map((port) => {
      const result = results.find((item) => item.port === port);
      return h("div", { class: `pv-scan-row${result && result.open ? " open" : ""}` }, h("span", { text: `poort ${port}` }), h("span", { text: !result ? "…" : result.open ? "open" : "gesloten" }));
    }));
  }

  function scan() {
    results = [];
    stateEl.textContent = "Scannen…";
    stateEl.className = "pv-state";
    render();
    let index = 0;
    const timer = setInterval(() => {
      if (index >= ports.length) {
        clearInterval(timer);
        const open = results.filter((item) => item.open).length;
        stateEl.textContent = `${open} open poort${open === 1 ? "" : "en"} gevonden`;
        stateEl.className = open ? "pv-state warn" : "pv-state good";
        return;
      }
      const port = ports[index];
      results.push({ port, open: [80, 443, 8080].includes(port) });
      index += 1;
      render();
    }, 260);
  }

  render();

  return frame(idea, {
    theme: "security",
    label: "Netwerk",
    body: [
      h("div", { class: "pv-row pv-gap" }, field("Host", host), btn("🔍 Scan", scan, "pv-btn-primary")),
      stateEl,
      list,
      h("p", { class: "pv-hint", text: "Scan alleen je eigen netwerk. Deze demo controleert een vaste lijst poorten." })
    ]
  });
}

function integrityPreview(idea) {
  const a = textarea({ rows: 2, "aria-label": "Origineel" });
  a.value = "Hallo EasyCodey!";
  const b = textarea({ rows: 2, "aria-label": "Controle" });
  b.value = "Hallo EasyCodey!";
  const resultEl = h("div", { class: "pv-feedback", text: "" });
  const hashEl = h("code", { class: "pv-hash", text: "" });

  function hash(text) {
    let value = 0;
    for (let i = 0; i < text.length; i += 1) {
      value = (value * 31 + text.charCodeAt(i)) >>> 0;
    }
    return value.toString(16).padStart(8, "0");
  }

  function check() {
    const same = a.value === b.value;
    resultEl.textContent = same ? "✓ De bestanden zijn identiek." : "⚠ De inhoud is verschillend!";
    resultEl.className = `pv-feedback ${same ? "good" : "warn"}`;
    hashEl.textContent = `sha: ${hash(a.value)} · ${hash(b.value)}`;
  }

  [a, b].forEach((element) => element.addEventListener("input", check));
  check();

  return frame(idea, {
    theme: "security",
    label: "Integriteit",
    body: [
      h("div", { class: "pv-split" }, field("Origineel", a), field("Controle", b)),
      resultEl,
      hashEl,
      h("p", { class: "pv-hint", text: "Een hash verandert volledig zodra er één teken anders is. Zo merk je sabotage of fouten." })
    ]
  });
}

function keyExchangePreview(idea) {
  const stateEl = h("span", { class: "pv-state", text: "Kies een geheim getal" });
  const alice = input({ type: "range", min: "2", max: "9", value: "4", "aria-label": "Geheim A" });
  const bob = input({ type: "range", min: "2", max: "9", value: "6", "aria-label": "Geheim B" });
  const publicEl = h("div", { class: "pv-keyviz" });
  const resultEl = h("div", { class: "pv-feedback", text: "" });
  const p = 23;
  const g = 5;

  function render() {
    const a = Number(alice.value);
    const b = Number(bob.value);
    const A = (g ** a) % p;
    const B = (g ** b) % p;
    const sharedA = (B ** a) % p;
    const sharedB = (A ** b) % p;
    publicEl.replaceChildren(
      h("div", { class: "pv-keybox" }, h("small", { text: "Alice geheim" }), h("strong", { text: a })),
      h("span", { class: "pv-arrow", text: "→" }),
      h("div", { class: "pv-keybox" }, h("small", { text: "Publiek A" }), h("strong", { text: A })),
      h("span", { class: "pv-arrow", text: "⇄" }),
      h("div", { class: "pv-keybox" }, h("small", { text: "Publiek B" }), h("strong", { text: B })),
      h("span", { class: "pv-arrow", text: "←" }),
      h("div", { class: "pv-keybox" }, h("small", { text: "Bob geheim" }), h("strong", { text: b }))
    );
    resultEl.textContent = `Gedeelde sleutel: ${sharedA} (Alice) = ${sharedB} (Bob) ✓`;
    resultEl.className = "pv-feedback good";
  }

  [alice, bob].forEach((control) => control.addEventListener("input", render));
  render();

  return frame(idea, {
    theme: "security",
    label: "Sleutels",
    body: [
      publicEl,
      resultEl,
      h("div", { class: "pv-row pv-gap" }, field("Alice", alice), field("Bob", bob)),
      h("div", { class: "pv-row pv-between" }, stateEl, chip("🔐 Diffie-Hellman")),
      h("p", { class: "pv-hint", text: "Beide partijen maken een publieke waarde en vinden zo dezelfde geheime sleutel, zonder die ooit te versturen." })
    ]
  });
}

function logAnalysisPreview(idea) {
  const logs = textarea({ rows: 5, "aria-label": "Logboek" });
  logs.value = "INFO server gestart\nWARN schijf bijna vol\nERROR database niet bereikbaar\nINFO bezoeker ingelogd\nERROR time-out\nWARN veel aanvragen";
  const statsEl = h("div", { class: "pv-stats" });
  const list = h("div", { class: "pv-log" });
  const stateEl = h("span", { class: "pv-state", text: "6 regels" });

  function analyse() {
    const lines = logs.value.split(/\r?\n/).filter((line) => line.trim());
    const counts = { INFO: 0, WARN: 0, ERROR: 0 };
    lines.forEach((line) => {
      const match = line.match(/\b(INFO|WARN|ERROR)\b/i);
      if (match) counts[match[1].toUpperCase()] += 1;
    });
    statsEl.replaceChildren(
      h("div", { class: "pv-stat" }, h("strong", { text: counts.INFO }), h("span", { text: "info" })),
      h("div", { class: "pv-stat" }, h("strong", { text: counts.WARN }), h("span", { text: "waarschuwing" })),
      h("div", { class: "pv-stat" }, h("strong", { text: counts.ERROR }), h("span", { text: "fouten" }))
    );
    list.replaceChildren(...lines.slice(0, 12).map((line) => {
      const level = (line.match(/\b(INFO|WARN|ERROR)\b/i) || [])[1];
      return h("div", { class: `pv-log-line ${level ? level.toLowerCase() : ""}`.trim(), text: line });
    }));
    stateEl.textContent = `${lines.length} regels · ${counts.ERROR} fouten`;
    stateEl.className = counts.ERROR ? "pv-state warn" : "pv-state good";
  }

  logs.addEventListener("input", analyse);
  analyse();

  return frame(idea, {
    theme: "security",
    label: "Logboek",
    body: [
      field("Logboek", logs),
      statsEl,
      list,
      h("div", { class: "pv-row pv-between" }, stateEl, chip("📋 Log-analyse")),
      h("p", { class: "pv-hint", text: "Het script telt info-, waarschuwing- en foutregels en toont de belangrijkste regels." })
    ]
  });
}

function dailyReportPreview(idea) {
  const output = h("pre", { class: "pv-code-output" });
  const stateEl = h("span", { class: "pv-state", text: "Nog niet gegenereerd" });
  const now = new Date();
  const dateText = now.toLocaleDateString("nl-BE", { day: "2-digit", month: "long", year: "numeric" });

  function generate() {
    const visitors = 120 + rnd(80);
    const sales = 300 + rnd(500);
    output.textContent = `Dagrapport ${dateText}\n────────────────────\nBezoekers: ${visitors}\nVerkopen:  ${sales}\nOmzet:     € ${(sales * 4.5).toFixed(2)}\nFouten:    ${rnd(3)}\n\nVerzonden naar eigenaar ✓`;
    stateEl.textContent = "Rapport klaar ✓";
    stateEl.className = "pv-state good";
  }

  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      output,
      h("div", { class: "pv-row pv-between" }, stateEl, btn("▶ Genereer rapport", generate, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: "Elke ochtend verzamelt het script de cijfers van gisteren en mailt ze naar jou." })
    ]
  });
}

function notFoundPreview(idea) {
  const browser = h("div", { class: "pv-browser" },
    h("div", { class: "pv-browser-bar" }, h("span", { class: "pv-url", text: "easycodey.be/pagina-die-niet-bestaat" })),
    h("div", { class: "pv-webpage" },
      h("span", { class: "pv-404", text: "404" }),
      h("h3", { text: "Deze pagina bestaat niet" }),
      h("p", { text: "Geen probleem — we brengen je terug naar iets leuks." }),
      btn("← Terug naar home", () => { window.location.hash = "#/"; }, "pv-btn-primary")
    )
  );

  return frame(idea, {
    theme: "web",
    label: "Website",
    body: [
      browser,
      h("p", { class: "pv-hint", text: "Een vriendelijke 404-pagina houdt bezoekers op je site in plaats van ze te verliezen." })
    ]
  });
}

/* ------------------------------ registry ------------------------------ */

const BUILDERS = new Map();

function define(ids, builder) {
  ids.forEach((id) => BUILDERS.set(id, builder));
}

define(["snake", "snake-ai"], snakePreview);
define(["pong"], pongPreview);
define(["spel-2048"], game2048Preview);
define(["galgje", "woord-raden"], galgjePreview);
define(["raad-het-getal"], guessPreview);
define(["hoger-lager"], higherLowerPreview);
define(["steen-papier-schaar"], rpsPreview);
define(["boter-kaas-eieren", "slimme-boter-kaas-eieren"], ticTacToePreview);
define(["quiz-spel", "quizduel", "emoji-raden", "quiz-gui", "flask-quiz", "tijdlijn-quiz", "spelling-quiz"], quizPreview);
define(["dobbelsteen-simulator", "yahtzee-lite"], dicePreview);
define(["eenentwintigen"], blackjackPreview);
define(["memorie"], memoryPreview);
define(["minesweeper"], minesweeperPreview);
define(["breakout"], breakoutPreview);
define(["reactiespel"], reactionPreview);
define(["torens-van-hanoi"], hanoiPreview);
define(["life-simulator"], lifePreview);
define(["simon-says"], simonPreview);

define(["rekenmachine-gui"], calculatorPreview);
define(["klok-gui"], clockPreview);
define(["stopwatch-gui"], stopwatchPreview);
define(["pomodoro-timer"], pomodoroPreview);
define(["kleurenkiezer"], colorPickerPreview);
define(["bmi-app"], bmiPreview);
define(["todo-gui", "boodschappen-gui", "todo-lijst"], todoPreview);
define(["weer-gui", "weer-app", "weer-dashboard"], weatherPreview);
define(["tekst-editor", "markdown-html", "markdown-blog"], markdownPreview);
define(["fotoviewer", "flask-fotogalerij"], galleryPreview);
define(["pixel-tekenen", "pixel-art-converter"], pixelPreview);
define(["systeem-dashboard", "verkoop-dashboard", "pandas-rapport", "csv-analyse", "aanbevelingssysteem", "perceptron", "cijfervoorspeller"], genericData);
define(["mp3-speler", "muziek-generator"], musicPreview);

define(["wachtwoord-generator", "wachtwoord-generator-plus", "wachtwoordkluis"], passwordGeneratorPreview);
define(["tekst-teller"], textCounterPreview);
define(["eenheid-converter"], converterPreview);
define(["json-formatter"], jsonPreview);
define(["qr-generator"], qrPreview);
define(["klembord-tool"], clipboardPreview);
define(["organiseer-downloads", "downloads-sorteren", "bestandszoeker"], fileOrganizerPreview);
define(["image-resizer"], imageResizerPreview);
define(["pdf-samenvoegen"], pdfPreview);
define(["excel-rapport"], excelPreview);

define(["url-shortener"], urlShortenerPreview);
define(["login-systeem"], loginPreview);
define(["contactformulier"], contactPreview);
define(["bezoekers-teller"], visitorPreview);
define(["nieuwsbrief-aanmelding"], newsletterPreview);
define(["webscraper"], scraperPreview);
define(["flask-takenlijst", "rest-api"], tasksApiPreview);
define(["stem-app"], pollPreview);
define(["csv-upload"], csvPreview);
define(["webhook-ontvanger"], webhookPreview);
define(["sitemap-generator"], sitemapPreview);
define(["flask-favorieten"], favoritesPreview);
define(["flask-blog", "portfolio-generator"], blogPreview);
define(["recepten-app"], recipesPreview);

define(["budget-tracker"], budgetPreview);
define(["sudoku-oplosser"], sudokuPreview);
define(["sentiment-analyse"], sentimentPreview);
define(["lineaire-regressie"], regressionPreview);
define(["regel-chatbot"], chatbotPreview);
define(["kmeans-kleuren"], palettePreview);

define(["priemgetallen"], primesPreview);
define(["fibonacci"], fibonacciPreview);
define(["mandelbrot"], mandelbrotPreview);
define(["planeten-simulatie"], planetsPreview);
define(["dna-analyse"], dnaPreview);
define(["temperatuurgrafiek"], temperaturePreview);
define(["statistiek-tool"], statisticsPreview);
define(["chemie-tabel"], periodicPreview);
define(["ph-simulator"], phPreview);
define(["projectielbaan"], projectilePreview);

define(["wachtwoord-sterkt", "wachtwoordbeleid"], passwordStrengthPreview);
define(["caesar-cipher"], caesarPreview);
define(["hash-vergelijker"], hashComparePreview);
define(["phishing-quiz"], phishingPreview);
define(["log-maskeren"], logMaskPreview);
define(["veilige-bestandsnaam"], safeFilenamePreview);
define(["hash-kraken"], hashCrackPreview);
define(["twee-factor-demo"], twoFactorPreview);

define(["kleurenpalet"], palettePreview);
define(["ascii-kunst"], asciiPreview);
define(["turtle-schilderij"], turtlePreview);
define(["mozaiek-maker"], mosaicPreview);
define(["fractal-kunst"], fractalPreview);
define(["gedichten-generator"], poemPreview);
define(["poster-generator"], posterPreview);
define(["animatie-maker"], animationPreview);

define(["tafels-oefenen"], tablesPreview);
define(["flashcards", "woordjes-overhoren"], flashcardsPreview);
define(["rekenracer"], mathRacerPreview);
define(["cijfer-checker"], gradePreview);
define(["leesbaarheid"], readabilityPreview);
define(["dictee-generator"], dictationPreview);
define(["huiswerkplanner"], plannerPreview);

define(["bestanden-hernoemen"], renamePreview);
define(["back-up-script"], backupPreview);
define(["website-monitor"], monitorPreview);
define(["factuur-nummering"], invoicePreview);
define(["screenshot-automatisering"], screenshotPreview);
define(["e-mail-herinnering"], emailReminderPreview);
define(["agenda-ics"], agendaPreview);
define(["map-opruimer"], duplicatesPreview);

/* extra previews */
define(["tekst-avontuur"], textAdventurePreview);
define(["asteroids-spel"], asteroidsPreview);
define(["flappy-bird"], flappyPreview);
define(["tetris"], tetrisPreview);
define(["woordketting"], wordChainPreview);
define(["bingo"], bingoPreview);
define(["doolhof"], mazePreview);
define(["platformer"], platformerPreview);
define(["vallende-bal"], fallingBallPreview);
define(["woordpuzzel"], wordSearchPreview);
define(["sokoban"], sokobanPreview);
define(["ruimteschietspel"], spaceShooterPreview);
define(["katten-rennen"], catRunnerPreview);
define(["sterrenkaart"], starMapPreview);
define(["zwaartekracht-simulatie"], gravityPreview);
define(["plantengroei"], plantGrowthPreview);
define(["exoplaneet-transit"], exoplanetPreview);
define(["ecosysteem"], ecosystemPreview);
define(["molecuulmassa"], moleculePreview);
define(["warmteverspreiding"], heatPreview);
define(["portscanner"], portScannerPreview);
define(["bestand-integriteit"], integrityPreview);
define(["sleutel-uitwisseling"], keyExchangePreview);
define(["log-analyse"], logAnalysisPreview);
define(["dagelijkse-rapportage"], dailyReportPreview);
define(["eigen-404"], notFoundPreview);

/* ------------------------------ generieke fallbacks ------------------------------ */

function fallbackFor(idea) {
  const theme = {
    Games: "game",
    Web: "web",
    GUI: "gui",
    "Data & AI": "data",
    "Handige tools": "tool",
    Automatisering: "auto",
    Security: "security",
    Wetenschap: "science",
    "Kunst & Creatief": "art",
    Onderwijs: "school"
  }[idea.category] || "neutral";
  const builder = FALLBACKS[theme] || FALLBACKS.neutral;
  return builder(idea, theme);
}

function genericGame(idea) {
  let score = 0;
  const scoreEl = h("strong", { text: "0" });
  const target = h("button", { type: "button", class: "pv-target", "aria-label": "Raak het doel" }, "🎯");
  const area = h("div", { class: "pv-target-area" }, target);
  function move() {
    target.style.left = `${8 + Math.random() * 78}%`;
    target.style.top = `${10 + Math.random() * 70}%`;
  }
  target.addEventListener("click", () => {
    score += 1;
    scoreEl.textContent = String(score);
    move();
  });
  move();
  return frame(idea, {
    theme: "game",
    label: "Mini-demo",
    body: [
      h("div", { class: "pv-row pv-between" }, h("span", { class: "pv-score" }, "Score ", scoreEl), h("span", { class: "pv-state", text: "Tik op het doel" })),
      area,
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericWeb(idea) {
  const is404 = idea.id === "eigen-404";
  const name = idea.title;
  return frame(idea, {
    theme: "web",
    label: is404 ? "Foutpagina" : "Website",
    body: [
      h("div", { class: "pv-browser" },
        h("div", { class: "pv-browser-bar" }, h("span", { text: "🔒" }), h("span", { class: "pv-url", text: `easycodey.be/${idea.id}` })),
        h("div", { class: "pv-webpage" },
          is404
            ? [h("span", { class: "pv-404", text: "404" }), h("h3", { text: "Deze pagina bestaat niet" }), h("p", { text: "Geen zorgen — ga terug naar de startpagina." }), btn("← Terug naar home", () => {}, "pv-btn-primary")]
            : [h("span", { class: "pv-web-badge", text: (CATEGORY_META[idea.category]?.emoji || "✦") + " " + idea.category }), h("h3", { text: name }), h("p", { text: idea.summary }), h("div", { class: "pv-web-cards" }, h("div", { class: "pv-web-card" }, "📄", "Overzicht"), h("div", { class: "pv-web-card" }, "⚡", "Snel"), h("div", { class: "pv-web-card" }, "🔒", "Veilig")), btn("Ontdek meer →", () => {}, "pv-btn-primary")]
        )
      ),
      h("p", { class: "pv-hint", text: "Een voorbeeld van hoe de website eruit kan zien." })
    ]
  });
}

function genericGui(idea) {
  const toggle = h("button", { type: "button", class: "pv-toggle", "aria-pressed": "false" }, "Uit");
  const slider = input({ type: "range", min: "0", max: "100", value: "60" });
  const valueEl = h("strong", { text: "60" });
  slider.addEventListener("input", () => { valueEl.textContent = slider.value; });
  toggle.addEventListener("click", () => {
    const on = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(on));
    toggle.textContent = on ? "Aan" : "Uit";
    toggle.classList.toggle("on", on);
  });
  return frame(idea, {
    theme: "gui",
    label: "Venster",
    body: [
      h("div", { class: "pv-gui-window" },
        h("div", { class: "pv-gui-title" }, h("span", { text: idea.emoji || "🪟" }), idea.title),
        h("div", { class: "pv-gui-content" },
          h("p", { text: idea.summary }),
          h("div", { class: "pv-gui-row" }, h("span", { text: "Instelling" }), toggle),
          h("div", { class: "pv-gui-row" }, h("span", { text: "Waarde" }), valueEl),
          slider
        )
      ),
      h("p", { class: "pv-hint", text: "Dit venster laat zien hoe de app werkt." })
    ]
  });
}

function genericData(idea) {
  const bars = Array.from({ length: 7 }, () => 20 + Math.random() * 70);
  const chart = h("div", { class: "pv-bars" }, ...bars.map((height) => h("span", { style: { height: `${height}%` } })));
  const button = btn("🎲 Nieuwe data", () => {
    chart.replaceChildren(...Array.from({ length: 7 }, () => h("span", { style: { height: `${20 + Math.random() * 70}%` } })));
  }, "pv-btn-primary");
  return frame(idea, {
    theme: "data",
    label: "Analyse",
    body: [
      h("div", { class: "pv-chart-card" }, h("div", { class: "pv-row pv-between" }, h("strong", { text: "Resultaten" }), h("span", { class: "pv-state", text: "Live demo" })), chart),
      h("div", { class: "pv-row pv-between" }, kv("Rijen", "128"), kv("Kolommen", "7"), kv("Bron", "CSV")),
      h("div", { class: "pv-row pv-center" }, button),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericScience(idea) {
  const c = canvas(420, 220, "pv-sim");
  const g = ctx2d(c);
  let t = 0;
  loopWhile(c, () => {
    t += 0.02;
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 7; i += 1) {
      const x = c.width / 2 + Math.cos(t + i) * (40 + i * 22);
      const y = c.height / 2 + Math.sin(t * 1.3 + i) * (30 + i * 12);
      g.fillStyle = ["#7ee2b8", "#e8c47c", "#ff8a6b", "#8ab4ff"][i % 4];
      g.beginPath();
      g.arc(x, y, 4 + (i % 3) * 2, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "rgba(126,226,184,.2)";
    g.beginPath();
    g.arc(c.width / 2, c.height / 2, 28 + Math.sin(t) * 5, 0, Math.PI * 2);
    g.stroke();
  });
  return frame(idea, {
    theme: "science",
    label: "Simulatie",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-between" }, kv("Model", "Simulatie"), kv("Status", "Actief")),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericSecurity(idea) {
  const output = h("pre", { class: "pv-terminal", text: `$ easycodey --start "${idea.id}"\n> demo gestart…` });
  const run = btn("▶ Start demo", () => {
    output.textContent = `$ easycodey --start "${idea.id}"\n> demo gestart…\n> controleren…\n> klaar. Alles veilig. ✓`;
  }, "pv-btn-primary");
  return frame(idea, {
    theme: "security",
    label: "Demo",
    body: [
      output,
      h("div", { class: "pv-row pv-center" }, run),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericArt(idea) {
  const c = canvas(420, 240, "pv-art-canvas");
  const g = ctx2d(c);
  function draw() {
    g.fillStyle = "#0b1512";
    g.fillRect(0, 0, c.width, c.height);
    const palette = ["#7ee2b8", "#e8c47c", "#ff8a6b", "#8ab4ff", "#d8a7ff"];
    for (let i = 0; i < 26; i += 1) {
      g.fillStyle = palette[i % palette.length] + "cc";
      g.beginPath();
      g.arc(Math.random() * c.width, Math.random() * c.height, 8 + Math.random() * 34, 0, Math.PI * 2);
      g.fill();
    }
  }
  draw();
  return frame(idea, {
    theme: "art",
    label: "Creatief",
    body: [
      h("div", { class: "pv-canvas-wrap" }, c),
      h("div", { class: "pv-row pv-center" }, btn("🎨 Genereer", draw, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericSchool(idea) {
  let index = 0;
  const cards = [
    { q: "Wat is 7 × 8?", a: "56" },
    { q: "Wat is de hoofdstad van België?", a: "Brussel" },
    { q: "Hoeveel is 12 + 9?", a: "21" },
    { q: "Wat is het Engelse woord voor 'boek'?", a: "book" }
  ];
  const questionEl = h("h3", { class: "pv-question", text: cards[0].q });
  const answerEl = h("p", { class: "pv-feedback", text: "Denk even na…" });
  const next = btn("Toon antwoord", () => {
    answerEl.textContent = cards[index].a;
    answerEl.className = "pv-feedback good";
    next.textContent = "Volgende →";
    next.dataset.showing = "1";
  }, "pv-btn-primary");
  next.addEventListener("click", () => {
    if (next.dataset.showing === "1") {
      index = (index + 1) % cards.length;
      questionEl.textContent = cards[index].q;
      answerEl.textContent = "Denk even na…";
      answerEl.className = "pv-feedback";
      next.textContent = "Toon antwoord";
      delete next.dataset.showing;
    }
  });
  return frame(idea, {
    theme: "school",
    label: "Oefenen",
    body: [
      h("div", { class: "pv-flashcard" }, h("span", { class: "pv-flashcard-emoji", text: "🧠" }), questionEl, answerEl),
      h("div", { class: "pv-row pv-center" }, next),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericTool(idea) {
  const value = input({ type: "text", value: "EasyCodey", placeholder: "Typ iets…" });
  const output = h("div", { class: "pv-output", text: "EasyCodey" });
  const action = btn("Verwerk", () => {
    output.textContent = value.value.trim() || "—";
  }, "pv-btn-primary");
  value.addEventListener("input", () => { output.textContent = value.value.trim() || "—"; });
  return frame(idea, {
    theme: "tool",
    label: "Tool",
    body: [
      field("Invoer", value),
      h("div", { class: "pv-tool-result" }, h("span", { class: "pv-state", text: "Resultaat" }), output),
      h("div", { class: "pv-row pv-center" }, action),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

function genericAuto(idea) {
  const steps = ["Scannen", "Sorteren", "Uitvoeren", "Klaar"];
  const log = h("div", { class: "pv-pipeline" });
  let running = false;
  function render(active = -1) {
    log.replaceChildren(...steps.map((step, index) => h("div", { class: `pv-pipe-step${index <= active ? " done" : ""}${index === active ? " active" : ""}` }, h("span", { class: "pv-pipe-dot" }), step)));
  }
  function run() {
    if (running) return;
    running = true;
    let index = 0;
    render(0);
    const timer = window.setInterval(() => {
      index += 1;
      if (index >= steps.length) {
        window.clearInterval(timer);
        running = false;
        render(steps.length - 1);
        return;
      }
      render(index);
    }, 650);
  }
  render();
  return frame(idea, {
    theme: "auto",
    label: "Automatisering",
    body: [
      log,
      h("div", { class: "pv-row pv-center" }, btn("▶ Start", run, "pv-btn-primary")),
      h("p", { class: "pv-hint", text: idea.summary })
    ]
  });
}

const FALLBACKS = {
  game: genericGame,
  web: genericWeb,
  gui: genericGui,
  data: genericData,
  science: genericScience,
  security: genericSecurity,
  art: genericArt,
  school: genericSchool,
  tool: genericTool,
  auto: genericAuto,
  neutral: genericGui
};

/* ------------------------------ mount + tabs ------------------------------ */

export function renderPreview(idea) {
  const builder = BUILDERS.get(idea.id);
  try {
    return builder ? builder(idea) : fallbackFor(idea);
  } catch (error) {
    console.warn("Preview mislukt voor", idea.id, error);
    return fallbackFor(idea);
  }
}

function setView(view, mode) {
  const isCode = mode === "code";
  view.classList.toggle("is-app", !isCode);
  view.classList.toggle("is-code", isCode);
  view.querySelectorAll("[data-view-tab]").forEach((tab) => {
    const active = tab.dataset.viewTab === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  const hint = view.querySelector("[data-view-hint]");
  if (hint) {
    hint.textContent = isCode
      ? "Alle code van dit project, stap voor stap. Kies ▶ Speel dit idee om terug te gaan."
      : "Kies ▶ Speel dit idee voor de app, of ⌨ Gebruik dit idee voor alle code.";
  }

  // Sta je diep in de code en kies je opnieuw "Speel dit idee", dan brengen we
  // de app-weergave in beeld in plaats van je bovenaan de code achter te laten.
  if (!isCode) {
    const panel = view.querySelector(".preview-panel");
    if (panel && typeof panel.scrollIntoView === "function") {
      const box = panel.getBoundingClientRect();
      if (box.top < 0 || box.top > window.innerHeight * 0.55) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }
}

let wired = false;

function wireTabs() {
  if (wired) return;
  wired = true;
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-view-tab]");
    if (!tab) return;
    const view = tab.closest("[data-project-view]");
    if (!view) return;
    setView(view, tab.dataset.viewTab === "code" ? "code" : "app");
  });
  document.addEventListener("keydown", (event) => {
    const tab = event.target.closest?.("[data-view-tab]");
    if (!tab) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const tabs = [...tab.closest("[role='tablist']").querySelectorAll("[data-view-tab]")];
    const index = tabs.indexOf(tab);
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  });
}

export function mountProjectView(root = document) {
  wireTabs();
  const views = root.querySelectorAll ? root.querySelectorAll("[data-project-view]") : [];
  views.forEach((view) => {
    const stage = view.querySelector("[data-preview-stage]");
    if (!stage || stage.dataset.mounted === "1") return;
    const idea = IDEAS.find((item) => item.id === view.dataset.ideaId);
    if (!idea) return;
    stage.dataset.mounted = "1";
    const node = renderPreview(idea);
    stage.replaceChildren(node);
  });
}

export function initPreviews() {
  wireTabs();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountProjectView(document), { once: true });
  } else {
    mountProjectView(document);
  }
}

initPreviews();
