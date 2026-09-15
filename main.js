const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Optional Firebase integration: replace these values with your project configuration.
// When configured, call Firebase Auth here; the interface otherwise remains available in demo mode.
const firebaseConfig = { apiKey: "", authDomain: "", projectId: "" };
const ADMIN_EMAIL = "studiessupport@gmail.com";
let user = JSON.parse(localStorage.getItem("studiesSupportUser")) || { name: "Alex Morgan", email: "alex@example.com" };
let currentPage = "dashboard";

function initials(name) { return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(); }
function updateProfile() {
  $("#profile-name").textContent = user.name;
  $("#avatar").textContent = initials(user.name);
  $("#page-kicker").innerHTML = `Good afternoon, <b>${user.name.split(" ")[0]}</b>`;
  $("#admin-nav").classList.toggle("hidden", user.email !== ADMIN_EMAIL);
}
function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.remove("hidden"); setTimeout(() => el.classList.add("hidden"), 3000); }
function go(page) {
  if (page === "admin" && user.email !== ADMIN_EMAIL) { toast("This page is restricted to the StudiesSupport administrator."); return; }
  currentPage = page;
  $$(".page").forEach((el) => el.classList.toggle("active", el.id === `${page}-page`));
  $$(".nav-link").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
  window.location.hash = page;
  $(".sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

$$(".nav-link").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); go(link.dataset.page); }));
$$('[data-go]').forEach((button) => button.addEventListener("click", () => go(button.dataset.go)));
$("#menu-button").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
updateProfile();
if (location.hash.slice(1)) go(location.hash.slice(1));

const quizQuestions = [
  { question: "Which part of a cell controls what enters and leaves it?", options: ["The cell membrane", "The nucleus", "The cytoplasm", "The mitochondria"], answer: 0 },
  { question: "Where does aerobic respiration mainly take place in a cell?", options: ["The vacuole", "The mitochondria", "The cell wall", "The ribosomes"], answer: 1 },
  { question: "Which structure is found in plant cells but not animal cells?", options: ["Nucleus", "Cell membrane", "Chloroplast", "Cytoplasm"], answer: 2 },
  { question: "What is the jelly-like substance inside a cell called?", options: ["Cytoplasm", "Membrane", "Cell wall", "Chlorophyll"], answer: 0 },
  { question: "What is the function of the nucleus?", options: ["Makes energy", "Controls the cell's activities", "Protects the cell", "Makes proteins"], answer: 1 }
];
let quizIndex = 0, selectedAnswer = null, checked = false;
function renderQuiz() {
  const item = quizQuestions[quizIndex]; selectedAnswer = null; checked = false;
  $("#question-number").textContent = quizIndex + 1;
  $("#question-text").textContent = item.question;
  $("#quiz-progress").style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
  $("#check-answer").textContent = "Check answer";
  $("#answers").innerHTML = item.options.map((option, i) => `<button class="answer" data-answer="${i}"><span>${"ABCD"[i]}</span>${option}</button>`).join("");
  $$("#answers .answer").forEach((button) => button.addEventListener("click", () => {
    if (checked) return; selectedAnswer = Number(button.dataset.answer); $$("#answers .answer").forEach((answer) => answer.classList.remove("selected")); button.classList.add("selected");
  }));
}
$("#check-answer").addEventListener("click", () => {
  if (selectedAnswer === null) { toast("Choose an answer first."); return; }
  if (!checked) {
    checked = true; const answer = quizQuestions[quizIndex].answer;
    $$("#answers .answer").forEach((button) => { const index = Number(button.dataset.answer); if (index === answer) button.classList.add("correct"); if (index === selectedAnswer && index !== answer) button.classList.add("wrong"); });
    $("#check-answer").textContent = quizIndex === quizQuestions.length - 1 ? "Finish practice" : "Next question →";
  } else if (quizIndex < quizQuestions.length - 1) { quizIndex++; renderQuiz(); } else { toast("Practice complete — excellent work!"); quizIndex = 0; renderQuiz(); }
});
$("#skip-question").addEventListener("click", () => { quizIndex = (quizIndex + 1) % quizQuestions.length; renderQuiz(); });
renderQuiz();

