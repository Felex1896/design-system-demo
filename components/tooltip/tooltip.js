(() => {
class CcTooltip extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "tooltip");
    this.hidden = true;
    this._run = 0;
  }

  show(anchor, text, fit) {
    const appear = this.hidden;
    this._run += 1;
    this.textContent = text;
    this.hidden = false;
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-2")) || 0;
    const host = restBox(anchor);
    const anchorFit = fit === "anchor";
    if (anchorFit) this.dataset.fit = "anchor";
    else delete this.dataset.fit;
    this.style.width = anchorFit ? `${host.width}px` : "";
    const plate = this.getBoundingClientRect();
    const viewWidth = document.documentElement.clientWidth;
    const viewHeight = document.documentElement.clientHeight;
    const narrow = document.documentElement.classList.contains("is-narrow");
    const above = host.top - gap - plate.height;
    const below = host.bottom + gap;
    const belowFits = below + plate.height <= viewHeight;
    const aboveFits = above >= 0;
    let top = below;
    if (anchor.getAttribute("tip") === "above") top = above;
    else if (narrow) top = aboveFits || !belowFits ? above : below;
    else if (!belowFits) top = above;
    const span = anchorFit ? host.width : plate.width;
    let left = host.left;
    if (left + span > viewWidth) left = viewWidth - span;
    if (left < 0) left = anchorFit ? host.left : 0;
    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
    if (appear && !document.documentElement.classList.contains("is-touch")) this._fade(true);
    else this._holdOpen();
  }

  _holdOpen() {
    this.getAnimations().forEach((item) => item.cancel());
    this.style.opacity = "1";
  }

  hide(immediate) {
    if (this.hidden) return;
    this._run += 1;
    const run = this._run;
    const finish = () => {
      if (this._run !== run) return;
      this.hidden = true;
      this.style.opacity = "";
      this.style.top = "";
      this.style.left = "";
      this.style.width = "";
      delete this.dataset.fit;
    };
    const motion = window.ccMotion;
    if (immediate || !motion || motion.reduce()) {
      finish();
      return;
    }
    this._fade(false);
    requestAnimationFrame(() => {
      const running = [...this.getAnimations()];
      if (!running.length) {
        finish();
        return;
      }
      Promise.all(running.map((item) => item.finished.then(() => {}, () => {}))).then(finish);
    });
  }

  _fade(open) {
    this.getAnimations().forEach((item) => item.cancel());
    const motion = window.ccMotion;
    const fade = { duration: 0.12, ease: "easeOut" };
    if (!motion || motion.reduce()) {
      this.style.opacity = "";
      return;
    }
    if (open) {
      this.style.opacity = "0";
      motion.animate(this, { opacity: [0, 1] }, fade);
      return;
    }
    motion.animate(this, { opacity: 0 }, fade);
  }
}

function restBox(anchor) {
  const visual = anchor.getBoundingClientRect();
  const width = anchor.offsetWidth;
  const height = anchor.offsetHeight;
  const left = visual.left + (visual.width - width) / 2;
  const top = visual.top + (visual.height - height) / 2;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

customElements.define("cc-tooltip", CcTooltip);

const tip = document.createElement("cc-tooltip");
document.body.append(tip);

const ROW = "cc-color-row, cc-size-row, cc-type-row, cc-shadow-row";

function rowFrom(event) {
  return event.target instanceof Element ? event.target.closest(ROW) : null;
}

function descriptionText(row) {
  return (row.getAttribute("description") || "").trim();
}

function showRow(row) {
  const text = descriptionText(row);
  if (!text) {
    if (hoveredRow === row) hoveredRow = null;
    tip.hide();
    return;
  }
  hoveredRow = row;
  tip.show(row, text, "anchor");
}

function staysInside(row, event) {
  const next = event.relatedTarget;
  return next instanceof Node && row.contains(next);
}

const HOLD_SLOP = 8;
let holdPointer = null;
let heldRow = null;
let latchUntil = 0;
let hoveredRow = null;
let mousePoint = null;
let keyboardNav = false;

function rowAt(x, y) {
  const under = document.elementFromPoint(x, y);
  return under instanceof Element ? under.closest(ROW) : null;
}

function pointerStillOn(row, event) {
  if (staysInside(row, event)) return true;
  return rowAt(event.clientX, event.clientY) === row;
}

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
  latchUntil = 0;
  hoveredRow = null;
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
  return rowAt(event.clientX, event.clientY);
}

document.addEventListener("pointerover", (event) => {
  if (event.pointerType !== "mouse") return;
  document.documentElement.classList.remove("is-touch");
  mousePoint = { x: event.clientX, y: event.clientY };
  const row = rowFrom(event);
  if (!row) return;
  showRow(row);
});

document.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  mousePoint = { x: event.clientX, y: event.clientY };
  const row = rowUnder(event);
  if (row) {
    if (row !== hoveredRow) showRow(row);
    return;
  }
  if (!hoveredRow) return;
  hoveredRow = null;
  tip.hide();
});

document.addEventListener("pointerout", (event) => {
  if (event.pointerType !== "mouse") return;
  const row = rowFrom(event);
  if (!row || pointerStillOn(row, event)) return;
  if (hoveredRow !== row) return;
  hoveredRow = null;
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
  if (event.cancelable) event.preventDefault();
  holdPointer = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    moved: false,
  };
  placeHold(row);
});

document.addEventListener("pointermove", (event) => {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  const dx = event.clientX - holdPointer.x;
  const dy = event.clientY - holdPointer.y;
  if (dx * dx + dy * dy <= HOLD_SLOP * HOLD_SLOP && rowUnder(event) === heldRow) return;
  holdPointer.moved = true;
  dropHold();
});

function endTouch(event) {
  if (!holdPointer || event.pointerId !== holdPointer.id) return;
  const moved = holdPointer.moved;
  holdPointer = null;
  if (moved || !heldRow) {
    dropHold();
    return;
  }
  latchUntil = performance.now() + 400;
}

document.addEventListener("pointerup", endTouch);
document.addEventListener("pointercancel", endTouch);

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
  if (hoveredRow === row && mousePoint && rowAt(mousePoint.x, mousePoint.y) === row) return;
  if (hoveredRow === row) hoveredRow = null;
  tip.hide();
});

document.addEventListener("scroll", () => {
  if (holdPointer) return;
  if (heldRow && performance.now() < latchUntil) return;
  if (heldRow) {
    dropHold();
    return;
  }
  if (!hoveredRow) return;
  if (!mousePoint) {
    hoveredRow = null;
    tip.hide(true);
    return;
  }
  if (rowAt(mousePoint.x, mousePoint.y) === hoveredRow) {
    showRow(hoveredRow);
    return;
  }
  hoveredRow = null;
  tip.hide(true);
}, true);
})();
