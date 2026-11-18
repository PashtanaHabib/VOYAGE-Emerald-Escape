const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const header = $("#header"),
  nav = $("#nav"),
  menu = $("#menu"),
  theme = $("#theme"),
  modal = $("#modal");
const destinations = {
  maldives: {
    name: "The Maldives",
    region: "INDIAN OCEAN / ISLAND LIFE",
    category: "island",
    budget: 4200,
    season: "Nov–Apr",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=85",
    description:
      "A world of luminous lagoons, quiet private shores and overwater hideaways. Slow down, dive deeper and let the rhythm of the ocean set the pace.",
  },
  bali: {
    name: "Bali",
    region: "INDONESIA / INTO THE GREEN",
    category: "nature",
    budget: 1900,
    season: "Apr–Oct",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
    description:
      "Follow jungle paths to hidden waterfalls, wander through temple gardens and discover an island where nature and culture move together.",
  },
  dolomites: {
    name: "The Dolomites",
    region: "ITALY / HIGHER GROUND",
    category: "nature",
    budget: 2600,
    season: "Jun–Sep",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
    description:
      "Jagged peaks, alpine lakes and trails that reward every step. A dramatic escape for travellers who feel most alive in the wild.",
  },
  marrakech: {
    name: "Marrakech",
    region: "MOROCCO / ANCIENT RHYTHMS",
    category: "culture",
    budget: 1500,
    season: "Mar–May, Sep–Nov",
    image:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=85",
    description:
      "A sensory journey through intricate courtyards, spice-filled souks and sun-warmed architecture. Let every turn reveal another story.",
  },
};
// Loader and responsive navigation
window.addEventListener("load", () =>
  setTimeout(() => $("#loader")?.classList.add("hide"), 350),
);
const onScroll = () => header?.classList.toggle("scrolled", scrollY > 45);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
$$("#nav a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
  }),
);
// Theme preference: all component colors are controlled by body.light CSS variables.
function setTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  localStorage.setItem("voyage-theme", mode);
  theme.textContent = mode === "light" ? "☾" : "☼";
  theme.setAttribute(
    "aria-label",
    mode === "light" ? "Switch to dark mode" : "Switch to light mode",
  );
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = mode === "light" ? "#f7f6f0" : "#071b15";
}
setTheme(localStorage.getItem("voyage-theme") === "light" ? "light" : "dark");
theme?.addEventListener("click", () =>
  setTheme(document.body.classList.contains("light") ? "dark" : "light"),
);
// Original category filter
$$("[data-filter]").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$("[data-filter]").forEach((b) => b.classList.toggle("active", b === btn));
    $$(".places .place").forEach((card) =>
      card.classList.toggle(
        "hidden",
        btn.dataset.filter !== "all" &&
          card.dataset.category !== btn.dataset.filter,
      ),
    );
  }),
);
// Destination details modal
function openModal(key) {
  const d = destinations[key];
  if (!d) return;
  $("#modalRegion").textContent = d.region;
  $("#modalTitle").textContent = d.name;
  $("#modalText").textContent = d.description;
  $("#modalImage").src = d.image;
  $("#modalImage").alt = "Scenic view of " + d.name;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#closeModal").focus();
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
$$("[data-place]").forEach((b) =>
  b.addEventListener("click", () => openModal(b.dataset.place)),
);
$("#closeModal")?.addEventListener("click", closeModal);
$$("[data-close]").forEach((e) => e.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});
$(".modal-box .text-link")?.addEventListener("click", closeModal);
// Scroll reveal
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.1 },
  );
  $$(".reveal").forEach((el) => observer.observe(el));
} else $$(".reveal").forEach((el) => el.classList.add("visible"));
// Smart destination explorer
const explorerGrid = $("#explorerGrid"),
  search = $("#destinationSearch"),
  typeFilter = $("#typeFilter"),
  budgetFilter = $("#budgetFilter");