const mockQuestions = [
  ["Solve for x: 3x + 7 = 22", ["x = 3", "x = 5", "x = 7", "x = 9"], 1],
  ["What is 15% of 240?", ["24", "30", "36", "48"], 2],
  ["Simplify: 4(a + 3)", ["4a + 3", "4a + 7", "4a + 12", "a + 12"], 2],
  ["A triangle has angles 45° and 65°. What is the third angle?", ["60°", "70°", "80°", "90°"], 1],
  ["What is the square root of 144?", ["10", "11", "12", "14"], 2]
];
let mockIndex = 0; const mockAnswers = Array(mockQuestions.length).fill(null);
function renderMock() {
  const item = mockQuestions[mockIndex]; $("#mock-question-number").textContent = mockIndex + 1; $("#mock-question-text").textContent = item[0];
  $("#question-nav").innerHTML = mockQuestions.map((_, i) => `<button class="q-nav ${i === mockIndex ? "current" : ""}" data-q="${i}">${i + 1}</button>`).join("");
  $$(".q-nav").forEach((button) => button.addEventListener("click", () => { mockIndex = Number(button.dataset.q); renderMock(); }));
  $("#mock-answers").innerHTML = item[1].map((option, i) => `<button class="answer ${mockAnswers[mockIndex] === i ? "selected" : ""}" data-mock-answer="${i}"><span>${"ABCD"[i]}</span>${option}</button>`).join("");
  $$("[data-mock-answer]").forEach((button) => button.addEventListener("click", () => { mockAnswers[mockIndex] = Number(button.dataset.mockAnswer); renderMock(); }));
  $("#previous-mock").style.visibility = mockIndex ? "visible" : "hidden"; $("#next-mock").textContent = mockIndex === mockQuestions.length - 1 ? "Review answers" : "Next question →";
}
$("#previous-mock").addEventListener("click", () => { if (mockIndex) { mockIndex--; renderMock(); } });
$("#next-mock").addEventListener("click", () => { if (mockIndex < mockQuestions.length - 1) { mockIndex++; renderMock(); } else toast(`${mockAnswers.filter((a) => a !== null).length} of ${mockQuestions.length} answers ready to review.`); });
$("#submit-mock").addEventListener("click", () => { const score = mockQuestions.reduce((sum, question, i) => sum + (mockAnswers[i] === question[2] ? 1 : 0), 0); toast(`Mock submitted — score: ${score}/${mockQuestions.length}.`); });
renderMock();
let mockRemaining = 30 * 60;
setInterval(() => {
  if (mockRemaining <= 0) return;
  mockRemaining--;
  $("#mock-time").textContent = format(mockRemaining);
  if (mockRemaining === 0) { toast("Time is up — submit your mock test now."); }
}, 1000);

