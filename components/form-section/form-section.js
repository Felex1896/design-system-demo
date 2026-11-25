(function () {
  const script = document.currentScript;
  if (script && script.src) {
    const href = script.src.replace(/form-section\.js(?=[?#]|$)/, "form-section.css");
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.append(link);
    }
  }

  class FormSection extends HTMLElement {
    static get observedAttributes() {
      return ["title"];
    }

    constructor() {
      super();
      this._title = null;
    }

    connectedCallback() {
      this._syncTitle();
    }

    attributeChangedCallback() {
      this._syncTitle();
    }

    _syncTitle() {
      if (!this.hasAttribute("title")) {
        if (this._title) {
          this._title.remove();
          this._title = null;
        }
        return;
      }
      if (!this._title) {
        this._title = document.createElement("h2");
        this._title.className = "form-section__title";
        this.prepend(this._title);
      }
      this._title.textContent = this.getAttribute("title") ?? "";
    }
  }

  if (!customElements.get("form-section")) customElements.define("form-section", FormSection);
})();
