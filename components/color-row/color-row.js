const REFLECTED = ["name", "alias", "description", "swatch"];

const CHEVRON_DOWN = "M12 13.2L16.2 8.99998C16.5314 8.6686 17.0686 8.6686 17.4 8.99998C17.7314 9.33135 17.7314 9.8686 17.4 10.2L12 15.6L6.6 10.2C6.26863 9.8686 6.26863 9.33135 6.6 8.99998C6.93137 8.6686 7.46863 8.6686 7.8 8.99998L12 13.2Z";
const CHEVRON_UP = "M12 10.7999L16.2 14.9999C16.5314 15.3313 17.0686 15.3313 17.4 14.9999C17.7314 14.6685 17.7314 14.1313 17.4 13.7999L12 8.3999L6.6 13.7999C6.26863 14.1313 6.26863 14.6685 6.6 14.9999C6.93137 15.3313 7.46863 15.3313 7.8 14.9999L12 10.7999Z";

function blank(value) {
  return value.trim() === "";
}

class CcColorRow extends HTMLElement {
  static get observedAttributes() {
    return REFLECTED;
  }

  constructor() {
    super();
    this._expanded = false;
    this._ready = false;
    for (const key of REFLECTED) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const value = this[key];
        delete this[key];
        this[key] = value;
      }
    }
  }

  connectedCallback() {
    this._ensure();
    this._sync();
  }

  attributeChangedCallback() {
    if (!this._ready) return;
    this._sync();
  }

  _reflect(key, value) {
    if (typeof value === "string") this.setAttribute(key, value);
    else this.removeAttribute(key);
  }

  _ensure() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = `
      <div class="cc-color-row__title">
        <span class="cc-color-row__swatch"></span>
        <span class="cc-color-row__label">
          <span class="cc-color-row__name"></span>
          <span class="cc-color-row__alias" hidden></span>
        </span>
        <span class="cc-color-row__chevron" hidden>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d=""></path>
          </svg>
        </span>
      </div>
      <div class="cc-color-row__description" hidden></div>
    `;
    this._name = this.querySelector(".cc-color-row__name");
    this._alias = this.querySelector(".cc-color-row__alias");
    this._description = this.querySelector(".cc-color-row__description");
    this._chevron = this.querySelector(".cc-color-row__chevron");
    this._glyph = this._chevron.querySelector("path");
    this.addEventListener("click", () => this._toggle());
    this.addEventListener("keydown", (event) => this._onKeyDown(event));
  }

  _toggle() {
    if (blank(this.description)) return;
    this._expanded = !this._expanded;
    this._sync();
  }

  _onKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (blank(this.description)) return;
    event.preventDefault();
    this._toggle();
  }

  _sync() {
    const hasDescription = !blank(this.description);
    if (!hasDescription) this._expanded = false;

    this._name.textContent = this.name;
    this._alias.textContent = this.alias;
    this._alias.hidden = blank(this.alias);
    this._description.textContent = this.description;
    this._description.hidden = !hasDescription || !this._expanded;
    this._chevron.hidden = !hasDescription;
    if (this._glyph) this._glyph.setAttribute("d", this._expanded ? CHEVRON_UP : CHEVRON_DOWN);

    const swatchElement = this.querySelector(".cc-color-row__swatch");
    swatchElement.style.backgroundColor = this.swatch;

    if (hasDescription) {
      this.setAttribute("role", "button");
      this.tabIndex = 0;
      this.setAttribute("aria-expanded", this._expanded ? "true" : "false");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
      this.removeAttribute("aria-expanded");
    }
  }
}

for (const key of REFLECTED) {
  Object.defineProperty(CcColorRow.prototype, key, {
    configurable: true,
    enumerable: true,
    get() {
      return this.getAttribute(key) ?? "";
    },
    set(value) {
      this._reflect(key, value);
    },
  });
}

customElements.define("cc-color-row", CcColorRow);
