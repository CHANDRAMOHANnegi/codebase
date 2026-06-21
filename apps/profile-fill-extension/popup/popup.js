const STORAGE_KEY = "profileFillAssistant.profile";
const form = document.querySelector("#profile-form");
const statusEl = document.querySelector("#status");
const saveButton = document.querySelector("#save-profile");
const fillButton = document.querySelector("#fill-page");

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`.trim();
}

function formToProfile() {
  return Object.fromEntries(new FormData(form).entries());
}

function applyProfile(profile) {
  for (const [key, value] of Object.entries(profile ?? {})) {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  }
}

async function loadProfile() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  applyProfile(stored[STORAGE_KEY]);
}

async function saveProfile() {
  const profile = formToProfile();
  await chrome.storage.local.set({ [STORAGE_KEY]: profile });
  setStatus("Profile saved in this Chrome profile.", "good");
  return profile;
}

async function fillCurrentPage() {
  const profile = await saveProfile();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setStatus("No active tab found.", "warn");
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "PROFILE_FILL_ASSISTANT_FILL",
      profile
    });
    const count = response?.filledCount ?? 0;
    setStatus(count ? `Filled ${count} fields on this page.` : "No matching fields found on this page.", count ? "good" : "warn");
  } catch {
    setStatus("Refresh the page once, then try Fill current page again.", "warn");
  }
}

saveButton.addEventListener("click", () => {
  saveProfile().catch(() => setStatus("Could not save profile.", "warn"));
});

fillButton.addEventListener("click", () => {
  fillCurrentPage().catch(() => setStatus("Could not fill this page.", "warn"));
});

loadProfile().catch(() => setStatus("Could not load saved profile.", "warn"));
