(function attachSelectSmallStyles() {
  const script = document.currentScript;
  if (!script || !script.src) return;
  const href = script.src.replace(/select-small\.js(?:[?#].*)?$/, "select-small.css");
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
})();

const CHEVRON_PATH =
  "M12 13.2L16.2 8.99998C16.5314 8.6686 17.0686 8.6686 17.4 8.99998C17.7314 9.33135 17.7314 9.8686 17.4 10.2L12 15.6L6.6 10.2C6.26863 9.8686 6.26863 9.33135 6.6 8.99998C6.93137 8.6686 7.46863 8.6686 7.8 8.99998L12 13.2Z";

let sequence = 0;

class CcSelectSmall extends HTMLElement {
  static get observedAttributes() {
    return ["value", "disabled", "open"];
  }

  constructor() {
    super();
    this._options = [];
    this._open = false;
    this._ready = false;
    this._onPointerDown = (event) => {
      if (!this._open) return;
      if (event.composedPath().includes(this)) return;
      this._setOpen(false);
    };
    this._onKeyDown = (event) => {
      if (!this._open || event.key !== "Escape") return;
      event.preventDefault();
      this._setOpen(false);
      if (this._plate) this._plate.focus();
    };
  }

  get options() {
    return this._options.slice();
  }

  set options(list) {
    const source = Array.isArray(list) ? list : [];
    this._options = source.map((item) => {
      if (item && typeof item === "object") {
        const value = String(item.value ?? "");
        return { value, label: String(item.label ?? value) };
      }
      const value = String(item);
      return { value, label: value };
    });
    this._renderOptions();
  }

  get value() {
    return this.getAttribute("value") || "";
  }

  set value(next) {
    const text = next == null ? "" : String(next);
    if (this.getAttribute("value") === text) {
      this._syncValue();
      return;
    }
    this.setAttribute("value", text);
  }

  get open() {
    return this._open;
  }

  set open(next) {
    this._setOpen(Boolean(next));
  }

  connectedCallback() {
    if (!this._ready) {
      this._ready = true;
      this._build();
    }
    if (this.hasAttribute("open")) this._setOpen(true);
    if (this._open) this._bindDismiss(true);
  }

  disconnectedCallback() {
    this._bindDismiss(false);
  }

  attributeChangedCallback(name) {
    if (!this._ready) return;
    if (name === "value") this._syncValue();
    if (name === "disabled") this._syncDisabled();
    if (name === "open") this._setOpen(this.hasAttribute("open"));
  }

  _build() {
    const listId = `cc-select-small-list-${++sequence}`;

    this._plate = document.createElement("button");
    this._plate.type = "button";
    this._plate.className = "cc-select-small__plate";
    this._plate.setAttribute("aria-haspopup", "listbox");
    this._plate.setAttribute("aria-expanded", "false");
    this._plate.setAttribute("aria-controls", listId);

    this._valueNode = document.createElement("span");
    this._valueNode.className = "cc-select-small__label";
    this._plate.append(this._valueNode, this._chevron());

    this._list = document.createElement("div");
    this._list.id = listId;
    this._list.className = "cc-select-small__list";
    this._list.setAttribute("role", "listbox");
    this._list.hidden = true;

    this._plate.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this._setOpen(!this._open);
    });

    this.append(this._plate, this._list);
    this._renderOptions();
    this._syncDisabled();
  }

  _chevron() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "cc-select-small__icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", CHEVRON_PATH);
    svg.append(path);
    return svg;
  }

  _renderOptions() {
    if (!this._list) return;
    this._list.replaceChildren();
    for (const option of this._options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cc-select-small__option";
      button.setAttribute("role", "option");
      button.setAttribute("data-value", option.value);
      const label = document.createElement("span");
      label.className = "cc-select-small__label";
      label.textContent = option.label;
      button.append(label);
      button.addEventListener("click", () => this._choose(option.value));
      this._list.append(button);
    }
    this._syncValue();
  }

  _syncValue() {
    if (!this._valueNode) return;
    const value = this.getAttribute("value") || "";
    const match = this._options.find((option) => option.value === value);
    this._valueNode.textContent = match ? match.label : value;
    if (!this._list) return;
    for (const option of this._list.querySelectorAll(".cc-select-small__option")) {
      const selected = option.getAttribute("data-value") === value;
      option.setAttribute("aria-selected", selected ? "true" : "false");
    }
  }

  _syncDisabled() {
    if (!this._plate) return;
    const disabled = this.hasAttribute("disabled");
    this._plate.disabled = disabled;
    if (disabled) this._setOpen(false);
  }

  _choose(value) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("cc-change", {
      bubbles: true,
      detail: { value },
    }));
    this._setOpen(false);
    if (this._plate) this._plate.focus();
  }

  _setOpen(next) {
    const open = Boolean(next) && !this.hasAttribute("disabled");
    if (this._open === open) {
      if (open && !this.hasAttribute("open")) this.setAttribute("open", "");
      if (!open && this.hasAttribute("open")) this.removeAttribute("open");
      return;
    }
    this._open = open;
    if (open) this.setAttribute("open", "");
    else this.removeAttribute("open");
    if (this._plate) this._plate.setAttribute("aria-expanded", open ? "true" : "false");
    if (this._list) this._list.hidden = !open;
    this._bindDismiss(open);
    if (open) {
      this.dispatchEvent(new CustomEvent("cc-open", { bubbles: true }));
    }
  }

  _bindDismiss(active) {
    document.removeEventListener("pointerdown", this._onPointerDown, true);
    document.removeEventListener("keydown", this._onKeyDown);
    if (!active) return;
    document.addEventListener("pointerdown", this._onPointerDown, true);
    document.addEventListener("keydown", this._onKeyDown);
  }
}

if (!customElements.get("cc-select-small")) {
  customElements.define("cc-select-small", CcSelectSmall);
}