function renderExplorer() {
  const q = (search.value || "").trim().toLowerCase(),
    type = typeFilter.value,
    budget = budgetFilter.value;
  const matches = Object.entries(destinations).filter(
    ([id, d]) =>
      (!q ||
        (d.name + " " + d.region + " " + d.category + " " + d.description)
          .toLowerCase()
          .includes(q)) &&
      (type === "all" || d.category === type) &&
      (budget === "all" || d.budget <= Number(budget)),
  );
  $("#resultCount").textContent =
    `Showing ${matches.length} of ${Object.keys(destinations).length} destinations`;
  explorerGrid.innerHTML = matches.length
    ? matches
        .map(
          ([id, d]) =>
            `<article class="explorer-card"><img src="${d.image}" alt="${d.name}" loading="lazy"><button class="save-place ${isSaved(id) ? "saved" : ""}" data-save="${id}" aria-label="${isSaved(id) ? "Remove" : "Save"} ${d.name}">${isSaved(id) ? "♥" : "♡"}</button><div class="explorer-card-copy"><small>${d.region} · FROM ABOUT $${d.budget.toLocaleString()}</small><h3>${d.name}</h3><p>Best season: ${d.season}</p></div></article>`,
        )
        .join("")
    : '<div class="empty-results">No destinations match those filters. Try a broader search.</div>';
  $$("[data-save]", explorerGrid).forEach((b) =>
    b.addEventListener("click", () => toggleSaved(b.dataset.save)),
  );
}
[search, typeFilter, budgetFilter].forEach((el) =>
  el.addEventListener("input", renderExplorer),
);
// Wishlist is stored locally in this browser
function getSaved() {
  try {
    return JSON.parse(localStorage.getItem("voyage-wishlist") || "[]");
  } catch {
    return [];
  }
}
function isSaved(id) {
  return getSaved().includes(id);
}
function renderWishlist() {
  const saved = getSaved();
  $("#wishlistCount").textContent = saved.length
    ? `${saved.length} destination${saved.length === 1 ? "" : "s"} saved for later.`
    : "No saved destinations yet. Tap the heart on a destination to keep it here.";
  $("#wishlistItems").innerHTML = saved
    .map(
      (id) =>
        `<span class="wishlist-chip">${destinations[id]?.name || id}<button data-remove="${id}" aria-label="Remove ${destinations[id]?.name || id}">×</button></span>`,
    )
    .join("");
  $$("[data-remove]").forEach((b) =>
    b.addEventListener("click", () => toggleSaved(b.dataset.remove)),
  );
}
function toggleSaved(id) {
  let saved = getSaved();
  saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
  localStorage.setItem("voyage-wishlist", JSON.stringify(saved));
  renderExplorer();
  renderWishlist();
}
renderExplorer();
renderWishlist();
// Trip planner: sample daily estimates, no real booking or live prices
const baseRates = { maldives: 390, bali: 155, dolomites: 220, marrakech: 125 },
  styleMultiplier = { comfort: 1, premium: 1.45, luxury: 2.1 };
$("#plannerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("#planDestination").value,
    people = Math.max(1, Math.min(12, Number($("#travelers").value) || 1)),
    days = Math.max(1, Math.min(30, Number($("#days").value) || 1)),
    style = $("#travelStyle").value;
  if (!id) {
    $("#planDestination").focus();
    return;
  }
  const total = Math.round(
    baseRates[id] * days * people * styleMultiplier[style] + people * 180,
  );
  $("#plannerOutput").innerHTML =
    `<span class="output-icon">✳</span><p class="eyebrow gold">YOUR TRIP ESTIMATE · ${destinations[id].name.toUpperCase()}</p><h3>Your story<br>starts <em>here.</em></h3><p>${people} traveller${people === 1 ? "" : "s"} · ${days} days · ${style} style</p><div class="estimate">$${total.toLocaleString()}</div><small>Illustrative estimate only. Uses sample daily rates and a simple per-person allowance. Flights and actual provider prices are not included.</small>`;
});
// Three-step destination personality quiz
const quizQuestions = [
  {
    q: "What landscape calls to you?",
    a: [
      ["Sea and sun", "island"],
      ["Deep forests", "nature"],
      ["Historic streets", "culture"],
      ["High mountains", "mountain"],
    ],
  },
  {
    q: "How do you like to spend a day?",
    a: [
      ["Slow mornings by the water", "island"],
      ["Hiking and exploring", "nature"],
      ["Food, art and local life", "culture"],
      ["Fresh air and big views", "mountain"],
    ],
  },
  {
    q: "Choose your ideal atmosphere.",
    a: [
      ["Tropical and peaceful", "island"],
      ["Green and adventurous", "nature"],
      ["Colourful and vibrant", "culture"],
      ["Wild and majestic", "mountain"],
    ],
  },
];
let quizStep = 0,
  quizAnswers = [];
