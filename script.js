/* =====================================================================
   HAPPY BIRTHDAY — script.js
   ---------------------------------------------------------------------
   What's in here:
     1. THE LETTER          ← edit your letter here
     2. Settings            ← music volume, typing speed, file names
     3. Answers + saving to the browser
     4. Moving between screens
     5. Music
     6. Screen 2 / 3 / 4 / 6 — the questions
     7. The letter typing effect
     8. Final screen + downloading the answers file
     9. Background effects (hearts, stars, confetti)
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. THE LETTER  ← ✏️ EDIT THIS TEXT. Keep the backticks at both ends.
      An empty line between paragraphs becomes a blank line on screen.
   --------------------------------------------------------------------- */
const LETTER_TEXT =`Happy birthday to the person who somehow became the reason for my constant smile, my favorite notification, and one of the most beautiful parts of my life.

You know, Pakhi...🕊️
Then suddenly, you came and colored my plain life. If you hadn't come into my life, I would never have understood that I could love someone this much. I love you to the sky and back, and I love you a thousand times more than all the love that surrounds this world. Please keep me with you, I will stay forever.
Please never misunderstand me. I don't feel good when you are angry with me, it hurts a lot. I know you love me too, and you are kinder than you give yourself credit for. You carry more than you admit. And on the days when you're quiet, I hope you know that I'm not waiting for the better version of you — I like this one. All of it.

I don't know exactly what the future looks like. But I know I want more of it with you in it. More late nights, more bad plans that turn out well, more of that laugh you try to hide.

So today, of all days: I hope you feel loved in a way you can actually believe. I hope you get everything you were too shy to wish out loud.

    And I hope you always come back to me.

Happy birthday, my love. ❤️
  
        Your💡

`;




/* ---------------------------------------------------------------------
   2. SETTINGS
   --------------------------------------------------------------------- */
const SETTINGS = {
  musicVolume: 0.55,        // 0 = silent, 1 = full volume
  typingSpeed: 22,          // milliseconds per letter in the letter screen
  txtFileName: "birthday_responses.txt",
  jsonFileName: "birthday_responses.json",
  storageKey: "birthdayCardAnswers"
};

const TOTAL_SCREENS = 7;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------------------------------------------------------------------
   3. ANSWERS — kept in memory and in the browser (localStorage),
      so nothing is lost when going back a screen or refreshing.
   --------------------------------------------------------------------- */
const answers = {
  q1: "",          // "Do you know how special you are to me?"
  favourite: "",   // "What is your favourite thing about us?"
  wish: "",        // the typed wish
  final: ""        // "Yes" / "Always"
};

function saveAnswers() {
  try {
    localStorage.setItem(SETTINGS.storageKey, JSON.stringify(answers));
  } catch (err) {
    /* Private browsing can block storage — the experience still works. */
  }
}

function loadAnswers() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS.storageKey) || "{}");
    Object.keys(answers).forEach(function (key) {
      if (typeof saved[key] === "string") answers[key] = saved[key];
    });
  } catch (err) { /* ignore */ }
}


/* ---------------------------------------------------------------------
   4. MOVING BETWEEN SCREENS
   --------------------------------------------------------------------- */
const screens = [];
for (let i = 1; i <= TOTAL_SCREENS; i++) {
  screens.push(document.getElementById("screen-" + i));
}

const progressBar = document.getElementById("progress");
let currentScreen = 1;
let isMoving = false;

// Build the progress dots
for (let i = 0; i < TOTAL_SCREENS; i++) {
  progressBar.appendChild(document.createElement("i"));
}

function updateProgress() {
  const dots = progressBar.children;
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("is-on", i === currentScreen - 1);
  }
}

function goToScreen(number) {
  if (isMoving || number === currentScreen) return;
  if (number < 1 || number > TOTAL_SCREENS) return;

  isMoving = true;
  const leaving = screens[currentScreen - 1];
  const entering = screens[number - 1];

  stopEffectsFor(currentScreen);
  leaving.classList.remove("is-active");

  window.setTimeout(function () {
    leaving.hidden = true;
    entering.hidden = false;
    entering.scrollTop = 0;

    // next frame, so the browser can animate the fade-in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        entering.classList.add("is-active");
      });
    });

    currentScreen = number;
    document.body.dataset.screen = String(number);
    updateProgress();
    startEffectsFor(number);
    onScreenShown(number);
    isMoving = false;
  }, reducedMotion ? 0 : 480);
}

// Back / next buttons on every screen
document.querySelectorAll("[data-go]").forEach(function (button) {
  button.addEventListener("click", function () {
    goToScreen(button.dataset.go === "next" ? currentScreen + 1 : currentScreen - 1);
  });
});

