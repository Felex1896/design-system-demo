const REFLECTED = ["name", "alias", "description", "swatch"];

function blank(value) {
  return value.trim() === "";
}

function parseColor(input) {
  const value = String(input || "").trim();
  if (value.startsWith("#")) {
    let body = value.slice(1);
    if (body.length === 3 || body.length === 4) body = [...body].map((part) => part + part).join("");
    if (body.length !== 6 && body.length !== 8) return null;
    return {
      r: Number.parseInt(body.slice(0, 2), 16),
      g: Number.parseInt(body.slice(2, 4), 16),
      b: Number.parseInt(body.slice(4, 6), 16),
      a: body.length === 8 ? Number.parseInt(body.slice(6, 8), 16) / 255 : 1,
    };
  }
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  const [r, g, b, a = 1] = parts.map(Number);
  return { r, g, b, a: parts.length > 3 ? a : 1 };
}

function over(fg, bg) {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (front, back) => (front * fg.a + back * bg.a * (1 - fg.a)) / a;
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a };
}

function channel(value) {
  const unit = value / 255;
  return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
}

function contrast(fg, bg) {
  const paint = over(fg, bg);
  const lum = (color) => 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  const hi = Math.max(lum(paint), lum(bg));
  const lo = Math.min(lum(paint), lum(bg));
  return (hi + 0.05) / (lo + 0.05);
}

function readColor(styles, name) {
  return parseColor(styles.getPropertyValue(name));
}

class CcColorRow extends HTMLElement {
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
      <span class="cc-color-row__swatch">
        <span class="cc-color-row__name"></span>
        <span class="cc-color-row__alias" hidden></span>
      </span>
    `;
    this._name = this.querySelector(".cc-color-row__name");
    this._alias = this.querySelector(".cc-color-row__alias");
    this._swatch = this.querySelector(".cc-color-row__swatch");
  }

  _sync() {
    this._name.textContent = this.name;
    this._alias.textContent = this.alias;
    this._alias.hidden = blank(this.alias);
    const swatch = this.swatch.trim();
    this._swatch.style.backgroundImage = swatch ? `linear-gradient(${swatch}, ${swatch})` : "";
    this.toggleAttribute("data-invert", this._needsInverse(swatch));

    if (blank(this.description)) this.removeAttribute("tabindex");
    else this.tabIndex = 0;
  }

  _needsInverse(swatch) {
    const plateColor = parseColor(swatch);
    if (!plateColor) return false;
    const styles = getComputedStyle(this);
    const base = readColor(styles, "--color-surface-core-base");
    const primary = readColor(styles, "--color-text-core-primary");
    const tertiary = readColor(styles, "--color-text-core-tertiary");
    const inverse = readColor(styles, "--color-text-core-inverse");
    if (!base || !primary || !tertiary || !inverse) return false;
    const plate = over(plateColor, { ...base, a: 1 });
    const inverseAlias = { ...inverse, a: inverse.a * 0.61 };
    const themeScore = Math.min(contrast(primary, plate), contrast(tertiary, plate));
    const inverseScore = Math.min(contrast(inverse, plate), contrast(inverseAlias, plate));
    return inverseScore > themeScore;
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
