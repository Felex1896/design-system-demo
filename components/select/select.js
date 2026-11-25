(function attachSelectStyles() {
  const script = document.currentScript;
  if (!script || !script.src) return;
  const href = script.src.replace(/select\.js(?=[?#]|$)/, "select.css");
  if (document.querySelector('link[href*="select.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
})();

const MODULES = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 20H4V16H8V20ZM14 20H10V16H14V20ZM20 16V20H16V16H20ZM8 14H4V10H8V14ZM14 14H10V10H14V14ZM20 14H16V10H20V14ZM8 8H4V4H8V8ZM14 8H10V4H14V8ZM20 8H16V4H20V8Z"/>
</svg>`;

const INFO = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 5C15.864 5 19 8.136 19 12C19 15.864 15.864 19 12 19C8.136 19 5 15.864 5 12C5 8.136 8.136 5 12 5ZM11 16H13V11H11V16ZM11 8V10H13V8H11Z"/>
</svg>`;

const CHEVRON_SMALL =
  "M12 13.2L16.2 8.99998C16.5314 8.6686 17.0686 8.6686 17.4 8.99998C17.7314 9.33135 17.7314 9.8686 17.4 10.2L12 15.6L6.6 10.2C6.26863 9.8686 6.26863 9.33135 6.6 8.99998C6.93137 8.6686 7.46863 8.6686 7.8 8.99998L12 13.2Z";
const CHEVRON_LARGE =
  "M12 13.3333L16.9341 8.63417C17.307 8.27903 17.893 8.27903 18.2659 8.63417C18.6654 9.01467 18.6654 9.652 18.2659 10.0325L12 16L5.73413 10.0325C5.3346 9.652 5.3346 9.01467 5.73413 8.63417C6.10702 8.27903 6.69298 8.27903 7.06587 8.63417L12 13.3333Z";

const TYPES = ["large", "medium", "small", "multiple-values"];
const STATES = ["default", "error", "disabled"];
const EMPTY_LABEL = "Nothing selected";

class CcSelect extends HTMLElement {
  static get observedAttributes() {
    return [
      "type",
      "state",
      "open",
      "value",
      "placeholder",
      "label",
      "hint",
      "add-label",
      "show-placeholder",
      "show-hint",
      "show-icon",
      "show-trailing",
      "show-required",
      "show-label",
      "icon",
      "aria-label",
    ];
  }

  constructor() {
    super();
    this._values = [];
    this._options = [];
    this._menu = null;
    this._ready = false;
    this._tipped = false;
    this._dismissing = false;
    this._onPointerDown = (event) => {
      const path = event.composedPath();
      if (path.includes(this)) return;
      if (this._menu && path.includes(this._menu)) return;
      this.removeAttribute("open");
    };
    this._onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      this.removeAttribute("open");
    };
  }

  get values() {
    return this._values.slice();
  }

  set values(next) {
    const source = Array.isArray(next) ? next : [];
    this._values = source.map((item) => String(item));
    if (this._ready) this._paint();
  }

  get options() {
    return this._options.map((item) => {
      if (item.kind === "group") return { kind: "group", label: item.label };
      const choice = { value: item.value, label: item.label };
      if (item.icon != null) choice.icon = item.icon;
      return choice;
    });
  }

  set options(next) {
    this._options = this._normalizeOptions(next);
    if (!this._ready) return;
    this._renderMenu();
    this._paint();
  }

  connectedCallback() {
    if (this._ready) {
      if (this._state() === "disabled" && this.hasAttribute("open")) this.removeAttribute("open");
      else if (this.hasAttribute("open")) this._syncOpen();
      return;
    }
    this._ready = true;
    this._build();
    this._paint();
    if (this._state() === "disabled" && this.hasAttribute("open")) this.removeAttribute("open");
    else this._syncOpen();
  }

  disconnectedCallback() {
    this._tip(false);
    this._unbindDismiss();
    if (this._menu) this._menu.removeAttribute("open");
  }

  attributeChangedCallback(name) {
    if (!this._ready) return;
    if ((name === "state" || name === "open") && this._state() === "disabled" && this.hasAttribute("open")) {
      this.removeAttribute("open");
      return;
    }
    this._paint();
    if (name === "open") this._syncOpen();
    else if (name === "type" || name === "show-placeholder" || name === "placeholder") this._renderMenu();
    else if (name === "value") this._syncSingleSelected();
  }

  _build() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="cc-select__plate">
        <span class="cc-select__icon" hidden>${MODULES}</span>
        <div class="cc-select__text">
          <div class="cc-select__label">
            <span class="cc-select__name"></span>
            <span class="cc-select__star" hidden>*</span>
          </div>
          <div class="cc-select__line">
            <span class="cc-select__inline">
              <span class="cc-select__inline-name"></span>
              <span class="cc-select__star" hidden>*</span>
            </span>
            <span class="cc-select__value" hidden></span>
            <span class="cc-select__chips"></span>
            <button class="cc-select__add" type="button" hidden></button>
          </div>
        </div>
        <span class="cc-select__trail" hidden>
          <button class="cc-select__info" type="button" tabindex="-1" aria-label="additional information">${INFO}</button>
        </span>
        <span class="cc-select__indicator"></span>
      </div>
      <div class="cc-select__hint" hidden></div>
    `;
    this._plate = wrap.querySelector(".cc-select__plate");
    this._icon = wrap.querySelector(".cc-select__icon");
    this._name = wrap.querySelector(".cc-select__name");
    this._inlineName = wrap.querySelector(".cc-select__inline-name");
    this._stars = wrap.querySelectorAll(".cc-select__star");
    this._value = wrap.querySelector(".cc-select__value");
    this._chipsHost = wrap.querySelector(".cc-select__chips");
    this._add = wrap.querySelector(".cc-select__add");
    this._trail = wrap.querySelector(".cc-select__trail");
    this._info = wrap.querySelector(".cc-select__info");
    this._hint = wrap.querySelector(".cc-select__hint");
    this._caret = this._chevron();
    this._plate.insertBefore(this._caret, wrap.querySelector(".cc-select__indicator"));
    this.prepend(this._plate, this._hint);
    this._plate.addEventListener("click", (event) => this._onPlateClick(event));
    this._info.addEventListener("mousedown", (event) => event.preventDefault());
    this._info.addEventListener("pointerenter", () => this._tip(true));
    this._info.addEventListener("pointerleave", () => this._tip(false));
    this.addEventListener("demo-clear", (event) => this._onClear(event));
  }

  _chevron() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "cc-select__caret");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", CHEVRON_SMALL);
    svg.append(path);
    this._caretPath = path;
    return svg;
  }

  _type() {
    const type = this.getAttribute("type") || "small";
    return TYPES.includes(type) ? type : "small";
  }

  _state() {
    const state = this.getAttribute("state") || "default";
    return STATES.includes(state) ? state : "default";
  }

  _on(name) {
    return this.hasAttribute(name);
  }

  _copy(name, fallback) {
    return this.hasAttribute(name) ? this.getAttribute(name) : fallback;
  }

  _floated(type) {
    if (type === "medium" || type === "small") return false;
    if (type === "multiple-values" && !this._on("show-label")) return false;
    if (type === "multiple-values") {
      if (this._values.length > 0) return true;
    } else if ((this.getAttribute("value") || "").length > 0) {
      return true;
    }
    if (this.hasAttribute("open")) return true;
    return this._on("show-placeholder");
  }

  _onPlateClick(event) {
    if (this._state() === "disabled") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".demo-chip__clear, .cc-select__info")) return;
    const source = target.closest(".cc-select__add") ? "add" : "plate";
    if (this.hasAttribute("open")) this.removeAttribute("open");
    else this.setAttribute("open", "");
    this.dispatchEvent(new CustomEvent("cc-toggle", {
      bubbles: true,
      detail: { source },
    }));
  }

  _onClear(event) {
    if (this._state() === "disabled") return;
    if (this._type() !== "multiple-values") return;
    const chip = event.target instanceof Element ? event.target.closest("demo-chip") : null;
    if (!chip || !this.contains(chip)) return;
    const index = Number(chip.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= this._values.length) return;
    const next = this._values.slice();
    next.splice(index, 1);
    this._values = next;
    this._paint();
    this.dispatchEvent(new CustomEvent("cc-change", {
      bubbles: true,
      detail: { values: next.slice() },
    }));
  }

  _tip(show) {
    const tip = document.querySelector("cc-tooltip");
    if (!tip || !this._info) return;
    if (!show || this._state() === "disabled") {
      if (!this._tipped) return;
      this._tipped = false;
      tip.hide();
      return;
    }
    this._tipped = true;
    tip.show(this._info, "additional information");
  }

  _renderChips() {
    this._chipsHost.replaceChildren();
    if (this._type() !== "multiple-values") return;
    const off = this._state() === "disabled";
    this._values.forEach((id, index) => {
      const chip = document.createElement("demo-chip");
      chip.dataset.index = String(index);
      chip.setAttribute("label", this._labelFor(id));
      if (off) chip.setAttribute("disabled", "");
      this._chipsHost.append(chip);
    });
  }

  _paintValue(type) {
    const raw = this.getAttribute("value") || "";
    const placeholder = this._copy("placeholder", "Placeholder");
    const node = this._value;
    const showPlaceholder = this._on("show-placeholder") && (type === "large" || type === "medium" || (type === "multiple-values" && this._values.length === 0));
    const shown = this._labelFor(raw);
    if (type === "small") {
      node.hidden = false;
      node.dataset.kind = "value";
      node.textContent = shown;
      return;
    }
    if (type !== "multiple-values" && raw) {
      node.hidden = false;
      node.dataset.kind = "value";
      node.textContent = shown;
      return;
    }
    if (showPlaceholder) {
      node.hidden = false;
      node.dataset.kind = "placeholder";
      node.textContent = placeholder;
      return;
    }
    if (this._floated(type) && type !== "medium" && !(type === "multiple-values" && this._values.length > 0)) {
      node.hidden = false;
      node.dataset.kind = "value";
      node.textContent = "";
      return;
    }
    node.hidden = true;
    node.textContent = "";
    delete node.dataset.kind;
  }

  _paint() {
    const type = this._type();
    const state = this._state();
    const disabled = state === "disabled";
    const multiple = type === "multiple-values";
    const showLabel = type !== "medium" && type !== "small" && (!multiple || this._on("show-label"));
    this.dataset.type = type;
    this.dataset.state = state;
    if (this._floated(type)) this.dataset.float = "";
    else delete this.dataset.float;
    if (multiple && this._values.length > 0) this.dataset.chips = "";
    else delete this.dataset.chips;
    const label = this._copy("label", "Label");
    this._name.textContent = label;
    this._inlineName.textContent = label;
    this._hint.textContent = this._copy("hint", "Tell me a story");
    this._add.textContent = this._copy("add-label", "Add");
    this._caretPath.setAttribute("d", type === "medium" || type === "small" ? CHEVRON_SMALL : CHEVRON_LARGE);
    this._paintIcon();
    this._paintName(type);
    this._trail.hidden = !this._on("show-trailing");
    this._hint.hidden = type === "small" || !this._on("show-hint");
    const star = this._on("show-required") && showLabel;
    for (const node of this._stars) node.hidden = !star;
    this._info.disabled = disabled;
    this._add.disabled = disabled;
    this._add.hidden = !(multiple && this._values.length > 0 && !this.hasAttribute("open"));
    this._renderChips();
    this._paintValue(type);
    this._syncCheckboxSelected();
    if (disabled) this._tip(false);
  }

  _normalizeOptions(next) {
    if (!Array.isArray(next)) return [];
    const stored = [];
    for (const item of next) {
      if (typeof item === "string") {
        stored.push({ value: item, label: item });
        continue;
      }
      if (!item || typeof item !== "object") continue;
      if (item.kind === "group") {
        stored.push({ kind: "group", label: item.label == null ? "" : String(item.label) });
        continue;
      }
      const value = item.value == null ? "" : String(item.value);
      const label = item.label == null ? value : String(item.label);
      const choice = { value, label };
      if (item.icon != null && String(item.icon) !== "") choice.icon = String(item.icon);
      stored.push(choice);
    }
    return stored;
  }

  _chosenIcon() {
    const mode = this.getAttribute("icon");
    if (mode !== "priority" && mode !== "status") return "";
    const current = this.getAttribute("value") || "";
    for (const item of this._options) {
      if (item.kind === "group") continue;
      if (item.value === current) return item.icon || "";
    }
    return "";
  }

  _paintIcon() {
    const mode = this.getAttribute("icon");
    if (mode === "priority" || mode === "status") {
      const chosen = this._chosenIcon();
      const marks = window.CC_MARKS || {};
      const spec = chosen && marks[chosen] ? marks[chosen] : null;
      const empty = mode === "status" && !spec;
      const shown = spec || (empty ? { tone: "muted", html: `<span class="cc-mark"><span class="cc-mark__dot"></span></span>` } : null);
      const key = spec ? chosen : empty ? "unset" : "";
      this._icon.hidden = !this._on("show-icon") || !shown;
      if (!shown) {
        delete this.dataset.tone;
        this._icon.dataset.mark = "";
        return;
      }
      this.dataset.tone = shown.tone;
      if (this._icon.dataset.mark === key) return;
      this._icon.dataset.mark = key;
      this._icon.innerHTML = shown.html;
      return;
    }
    delete this.dataset.tone;
    if (this._icon.dataset.mark === "modules") return;
    this._icon.dataset.mark = "modules";
    this._icon.innerHTML = MODULES;
  }

  _paintName(type) {
    const named = type === "medium" && this.hasAttribute("aria-label");
    if (!named) {
      this._plate.removeAttribute("aria-label");
      if (this._plate.getAttribute("role") === "button") this._plate.removeAttribute("role");
      return;
    }
    this._plate.setAttribute("role", "button");
    this._plate.setAttribute("aria-label", this.getAttribute("aria-label") ?? "");
  }

  _labelFor(value) {
    for (const item of this._options) {
      if (item.kind === "group") continue;
      if (item.value === value) return item.label;
    }
    return value;
  }

  _ensureMenu() {
    if (this._menu && this._menu.isConnected) return this._menu;
    let menu = this.querySelector(":scope > cc-dropdown-menu");
    if (!menu) {
      menu = document.createElement("cc-dropdown-menu");
      this.append(menu);
    }
    if (menu !== this._menu) menu.addEventListener("cc-pick", (event) => this._onPick(event));
    this._menu = menu;
    return menu;
  }

  _syncOpen() {
    if (!this.hasAttribute("open")) {
      if (this._menu) {
        this._menu.removeAttribute("open");
        if (this._menu.parentElement !== this) this.append(this._menu);
      }
      this._unbindDismiss();
      return;
    }
    const menu = this._ensureMenu();
    this._renderMenu();
    if (menu.parentElement !== document.body) document.body.append(menu);
    menu.setAttribute("open", "");
    if (!this.isConnected) return;
    menu.place(this._plate);
    this._bindDismiss();
  }

  _menuItems() {
    const type = this._type();
    const source = this._options.slice();
    if (type === "small" || type === "multiple-values" || !this._on("show-placeholder")) return source;
    const rest = source.filter((item) => item.kind === "group" || item.value !== "");
    const label = (this.getAttribute("placeholder") || "").trim() || EMPTY_LABEL;
    return [{ value: "", label, empty: true }, ...rest];
  }

  _renderMenu() {
    const menu = this._menu;
    if (!menu) return;
    const type = this._type();
    const current = this.getAttribute("value") || "";
    const selectedValues = new Set(this._values);
    const fragment = document.createDocumentFragment();
    for (const item of this._menuItems()) {
      if (item.kind === "group") {
        const group = document.createElement("cc-option-group");
        group.setAttribute("label", item.label);
        fragment.append(group);
        continue;
      }
      let row;
      if (type === "small") {
        row = document.createElement("cc-dropdown-action-item");
        row.setAttribute("size", "small");
      } else if (type === "multiple-values") {
        row = document.createElement("cc-checkbox-option");
        if (selectedValues.has(item.value)) row.setAttribute("selected", "");
      } else {
        row = document.createElement("cc-select-option");
        if (item.value === current) row.setAttribute("selected", "");
      }
      row.setAttribute("label", item.label);
      row.setAttribute("value", item.value);
      if (item.icon) row.setAttribute("mark", item.icon);
      if (item.empty) row.setAttribute("data-empty", "");
      fragment.append(row);
    }
    menu.replaceChildren(fragment);
    if (menu.hasAttribute("open")) menu.place(this._plate);
  }

  _syncSingleSelected() {
    if (!this._menu) return;
    const current = this.getAttribute("value") || "";
    for (const row of this._menu.querySelectorAll("cc-select-option")) {
      if ((row.getAttribute("value") ?? "") === current) row.setAttribute("selected", "");
      else row.removeAttribute("selected");
    }
  }

  _syncCheckboxSelected() {
    if (!this._menu) return;
    const selected = new Set(this._values);
    for (const row of this._menu.querySelectorAll("cc-checkbox-option")) {
      const value = row.getAttribute("value") ?? "";
      if (selected.has(value)) row.setAttribute("selected", "");
      else row.removeAttribute("selected");
    }
  }

  _onPick(event) {
    if (this._state() === "disabled") return;
    const type = this._type();
    if (type === "multiple-values") {
      const next = [];
      for (const row of this._menu.querySelectorAll("cc-checkbox-option")) {
        if (row.hasAttribute("selected")) next.push(row.getAttribute("value") ?? "");
      }
      this._values = next;
      this._paint();
      this.dispatchEvent(new CustomEvent("cc-change", {
        bubbles: true,
        detail: { values: next.slice() },
      }));
      return;
    }
    const raw = event.detail ? event.detail.value : "";
    const value = raw == null ? "" : String(raw);
    this.setAttribute("value", value);
    this.dispatchEvent(new CustomEvent("cc-change", {
      bubbles: true,
      detail: { value },
    }));
    if (this.hasAttribute("open")) this.removeAttribute("open");
  }

  _bindDismiss() {
    if (this._dismissing) return;
    this._dismissing = true;
    document.addEventListener("pointerdown", this._onPointerDown, true);
    document.addEventListener("keydown", this._onKeyDown, true);
  }

  _unbindDismiss() {
    if (!this._dismissing) return;
    this._dismissing = false;
    document.removeEventListener("pointerdown", this._onPointerDown, true);
    document.removeEventListener("keydown", this._onKeyDown, true);
  }
}

if (!customElements.get("cc-select")) {
  customElements.define("cc-select", CcSelect);
}