let duration = 25 * 60, remaining = duration, timerId = null, timerMode = "focus";
const modes = { focus: 25, short: 5, long: 15 };
function format(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function drawTimer() { $("#timer-display").textContent = format(remaining); document.title = `${format(remaining)} — StudiesSupport`; }
function stopTimer() { clearInterval(timerId); timerId = null; $("#start-timer").textContent = timerMode === "focus" ? "Start focus" : "Start break"; }
$("#start-timer").addEventListener("click", () => { if (timerId) { stopTimer(); return; } timerId = setInterval(() => { remaining--; drawTimer(); if (remaining <= 0) { stopTimer(); remaining = duration; drawTimer(); toast("Session complete. Take a moment to reset."); } }, 1000); $("#start-timer").textContent = "Pause"; });
$("#reset-timer").addEventListener("click", () => { stopTimer(); remaining = duration; drawTimer(); });
$$(".mode-tabs button").forEach((button) => button.addEventListener("click", () => { timerMode = button.dataset.mode; duration = modes[timerMode] * 60; remaining = duration; stopTimer(); $$(".mode-tabs button").forEach((tab) => tab.classList.toggle("selected", tab === button)); $("#timer-message").textContent = timerMode === "focus" ? "One focused session at a time." : "A short reset helps your brain retain more."; drawTimer(); }));
$("#focus-range").addEventListener("input", (event) => { const min = Number(event.target.value); $("#focus-output").textContent = `${min} min`; if (timerMode === "focus" && !timerId) { duration = min * 60; remaining = duration; drawTimer(); } });
$("#sound-timer").addEventListener("click", () => toast("Timer sound is on.")); drawTimer();

const notes = [{ title: "Cell structure — overview", subject: "Biology", content: "The cell membrane is selectively permeable. It controls the movement of substances in and out of the cell.\n\nPlant cells also contain a cell wall, chloroplasts and a permanent vacuole." }, { title: "Algebra formulas", subject: "Mathematics", content: "Expand brackets by multiplying every term inside by the term outside.\n\nRemember: x² − y² = (x + y)(x − y)." }, { title: "The Renaissance", subject: "History", content: "The Renaissance began in Italy and encouraged a renewed interest in classical learning, art and science." }];
let noteIndex = 0;
function renderNotes() { $("#notes-list").innerHTML = notes.map((note, i) => `<button class="note-item ${i === noteIndex ? "active" : ""}" data-note="${i}"><b>${note.title}</b><small>${note.subject} · Edited today</small></button>`).join(""); $$("[data-note]").forEach((button) => button.addEventListener("click", () => { noteIndex = Number(button.dataset.note); loadNote(); })); }
function loadNote() { const note = notes[noteIndex]; $("#note-title").value = note.title; $("#note-content").value = note.content; $(".note-meta").textContent = `${note.subject} · Edited just now`; renderNotes(); }
$("#save-note").addEventListener("click", () => { notes[noteIndex].title = $("#note-title").value || "Untitled note"; notes[noteIndex].content = $("#note-content").value; $("#save-status").textContent = "Saved"; renderNotes(); setTimeout(() => $("#save-status").textContent = "", 2000); });
$("#new-note").addEventListener("click", () => { notes.unshift({ title: "Untitled note", subject: "Personal", content: "Start writing here..." }); noteIndex = 0; loadNote(); toast("New note created."); }); renderNotes(); loadNote();

$$(".suspend-button,.restore-button").forEach((button) => button.addEventListener("click", () => { const row = button.closest(".user-row"), status = row.querySelector(".status"); const suspended = button.classList.contains("suspend-button"); status.textContent = suspended ? "Suspended" : "Active"; status.className = `status ${suspended ? "suspended-status" : "active-status"}`; button.textContent = suspended ? "Restore" : "Suspend"; button.className = suspended ? "restore-button" : "suspend-button"; toast(suspended ? "Learner account suspended." : "Learner account restored."); }));
$("#add-user").addEventListener("click", () => toast("User invitation flow opened.")); $("#add-material").addEventListener("click", () => toast("Choose a material type to add."));

$("#sign-out").addEventListener("click", () => $("#login-modal").classList.remove("hidden")); $("#close-login").addEventListener("click", () => $("#login-modal").classList.add("hidden"));
$("#login-form").addEventListener("submit", (event) => { event.preventDefault(); const email = $("#email").value.trim().toLowerCase(); const password = $("#password").value; if (!email || !password) { $("#login-error").textContent = "Enter your email address and password."; return; } user = { email, name: email === ADMIN_EMAIL ? "StudiesSupport Admin" : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }; localStorage.setItem("studiesSupportUser", JSON.stringify(user)); updateProfile(); $("#login-modal").classList.add("hidden"); $("#login-error").textContent = ""; toast("Welcome back — your progress is ready."); });