// Things that need to happen the moment a screen appears
function onScreenShown(number) {
  if (number === 5) startTyping();
  if (number === 7) renderRecap();
}


/* ---------------------------------------------------------------------
   5. MUSIC
   --------------------------------------------------------------------- */
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
let musicAvailable = true;

music.addEventListener("error", function () {
  // No audio/song.mp3 yet — hide the button instead of showing a broken control.
  musicAvailable = false;
  musicToggle.hidden = true;
});

function startMusic() {
  if (!musicAvailable) return;
  music.volume = 0;
  const attempt = music.play();
  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(function () { /* browser blocked it — the button stays available */ });
  }
  fadeVolumeTo(SETTINGS.musicVolume);
}

function fadeVolumeTo(target) {
  const step = (target - music.volume) / 30;
  const timer = setInterval(function () {
    const next = music.volume + step;
    if ((step > 0 && next >= target) || (step < 0 && next <= target)) {
      music.volume = Math.min(1, Math.max(0, target));
      clearInterval(timer);
    } else {
      music.volume = Math.min(1, Math.max(0, next));
    }
  }, 40);
}

musicToggle.addEventListener("click", function () {
  music.muted = !music.muted;
  musicToggle.classList.toggle("is-muted", music.muted);
  musicToggle.setAttribute("aria-label", music.muted ? "Play the music" : "Mute the music");
  if (!music.muted && music.paused) startMusic();
});

// The one button that starts everything
document.getElementById("startBtn").addEventListener("click", function () {
  startMusic();
  if (musicAvailable) musicToggle.hidden = false;
  progressBar.hidden = false;
  updateProgress();
  goToScreen(2);
});


/* ---------------------------------------------------------------------
   6. THE QUESTIONS
   --------------------------------------------------------------------- */

/* --- Screen 2: the two buttons, each with its own reply --- */
const q1Reply = document.getElementById("q1Reply");

document.querySelectorAll("[data-q1]").forEach(function (button) {
  button.addEventListener("click", function () {
    answers.q1 = button.dataset.q1;
    saveAnswers();

    q1Reply.textContent = button.dataset.reply;
    q1Reply.classList.remove("is-shown");
    requestAnimationFrame(function () { q1Reply.classList.add("is-shown"); });

    document.querySelectorAll("[data-q1]").forEach(function (other) {
      other.classList.toggle("is-selected", other === button);
    });

    // A small pause so the reply can be read, then move on.
    window.setTimeout(function () {
      if (currentScreen === 2) goToScreen(3);
    }, 1900);
  });
});

/* --- Screen 3: the chips --- */
document.querySelectorAll("[data-q2]").forEach(function (chip) {
  chip.addEventListener("click", function () {
    answers.favourite = chip.dataset.q2;
    saveAnswers();
    document.querySelectorAll("[data-q2]").forEach(function (other) {
      other.classList.toggle("is-selected", other === chip);
    });
  });
});

/* --- Screen 4: the wish --- */
const wishInput = document.getElementById("wishInput");
const wishReply = document.getElementById("wishReply");

wishInput.addEventListener("input", function () {
  answers.wish = wishInput.value;
  saveAnswers();
});

document.getElementById("saveWishBtn").addEventListener("click", function () {
  answers.wish = wishInput.value.trim();
  saveAnswers();

  if (!answers.wish) {
    wishReply.textContent = "Write a few words first — anything at all.";
  } else {
    wishReply.textContent = "Saved. I'm keeping this one. ✨";
  }
  wishReply.classList.remove("is-shown");
  requestAnimationFrame(function () { wishReply.classList.add("is-shown"); });
});

/* --- Screen 6: the last question --- */
document.querySelectorAll("[data-q4]").forEach(function (button) {
  button.addEventListener("click", function () {
    answers.final = button.dataset.q4;
    saveAnswers();
    goToScreen(7);
  });
});


/* ---------------------------------------------------------------------
   7. THE LETTER TYPING EFFECT
   --------------------------------------------------------------------- */
const letterEl = document.getElementById("letterText");
const skipBtn = document.getElementById("skipTyping");
let typingTimer = null;
let typingDone = false;

function startTyping() {
  if (typingDone) return;
  if (reducedMotion) { finishTyping(); return; }

  let index = 0;
  letterEl.textContent = "";
  const caret = document.createElement("span");
  caret.className = "caret";
  letterEl.appendChild(caret);

  clearInterval(typingTimer);
  typingTimer = setInterval(function () {
    index += 1;
    caret.remove();
    letterEl.textContent = LETTER_TEXT.slice(0, index);
    letterEl.appendChild(caret);

    if (index >= LETTER_TEXT.length) {
      clearInterval(typingTimer);
      caret.remove();
      typingDone = true;
    }
  }, SETTINGS.typingSpeed);
}

