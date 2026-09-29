const STORAGE_KEY = "yvetteGksStudyTracker_v1";
const THEME_KEY = "yvetteGksTrackerTheme";

const categories = [
  "English",
  "Core Mathematics",
  "Elective Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Social Studies",
  "Korean",
  "Programming",
  "Architecture",
  "Graphic Design",
  "Portfolio"
];

const quotes = [
  "Consistency beats perfection.",
  "You don't need to see the whole staircase. Just take the next step.",
  "Your future self is watching what you do today.",
  "Small progress is still progress.",
  "Learn it. Build it. Document it.",
  "One day, you'll be glad you didn't quit.",
  "Dreams need deadlines and action."
];

function todayISO() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(dateString) {
  if (!dateString) return "No due date";

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createStarterTasks() {
  const tasks = [
    ["Practice percentages and ratios", "Core Mathematics", "Academic", 30, 0],
    ["Revise algebra basics", "Elective Mathematics", "Academic", 35, 1],
    ["Review forces and motion", "Physics", "Academic", 30, 1],
    ["Study atomic structure", "Chemistry", "Academic", 30, 2],
    ["Revise cell structure", "Biology", "Academic", 30, 2],
    ["Write one English essay introduction", "English", "Academic", 25, 3],
    ["Study data structures", "Computer Science", "Academic", 40, 3],
    ["Review Ghana governance notes", "Social Studies", "Academic", 25, 4],

    ["Practice Hangul reading", "Korean", "Korean", 20, 0],
    ["Learn 20 Korean vocabulary words", "Korean", "Korean", 25, 2],
    ["Study basic Korean sentence structure", "Korean", "Korean", 25, 4],

    ["Practice JavaScript variables and functions", "Programming", "Programming", 40, 1],
    ["Build a small JavaScript interaction", "Programming", "Programming", 45, 3],

    ["Sketch a one-point perspective", "Architecture", "Architecture", 40, 2],
    ["Create a simple floor plan", "Architecture", "Architecture", 45, 5],

    ["Design a portfolio project cover", "Graphic Design", "Creative", 35, 3],
    ["Document one completed project", "Portfolio", "Portfolio", 25, 4]
  ];

  return tasks.map((item) => ({
    id: uid("task"),
    title: item[0],
    category: item[1],
    type: item[2],
    minutes: item[3],
    due: offsetDate(item[4]),
    completed: false,
    completedAt: null
  }));
}

function defaultData() {
  return {
    tasks: createStarterTasks(),

    goals: [
      {
        id: uid("goal"),
        title: "Finish my GKS portfolio",
        category: "Portfolio",
        target: "Complete major projects",
        done: false
      },
      {
        id: uid("goal"),
        title: "Build stronger programming skills",
        category: "Programming",
        target: "Create multiple projects",
        done: false
      },
      {
        id: uid("goal"),
        title: "Build a Korean study foundation",
        category: "Korean",
        target: "Hangul + vocabulary + grammar",
        done: false
      }
    ],

    notes: []
  };
}

let data = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : []
      };
    }
  } catch (error) {
    console.error("Could not load tracker data:", error);
  }

  return defaultData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCompletedTasks() {
  return data.tasks.filter(task => task.completed);
}

function getOverallProgress() {
  if (!data.tasks.length) return 0;

  return Math.round(
    (getCompletedTasks().length / data.tasks.length) * 100
  );
}

function getCategoryProgress(category) {
  const tasks = data.tasks.filter(task => task.category === category);

  if (!tasks.length) return 0;

  const completed = tasks.filter(task => task.completed).length;

  return Math.round((completed / tasks.length) * 100);
}

function calculateStreak() {
  const completedDates = new Set(
    data.tasks
      .filter(task => task.completed && task.completedAt)
      .map(task => task.completedAt)
  );

  if (!completedDates.size) return 0;

  let cursor = new Date();

  const today = todayISO();
  const yesterday = offsetDate(-1);

  if (!completedDates.has(today)) {
    if (!completedDates.has(yesterday)) return 0;
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (true) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");

    const dateString = `${y}-${m}-${d}`;

    if (!completedDates.has(dateString)) break;

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getStudyDays() {
  return new Set(
    getCompletedTasks()
      .filter(task => task.completedAt)
      .map(task => task.completedAt)
  ).size;
}

/* ---------------- NAVIGATION ---------------- */

const sections = document.querySelectorAll(".page-section");
const navItems = document.querySelectorAll(".nav-item");

const pageTitles = {
  dashboard: "Study Dashboard",
  tasks: "Study Tasks",
  progress: "Progress",
  goals: "Goals",
  notes: "Study Notes",
  completed: "Completed Work"
};

function showSection(id) {
  sections.forEach(section => {
    section.classList.toggle("active", section.id === id);
  });

  navItems.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === id
    );
  });

  document.getElementById("pageTitle").textContent =
    pageTitles[id] || "Study Dashboard";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

