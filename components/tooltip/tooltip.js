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
    const narrow = document.documentElement.classList.contains("is-narrow");
    const below = host.bottom + gap;
    const above = host.top - gap - plate.height;
    const belowFits = below + plate.height <= viewHeight;
    const aboveFits = above >= 0;
    let top = below;
    if (narrow) top = aboveFits || !belowFits ? above : below;
    else if (!belowFits) top = above;
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

const ROW = "cc-color-row, cc-size-row, cc-type-row";

function rowFrom(event) {
  return event.target instanceof Element ? event.target.closest(ROW) : null;
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

const HOLD_SLOP = 8;
let holdPointer = null;
let heldRow = null;
let keyboardNav = false;

function touchPointer(event) {
  return event.pointerType === "touch" || event.pointerType === "pen";
}

function dropHold() {
  if (heldRow) {
    heldRow.classList.remove("is-held");
    if (document.activeElement === heldRow) heldRow.blur();
  }
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

function rowUnder(event) {
  const under = document.elementFromPoint(event.clientX, event.clientY);
  return under instanceof Element ? under.closest(ROW) : null;
}

document.addEventListener("pointerover", (event) => {
  if (event.pointerType !== "mouse") return;
  document.documentElement.classList.remove("is-touch");
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") keyboardNav = true;
});

document.addEventListener("pointerdown", (event) => {
  keyboardNav = false;
  if (!touchPointer(event)) return;
  document.documentElement.classList.add("is-touch");
  const row = rowFrom(event);
  if (!row) {
    dropHold();
    return;
  }
  holdPointer = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  };
  placeHold(row);
});

document.addEventListener("pointermove", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  const dx = event.clientX - holdPointer.x;
  const dy = event.clientY - holdPointer.y;
  if (dx * dx + dy * dy > HOLD_SLOP * HOLD_SLOP || rowUnder(event) !== heldRow) dropHold();
});

document.addEventListener("pointerup", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  dropHold();
});

document.addEventListener("pointercancel", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  dropHold();
});

document.addEventListener("contextmenu", (event) => {
  if (rowFrom(event) && document.documentElement.classList.contains("is-touch")) event.preventDefault();
});

document.addEventListener("focusin", (event) => {
  if (!keyboardNav) return;
  const row = rowFrom(event);
  if (!row) return;
  showRow(row);
});

document.addEventListener("focusout", (event) => {
  const row = rowFrom(event);
  if (!row || staysInside(row, event)) return;
  if (heldRow === row) return;
  tip.hide();
});

document.addEventListener("scroll", () => {
  if (holdPointer || heldRow) dropHold();
  else tip.hide();
}, true);
