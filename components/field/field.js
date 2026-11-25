(function () {
const MODULES = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 20H4V16H8V20ZM14 20H10V16H14V20ZM20 16V20H16V16H20ZM8 14H4V10H8V14ZM14 14H10V10H14V14ZM20 14H16V10H20V14ZM8 8H4V4H8V8ZM14 8H10V4H14V8ZM20 8H16V4H20V8Z"/>
</svg>`;

const INFO = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 5C15.864 5 19 8.136 19 12C19 15.864 15.864 19 12 19C8.136 19 5 15.864 5 12C5 8.136 8.136 5 12 5ZM11 16H13V11H11V16ZM11 8V10H13V8H11Z"/>
</svg>`;

const CALENDAR = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8.44434 4.88867H15.5557V3.11133H17.333V4.88867H18.2227C19.2002 4.88891 20 5.68936 20 6.66699V19.1113C19.9999 20.0889 19.2002 20.8884 18.2227 20.8887H5.77734C4.79095 20.8884 4.00012 20.0889 4 19.1113L4.00879 6.66699C4.00879 5.68936 4.79088 4.88891 5.77734 4.88867H6.66699V3.11133H8.44434V4.88867ZM5.77734 19.1113H18.2227V9.33301H5.77734V19.1113ZM9.77734 11.1113C11.0045 11.1113 11.9998 12.1059 12 13.333C12 14.5603 11.0046 15.5557 9.77734 15.5557C8.55024 15.5554 7.55566 14.5602 7.55566 13.333C7.55584 12.106 8.55035 11.1116 9.77734 11.1113Z"/>
</svg>`;

const TIME = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.02 21 3 16.97 3 12C3 7.03 7.03 3 12 3ZM12 5C8.13 5 5 8.13 5 12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12C19 8.13 15.87 5 12 5ZM12.5 7V12.25L16.5 14.6201L15.75 15.8496L11 13V7H12.5Z"/>
</svg>`;

const CHEVRON_LEFT = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M10.8 12L15.7 16.9C16.0866 17.2866 16.0866 17.9134 15.7 18.3C15.3134 18.6866 14.6866 18.6866 14.3 18.3L8 12L14.3 5.7C14.6866 5.3134 15.3134 5.3134 15.7 5.7C16.0866 6.0866 16.0866 6.7134 15.7 7.1L10.8 12Z"/></svg>`;

const CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M13.2 12L8.3 16.9C7.9134 17.2866 7.9134 17.9134 8.3 18.3C8.6866 18.6866 9.3134 18.6866 9.7 18.3L16 12L9.7 5.7C9.3134 5.3134 8.6866 5.3134 8.3 5.7C7.9134 6.0866 7.9134 6.7134 8.3 7.1L13.2 12Z"/></svg>`;

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

const WEEKDAYS = {
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
};

function glyph(path) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="${path}"/></svg>`;
}

const VISIBILITY = glyph("M12 4.5C17 4.5 21.27 7.61 23 12C21.27 16.39 17 19.5 12 19.5C7 19.5 2.73 16.39 1 12C2.73 7.61 7 4.5 12 4.5ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9Z");

const VISIBILITY_OFF = glyph("M21.0088 20.6631L19.7383 22L16.8076 18.9268L16.3867 18.4844C15.0362 19.0527 13.5555 19.3682 12.0049 19.3682C7.00266 19.3681 2.73077 16.0946 1 11.4736C1.78036 9.38944 3.08144 7.57859 4.74219 6.2207L4.28125 5.7373L2 3.33691L3.27148 2L21.0088 20.6631ZM7.5332 9.1582C7.20311 9.86341 7.00294 10.6421 7.00293 11.4736C7.00293 14.3789 9.24368 16.7372 12.0049 16.7373C12.7952 16.7373 13.5358 16.5261 14.2061 16.1787L12.6553 14.5479C12.4452 14.6005 12.2249 14.6318 12.0049 14.6318C10.3442 14.6318 9.00391 13.221 9.00391 11.4736C9.00391 11.2421 9.03397 11.0101 9.08398 10.7891L7.5332 9.1582ZM11.9951 3.5791C16.9973 3.57915 21.2692 6.85264 23 11.4736C22.2697 13.4315 21.079 15.1473 19.5684 16.4736L16.6475 13.4004C16.8776 12.8004 17.0068 12.1578 17.0068 11.4736C17.0068 8.56839 14.7661 6.21094 12.0049 6.21094C11.3546 6.21095 10.7441 6.34775 10.1738 6.58984L8.01367 4.31543C9.25408 3.84188 10.5947 3.5791 11.9951 3.5791ZM12.0146 8.32617C13.6754 8.32617 15.0166 9.73701 15.0166 11.4844L14.9961 11.6523L11.8447 8.33691L12.0146 8.32617Z");

const DEPENDENCY = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M4 10H8V14H4V10ZM16 10H20V14H16V10ZM8 11H16V13H8V11Z"/>
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
      "label",
      "hint",
      "suffix",
      "placeholder",
      "icon",
      "input",
      "trailing",
      "aria-label",
      "value",
      "mask",
      "tip",
    ];
  }

  constructor() {
    super();
    this._chips = [];
    this._marked = -1;
    this._value = "";
    this._valueOwned = false;
    this._revealed = false;
    this._ready = false;
    this._pickerOpen = false;
    this._viewYear = 0;
    this._viewMonth = 0;
  }

  get value() {
    return this._value;
  }

  set value(next) {
    this._valueOwned = true;
    this._value = next == null ? "" : String(next);
    if (!this._ready) return;
    this._input.value = this._value;
    this._area.value = this._value;
    this._marked = -1;
    this._paint();
  }

  get values() {
    return this._chips.slice();
  }

  set values(next) {
    this._chips = Array.isArray(next) ? next.map((item) => String(item)) : [];
    this._marked = -1;
    if (!this._ready) return;
    this._renderChips();
    this._paint();
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
            <span class="demo-field__value">
              <span class="demo-field__mask" hidden>
                <span class="demo-field__mask-typed"></span><span class="demo-field__mask-rest"></span>
              </span>
              <input class="demo-field__entry" type="text" autocomplete="off">
            </span>
            <textarea class="demo-field__entry" hidden></textarea>
            <span class="demo-field__suffix" hidden></span>
          </div>
        </div>
        <span class="demo-field__trail" hidden>
          <button class="demo-field__glyph" type="button" tabindex="-1" aria-label="additional information">${INFO}</button>
        </span>
        <span class="demo-field__indicator"></span>
      </div>
      <div class="demo-field__picker" hidden>
        <div class="demo-field__cal">
          <div class="demo-field__month">
            <button class="demo-field__nav demo-field__nav--prev" type="button" data-step="-1">${CHEVRON_LEFT}</button>
            <div class="demo-field__month-title"></div>
            <button class="demo-field__nav demo-field__nav--next" type="button" data-step="1">${CHEVRON_RIGHT}</button>
          </div>
          <div class="demo-field__week"></div>
          <div class="demo-field__days"></div>
          <div class="demo-field__presets">
            <button class="demo-field__today" type="button"></button>
          </div>
        </div>
        <div class="demo-field__times"></div>
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
    this._valueBox = this.querySelector(".demo-field__value");
    this._mask = this.querySelector(".demo-field__mask");
    this._maskTyped = this.querySelector(".demo-field__mask-typed");
    this._maskRest = this.querySelector(".demo-field__mask-rest");
    this._input = this.querySelector("input.demo-field__entry");
    this._area = this.querySelector("textarea.demo-field__entry");
    this._suffix = this.querySelector(".demo-field__suffix");
    this._trail = this.querySelector(".demo-field__trail");
    this._glyph = this.querySelector(".demo-field__glyph");
    this._hint = this.querySelector(".demo-field__hint");
    this._plate = this.querySelector(".demo-field__plate");
    this._picker = this.querySelector(".demo-field__picker");
    this._cal = this.querySelector(".demo-field__cal");
    this._todayButton = this.querySelector(".demo-field__today");
    this._monthTitle = this.querySelector(".demo-field__month-title");
    this._week = this.querySelector(".demo-field__week");
    this._days = this.querySelector(".demo-field__days");
    this._times = this.querySelector(".demo-field__times");
    this._onDocPointer = (event) => {
      if (!this._pickerOpen) return;
      if (this._picker.contains(event.target) || this._plate.contains(event.target)) return;
      this._closePicker();
    };
    this._onDocKey = (event) => {
      if (!this._pickerOpen || event.key !== "Escape") return;
      this._closePicker();
    };
    this._onMove = () => {
      if (this._pickerOpen) this._placePicker();
    };
    this._picker.addEventListener("pointerdown", (event) => event.preventDefault());
    this._picker.addEventListener("click", (event) => this._onPickerClick(event));
    if (!this._valueOwned && this.hasAttribute("value")) {
      this._value = this.getAttribute("value") ?? "";
    }
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
    this._glyph.addEventListener("click", () => this._onGlyph());
    this._glyph.addEventListener("pointerenter", () => this._tip(true));
    this._glyph.addEventListener("pointerleave", () => this._tip(false));
    this._plate.addEventListener("pointerdown", (event) => {
      if (this._state() === "disabled") return;
      if (event.target.closest(".demo-chip__clear, .demo-field__glyph, .demo-field__entry")) return;
      event.preventDefault();
      this._marked = -1;
      const entry = this._entry();
      if (entry.hidden) entry.hidden = false;
      if (entry === this._input && this._valueBox.hidden) this._valueBox.hidden = false;
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
      this._emit();
    });
    this._paint();
  }

  attributeChangedCallback(name) {
    if (!this._ready) return;
    if (name === "input") this._revealed = false;
    if (name === "value") {
      this._valueOwned = true;
      this._value = this.getAttribute("value") ?? "";
      this._input.value = this._value;
      this._area.value = this._value;
    }
    this._paint();
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

  _copy(name, fallback) {
    return this.hasAttribute(name) ? this.getAttribute(name) ?? "" : fallback;
  }

  _emit() {
    this.dispatchEvent(new Event("input", { bubbles: true }));
  }

  _onGlyph() {
    if (this._state() === "disabled") return;
    if (this.getAttribute("trailing") !== "visibility") return;
    this._revealed = !this._revealed;
    this._paint();
  }

  _entry() {
    return this._kind() === "field-text-area" ? this._area : this._input;
  }

  _maskPattern() {
    return this.getAttribute("mask") || "";
  }

  _slotCount(pattern) {
    let count = 0;
    for (const ch of pattern) if (/\p{L}/u.test(ch)) count += 1;
    return count;
  }

  _splitMask(pattern, digits) {
    let used = 0;
    let index = 0;
    for (; index < pattern.length; index += 1) {
      if (!/\p{L}/u.test(pattern[index])) continue;
      if (used >= digits.length) break;
      used += 1;
    }
    let typed = "";
    let slot = 0;
    for (let cursor = 0; cursor < index; cursor += 1) {
      const ch = pattern[cursor];
      if (/\p{L}/u.test(ch)) {
        typed += digits[slot];
        slot += 1;
      } else typed += ch;
    }
    return { typed, rest: pattern.slice(index) };
  }

  _onType(entry) {
    this._marked = -1;
    let next = entry.value;
    const pattern = this._maskPattern();
    if (pattern && entry === this._input) {
      const digits = next.replace(/\D/g, "").slice(0, this._slotCount(pattern));
      next = this._splitMask(pattern, digits).typed;
      if (entry.value !== next) {
        entry.value = next;
        const end = next.length;
        if (typeof entry.setSelectionRange === "function") entry.setSelectionRange(end, end);
      }
    } else if (this.hasAttribute("digits") && entry === this._input) {
      const clean = next.replace(/\D/g, "");
      if (clean !== next) {
        next = clean;
        entry.value = next;
        const end = next.length;
        if (typeof entry.setSelectionRange === "function") entry.setSelectionRange(end, end);
      }
    }
    this._value = next;
    if (entry !== this._input) this._input.value = entry.value;
    if (entry !== this._area) this._area.value = entry.value;
    this._paint();
    if (this._pickerOpen) this._syncPicker();
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
    this._emit();
  }

  _tip(show) {
    const mode = this.getAttribute("trailing");
    const tip = document.querySelector("cc-tooltip");
    if (!tip) return;
    if (mode === "visibility") {
      if (!this._tipped) return;
      this._tipped = false;
      tip.hide();
      return;
    }
    if (mode === "conditional") {
      if (!show) {
        if (!this._tipped) return;
        this._tipped = false;
        tip.hide();
        return;
      }
      this._tipped = true;
      tip.show(this._glyph, this.getAttribute("tip") || "Depends on another field");
      return;
    }
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
      const changed = this._value.length > 0;
      this._value = "";
      this._input.value = "";
      this._area.value = "";
      this._paint();
      if (changed) this._emit();
      return;
    }
    this._chips.push(text);
    this._value = "";
    this._input.value = "";
    this._area.value = "";
    this._renderChips();
    this._paint();
    this._emit();
  }

  _setActive(on) {
    if (this._state() === "disabled") on = false;
    const was = this.hasAttribute("data-active");
    if (on) this.setAttribute("data-active", "");
    else this.removeAttribute("data-active");
    this._paint();
    if (on) this._openPicker();
    else this._closePicker();
    if (was !== on) this.dispatchEvent(new CustomEvent("demo-active", { bubbles: true }));
  }

  _floated() {
    const kind = this._kind();
    if (kind === "field-medium") return false;
    if (this._maskPattern()) return true;
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
    const label = this._copy("label", COPY.label);
    this._name.textContent = label;
    this._inlineName.textContent = label;
    this._suffix.textContent = this._copy("suffix", COPY.suffix);
    this._hint.textContent = this._copy("hint", COPY.hint);
    this._icon.hidden = !this._on("show-icon");
    this._paintIcon();
    this._trail.hidden = !this._on("show-trailing");
    this._paintTrail();
    this._hint.hidden = !this._on("show-hint");
    this._paintName();
    const hasLabel = kind !== "field-medium" && !(chips && !this._on("show-label"));
    const star = this._on("show-required") && hasLabel;
    for (const node of this._stars) node.hidden = !star;
    const suffix = this._on("show-suffix") && kind !== "field-text-area" && !chips;
    this._suffix.hidden = !suffix;
    const showPlaceholder = this._on("show-placeholder") && this._value.length === 0;
    const placeholder = showPlaceholder ? this._copy("placeholder", COPY.placeholder) : "";
    this._input.placeholder = placeholder;
    this._area.placeholder = placeholder;
    const conceal = this.getAttribute("input") === "password" && !this._revealed;
    const entryType = conceal ? "password" : "text";
    if (this._input.type !== entryType) this._input.type = entryType;
    this._input.hidden = area || (chips && !floated);
    this._valueBox.hidden = this._input.hidden;
    this._area.hidden = !area;
    const pattern = this._maskPattern();
    if (pattern && !this._input.hidden) {
      const parts = this._splitMask(pattern, this._value.replace(/\D/g, "").slice(0, this._slotCount(pattern)));
      this._maskTyped.textContent = parts.typed;
      this._maskRest.textContent = parts.rest;
      this._mask.hidden = false;
      this.dataset.mask = "";
    } else {
      this._mask.hidden = true;
      this._maskTyped.textContent = "";
      this._maskRest.textContent = "";
      delete this.dataset.mask;
    }
    const entry = this._entry();
    if (entry.value !== this._value) entry.value = this._value;
    if (chips) this._renderChips();
    else this._chipsHost.replaceChildren();
  }

  _lang() {
    const form = this.closest("demo-form");
    return form && form.getAttribute("lang") === "ru" ? "ru" : "en";
  }

  _pickerKind() {
    if (this._kind() !== "field-standard" || this._state() === "disabled") return "";
    const pattern = this._maskPattern();
    if (!pattern) return "";
    const slots = this._slotCount(pattern);
    if (slots === 8) return "date";
    if (slots === 4 && pattern.includes(":")) return "time";
    return "";
  }

  _today() {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  }

  _sameDay(left, right) {
    return Boolean(left && right) && left.y === right.y && left.m === right.m && left.d === right.d;
  }

  _parseDate() {
    const digits = this._value.replace(/\D/g, "");
    if (digits.length !== 8) return null;
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return { y: year, m: month - 1, d: day };
  }

  _writeDigits(digits) {
    const pattern = this._maskPattern();
    const next = this._splitMask(pattern, digits.slice(0, this._slotCount(pattern))).typed;
    this._value = next;
    this._input.value = next;
    this._area.value = next;
    this._marked = -1;
    this._paint();
    this._emit();
  }

  _openPicker() {
    const kind = this._pickerKind();
    if (!kind || !this._picker) return;
    const first = !this._pickerOpen;
    this._picker.hidden = false;
    this._picker.dataset.kind = kind;
    this._cal.hidden = kind !== "date";
    this._times.hidden = kind !== "time";
    if (kind === "date") {
      if (first) {
        const parsed = this._parseDate() || this._today();
        this._viewYear = parsed.y;
        this._viewMonth = parsed.m;
      }
      this._renderCalendar();
    } else if (first) this._renderTimes(true);
    else this._markTime();
    this._placePicker();
    if (!first) return;
    this._pickerOpen = true;
    document.addEventListener("pointerdown", this._onDocPointer, true);
    document.addEventListener("keydown", this._onDocKey);
    window.addEventListener("resize", this._onMove);
    window.addEventListener("scroll", this._onMove, true);
  }

  _closePicker() {
    if (!this._pickerOpen) return;
    this._pickerOpen = false;
    this._picker.hidden = true;
    document.removeEventListener("pointerdown", this._onDocPointer, true);
    document.removeEventListener("keydown", this._onDocKey);
    window.removeEventListener("resize", this._onMove);
    window.removeEventListener("scroll", this._onMove, true);
  }

  _syncPicker() {
    if (this._picker.dataset.kind === "date") {
      const parsed = this._parseDate();
      if (parsed) {
        this._viewYear = parsed.y;
        this._viewMonth = parsed.m;
      }
      this._renderCalendar();
      this._placePicker();
      return;
    }
    this._markTime();
  }

  _placePicker() {
    if (this._picker.dataset.kind === "time") {
      const plateWidth = this._plate.getBoundingClientRect().width;
      this._picker.style.width = `${Math.max(plateWidth, 160)}px`;
    } else this._picker.style.width = "";
    const plate = this._plate.getBoundingClientRect();
    const height = this._picker.offsetHeight;
    const width = this._picker.offsetWidth;
    const gap = 4;
    let top = plate.bottom + gap;
    if (top + height > window.innerHeight - 8 && plate.top - gap - height >= 8) top = plate.top - gap - height;
    let left = plate.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - 8 - width;
    if (left < 8) left = 8;
    this._picker.style.top = `${top}px`;
    this._picker.style.left = `${left}px`;
  }

  _onPickerClick(event) {
    const day = event.target.closest(".demo-field__day");
    if (day) {
      this._writeDigits(`${day.dataset.d}${day.dataset.month}${day.dataset.y}`);
      this._dismissPicker();
      return;
    }
    const nav = event.target.closest(".demo-field__nav");
    if (nav) {
      const next = new Date(this._viewYear, this._viewMonth + Number(nav.dataset.step), 1);
      this._viewYear = next.getFullYear();
      this._viewMonth = next.getMonth();
      this._renderCalendar();
      this._placePicker();
      return;
    }
    if (event.target.closest(".demo-field__today")) {
      const today = this._today();
      const day = String(today.d).padStart(2, "0");
      const month = String(today.m + 1).padStart(2, "0");
      this._writeDigits(`${day}${month}${today.y}`);
      this._dismissPicker();
      return;
    }
    const time = event.target.closest(".demo-field__time");
    if (!time) return;
    this._writeDigits(time.dataset.value.replace(/\D/g, ""));
    this._dismissPicker();
  }

  _dismissPicker() {
    const entry = this._entry();
    if (document.activeElement === entry) entry.blur();
    this._setActive(false);
  }

  _renderCalendar() {
    const lang = this._lang();
    const ru = lang === "ru";
    const today = this._today();
    const selected = this._parseDate();
    this._todayButton.textContent = ru ? "Сегодня" : "Today";
    this._todayButton.setAttribute("aria-pressed", this._sameDay(selected, today) ? "true" : "false");
    this._monthTitle.textContent = `${MONTHS[lang][this._viewMonth]} ${this._viewYear}`;
    const prev = ru ? "Предыдущий месяц" : "Previous month";
    const next = ru ? "Следующий месяц" : "Next month";
    this._picker.querySelector(".demo-field__nav--prev").setAttribute("aria-label", prev);
    this._picker.querySelector(".demo-field__nav--next").setAttribute("aria-label", next);
    this._week.replaceChildren();
    for (const label of WEEKDAYS[lang]) {
      const item = document.createElement("span");
      item.textContent = label;
      this._week.append(item);
    }
    const first = new Date(this._viewYear, this._viewMonth, 1);
    let offset = first.getDay();
    if (ru) offset = (offset + 6) % 7;
    const start = new Date(this._viewYear, this._viewMonth, 1 - offset);
    this._days.replaceChildren();
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const point = { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() };
      const button = document.createElement("button");
      button.type = "button";
      button.className = "demo-field__day";
      button.textContent = String(point.d);
      button.dataset.y = String(point.y);
      button.dataset.month = String(point.m + 1).padStart(2, "0");
      button.dataset.d = String(point.d).padStart(2, "0");
      if (point.m !== this._viewMonth) button.dataset.other = "";
      if (this._sameDay(point, today)) button.dataset.today = "";
      button.setAttribute("aria-selected", this._sameDay(point, selected) ? "true" : "false");
      this._days.append(button);
    }
  }

  _renderTimes(scroll) {
    const digits = this._value.replace(/\D/g, "");
    const current = digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : "";
    this._times.replaceChildren();
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "demo-field__time";
        button.dataset.value = label;
        button.textContent = label;
        button.setAttribute("aria-selected", label === current ? "true" : "false");
        this._times.append(button);
      }
    }
    if (!scroll) return;
    const chosen = this._times.querySelector('[aria-selected="true"]');
    if (!chosen) return;
    this._times.scrollTop = chosen.offsetTop - this._times.clientHeight / 2 + chosen.offsetHeight / 2;
  }

  _markTime() {
    const digits = this._value.replace(/\D/g, "");
    const current = digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : "";
    for (const button of this._times.querySelectorAll(".demo-field__time")) {
      button.setAttribute("aria-selected", button.dataset.value === current ? "true" : "false");
    }
  }

  _paintIcon() {
    const name = this._on("show-icon") ? this.getAttribute("icon") : "";
    const key = name === "date" || name === "time" ? name : "modules";
    if (this._icon.dataset.mark === key) return;
    this._icon.dataset.mark = key;
    this._icon.innerHTML = key === "date" ? CALENDAR : key === "time" ? TIME : MODULES;
  }

  _paintTrail() {
    const mode = this.getAttribute("trailing");
    let key = "info";
    let markup = INFO;
    let name = "additional information";
    if (mode === "visibility") {
      key = this._revealed ? "visibility-off" : "visibility";
      markup = this._revealed ? VISIBILITY_OFF : VISIBILITY;
      name = this._revealed ? "Hide password" : "Show password";
    } else if (mode === "conditional") {
      key = "conditional";
      markup = DEPENDENCY;
      name = "Depends on another field";
    }
    this._glyph.setAttribute("aria-label", name);
    if (mode === "visibility") this._glyph.setAttribute("aria-pressed", this._revealed ? "true" : "false");
    else this._glyph.removeAttribute("aria-pressed");
    if (this._glyph.dataset.mark === key) return;
    this._glyph.dataset.mark = key;
    this._glyph.innerHTML = markup;
  }

  _paintName() {
    const named = this._kind() === "field-medium" && this.hasAttribute("aria-label");
    const name = named ? this.getAttribute("aria-label") ?? "" : "";
    if (named) {
      this._input.setAttribute("aria-label", name);
      this._area.setAttribute("aria-label", name);
      return;
    }
    this._input.removeAttribute("aria-label");
    this._area.removeAttribute("aria-label");
  }
}

if (!customElements.get("demo-field")) customElements.define("demo-field", DemoField);
})();
