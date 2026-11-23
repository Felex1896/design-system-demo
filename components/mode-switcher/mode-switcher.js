const ICONS = {
  dark: `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 1.33301C11.6819 1.33301 14.667 4.3181 14.667 8C14.667 11.6819 11.6819 14.667 8 14.667C4.3181 14.667 1.33301 11.6819 1.33301 8C1.33301 4.3181 4.3181 1.33301 8 1.33301ZM8 3.9873C5.79086 3.9873 4 5.77817 4 7.9873C4.00024 10.1962 5.79101 11.9873 8 11.9873C9.19195 11.9873 10.2613 11.4648 10.9941 10.6377C8.94389 10.4655 7.3331 8.74808 7.33301 6.65332C7.33311 5.63616 7.71344 4.70773 8.33887 4.00195C8.22713 3.99258 8.11416 3.9873 8 3.9873Z"/>
</svg>`,
  light: `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M10.1461 2.81348H13.1872V5.85449L15.3336 8.00098L13.1872 10.1475V13.1885H10.1461L7.99966 15.335L5.85416 13.1885H2.81314V10.1475L0.666656 8.00098L2.81314 5.85449V2.81348H5.85416L7.99966 0.666992L10.1461 2.81348ZM7.99966 4.11035C5.85363 4.11053 4.11002 5.85471 4.11002 8.00098C4.11019 10.1471 5.85374 11.8914 7.99966 11.8916C10.1457 11.8916 11.8901 10.1472 11.8903 8.00098C11.8903 5.8546 10.1458 4.11035 7.99966 4.11035Z"/>
</svg>`,
};

class CcModeSwitcher extends HTMLElement {
  static get observedAttributes() {
    return ["mode", "label-dark", "label-light"];
  }

  #dark = null;
  #light = null;

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    this.#ensure();
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get mode() {
    return this.getAttribute("mode") === "light" ? "light" : "dark";
  }

  #ensure() {
    if (this.#dark) return;
    this.#dark = this.#cell("dark");
    this.#light = this.#cell("light");
    this.append(this.#dark, this.#light);
  }

  #cell(mode) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mode = mode;
    button.innerHTML = ICONS[mode];
    button.addEventListener("click", () => {
      if (mode === this.mode) return;
      this.dispatchEvent(new CustomEvent("cc-change", {
        bubbles: true,
        detail: { mode },
      }));
    });
    return button;
  }

  #sync() {
    if (!this.#dark) return;
    const mode = this.mode;
    this.#paint(this.#dark, mode === "dark", this.getAttribute("label-dark") || "");
    this.#paint(this.#light, mode === "light", this.getAttribute("label-light") || "");
  }

  #paint(button, selected, label) {
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.setAttribute("aria-label", label);
    if (label) button.setAttribute("title", label);
    else button.removeAttribute("title");
  }
}

customElements.define("cc-mode-switcher", CcModeSwitcher);
