const CLOSE = `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M11.4674 5.59769L9.06512 8L11.4674 10.4023C11.7616 10.6964 11.7616 11.1733 11.4674 11.4674C11.1733 11.7616 10.6964 11.7616 10.4023 11.4674L8 9.06512L5.59768 11.4674C5.30356 11.7616 4.82669 11.7616 4.53256 11.4674C4.23844 11.1733 4.23844 10.6964 4.53256 10.4023L6.93488 8L4.53256 5.59768C4.23844 5.30356 4.23844 4.82669 4.53256 4.53256C4.82669 4.23844 5.30356 4.23844 5.59768 4.53256L8 6.93488L10.4023 4.53256C10.6964 4.23844 11.1733 4.23844 11.4674 4.53256C11.7616 4.82669 11.7616 5.30356 11.4674 5.59769Z"/>
</svg>`;

class DemoChip extends HTMLElement {
  static get observedAttributes() {
    return ["label", "disabled"];
  }

  constructor() {
    super();
    this._onClear = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(new CustomEvent("demo-clear", { bubbles: true }));
    };
    this._keepFocus = (event) => {
      if (this.hasAttribute("disabled")) return;
      event.preventDefault();
    };
  }

  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = `<span class="demo-chip__text"></span><button class="demo-chip__clear" type="button" tabindex="-1" aria-label="Remove">${CLOSE}</button>`;
    this._text = this.querySelector(".demo-chip__text");
    this._clear = this.querySelector(".demo-chip__clear");
    this._clear.addEventListener("mousedown", this._keepFocus);
    this._clear.addEventListener("click", this._onClear);
    this._paint();
  }

  attributeChangedCallback() {
    if (this._ready) this._paint();
  }

  _paint() {
    const label = this.getAttribute("label") || "";
    this._text.textContent = label;
    const off = this.hasAttribute("disabled");
    this._clear.disabled = off;
    this._clear.setAttribute("aria-label", label ? `Remove ${label}` : "Remove");
  }
}

customElements.define("demo-chip", DemoChip);