function showQuiz() {
  const area = $("#quizArea"),
    item = quizQuestions[quizStep];
  area.hidden = false;
  area.innerHTML = `<p class="eyebrow gold">QUESTION ${quizStep + 1} / 3</p><h3>${item.q}</h3><div class="quiz-options">${item.a.map(([label, val]) => `<button type="button" data-answer="${val}" class="${quizAnswers[quizStep] === val ? "selected" : ""}">${label}</button>`).join("")}</div><div class="quiz-controls"><button type="button" id="quizBack" ${quizStep === 0 ? "disabled" : ""}>← BACK</button><button type="button" id="quizNext">${quizStep === 2 ? "SHOW MY MATCH" : "NEXT →"}</button></div>`;
  $$("[data-answer]", area).forEach((b) =>
    b.addEventListener("click", () => {
      quizAnswers[quizStep] = b.dataset.answer;
      showQuiz();
    }),
  );
  $("#quizBack").addEventListener("click", () => {
    if (quizStep > 0) {
      quizStep--;
      showQuiz();
    }
  });
  $("#quizNext").addEventListener("click", () => {
    if (!quizAnswers[quizStep]) {
      area.querySelector("h3").textContent = "Choose one option to continue.";
      return;
    }
    if (quizStep < 2) {
      quizStep++;
      showQuiz();
    } else showQuizResult();
  });
}
function showQuizResult() {
  const counts = { island: 0, nature: 0, culture: 0, mountain: 0 };
  quizAnswers.forEach((a) => counts[a]++);
  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const match =
    winner === "island"
      ? "maldives"
      : winner === "culture"
        ? "marrakech"
        : winner === "mountain"
          ? "dolomites"
          : "bali";
  $("#quizArea").innerHTML =
    `<p class="eyebrow gold">YOUR VOYAGE MATCH</p><h3>Your spirit belongs somewhere like...</h3><div class="quiz-result">${destinations[match].name}</div><p>${destinations[match].description}</p><div class="quiz-controls"><button type="button" id="quizAgain">RETAKE QUIZ</button><button type="button" id="quizDiscover">DISCOVER ↗</button></div>`;
  $("#quizAgain").addEventListener("click", () => {
    quizStep = 0;
    quizAnswers = [];
    showQuiz();
  });
  $("#quizDiscover").addEventListener("click", () => openModal(match));
}
$("#startQuiz").addEventListener("click", () => {
  quizStep = 0;
  quizAnswers = [];
  showQuiz();
  $("#quizArea").scrollIntoView({ behavior: "smooth", block: "nearest" });
});
// Contact form validation (demo only; no backend submission)
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget,
    name = $("#name"),
    email = $("#email"),
    destination = $("#destination"),
    feedback = $("#feedback");
  $$(".field small", form).forEach((s) => (s.textContent = ""));
  feedback.textContent = "";
  let valid = true;
  if (name.value.trim().length < 2) {
    name.parentElement.querySelector("small").textContent =
      "Please enter at least 2 characters.";
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    email.parentElement.querySelector("small").textContent =
      "Please enter a valid email address.";
    valid = false;
  }
  if (!destination.value) {
    destination.parentElement.querySelector("small").textContent =
      "Please choose a destination.";
    valid = false;
  }
  if (!valid) {
    feedback.textContent = "A few details need your attention.";
    return;
  }
  feedback.textContent = `Thank you, ${name.value.trim()}! Your enquiry is ready. This demo form does not send data to a server.`;
  form.reset();
});
