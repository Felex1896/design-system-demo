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

let pointer = null;

function rememberPointer(event) {
  if (event.pointerType && event.pointerType !== "mouse") return;
  pointer = { x: event.clientX, y: event.clientY };
}

function rowUnderPointer() {
  if (!pointer) return null;
  for (const node of document.elementsFromPoint(pointer.x, pointer.y)) {
    if (!(node instanceof Element)) continue;
    const row = node.closest("cc-color-row");
    if (row?.closest(".family-scroll")) return row;
  }
  return null;
}

function settleLifts(animated) {
  const next = rowUnderPointer();
  for (const row of document.querySelectorAll("cc-color-row")) {
    if (!row._lifted || row === next) continue;
    if (row.classList.contains("is-held") || document.activeElement === row) continue;
    if (animated) row._drop();
    else row._finishDrop();
  }
  if (next && (!next._lifted || next._dropping)) next._lift();
}

function watchScroller(scroller) {
  if (!scroller || scroller.dataset.liftWatch) return;
  scroller.dataset.liftWatch = "true";
  scroller.addEventListener("scroll", () => settleLifts(false), { passive: true });
}

document.addEventListener("pointermove", (event) => {
  rememberPointer(event);
  settleLifts(true);
}, { passive: true });

document.addEventListener("scroll", () => settleLifts(false), true);

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
    this._bindLift();
  }

  disconnectedCallback() {
    window.clearTimeout(this._dropTimer);
    this._dropTimer = 0;
    this._dropping = false;
    if (this._lifted) this._finishDrop();
    this._watch?.disconnect();
    this._watch = null;
  }

  attributeChangedCallback() {
    if (!this._ready) return;
    this._sync();
  }

  _reflect(key, value) {
    if (typeof value === "string") this.setAttribute(key, value);
    else this.removeAttribute(key);
  }

  _bindLift() {
    if (this._boundLift) return;
    this._boundLift = true;
    this.addEventListener("pointerenter", (event) => {
      rememberPointer(event);
      this._lift();
    });
    this.addEventListener("pointerleave", () => {
      if (this.classList.contains("is-held") || this === document.activeElement) return;
      this._drop();
    });
    this.addEventListener("focus", () => this._lift());
    this.addEventListener("blur", () => this._liftOff());
    this._watch = new MutationObserver(() => {
      if (this.classList.contains("is-held")) this._lift();
      else this._liftOff();
    });
    this._watch.observe(this, { attributes: true, attributeFilter: ["class"] });
  }

  _containsPointer() {
    if (!pointer) return this.matches(":hover");
    const rect = this.getBoundingClientRect();
    return pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
  }

  _lift() {
    if (this._dropping) {
      if (!this._containsPointer() && this !== document.activeElement && !this.classList.contains("is-held")) return;
      window.clearTimeout(this._dropTimer);
      this._dropping = false;
      this._dropTimer = 0;
      this._swatch.style.transform = "scale(1.05)";
      this._swatch.style.boxShadow = "var(--shadow-color-row)";
      return;
    }
    const scroller = this.closest(".family-scroll");
    if (!scroller || this._lifted) return;
    this._liftGen = (this._liftGen || 0) + 1;
    const swatch = this._swatch;
    const rect = this.getBoundingClientRect();
    this._name.style.color = getComputedStyle(this._name).color;
    this._alias.style.color = getComputedStyle(this._alias).color;
    this.style.height = `${rect.height}px`;
    swatch.style.position = "fixed";
    swatch.style.zIndex = "6";
    swatch.style.margin = "0";
    swatch.style.pointerEvents = "none";
    swatch.style.transform = "scale(1)";
    swatch.style.boxShadow = "none";
    document.body.append(swatch);
    this._lifted = true;
    this._scroller = scroller;
    this._pageScroll = this.closest(".page-scroll");
    watchScroller(scroller);
    this._syncLift = () => {
      if (!this._lifted) return;
      if (!this.classList.contains("is-held") && this !== document.activeElement && !this._containsPointer()) {
        const next = rowUnderPointer();
        this._finishDrop();
        if (next && next !== this && (!next._lifted || next._dropping)) next._lift();
        return;
      }
      this._placeLift();
    };
    scroller.addEventListener("scroll", this._syncLift, { passive: true });
    this._pageScroll?.addEventListener("scroll", this._syncLift, { passive: true });
    window.addEventListener("resize", this._syncLift);
    this._placeLift();
    const gen = this._liftGen;
    const grow = () => {
      if (gen !== this._liftGen || !this._lifted || this._dropping) return;
      swatch.style.transform = "scale(1.05)";
      swatch.style.boxShadow = "var(--shadow-color-row)";
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) grow();
    else requestAnimationFrame(() => requestAnimationFrame(grow));
  }

  _placeLift() {
    if (!this._lifted) return;
    const swatch = this._swatch;
    const next = this.getBoundingClientRect();
    const view = this._scroller.getBoundingClientRect();
    const topCut = Math.max(0, view.top - next.top);
    const bottomCut = Math.max(0, next.bottom - view.bottom);
    swatch.style.left = `${next.left}px`;
    swatch.style.top = `${next.top}px`;
    swatch.style.width = `${next.width}px`;
    swatch.style.height = `${next.height}px`;
    swatch.style.visibility = next.bottom <= view.top || next.top >= view.bottom ? "hidden" : "visible";
    swatch.style.clipPath = `inset(${topCut}px -24px ${bottomCut}px -24px)`;
  }

  _liftOff() {
    if (this.classList.contains("is-held") || this === document.activeElement) return;
    if (this._containsPointer()) return;
    this._drop();
  }

  _drop() {
    if (!this._lifted || this._dropping) return;
    this._dropping = true;
    const swatch = this._swatch;
    swatch.style.transform = "scale(1)";
    swatch.style.boxShadow = "none";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this._dropTimer = window.setTimeout(() => this._finishDrop(), reduce ? 0 : 200);
  }

  _finishDrop() {
    if (!this._lifted && !this._dropping) return;
    this._dropTimer = 0;
    this._scroller?.removeEventListener("scroll", this._syncLift);
    this._pageScroll?.removeEventListener("scroll", this._syncLift);
    window.removeEventListener("resize", this._syncLift);
    const swatch = this._swatch;
    swatch.style.position = "";
    swatch.style.left = "";
    swatch.style.top = "";
    swatch.style.width = "";
    swatch.style.height = "";
    swatch.style.zIndex = "";
    swatch.style.margin = "";
    swatch.style.pointerEvents = "";
    swatch.style.transform = "";
    swatch.style.boxShadow = "";
    swatch.style.visibility = "";
    swatch.style.clipPath = "";
    this._name.style.color = "";
    this._alias.style.color = "";
    this.append(swatch);
    this.style.height = "";
    this._lifted = false;
    this._dropping = false;
    this._scroller = null;
    this._pageScroll = null;
    this._syncLift = null;
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
