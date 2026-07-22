const STORAGE_KEY = "docuflow.documents";

// A document moves through a simple workflow of stages.
const STAGES = ["Draft", "Review", "Approved"];

/** @typedef {{ id: string, title: string, stage: string, createdAt: number }} DocItem */

/** @returns {DocItem[]} */
function loadDocuments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** @param {DocItem[]} docs */
function saveDocuments(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

let documents = loadDocuments();

const form = document.getElementById("doc-form");
const titleInput = document.getElementById("doc-title");
const list = document.getElementById("doc-list");
const emptyState = document.getElementById("empty-state");

function nextStage(stage) {
  const idx = STAGES.indexOf(stage);
  return STAGES[Math.min(idx + 1, STAGES.length - 1)];
}

function stageClass(stage) {
  return `stage stage-${stage.toLowerCase()}`;
}

function render() {
  list.innerHTML = "";
  emptyState.style.display = documents.length ? "none" : "block";

  for (const doc of documents) {
    const li = document.createElement("li");
    li.className = "doc-item";
    li.dataset.id = doc.id;

    const title = document.createElement("span");
    title.className = "doc-title";
    title.textContent = doc.title;

    const stage = document.createElement("span");
    stage.className = stageClass(doc.stage);
    stage.textContent = doc.stage;

    const actions = document.createElement("div");
    actions.className = "doc-actions";

    const advanceBtn = document.createElement("button");
    advanceBtn.className = "advance-btn";
    advanceBtn.textContent =
      doc.stage === "Approved" ? "Done" : `Advance to ${nextStage(doc.stage)}`;
    advanceBtn.disabled = doc.stage === "Approved";
    advanceBtn.addEventListener("click", () => advance(doc.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => remove(doc.id));

    actions.append(advanceBtn, deleteBtn);
    li.append(title, stage, actions);
    list.append(li);
  }
}

function addDocument(titleText) {
  documents.unshift({
    id: crypto.randomUUID(),
    title: titleText,
    stage: "Draft",
    createdAt: Date.now(),
  });
  saveDocuments(documents);
  render();
}

function advance(id) {
  documents = documents.map((doc) =>
    doc.id === id ? { ...doc, stage: nextStage(doc.stage) } : doc
  );
  saveDocuments(documents);
  render();
}

function remove(id) {
  documents = documents.filter((doc) => doc.id !== id);
  saveDocuments(documents);
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = titleInput.value.trim();
  if (!value) return;
  addDocument(value);
  titleInput.value = "";
  titleInput.focus();
});

render();
