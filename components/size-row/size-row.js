(() => {
const REFLECTED = ["label", "kind", "amount", "description"];

function px(amount) {
  const text = String(amount).trim();
  if (text === "" || !Number.isFinite(Number(text))) return "";
  return Number(text) + "p" + "x";
}

class CcSizeRow extends HTMLElement {
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
      <span class="cc-size-row__plate">
        <span class="cc-size-row__specimen"></span>
        <span class="cc-size-row__label"></span>
      </span>
    `;
    this._plate = this.querySelector(".cc-size-row__plate");
    this._label = this.querySelector(".cc-size-row__label");
    this._specimen = this.querySelector(".cc-size-row__specimen");
  }

  _sync() {
    this._label.textContent = this.label;
    const text = (this.description || "").trim();
    if (!text) this.removeAttribute("tabindex");
    else this.tabIndex = 0;
    const length = px(this.amount);
    this._specimen.style.width = "";
    this._specimen.style.height = "";
    this._specimen.style.borderRadius = "";
    this.style.borderRadius = "";
    this._plate.style.borderRadius = "";
    if (this.kind === "spacing") this._specimen.style.width = length;
    if (this.kind === "rounding") {
      this._specimen.style.borderRadius = length;
      this.style.borderRadius = length;
      this._plate.style.borderRadius = length;
    }
    if (this.kind === "stroke") this._specimen.style.height = length;
  }
}

for (const key of REFLECTED) {
  Object.defineProperty(CcSizeRow.prototype, key, {
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

customElements.define("cc-size-row", CcSizeRow);
})();
