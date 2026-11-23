(() => {
const REFLECTED = ["sample", "caption", "weight", "size", "line", "tracking"];

function lengthOf(value) {
  const trimmed = String(value).trim();
  if (trimmed === "") return "";
  return trimmed + "p" + "x";
}

class CcTypeRow extends HTMLElement {
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
      <span class="cc-type-row__plate">
        <span class="cc-type-row__sample"></span>
        <span class="cc-type-row__caption"></span>
      </span>
    `;
    this._sample = this.querySelector(".cc-type-row__sample");
    this._caption = this.querySelector(".cc-type-row__caption");
  }

  _sync() {
    this._sample.textContent = this.sample;
    this._caption.textContent = this.caption;
    this._sample.style.fontWeight = this.weight.trim();
    this._sample.style.fontSize = lengthOf(this.size);
    this._sample.style.lineHeight = lengthOf(this.line);
    this._sample.style.letterSpacing = lengthOf(this.tracking);
    this._sample.style.height = lengthOf(this.line);
  }
}

for (const key of REFLECTED) {
  Object.defineProperty(CcTypeRow.prototype, key, {
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

customElements.define("cc-type-row", CcTypeRow);
})();
