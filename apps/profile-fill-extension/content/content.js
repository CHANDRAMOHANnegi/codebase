const FIELD_RULES = [
  { key: "fullName", tests: ["full name", "name", "candidate name", "applicant name"] },
  { key: "email", tests: ["email", "e-mail"] },
  { key: "phone", tests: ["phone", "mobile", "telephone", "contact number"] },
  { key: "location", tests: ["location", "city", "address", "current location"] },
  { key: "currentTitle", tests: ["current title", "job title", "headline", "position", "role"] },
  { key: "company", tests: ["company", "current company", "employer"] },
  { key: "linkedin", tests: ["linkedin", "linked in"] },
  { key: "github", tests: ["github", "git hub"] },
  { key: "portfolio", tests: ["portfolio", "website", "personal site", "url"] },
  { key: "resumeUrl", tests: ["resume url", "cv url", "resume link", "cv link"] },
  { key: "years", tests: ["years of experience", "experience", "total experience"] },
  { key: "notice", tests: ["notice period", "availability", "start date", "when can you start"] },
  { key: "workAuth", tests: ["work authorization", "work authorisation", "authorized to work", "visa", "sponsorship"] },
  { key: "salary", tests: ["salary", "compensation", "expected ctc", "current ctc", "pay expectation"] },
  { key: "summary", tests: ["summary", "cover letter", "about you", "profile", "bio"] }
];

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textForElement(element) {
  const parts = [
    element.name,
    element.id,
    element.placeholder,
    element.getAttribute("aria-label"),
    element.getAttribute("autocomplete")
  ];

  if (element.labels) {
    for (const label of element.labels) parts.push(label.textContent);
  }

  const describedBy = element.getAttribute("aria-describedby");
  if (describedBy) {
    for (const id of describedBy.split(/\s+/)) {
      const described = document.getElementById(id);
      if (described) parts.push(described.textContent);
    }
  }

  const container = element.closest("label, div, fieldset, section");
  if (container) parts.push(container.textContent);

  return normalize(parts.filter(Boolean).join(" "));
}

function valueForElement(element, profile) {
  const haystack = textForElement(element);
  const type = normalize(element.type);

  if (type === "email" && profile.email) return profile.email;
  if (type === "tel" && profile.phone) return profile.phone;
  if (type === "url") {
    if (haystack.includes("linkedin")) return profile.linkedin;
    if (haystack.includes("github")) return profile.github;
    if (haystack.includes("resume") || haystack.includes("cv")) return profile.resumeUrl;
    return profile.portfolio || profile.linkedin || profile.github;
  }

  const rule = FIELD_RULES.find((candidate) =>
    candidate.tests.some((test) => haystack.includes(test))
  );

  return rule ? profile[rule.key] : "";
}

function setNativeValue(element, value) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) descriptor.set.call(element, value);
  else element.value = value;

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillTextField(element, profile) {
  if (element.disabled || element.readOnly || element.type === "hidden") return false;

  const value = valueForElement(element, profile);
  if (!value) return false;

  setNativeValue(element, value);
  element.style.outline = "2px solid #dfb158";
  element.style.outlineOffset = "1px";
  return true;
}

function fillSelect(select, profile) {
  if (select.disabled) return false;

  const desired = normalize(valueForElement(select, profile));
  if (!desired) return false;

  const option = Array.from(select.options).find((candidate) => {
    const text = normalize(`${candidate.value} ${candidate.textContent}`);
    return desired.includes(text) || text.includes(desired);
  });

  if (!option) return false;
  select.value = option.value;
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
  select.style.outline = "2px solid #dfb158";
  select.style.outlineOffset = "1px";
  return true;
}

function fillPage(profile) {
  let filledCount = 0;
  const fields = document.querySelectorAll("input, textarea");
  const selects = document.querySelectorAll("select");

  fields.forEach((field) => {
    if (fillTextField(field, profile)) filledCount += 1;
  });

  selects.forEach((select) => {
    if (fillSelect(select, profile)) filledCount += 1;
  });

  return filledCount;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "PROFILE_FILL_ASSISTANT_FILL") return false;
  const filledCount = fillPage(message.profile ?? {});
  sendResponse({ filledCount });
  return true;
});
