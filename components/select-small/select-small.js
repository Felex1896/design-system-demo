(function attachSelectSmallStyles() {
  const script = document.currentScript;
  if (!script || !script.src) return;
  const href = script.src.replace(/select-small\.js(?:[?#].*)?$/, "select-small.css");
  if (document.querySelector('link[href*="select-small.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
})();

class CcSelectSmall extends HTMLElement {
  static get observedAttributes() {
    return ["value", "disabled", "open"];
  }

  constructor() {
    super();
    this._options = [];
    this._inner = null;
    this._lock = false;
  }

  get options() {
    return this._inner ? this._inner.options : this._options.slice();
  }

  set options(list) {
    this._options = Array.isArray(list) ? list : [];
    if (this._inner) this._inner.options = this._options;
  }

  get value() {
    return this.getAttribute("value") || "";
  }

  set value(next) {
    const text = next == null ? "" : String(next);
    if (this.getAttribute("value") === text) {
      if (this._inner && this._inner.getAttribute("value") !== text) {
        this._inner.setAttribute("value", text);
      }
      return;
    }
    this.setAttribute("value", text);
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    if (this._inner) return;
    const inner = document.createElement("cc-select");
    inner.setAttribute("type", "small");
    this._inner = inner;
    this.append(inner);
    if (this._options.length) inner.options = this._options;
    this._push();
    inner.addEventListener("cc-change", (event) => {
      const value = event.detail && event.detail.value != null ? String(event.detail.value) : "";
      if (this.getAttribute("value") === value) return;
      this._lock = true;
      this.setAttribute("value", value);
      this._lock = false;
    });
    new MutationObserver(() => this._mirrorOpen()).observe(inner, {
      attributes: true,
      attributeFilter: ["open"],
    });
  }

  attributeChangedCallback(name) {
    if (!this._inner || this._lock) return;
    if (name === "value") this._inner.setAttribute("value", this.getAttribute("value") || "");
    if (name === "disabled") {
      this._inner.setAttribute("state", this.hasAttribute("disabled") ? "disabled" : "default");
    }
    if (name === "open") {
      if (this.hasAttribute("open")) this._inner.setAttribute("open", "");
      else this._inner.removeAttribute("open");
    }
  }

  _push() {
    this._inner.setAttribute("value", this.getAttribute("value") || "");
    if (this.hasAttribute("disabled")) this._inner.setAttribute("state", "disabled");
    if (this.hasAttribute("open")) this._inner.setAttribute("open", "");
  }

  _mirrorOpen() {
    const open = this._inner.hasAttribute("open");
    if (open === this.hasAttribute("open")) {
      if (open) this.dispatchEvent(new CustomEvent("cc-open", { bubbles: true }));
      return;
    }
    this._lock = true;
    if (open) this.setAttribute("open", "");
    else this.removeAttribute("open");
    this._lock = false;
    if (open) this.dispatchEvent(new CustomEvent("cc-open", { bubbles: true }));
  }
}

if (!customElements.get("cc-select-small")) {
  customElements.define("cc-select-small", CcSelectSmall);
}
