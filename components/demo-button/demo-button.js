const GRID = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 20H4V16H8V20ZM14 20H10V16H14V20ZM20 16V20H16V16H20ZM8 14H4V10H8V14ZM14 14H10V10H14V14ZM20 14H16V10H20V14ZM8 8H4V4H8V8ZM14 8H10V4H14V8ZM20 8H16V4H20V8Z"/>
</svg>`;

const tip = document.createElement("div");
tip.className = "demo-button-tip";
tip.setAttribute("role", "tooltip");
tip.hidden = true;

let tipAnchor = null;
let quietMouse = 0;

function mountTip() {
  if (tip.isConnected || !document.body) return;
  document.body.append(tip);
}

function restBox(anchor) {
  const visual = anchor.getBoundingClientRect();
  const width = anchor.offsetWidth;
  const height = anchor.offsetHeight;
  const left = visual.left + (visual.width - width) / 2;
  const top = visual.top + (visual.height - height) / 2;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

function placeTip(anchor) {
  const spacing = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-2")) || 0;
  const gap = spacing + 2;
  const host = restBox(anchor);
  tip.style.width = "";
  const plate = tip.getBoundingClientRect();
  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = document.documentElement.clientHeight;
  const stacked = document.documentElement.classList.contains("is-stacked");
  const above = host.top - gap - plate.height;
  const below = host.bottom + gap;
  const belowFits = below + plate.height <= viewHeight;
  const aboveFits = above >= 0;
  let top = below;
  if (stacked) top = aboveFits ? above : below;
  else if (!belowFits) top = above;
  let left = host.left + (host.width - plate.width) / 2;
  if (left + plate.width > viewWidth) left = viewWidth - plate.width;
  if (left < 0) left = 0;
  tip.style.top = `${top}px`;
  tip.style.left = `${left}px`;
}

function hideTip() {
  tipAnchor = null;
  if (tip.hidden) return;
  tip.hidden = true;
  tip.textContent = "";
  tip.style.top = "";
  tip.style.left = "";
  tip.style.width = "";
}

function showTip(anchor, text) {
  if (!anchor || !anchor.isConnected || anchor.hasAttribute("disabled")) {
    if (tipAnchor === anchor) hideTip();
    return;
  }
  mountTip();
  tipAnchor = anchor;
  tip.hidden = false;
  tip.textContent = text;
  placeTip(anchor);
}

function touchLike(event) {
  return event.pointerType === "touch" || event.pointerType === "pen";
}

class DemoButton extends HTMLElement {
  static get observedAttributes() {
    return ["kind", "size", "label", "show-icon", "show-badge", "disabled"];
  }

  #button = null;
  #label = null;
  #wired = false;

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    this.#ensure();
    mountTip();
    if (!this.#wired) {
      this.#wired = true;
      this.addEventListener("pointerenter", (event) => this.#enter(event));
      this.addEventListener("pointerleave", (event) => this.#leave(event));
      this.addEventListener("pointerdown", (event) => this.#down(event));
      this.addEventListener("pointerup", (event) => this.#up(event));
      this.addEventListener("pointermove", (event) => this.#move(event));
      this.addEventListener("pointercancel", (event) => this.#cancel(event));
    }
    this.#sync();
  }

  disconnectedCallback() {
    if (tipAnchor === this) hideTip();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #ensure() {
    if (this.#button) return;
    let button = this.querySelector(":scope > button");
    let label = button && button.querySelector(".demo-button-label");
    if (!button || !label) {
      button = document.createElement("button");
      button.type = "button";
      const icon = document.createElement("span");
      icon.className = "demo-button-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = GRID;
      label = document.createElement("span");
      label.className = "demo-button-label";
      const badge = document.createElement("span");
      badge.className = "demo-button-badge";
      badge.setAttribute("aria-hidden", "true");
      const mark = document.createElement("span");
      mark.className = "demo-button-badge-mark";
      mark.textContent = "1";
      badge.append(mark);
      button.append(icon, label);
      this.append(button, badge);
    }
    this.#button = button;
    this.#label = label;
  }

  #sync() {
    const button = this.#button;
    if (!button) return;
    const text = this.getAttribute("label") || "Label";
    this.#label.textContent = text;
    if (this.getAttribute("kind") === "icon-button") button.setAttribute("aria-label", text);
    else button.removeAttribute("aria-label");
    const off = this.hasAttribute("disabled");
    button.disabled = off;
    if (off && document.activeElement === button) button.blur();
    if (off && tipAnchor === this) hideTip();
  }

  #enter(event) {
    if (event.pointerType !== "mouse") return;
    if (performance.now() < quietMouse) return;
    if (this.hasAttribute("disabled")) return;
    showTip(this, "hover");
  }

  #leave() {
    if (tipAnchor !== this) return;
    hideTip();
  }

  #down(event) {
    if (this.hasAttribute("disabled")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    showTip(this, "pressed");
  }

  #up(event) {
    if (touchLike(event)) {
      quietMouse = performance.now() + 700;
      if (tipAnchor === this) hideTip();
      return;
    }
    if (tipAnchor !== this) return;
    if (this.hasAttribute("disabled") || !this.matches(":hover")) {
      hideTip();
      return;
    }
    showTip(this, "hover");
  }

  #move(event) {
    if (!touchLike(event) || tipAnchor !== this) return;
    const under = document.elementFromPoint(event.clientX, event.clientY);
    if (under instanceof Element && this.contains(under)) return;
    hideTip();
  }

  #cancel(event) {
    if (tipAnchor !== this) return;
    if (touchLike(event)) quietMouse = performance.now() + 700;
    hideTip();
  }
}

customElements.define("demo-button", DemoButton);

document.addEventListener("pointerup", (event) => {
  if (!touchLike(event)) return;
  quietMouse = performance.now() + 700;
  hideTip();
});

document.addEventListener("pointercancel", (event) => {
  if (!touchLike(event)) return;
  quietMouse = performance.now() + 700;
  hideTip();
});

document.addEventListener("scroll", () => {
  hideTip();
}, true);

mountTip();
