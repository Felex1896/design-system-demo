class CcSidebar extends HTMLElement {
  #mounted = false;
  #closeLock = false;
  #scrim = null;
  #panel = null;
  #brand = null;
  #menu = null;
  #scrollbar = null;
  #close = null;

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    if (this.#mounted) return;
    this.#mounted = true;
    this.#mount();
  }

  #mount() {
    this.#scrim = document.createElement("div");
    this.#scrim.className = "scrim";
    this.#scrim.setAttribute("aria-hidden", "true");

    this.#panel = document.createElement("div");
    this.#panel.className = "panel";

    const header = document.createElement("div");
    header.className = "header";

    this.#brand = document.createElement("div");
    this.#brand.className = "brand";

    this.#close = document.createElement("cc-icon-button");
    this.#close.setAttribute("glyph", "close");
    this.#close.setAttribute("label", "Close menu");

    const body = document.createElement("div");
    body.className = "body";

    this.#menu = document.createElement("div");
    this.#menu.className = "menu";

    this.#scrollbar = document.createElement("div");
    this.#scrollbar.className = "scrollbar";

    header.append(this.#brand, this.#close);
    body.append(this.#menu, this.#scrollbar);
    this.#panel.append(header, body);

    this.#redirectInserts();
    this.#project();
    this.append(this.#scrim, this.#panel);

    this.#scrim.addEventListener("click", () => {
      this.#emitClose(this.#scrim);
    });
    this.#close.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#emitClose(this.#close);
    });
    this.#close.addEventListener("cc-press", (event) => {
      event.stopPropagation();
      this.#emitClose(this.#close);
    });

    const observer = new MutationObserver(() => this.#project());
    observer.observe(this, { childList: true });
  }

  #targetFor(node) {
    if (!(node instanceof Element)) return null;
    if (node === this.#scrim || node === this.#panel) return null;
    const name = node.getAttribute("slot");
    if (name === "brand") return this.#brand;
    if (name === "menu") return this.#menu;
    if (name === "scrollbar") return this.#scrollbar;
    return null;
  }

  #redirectInserts() {
    const appendChild = HTMLElement.prototype.appendChild;
    const insertBefore = HTMLElement.prototype.insertBefore;
    this.appendChild = (node) => {
      const target = this.#targetFor(node);
      if (target) return target.appendChild(node);
      return appendChild.call(this, node);
    };
    this.insertBefore = (node, reference) => {
      const target = this.#targetFor(node);
      if (target) return target.appendChild(node);
      return insertBefore.call(this, node, reference);
    };
    this.append = (...nodes) => {
      for (const node of nodes) {
        const normalized = node instanceof Node ? node : document.createTextNode(String(node));
        const target = this.#targetFor(normalized);
        if (target) target.appendChild(normalized);
        else appendChild.call(this, normalized);
      }
    };
  }

  #project() {
    for (const child of [...this.children]) {
      const target = this.#targetFor(child);
      if (target) target.appendChild(child);
    }
  }

  #emitClose(from) {
    if (this.#closeLock) return;
    this.#closeLock = true;
    queueMicrotask(() => {
      this.#closeLock = false;
    });
    from.dispatchEvent(new CustomEvent("cc-close", { bubbles: true }));
  }
}

if (!customElements.get("cc-sidebar")) {
  customElements.define("cc-sidebar", CcSidebar);
}
