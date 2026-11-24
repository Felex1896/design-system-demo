class CcSwitcherEnd extends HTMLElement {
  static get observedAttributes() {
    return ["label", "selected"];
  }

  #button = null;
  #label = null;

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    this.#ensure();
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get label() {
    return this.getAttribute("label") ?? "";
  }

  set label(value) {
    if (value == null) this.removeAttribute("label");
    else this.setAttribute("label", String(value));
  }

  get selected() {
    return this.hasAttribute("selected");
  }

  set selected(value) {
    if (value) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  #ensure() {
    if (this.#button) return;

    const button = document.createElement("button");
    button.type = "button";

    const label = document.createElement("span");
    label.className = "cc-switcher-end__label";

    const control = document.createElement("span");
    control.className = "cc-switcher-end__control";

    const toggle = document.createElement("span");
    toggle.className = "cc-switcher-end__toggle";

    const track = document.createElement("span");
    track.className = "cc-switcher-end__track";

    const knob = document.createElement("span");
    knob.className = "cc-switcher-end__knob";

    track.append(knob);
    toggle.append(track);
    control.append(toggle);
    button.append(label, control);

    button.addEventListener("click", () => {
      const selected = !this.selected;
      this.selected = selected;
      this.dispatchEvent(new CustomEvent("cc-change", {
        bubbles: true,
        detail: { selected },
      }));
    });

    this.append(button);
    this.#button = button;
    this.#label = label;
  }

  #sync() {
    if (!this.#button) return;
    this.#label.textContent = this.label;
    this.#button.setAttribute("aria-pressed", this.selected ? "true" : "false");
  }
}

customElements.define("cc-switcher-end", CcSwitcherEnd);
