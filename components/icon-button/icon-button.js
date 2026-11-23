const GLYPHS = {
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M20 16C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H4C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H20ZM20 11C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H20ZM20 6C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H20Z"/>
</svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M18.295 7.115C18.6844 6.72564 18.6844 6.09436 18.295 5.705C17.9056 5.31564 17.2744 5.31564 16.885 5.705L12 10.59L7.115 5.705C6.72564 5.31564 6.09436 5.31564 5.705 5.705C5.31564 6.09436 5.31564 6.72564 5.705 7.115L10.59 12L5.705 16.885C5.31564 17.2744 5.31564 17.9056 5.705 18.295C6.09436 18.6844 6.72564 18.6844 7.115 18.295L12 13.41L16.885 18.295C17.2744 18.6844 17.9056 18.6844 18.295 18.295C18.6844 17.9056 18.6844 17.2744 18.295 16.885L13.41 12L18.295 7.115Z"/>
</svg>`,
};

class CcIconButton extends HTMLElement {
  static get observedAttributes() {
    return ["glyph", "label"];
  }

  #button = null;
  #glyph = "";

  connectedCallback() {
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
    const glyph = this.getAttribute("glyph") === "close" ? "close" : "menu";
    button.setAttribute("aria-label", this.getAttribute("label") || "");
    if (this.#glyph === glyph) return;
    button.innerHTML = GLYPHS[glyph];
    this.#glyph = glyph;
  }
}

customElements.define("cc-icon-button", CcIconButton);
