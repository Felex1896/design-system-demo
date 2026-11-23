const MENU_CHEVRON_RIGHT = "M13.2 12L8.3 16.9C7.9134 17.2866 7.9134 17.9134 8.3 18.3C8.6866 18.6866 9.3134 18.6866 9.7 18.3L16 12L9.7 5.7C9.3134 5.3134 8.6866 5.3134 8.3 5.7C7.9134 6.0866 7.9134 6.7134 8.3 7.1L13.2 12Z";
const MENU_CHEVRON_DOWN = "M12 13.3333L16.9341 8.63417C17.307 8.27903 17.893 8.27903 18.2659 8.63417C18.6654 9.01467 18.6654 9.652 18.2659 10.0325L12 16L5.73413 10.0325C5.3346 9.652 5.3346 9.01467 5.73413 8.63417C6.10702 8.27903 6.69298 8.27903 7.06587 8.63417L12 13.3333Z";

class CcMenuItem extends HTMLElement {
  static get observedAttributes() {
    return ["label", "expanded", "depth", "selected", "leaf"];
  }

  #row = null;
  #chevron = null;
  #label = null;
  #glyph = null;

  connectedCallback() {
    this.#ensure();
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #ensure() {
    if (this.#row) return;

    const row = document.createElement("div");
    row.className = "cc-menu-item-row";

    const chevron = document.createElement("button");
    chevron.type = "button";
    chevron.className = "cc-menu-item-chevron";
    chevron.append(this.#icon());
    chevron.addEventListener("click", (event) => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("cc-toggle", {
        bubbles: true,
        detail: { expanded: !this.#expanded() },
      }));
    });

    const label = document.createElement("button");
    label.type = "button";
    label.className = "cc-menu-item-label";
    label.addEventListener("click", (event) => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("cc-navigate", {
        bubbles: true,
        detail: { label: this.getAttribute("label") ?? "" },
      }));
    });

    row.append(chevron, label);
    this.prepend(row);

    this.#row = row;
    this.#chevron = chevron;
    this.#label = label;
    this.#glyph = chevron.querySelector("path");
  }

  #icon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    svg.append(path);
    return svg;
  }

  #expanded() {
    return this.getAttribute("expanded") !== "false";
  }

  #depth() {
    const parsed = Number.parseInt(this.getAttribute("depth") ?? "0", 10);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
  }

  #sync() {
    if (!this.#label) return;

    this.#label.textContent = this.getAttribute("label") ?? "";

    const expanded = this.#expanded();
    const leaf = this.hasAttribute("leaf");
    this.#glyph.setAttribute("d", expanded ? MENU_CHEVRON_DOWN : MENU_CHEVRON_RIGHT);
    this.#chevron.hidden = leaf;
    if (leaf) {
      this.#chevron.removeAttribute("aria-expanded");
      this.#chevron.removeAttribute("aria-label");
    } else {
      this.#chevron.setAttribute("aria-expanded", expanded ? "true" : "false");
      this.#chevron.setAttribute("aria-label", expanded ? "Collapse" : "Expand");
    }

    if (this.hasAttribute("selected")) this.#label.setAttribute("aria-current", "page");
    else this.#label.removeAttribute("aria-current");

    this.style.setProperty("--menu-depth", String(this.#depth()));
  }
}

if (!customElements.get("cc-menu-item")) {
  customElements.define("cc-menu-item", CcMenuItem);
}
