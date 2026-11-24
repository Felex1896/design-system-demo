(() => {
const REFLECTED = ["label", "description"];

class CcShadowRow extends HTMLElement {
  static get observedAttributes() {
    return REFLECTED;
  }

  constructor() {
    super();
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
    if (this.closest("[data-ghost]")) return;
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
      <span class="cc-shadow-row__plate">
        <span class="cc-shadow-row__label"></span>
      </span>
    `;
    this._label = this.querySelector(".cc-shadow-row__label");
  }

  _sync() {
    this._label.textContent = this.label;
    const text = (this.description || "").trim();
    if (!text) this.removeAttribute("tabindex");
    else this.tabIndex = 0;
  }
}

for (const key of REFLECTED) {
  Object.defineProperty(CcShadowRow.prototype, key, {
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

customElements.define("cc-shadow-row", CcShadowRow);
})();
