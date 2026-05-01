// Tiny global accessibility-mode toggle.
// When enabled, sets data-a11y="true" on <html>; CSS in index.css
// inverts the palette to high-contrast black/white and bumps font sizes.

const KEY = "om_a11y";

export function isA11yOn() {
  try { return localStorage.getItem(KEY) === "true"; } catch { return false; }
}

export function applyA11y(on) {
  const html = document.documentElement;
  if (on) html.setAttribute("data-a11y", "true");
  else    html.removeAttribute("data-a11y");
}

export function setA11y(on) {
  try { localStorage.setItem(KEY, on ? "true" : "false"); } catch {}
  applyA11y(on);
  // Notify listeners (cross-component sync)
  window.dispatchEvent(new CustomEvent("om:a11y", { detail: { on } }));
}

export function toggleA11y() {
  setA11y(!isA11yOn());
}

// Call once at app boot
export function initA11y() {
  applyA11y(isA11yOn());
}
