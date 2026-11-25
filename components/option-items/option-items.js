(function attachOptionItemStyles() {
  const script = document.currentScript;
  if (!script || !script.src) return;
  const href = script.src.replace(/option-items\.js(?=[?#]|$)/, "option-items.css");
  if (document.querySelector('link[href*="option-items.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
})();

const CHECK_PATH = "M9.55 18.2 3.75 12.4 5.15 11 9.55 15.4 18.85 6.1 20.25 7.5Z";

function checkSvg(className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", CHECK_PATH);
  svg.append(path);
  return svg;
}

function rowButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cc-option-row";
  return button;
}

function labelNode() {
  const label = document.createElement("span");
  label.className = "cc-option__label";
  return label;
}

function setHidden(node, hidden) {
  if (hidden) node.setAttribute("hidden", "");
  else node.removeAttribute("hidden");
}

function defineElement(name, ctor) {
  if (!customElements.get(name)) customElements.define(name, ctor);
}

class CcSelectOption extends HTMLElement {
  static get observedAttributes() {
    return ["label", "value", "selected", "disabled"];
  }

  constructor() {
    super();
    this._ready = false;
    this._button = null;
    this._label = null;
    this._check = null;
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    if (!this._ready) {
      this._ready = true;
      this._build();
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._ready) this._sync();
  }

  _build() {
    const button = rowButton();
    const cell = document.createElement("span");
    cell.className = "cc-option__cell";
    const check = checkSvg("cc-option__check");
    const label = labelNode();
    cell.append(check);
    button.append(cell, label);
    button.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(new CustomEvent("cc-pick", {
        bubbles: true,
        detail: {
          value: this.getAttribute("value") ?? "",
          label: this.getAttribute("label") ?? "",
          selected: true,
        },
      }));
    });
    this.append(button);
    this._button = button;
    this._label = label;
    this._check = check;
  }

  _sync() {
    if (!this._button) return;
    this._label.textContent = this.getAttribute("label") ?? "";
    this._button.disabled = this.hasAttribute("disabled");
    setHidden(this._check, !this.hasAttribute("selected"));
  }
}

class CcDropdownActionItem extends HTMLElement {
  static get observedAttributes() {
    return ["label", "value", "size", "disabled"];
  }

  constructor() {
    super();
    this._ready = false;
    this._button = null;
    this._label = null;
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    if (!this._ready) {
      this._ready = true;
      this._build();
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._ready) this._sync();
  }

  _build() {
    const button = rowButton();
    const label = labelNode();
    button.append(label);
    button.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(new CustomEvent("cc-pick", {
        bubbles: true,
        detail: {
          value: this.getAttribute("value") ?? "",
          label: this.getAttribute("label") ?? "",
        },
      }));
    });
    this.append(button);
    this._button = button;
    this._label = label;
  }

  _sync() {
    if (!this._button) return;
    this._label.textContent = this.getAttribute("label") ?? "";
    this._button.disabled = this.hasAttribute("disabled");
  }
}

class CcCheckboxOption extends HTMLElement {
  static get observedAttributes() {
    return ["label", "value", "selected", "disabled"];
  }

  constructor() {
    super();
    this._ready = false;
    this._button = null;
    this._label = null;
    this._tick = null;
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    if (!this._ready) {
      this._ready = true;
      this._build();
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._ready) this._sync();
  }

  _build() {
    const button = rowButton();
    const cell = document.createElement("span");
    cell.className = "cc-option__cell";
    const box = document.createElement("span");
    box.className = "cc-option__box";
    const tick = checkSvg("cc-option__tick");
    const label = labelNode();
    box.append(tick);
    cell.append(box);
    button.append(cell, label);
    button.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      const selected = !this.hasAttribute("selected");
      if (selected) this.setAttribute("selected", "");
      else this.removeAttribute("selected");
      this.dispatchEvent(new CustomEvent("cc-pick", {
        bubbles: true,
        detail: {
          value: this.getAttribute("value") ?? "",
          label: this.getAttribute("label") ?? "",
          selected,
        },
      }));
    });
    this.append(button);
    this._button = button;
    this._label = label;
    this._tick = tick;
  }

  _sync() {
    if (!this._button) return;
    this._label.textContent = this.getAttribute("label") ?? "";
    this._button.disabled = this.hasAttribute("disabled");
    setHidden(this._tick, !this.hasAttribute("selected"));
  }
}

class CcOptionGroup extends HTMLElement {
  static get observedAttributes() {
    return ["label"];
  }

  constructor() {
    super();
    this._ready = false;
    this._label = null;
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    if (!this._ready) {
      this._ready = true;
      this.setAttribute("role", "presentation");
      const label = document.createElement("div");
      label.className = "cc-option-group__label";
      label.setAttribute("role", "presentation");
      this.append(label);
      this._label = label;
    }
    this._sync();
  }

  attributeChangedCallback() {
    if (this._ready) this._sync();
  }

  _sync() {
    if (!this._label) return;
    this._label.textContent = this.getAttribute("label") ?? "";
  }
}

defineElement("cc-select-option", CcSelectOption);
defineElement("cc-dropdown-action-item", CcDropdownActionItem);
defineElement("cc-checkbox-option", CcCheckboxOption);
defineElement("cc-option-group", CcOptionGroup);
