(function () {
const MODULES = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 20H4V16H8V20ZM14 20H10V16H14V20ZM20 16V20H16V16H20ZM8 14H4V10H8V14ZM14 14H10V10H14V14ZM20 14H16V10H20V14ZM8 8H4V4H8V8ZM14 8H10V4H14V8ZM20 8H16V4H20V8Z"/>
</svg>`;

const INFO = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 5C15.864 5 19 8.136 19 12C19 15.864 15.864 19 12 19C8.136 19 5 15.864 5 12C5 8.136 8.136 5 12 5ZM11 16H13V11H11V16ZM11 8V10H13V8H11Z"/>
</svg>`;

const COPY = {
  label: "Label",
  placeholder: "Placeholder",
  hint: "Tell me a story",
  suffix: "Km",
};

class DemoField extends HTMLElement {
  static get observedAttributes() {
    return [
      "kind",
      "state",
      "show-placeholder",
      "show-hint",
      "show-icon",
      "show-suffix",
      "show-trailing",
      "show-required",
      "show-label",
    ];
  }

  constructor() {
    super();
    this._chips = [];
    this._marked = -1;
    this._value = "";
    this._ready = false;
  }

  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = `
      <div class="demo-field__plate">
        <span class="demo-field__icon" hidden>${MODULES}</span>
        <div class="demo-field__text">
          <div class="demo-field__label">
            <span class="demo-field__name"></span>
            <span class="demo-field__star" hidden>*</span>
          </div>
          <div class="demo-field__line">
            <span class="demo-field__inline">
              <span class="demo-field__inline-name"></span>
              <span class="demo-field__star" hidden>*</span>
            </span>
            <span class="demo-field__chips"></span>
            <input class="demo-field__entry" type="text" autocomplete="off">
            <textarea class="demo-field__entry" hidden></textarea>
            <span class="demo-field__suffix" hidden></span>
          </div>
        </div>
        <span class="demo-field__trail" hidden>
          <button class="demo-field__glyph" type="button" tabindex="-1" aria-label="additional information">${INFO}</button>
        </span>
        <span class="demo-field__indicator"></span>
      </div>
      <div class="demo-field__hint" hidden></div>
    `;
    this._icon = this.querySelector(".demo-field__icon");
    this._label = this.querySelector(".demo-field__label");
    this._name = this.querySelector(".demo-field__name");
    this._inline = this.querySelector(".demo-field__inline");
    this._inlineName = this.querySelector(".demo-field__inline-name");
    this._stars = this.querySelectorAll(".demo-field__star");
    this._chipsHost = this.querySelector(".demo-field__chips");
    this._input = this.querySelector("input.demo-field__entry");
    this._area = this.querySelector("textarea.demo-field__entry");
    this._suffix = this.querySelector(".demo-field__suffix");
    this._trail = this.querySelector(".demo-field__trail");
    this._glyph = this.querySelector(".demo-field__glyph");
    this._hint = this.querySelector(".demo-field__hint");
    this._plate = this.querySelector(".demo-field__plate");
    this._suffix.textContent = COPY.suffix;
    this._hint.textContent = COPY.hint;
    this._name.textContent = COPY.label;
    this._inlineName.textContent = COPY.label;
    this._input.placeholder = COPY.placeholder;
    this._area.placeholder = COPY.placeholder;
    this._input.addEventListener("input", () => this._onType(this._input));
    this._area.addEventListener("input", () => this._onType(this._area));
    this._input.addEventListener("keydown", (event) => this._onKey(event));
    this.addEventListener("focusin", () => this._setActive(true));
    this.addEventListener("focusout", (event) => {
      if (this.contains(event.relatedTarget)) return;
      this._marked = -1;
      this._setActive(false);
      this._commit();
    });
    this._glyph.addEventListener("mousedown", (event) => event.preventDefault());
    this._glyph.addEventListener("pointerenter", () => this._tip(true));
    this._glyph.addEventListener("pointerleave", () => this._tip(false));
    this._plate.addEventListener("pointerdown", (event) => {
      if (this._state() === "disabled") return;
      if (event.target.closest(".demo-chip__clear, .demo-field__glyph, .demo-field__entry")) return;
      event.preventDefault();
      this._marked = -1;
      const entry = this._entry();
      if (entry.hidden) entry.hidden = false;
      if (document.activeElement !== entry) entry.focus();
      if (document.activeElement !== entry) {
        this._paint();
        return;
      }
      this._setActive(true);
    });
    this.addEventListener("demo-clear", (event) => {
      const chip = event.target.closest("demo-chip");
      if (!chip || this._state() === "disabled") return;
      const index = Number(chip.dataset.index);
      this._chips.splice(index, 1);
      if (this._marked === index) this._marked = -1;
      else if (this._marked > index) this._marked -= 1;
      this._renderChips();
      this._paint();
    });
    this._paint();
  }

  attributeChangedCallback() {
    if (this._ready) this._paint();
  }

  _kind() {
    return this.getAttribute("kind") || "field-standard";
  }

  _state() {
    return this.getAttribute("state") || "default";
  }

  _on(name) {
    return this.hasAttribute(name);
  }

  _entry() {
    return this._kind() === "field-text-area" ? this._area : this._input;
  }

  _onType(entry) {
    this._marked = -1;
    this._value = entry.value;
    if (entry !== this._input) this._input.value = entry.value;
    if (entry !== this._area) this._area.value = entry.value;
    this._paint();
  }

  _onKey(event) {
    if (this._kind() !== "field-with-chips") return;
    if (event.key === "Enter") {
      event.preventDefault();
      this._marked = -1;
      this._commit();
      return;
    }
    if (event.key !== "Backspace" || this._state() === "disabled") return;
    if (this._value.length > 0) return;
    if (!this._chips.length) return;
    event.preventDefault();
    if (this._marked < 0) {
      this._marked = this._chips.length - 1;
      this._paint();
      return;
    }
    this._chips.splice(this._marked, 1);
    this._marked = -1;
    this._renderChips();
    this._paint();
  }

  _tip(show) {
    const tip = document.querySelector("cc-tooltip");
    if (!tip) return;
    if (!show || this._state() === "disabled") {
      if (!this._tipped) return;
      this._tipped = false;
      tip.hide();
      return;
    }
    this._tipped = true;
    tip.show(this._glyph, "additional information");
  }

  _commit() {
    if (this._kind() !== "field-with-chips") return;
    if (this._state() === "disabled") return;
    const text = this._value.trim();
    if (!text) {
      this._value = "";
      this._input.value = "";
      this._area.value = "";
      this._paint();
      return;
    }
    this._chips.push(text);
    this._value = "";
    this._input.value = "";
    this._area.value = "";
    this._renderChips();
    this._paint();
  }

  _setActive(on) {
    if (this._state() === "disabled") on = false;
    const was = this.hasAttribute("data-active");
    if (on) this.setAttribute("data-active", "");
    else this.removeAttribute("data-active");
    this._paint();
    if (was !== on) this.dispatchEvent(new CustomEvent("demo-active", { bubbles: true }));
  }

  _floated() {
    const kind = this._kind();
    if (kind === "field-medium") return false;
    if (this._value.length > 0 || this._chips.length > 0) return true;
    if (this.hasAttribute("data-active") && this._state() !== "disabled") return true;
    return this._on("show-placeholder");
  }

  _renderChips() {
    this._chipsHost.replaceChildren();
    if (this._kind() !== "field-with-chips") return;
    const off = this._state() === "disabled";
    this._chips.forEach((label, index) => {
      const chip = document.createElement("demo-chip");
      chip.dataset.index = String(index);
      chip.setAttribute("label", label);
      if (off) chip.setAttribute("disabled", "");
      if (!off && index === this._marked) chip.dataset.marked = "";
      this._chipsHost.append(chip);
    });
  }

  _paint() {
    const kind = this._kind();
    const state = this._state();
    const area = kind === "field-text-area";
    const chips = kind === "field-with-chips";
    const floated = this._floated();
    const empty = this._value.length === 0 && this._chips.length === 0;
    this.dataset.kind = kind;
    this.dataset.state = state;
    if (floated) this.dataset.float = "";
    else delete this.dataset.float;
    if (empty) this.dataset.empty = "";
    else delete this.dataset.empty;
    if (chips && !this._on("show-label")) this.dataset.label = "off";
    else delete this.dataset.label;
    if (chips && this._chips.length > 0) this.dataset.chips = "";
    else delete this.dataset.chips;
    const disabled = state === "disabled";
    this._input.disabled = disabled;
    this._area.disabled = disabled;
    if (disabled && this.hasAttribute("data-active")) this.removeAttribute("data-active");
    this._icon.hidden = !this._on("show-icon");
    this._trail.hidden = !this._on("show-trailing");
    this._hint.hidden = !this._on("show-hint");
    const hasLabel = kind !== "field-medium" && !(chips && !this._on("show-label"));
    const star = this._on("show-required") && hasLabel;
    for (const node of this._stars) node.hidden = !star;
    const suffix = this._on("show-suffix") && kind !== "field-text-area" && !chips;
    this._suffix.hidden = !suffix;
    const showPlaceholder = this._on("show-placeholder") && this._value.length === 0;
    const placeholder = showPlaceholder ? COPY.placeholder : "";
    this._input.placeholder = placeholder;
    this._area.placeholder = placeholder;
    this._input.hidden = area || (chips && !floated);
    this._area.hidden = !area;
    const entry = this._entry();
    if (entry.value !== this._value) entry.value = this._value;
    if (chips) this._renderChips();
    else this._chipsHost.replaceChildren();
  }
}

if (!customElements.get("demo-field")) customElements.define("demo-field", DemoField);
})();