navItems.forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.go);
  });
});

/* ---------------- DATE ---------------- */

function renderDate() {
  const now = new Date();

  document.getElementById("todayText").textContent =
    now.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
}

/* ---------------- DROPDOWNS ---------------- */

function populateCategories() {
  const taskCategory = document.getElementById("taskCategory");
  const filterCategory = document.getElementById("filterCategory");
  const goalCategory = document.getElementById("goalCategory");

  categories.forEach(category => {
    taskCategory.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    );

    filterCategory.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    );

    goalCategory.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    );
  });
}

/* ---------------- DASHBOARD ---------------- */

function renderDashboard() {
  const progress = getOverallProgress();
  const completed = getCompletedTasks().length;
  const streak = calculateStreak();

  document.getElementById("heroProgress").textContent = `${progress}%`;
  document.getElementById("statProgress").textContent = `${progress}%`;
  document.getElementById("statCompleted").textContent =
    `${completed} / ${data.tasks.length}`;
  document.getElementById("statStreak").textContent =
    `${streak} day${streak === 1 ? "" : "s"}`;
  document.getElementById("topStreak").textContent = streak;
  document.getElementById("statAreas").textContent =
    new Set(data.tasks.map(task => task.category)).size;

  const quote =
    quotes[new Date().getDate() % quotes.length];

  document.getElementById("dailyQuote").textContent = quote;

  renderTodayTasks();
  renderProgressList("dashboardProgress");
}

function renderTodayTasks() {
  const container = document.getElementById("todayTasks");

  const today = todayISO();

  let tasks = data.tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    })
    .slice(0, 4);

  if (!tasks.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>Nothing waiting for you 🎉</strong>
        Add a new task when you're ready.
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(task => `
    <label class="mini-task">
      <input
        type="checkbox"
        data-mini-complete="${escapeHTML(task.id)}"
      >
      <span>${escapeHTML(task.title)}</span>
    </label>
  `).join("");

  container.querySelectorAll("[data-mini-complete]").forEach(input => {
    input.addEventListener("change", () => {
      toggleTask(input.dataset.miniComplete);
    });
  });
}

function renderProgressList(containerId) {
  const container = document.getElementById(containerId);

  container.innerHTML = categories
    .filter(category =>
      data.tasks.some(task => task.category === category)
    )
    .map(category => {
      const progress = getCategoryProgress(category);

      return `
        <div class="progress-row">
          <div class="progress-meta">
            <span>${escapeHTML(category)}</span>
            <span>${progress}%</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              style="width:${progress}%"
            ></div>
          </div>
        </div>
      `;
    }).join("");
}

/* ---------------- TASKS ---------------- */

function renderTasks() {
  const container = document.getElementById("taskList");

  const search =
    document.getElementById("searchTasks").value
      .trim()
      .toLowerCase();

  const category =
    document.getElementById("filterCategory").value;

  const status =
    document.getElementById("filterStatus").value;

  let tasks = [...data.tasks];

  if (search) {
    tasks = tasks.filter(task =>
      `${task.title} ${task.category} ${task.type}`
        .toLowerCase()
        .includes(search)
    );
  }

  if (category !== "all") {
    tasks = tasks.filter(task => task.category === category);
  }

  if (status === "active") {
    tasks = tasks.filter(task => !task.completed);
  }

  if (status === "completed") {
    tasks = tasks.filter(task => task.completed);
  }

  tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (!a.due) return 1;
    if (!b.due) return -1;

    return a.due.localeCompare(b.due);
  });

  if (!tasks.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No tasks found</strong>
        Try changing your search or filters.
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(task => `
    <article class="task-card ${task.completed ? "completed" : ""}">
      <input
        class="task-check"
        type="checkbox"
        ${task.completed ? "checked" : ""}
        data-task-check="${escapeHTML(task.id)}"
      >

      <div class="task-main">
        <div class="task-title">${escapeHTML(task.title)}</div>

        <div class="task-meta">
          <span class="badge">${escapeHTML(task.category)}</span>
          <span class="task-date">
            📅 ${formatDate(task.due)}
          </span>
          <span class="task-minutes">
            ⏱ ${task.minutes || 0} min
          </span>
        </div>
      </div>

      <button
        class="delete-btn"
        title="Delete task"
        data-delete-task="${escapeHTML(task.id)}"
      >
        ×
      </button>
    </article>
  `).join("");

  container.querySelectorAll("[data-task-check]").forEach(input => {
    input.addEventListener("change", () => {
      toggleTask(input.dataset.taskCheck);
    });
  });

  container.querySelectorAll("[data-delete-task]").forEach(button => {
    button.addEventListener("click", () => {
      deleteTask(button.dataset.deleteTask);
    });
  });
}

