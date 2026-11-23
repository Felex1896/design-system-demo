class CcFamily extends HTMLElement {
  static observedAttributes = ["title", "heading-id"];

  #title = null;

  connectedCallback() {
    this.#ensureTitle();
    this.#syncTitle();
  }

  attributeChangedCallback() {
    this.#syncTitle();
  }

  #ensureTitle() {
    const existing = this.querySelector(":scope > .cc-family-title");
    if (existing) {
      this.#title = existing;
      return;
    }

    const title = document.createElement("h2");
    title.className = "cc-family-title";
    this.prepend(title);
    this.#title = title;
  }

  #syncTitle() {
    if (!this.#title) return;

    this.#title.textContent = this.getAttribute("title") ?? "";

    const headingId = this.getAttribute("heading-id");
    if (headingId) this.#title.id = headingId;
    else this.#title.removeAttribute("id");
  }
}

if (!customElements.get("cc-family")) {
  customElements.define("cc-family", CcFamily);
}