function finishTyping() {
  clearInterval(typingTimer);
  letterEl.textContent = LETTER_TEXT;
  typingDone = true;
}

skipBtn.addEventListener("click", finishTyping);
letterEl.addEventListener("click", finishTyping);


/* ---------------------------------------------------------------------
   8. FINAL SCREEN — recap and downloads
   --------------------------------------------------------------------- */
const recapEl = document.getElementById("recap");
const saveReply = document.getElementById("saveReply");

const RECAP_LABELS = [
  ["Do you know how special you are to me?", "q1"],
  ["Favourite thing about us", "favourite"],
  ["The wish", "wish"],
  ["Will you stay with me?", "final"]
];

function renderRecap() {
  recapEl.innerHTML = "";
  RECAP_LABELS.forEach(function (pair) {
    const item = document.createElement("div");
    item.className = "recap__item";

    const label = document.createElement("span");
    label.className = "recap__label";
    label.textContent = pair[0];

    const value = document.createElement("span");
    value.className = "recap__value";
    value.textContent = answers[pair[1]] || "— left blank —";

    item.appendChild(label);
    item.appendChild(value);
    recapEl.appendChild(item);
  });
}

function buildTxt() {
  const now = new Date();
  return [
    "---",
    "",
    "OUR BIRTHDAY STORY ❤️",
    "",
    "Date: " + now.toLocaleDateString(),
    "Time: " + now.toLocaleTimeString(),
    "",
    "Question 1: Do you know how special you are to me?",
    "Answer: " + (answers.q1 || "(no answer)"),
    "",
    "Favourite thing about us:",
    "Answer: " + (answers.favourite || "(no answer)"),
    "",
    "His wish:",
    "Answer: " + (answers.wish || "(no answer)"),
    "",
    "Final answer: Will you stay with me and keep making memories?",
    "Answer: " + (answers.final || "(no answer)"),
    "",
    "---",
    "",
    "Made with love ❤️",
    ""
  ].join("\n");
}