function toggleTask(id) {
  const task = data.tasks.find(task => task.id === id);

  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? todayISO() : null;

  saveData();
  renderAll();

  showToast(
    task.completed
      ? "Task completed! 🎉"
      : "Task moved back to active."
  );
}

function deleteTask(id) {
  data.tasks = data.tasks.filter(task => task.id !== id);

  saveData();
  renderAll();

  showToast("Task deleted.");
}

document
  .getElementById("taskForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const title =
      document.getElementById("taskTitle").value.trim();

    if (!title) return;

    const task = {
      id: uid("task"),
      title,
      category: document.getElementById("taskCategory").value,
      type: document.getElementById("taskType").value,
      due: document.getElementById("taskDate").value,
      minutes:
        Number(document.getElementById("taskMinutes").value) || 0,
      completed: false,
      completedAt: null
    };

    data.tasks.unshift(task);

    saveData();

    event.target.reset();

    document.getElementById("taskMinutes").value = 30;
    document.getElementById("taskDate").value = todayISO();

    renderAll();

    showToast("New task added ✨");
  });

document
  .getElementById("searchTasks")
  .addEventListener("input", renderTasks);

document
  .getElementById("filterCategory")
  .addEventListener("change", renderTasks);

document
  .getElementById("filterStatus")
  .addEventListener("change", renderTasks);

/* ---------------- PROGRESS ---------------- */

function renderFullProgress() {
  const progress = getOverallProgress();
  const completed = getCompletedTasks().length;

  document.getElementById("bigProgressNumber").textContent =
    `${progress}%`;

  document.getElementById("bigProgressText").textContent =
    `${completed} completed task${completed === 1 ? "" : "s"} out of ${data.tasks.length}.`;

  document.getElementById("bigProgressBar").style.width =
    `${progress}%`;

  const container = document.getElementById("fullProgressList");

  const usedCategories = categories.filter(category =>
    data.tasks.some(task => task.category === category)
  );

  container.innerHTML = usedCategories.map(category => {
    const tasks = data.tasks.filter(
      task => task.category === category
    );

    const completedTasks =
      tasks.filter(task => task.completed).length;

    const percent = getCategoryProgress(category);

    return `
      <article class="category-card">
        <h3>${escapeHTML(category)}</h3>

        <p>
          ${completedTasks} of ${tasks.length} tasks completed
        </p>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="width:${percent}%"
          ></div>
        </div>

        <div class="progress-meta" style="margin-top:8px;">
          <span>Progress</span>
          <span>${percent}%</span>
        </div>
      </article>
    `;
  }).join("");
}

/* ---------------- GOALS ---------------- */

function renderGoals() {
  const container = document.getElementById("goalList");

  if (!data.goals.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No goals yet 🎯</strong>
        Add your first goal above.
      </div>
    `;
    return;
  }

  container.innerHTML = data.goals.map(goal => `
    <article class="goal-card ${goal.done ? "done" : ""}">

      <input
        class="goal-check"
        type="checkbox"
        ${goal.done ? "checked" : ""}
        data-goal-check="${escapeHTML(goal.id)}"
      >

      <div class="goal-info">
        <strong>${escapeHTML(goal.title)}</strong>
        <span>
          ${escapeHTML(goal.category)}
          ${goal.target ? ` • ${escapeHTML(goal.target)}` : ""}
        </span>
      </div>

      <button
        class="delete-btn"
        data-delete-goal="${escapeHTML(goal.id)}"
      >
        ×
      </button>

    </article>
  `).join("");

  container.querySelectorAll("[data-goal-check]").forEach(input => {
    input.addEventListener("change", () => {
      const goal = data.goals.find(
        item => item.id === input.dataset.goalCheck
      );

      if (!goal) return;

      goal.done = input.checked;

      saveData();
      renderGoals();

      showToast(
        goal.done
          ? "Goal achieved! 🏆"
          : "Goal reopened."
      );
    });
  });

  container.querySelectorAll("[data-delete-goal]").forEach(button => {
    button.addEventListener("click", () => {
      data.goals = data.goals.filter(
        goal => goal.id !== button.dataset.deleteGoal
      );

      saveData();
      renderGoals();

      showToast("Goal deleted.");
    });
  });
}

document
  .getElementById("goalForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const title =
      document.getElementById("goalTitle").value.trim();

    if (!title) return;

    data.goals.unshift({
      id: uid("goal"),
      title,
      category: document.getElementById("goalCategory").value,
      target:
        document.getElementById("goalTarget").value.trim(),
      done: false
    });

    saveData();

    event.target.reset();

    renderGoals();

    showToast("New goal added 🎯");
  });

/* ---------------- NOTES ---------------- */

function renderNotes() {
  const container = document.getElementById("noteList");

  if (!data.notes.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No notes yet 📝</strong>
        Save something you learn.
      </div>
    `;
    return;
  }

  container.innerHTML = data.notes.map(note => `
    <article class="note-card">

      <div class="note-card-header">
        <h3>${escapeHTML(note.title)}</h3>

        <button
          class="delete-btn"
          data-delete-note="${escapeHTML(note.id)}"
        >
          ×
        </button>
      </div>

      <time>${escapeHTML(note.date)}</time>

      <p>${escapeHTML(note.text)}</p>

    </article>
  `).join("");

  container.querySelectorAll("[data-delete-note]").forEach(button => {
    button.addEventListener("click", () => {
      data.notes = data.notes.filter(
        note => note.id !== button.dataset.deleteNote
      );

      saveData();
      renderNotes();

      showToast("Note deleted.");
    });
  });
}

