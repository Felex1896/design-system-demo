class CcTooltip extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "tooltip");
    this.hidden = true;
  }

  show(anchor, text) {
    this.textContent = text;
    this.hidden = false;
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-2")) || 0;
    const host = anchor.getBoundingClientRect();
    this.style.width = `${host.width}px`;
    const plate = this.getBoundingClientRect();
    const viewWidth = document.documentElement.clientWidth;
    const viewHeight = document.documentElement.clientHeight;
    let top = host.bottom + gap;
    if (top + plate.height > viewHeight) top = host.top - gap - plate.height;
    const plateWidth = plate.width;
    let left = host.left;
    if (left + plateWidth > viewWidth) left = viewWidth - plateWidth;
    if (left < 0) left = host.left;
    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  hide() {
    this.hidden = true;
    this.style.top = "";
    this.style.left = "";
    this.style.width = "";
  }
}

customElements.define("cc-tooltip", CcTooltip);

const tip = document.createElement("cc-tooltip");
document.body.append(tip);

function rowFrom(event) {
  return event.target instanceof Element ? event.target.closest("cc-color-row") : null;
}

function descriptionText(row) {
  return (row.getAttribute("description") || "").trim();
}

function showRow(row) {
  const text = descriptionText(row);
  if (!text) {
    tip.hide();
    return;
  }
  tip.show(row, text);
}

function staysInside(row, event) {
  const next = event.relatedTarget;
  return next instanceof Node && row.contains(next);
}

const HOLD_MS = 400;
const HOLD_SLOP = 8;
let holdTimer = 0;
let holdPointer = null;
let heldRow = null;

function narrowPage() {
  return document.documentElement.classList.contains("is-narrow");
}

function clearHoldTimer() {
  window.clearTimeout(holdTimer);
  holdTimer = 0;
}

function dropHold() {
  clearHoldTimer();
  if (heldRow) heldRow.classList.remove("is-held");
  heldRow = null;
  holdPointer = null;
  tip.hide();
}

function placeHold(row) {
  if (heldRow && heldRow !== row) heldRow.classList.remove("is-held");
  heldRow = row;
  if (!row) {
    tip.hide();
    return;
  }
  row.classList.add("is-held");
  showRow(row);
}

document.addEventListener("pointerover", (event) => {
  if (event.pointerType !== "mouse") return;
  const row = rowFrom(event);
  if (!row) return;
  showRow(row);
});

document.addEventListener("pointerout", (event) => {
  if (event.pointerType !== "mouse") return;
  const row = rowFrom(event);
  if (!row || staysInside(row, event)) return;
  tip.hide();
});

document.addEventListener("pointerdown", (event) => {
  if (!narrowPage() || event.pointerType === "mouse") return;
  clearHoldTimer();
  const row = rowFrom(event);
  holdPointer = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    row,
  };
  if (!row) {
    dropHold();
    return;
  }
  holdTimer = window.setTimeout(() => {
    holdTimer = 0;
    if (!holdPointer || holdPointer.row !== row) return;
    placeHold(row);
  }, HOLD_MS);
});

document.addEventListener("pointermove", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  const dx = event.clientX - holdPointer.x;
  const dy = event.clientY - holdPointer.y;
  if (!heldRow) {
    if (dx * dx + dy * dy > HOLD_SLOP * HOLD_SLOP) clearHoldTimer();
    return;
  }
  const under = document.elementFromPoint(event.clientX, event.clientY);
  const row = under instanceof Element ? under.closest("cc-color-row") : null;
  if (row !== heldRow) dropHold();
});

document.addEventListener("pointerup", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  const row = heldRow;
  clearHoldTimer();
  holdPointer = null;
  if (!row) return;
  row.classList.remove("is-held");
  heldRow = null;
  row.focus({ preventScroll: true });
  showRow(row);
});

document.addEventListener("pointercancel", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  dropHold();
});

document.addEventListener("contextmenu", (event) => {
  if (rowFrom(event) && narrowPage()) event.preventDefault();
});

document.addEventListener("focusin", (event) => {
  const row = rowFrom(event);
  if (!row) return;
  showRow(row);
});

document.addEventListener("focusout", (event) => {
  const row = rowFrom(event);
  if (!row || staysInside(row, event)) return;
  tip.hide();
});

document.addEventListener("scroll", () => tip.hide(), true);
