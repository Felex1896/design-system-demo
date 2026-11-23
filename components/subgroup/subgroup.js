class CcSubgroup extends HTMLElement {
  static get observedAttributes() {
    return ["label"];
  }

  #head = null;
  #label = null;
  #panel = null;
  #observer = null;

  connectedCallback() {
    this.#ensure();
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #ensure() {
    if (this.#head) return;
    const head = document.createElement("div");
    head.className = "cc-subgroup__head";
    const label = document.createElement("span");
    label.className = "cc-subgroup__label";
    head.append(label);
    const panel = document.createElement("div");
    panel.className = "cc-subgroup__panel";
    const existing = [...this.childNodes];
    this.append(head, panel);
    for (const node of existing) panel.append(node);
    this.#head = head;
    this.#label = label;
    this.#panel = panel;
    this.#observer = new MutationObserver(() => this.#adopt());
    this.#observer.observe(this, { childList: true });
  }

  #adopt() {
    if (!this.#panel) return;
    for (const node of [...this.childNodes]) {
      if (node === this.#head || node === this.#panel) continue;
      this.#panel.append(node);
    }
  }

  #sync() {
    if (!this.#label) return;
    this.#adopt();
    const label = this.getAttribute("label") || "";
    this.#label.textContent = label ? `/${label}` : "";
  }
}

if (!customElements.get("cc-subgroup")) {
  customElements.define("cc-subgroup", CcSubgroup);
}