document
  .getElementById("noteForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const title =
      document.getElementById("noteTitle").value.trim();

    const text =
      document.getElementById("noteText").value.trim();

    if (!title || !text) return;

    data.notes.unshift({
      id: uid("note"),
      title,
      text,
      date: new Date().toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    });

    saveData();

    event.target.reset();

    renderNotes();

    showToast("Note saved 📝");
  });

/* ---------------- COMPLETED ---------------- */

function renderCompleted() {
  const container = document.getElementById("completedList");
  const completed = getCompletedTasks();

  document.getElementById("completedNumber").textContent =
    completed.length;

  document.getElementById("studyDays").textContent =
    getStudyDays();

  const minutes = completed.reduce(
    (total, task) => total + Number(task.minutes || 0),
    0
  );

  document.getElementById("completedMinutes").textContent =
    minutes;

  if (!completed.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>Your completed work will appear here.</strong>
        Finish your first task and come back to see it.
      </div>
    `;
    return;
  }

  const sorted = [...completed].sort((a, b) =>
    (b.completedAt || "").localeCompare(a.completedAt || "")
  );

  container.innerHTML = sorted.map(task => `
    <article class="task-card completed">

      <span class="stat-icon">✓</span>

      <div class="task-main">
        <div class="task-title">${escapeHTML(task.title)}</div>

        <div class="task-meta">
          <span class="badge">${escapeHTML(task.category)}</span>
          <span class="task-date">
            Completed ${formatDate(task.completedAt)}
          </span>
          <span class="task-minutes">
            ⏱ ${task.minutes || 0} min
          </span>
        </div>
      </div>

    </article>
  `).join("");
}

/* ---------------- THEME ---------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme =
    theme === "dark" ? "dark" : "light";

  const icon =
    theme === "dark" ? "☀️" : "🌙";

  document.getElementById("themeToggle").textContent =
    `${icon} ${theme === "dark" ? "Light mode" : "Dark mode"}`;

  document.getElementById("mobileTheme").textContent = icon;

  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current =
    document.documentElement.dataset.theme || "light";

  applyTheme(current === "dark" ? "light" : "dark");
}

document
  .getElementById("themeToggle")
  .addEventListener("click", toggleTheme);

document
  .getElementById("mobileTheme")
  .addEventListener("click", toggleTheme);

/* ---------------- EXPORT / IMPORT ---------------- */

document
  .getElementById("exportBtn")
  .addEventListener("click", () => {
    const file = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = url;
    link.download = "yvette-gks-study-tracker-backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Backup exported.");
  });

document
  .getElementById("importBtn")
  .addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

document
  .getElementById("importFile")
  .addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);

        if (
          !Array.isArray(imported.tasks) ||
          !Array.isArray(imported.goals) ||
          !Array.isArray(imported.notes)
        ) {
          throw new Error("Invalid backup");
        }

        data = imported;

        saveData();
        renderAll();

        showToast("Backup imported successfully.");
      } catch (error) {
        showToast("That backup file isn't valid.");
      }

      event.target.value = "";
    };

    reader.readAsText(file);
  });

/* ---------------- RESET ---------------- */

document
  .getElementById("resetBtn")
  .addEventListener("click", () => {
    const confirmed = confirm(
      "Reset the entire tracker? This will delete your tasks, goals and notes."
    );

    if (!confirmed) return;

    data = defaultData();

    saveData();
    renderAll();

    showToast("Tracker reset.");
  });

/* ---------------- TOAST ---------------- */

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* ---------------- RENDER EVERYTHING ---------------- */

function renderAll() {
  renderDate();
  renderDashboard();
  renderTasks();
  renderFullProgress();
  renderGoals();
  renderNotes();
  renderCompleted();
}

/* ---------------- START ---------------- */

populateCategories();

document.getElementById("taskDate").value = todayISO();

const savedTheme =
  localStorage.getItem(THEME_KEY) || "light";

applyTheme(savedTheme);

renderAll();