function buildJson() {
  const now = new Date();
  return JSON.stringify({
    title: "Our Birthday Story",
    savedAt: now.toISOString(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    answers: {
      question1: { question: "Do you know how special you are to me?", answer: answers.q1 },
      favourite: { question: "What is your favourite thing about us?", answer: answers.favourite },
      wish: { question: "If you could make one wish for us, what would it be?", answer: answers.wish },
      final: { question: "Will you stay with me and keep making beautiful memories together?", answer: answers.final }
    }
  }, null, 2);
}

// Downloads a text file straight from the browser — no server needed.
function downloadFile(fileName, text, mimeType) {
  const blob = new Blob([text], { type: mimeType + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function showSaveReply(text) {
  saveReply.textContent = text;
  saveReply.classList.remove("is-shown");
  requestAnimationFrame(function () { saveReply.classList.add("is-shown"); });
}

document.getElementById("saveTxtBtn").addEventListener("click", function () {
  downloadFile(SETTINGS.txtFileName, buildTxt(), "text/plain");
  showSaveReply("Saved to your downloads as " + SETTINGS.txtFileName);
});

document.getElementById("saveJsonBtn").addEventListener("click", function () {
  downloadFile(SETTINGS.jsonFileName, buildJson(), "application/json");
  showSaveReply("Saved to your downloads as " + SETTINGS.jsonFileName);
});

document.getElementById("replayBtn").addEventListener("click", function () {
  typingDone = false;
  letterEl.textContent = "";
  goToScreen(1);
});


/* ---------------------------------------------------------------------
   9. BACKGROUND EFFECTS
      One small canvas engine, used three different ways.
   --------------------------------------------------------------------- */
function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);
  return { ctx: ctx, resize: resize };
}

function drawHeart(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(0, 2, -3, -3, -8, -3);
  ctx.bezierCurveTo(-16, -3, -16, 7, -16, 7);
  ctx.bezierCurveTo(-16, 13, -9, 20, 0, 26);
  ctx.bezierCurveTo(9, 20, 16, 13, 16, 7);
  ctx.bezierCurveTo(16, 7, 16, -3, 8, -3);
  ctx.bezierCurveTo(3, -3, 0, 2, 0, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* --- floating hearts (screen 1) and confetti (screen 7) --- */
function createHeartField(canvas, options) {
  const view = setupCanvas(canvas);
  const ctx = view.ctx;
  const colours = options.colours;
  let frame = null;
  let hearts = [];

  function makeHeart(startAnywhere) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    return {
      x: Math.random() * w,
      y: startAnywhere ? Math.random() * h : h + 30,
      size: 8 + Math.random() * options.maxSize,
      speed: 0.25 + Math.random() * options.speed,
      sway: 0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.01,
      rotation: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.5,
      colour: colours[Math.floor(Math.random() * colours.length)]
    };
  }

  function build() {
    hearts = [];
    for (let i = 0; i < options.count; i++) hearts.push(makeHeart(true));
  }

  function step() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    hearts.forEach(function (heart, index) {
      heart.y -= heart.speed;
      heart.phase += 0.01;
      heart.x += Math.sin(heart.phase) * heart.sway * 0.4;
      heart.rotation += heart.spin;

      ctx.globalAlpha = heart.alpha;
      ctx.fillStyle = heart.colour;
      ctx.shadowColor = heart.colour;
      ctx.shadowBlur = 14;
      drawHeart(ctx, heart.x, heart.y, heart.size, heart.rotation);

      if (heart.y < -40) hearts[index] = makeHeart(false);
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    frame = requestAnimationFrame(step);
  }

  return {
    start: function () {
      view.resize();
      build();
      if (reducedMotion) { step(); cancelAnimationFrame(frame); return; }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(step);
    },
    stop: function () { cancelAnimationFrame(frame); }
  };
}

/* --- constellation in the shape of a heart (screen 4) --- */
function createConstellation(canvas) {
  const view = setupCanvas(canvas);
  const ctx = view.ctx;
  let frame = null;
  let stars = [];
  let shape = [];
  let tick = 0;

  function build() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // loose background stars
    stars = [];
    const count = Math.round((w * h) / 9000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // the heart outline, drawn with the classic heart formula
    shape = [];
    const scale = Math.min(w, h) / 42;
    for (let i = 0; i < 34; i++) {
      const t = (i / 34) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      shape.push({
        x: w / 2 + x * scale,
        y: h / 2 - y * scale,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function step() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    tick += 0.02;

    // background stars
    stars.forEach(function (star) {
      const glow = 0.35 + Math.sin(tick + star.twinkle) * 0.3;
      ctx.globalAlpha = Math.max(0.05, glow);
      ctx.fillStyle = "#FBF4EA";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // the heart: lines then points
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = "#F3A8BC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    shape.forEach(function (point, i) {
      const drift = Math.sin(tick + point.phase) * 1.6;
      if (i === 0) ctx.moveTo(point.x, point.y + drift);
      else ctx.lineTo(point.x, point.y + drift);
    });
    ctx.closePath();
    ctx.stroke();

    shape.forEach(function (point) {
      const drift = Math.sin(tick + point.phase) * 1.6;
      ctx.globalAlpha = 0.5 + Math.sin(tick * 1.5 + point.phase) * 0.4;
      ctx.fillStyle = "#E9C27E";
      ctx.shadowColor = "#F3A8BC";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(point.x, point.y + drift, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    frame = requestAnimationFrame(step);
  }

  return {
    start: function () {
      view.resize();
      build();
      if (reducedMotion) { step(); cancelAnimationFrame(frame); return; }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(step);
    },
    stop: function () { cancelAnimationFrame(frame); }
  };
}

const effects = {
  1: createHeartField(document.getElementById("heartsCanvas"), {
    count: 26, maxSize: 14, speed: 0.5, colours: ["#F3A8BC", "#E9C27E", "#FBF4EA"]
  }),
  4: createConstellation(document.getElementById("constellationCanvas")),
  7: createHeartField(document.getElementById("celebrationCanvas"), {
    count: 44, maxSize: 20, speed: 0.9, colours: ["#F3A8BC", "#E9C27E", "#FFFFFF", "#C77DFF"]
  })
};

function startEffectsFor(number) { if (effects[number]) effects[number].start(); }
function stopEffectsFor(number) { if (effects[number]) effects[number].stop(); }


/* ---------------------------------------------------------------------
   START UP
   --------------------------------------------------------------------- */
loadAnswers();

// Put any saved answers back on screen
if (answers.wish) wishInput.value = answers.wish;
document.querySelectorAll("[data-q1]").forEach(function (b) {
  b.classList.toggle("is-selected", b.dataset.q1 === answers.q1);
});
document.querySelectorAll("[data-q2]").forEach(function (b) {
  b.classList.toggle("is-selected", b.dataset.q2 === answers.favourite);
});

document.body.dataset.screen = "1";
updateProgress();
startEffectsFor(1);
requestAnimationFrame(function () { screens[0].classList.add("is-active"); });
