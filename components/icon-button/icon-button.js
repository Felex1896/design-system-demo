const GLYPHS = {
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M20 16C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H4C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H20ZM20 11C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H20ZM20 6C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H20Z"/>
</svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M18.295 7.115C18.6844 6.72564 18.6844 6.09436 18.295 5.705C17.9056 5.31564 17.2744 5.31564 16.885 5.705L12 10.59L7.115 5.705C6.72564 5.31564 6.09436 5.31564 5.705 5.705C5.31564 6.09436 5.31564 6.72564 5.705 7.115L10.59 12L5.705 16.885C5.31564 17.2744 5.31564 17.9056 5.705 18.295C6.09436 18.6844 6.72564 18.6844 7.115 18.295L12 13.41L16.885 18.295C17.2744 18.6844 17.9056 18.6844 18.295 18.295C18.6844 17.9056 18.6844 17.2744 18.295 16.885L13.41 12L18.295 7.115Z"/>
</svg>`,
  "caret-up": `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M17.9996 15.2021C18.5519 15.2021 18.9996 15.6499 18.9996 16.2021C18.9996 16.7544 18.5519 17.2021 17.9996 17.2021H5.99964C5.44748 17.202 4.99964 16.7543 4.99964 16.2021C4.99964 15.65 5.44748 15.2023 5.99964 15.2021H17.9996ZM12.5543 6.37012L18.5543 10.3701C19.0139 10.6765 19.138 11.2973 18.8317 11.7568C18.5253 12.2163 17.9045 12.3405 17.445 12.0342L11.9996 8.40332L6.55433 12.0342C6.09481 12.3405 5.47395 12.2163 5.16761 11.7568C4.86131 11.2973 4.98549 10.6765 5.44496 10.3701L11.445 6.37012L11.9996 6L12.5543 6.37012Z"/>
</svg>`,
  "caret-down": `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M17.4452 11.3699C17.9047 11.0635 18.5255 11.1877 18.8319 11.6472C19.1382 12.1068 19.0141 12.7276 18.5545 13.0339L12.5545 17.0339L11.9998 17.4041L11.4452 17.0339L5.44515 13.0339C4.98569 12.7276 4.8615 12.1067 5.16781 11.6472C5.47414 11.1877 6.095 11.0636 6.55453 11.3699L11.9998 15.0007L17.4452 11.3699ZM17.9998 6.20192C18.5521 6.20192 18.9998 6.64963 18.9998 7.20192C18.9998 7.7542 18.5521 8.20192 17.9998 8.20192H5.99984C5.44759 8.20187 4.99984 7.75417 4.99984 7.20192C4.99984 6.64966 5.44759 6.20196 5.99984 6.20192H17.9998Z"/>
</svg>`,
};

class CcIconButton extends HTMLElement {
  static get observedAttributes() {
    return ["glyph", "label"];
  }

  #button = null;
  #glyph = "";

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    this.#ensure();
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #ensure() {
    if (this.#button) return;
    const button = document.createElement("button");
    button.type = "button";
    button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("cc-press", { bubbles: true }));
    });
    this.append(button);
    this.#button = button;
  }

  #sync() {
    const button = this.#button;
    if (!button) return;
    const requested = this.getAttribute("glyph");
    const glyph = requested === "close" || requested === "caret-up" || requested === "caret-down" ? requested : "menu";
    button.setAttribute("aria-label", this.getAttribute("label") || "");
    if (this.#glyph === glyph) return;
    button.innerHTML = GLYPHS[glyph];
    this.#glyph = glyph;
  }
}

customElements.define("cc-icon-button", CcIconButton);
