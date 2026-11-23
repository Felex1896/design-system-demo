class CcTooltip extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "tooltip");
    this.hidden = true;
  }

  show(anchor, text) {
    this.textContent = text;
    this.hidden = false;
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-2")) || 0;
    const host = anchor.getBoundingClientRect();
    const plate = this.getBoundingClientRect();
    const viewWidth = document.documentElement.clientWidth;
    const viewHeight = document.documentElement.clientHeight;
    let top = host.bottom + gap;
    if (top + plate.height > viewHeight) top = host.top - gap - plate.height;
    let left = host.left + (host.width - plate.width) / 2;
    if (left + plate.width > viewWidth) left = host.right - plate.width;
    if (left < 0) left = host.left;
    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  hide() {
    this.hidden = true;
    this.style.top = "";
    this.style.left = "";
  }
}

customElements.define("cc-tooltip", CcTooltip);

const tip = document.createElement("cc-tooltip");
document.body.append(tip);

const clipped = ".cc-color-row__name, .cc-color-row__alias";

function overflows(node) {
  return node.scrollWidth > node.clientWidth + 1;
}

document.addEventListener("pointerover", (event) => {
  const node = event.target instanceof Element ? event.target.closest(clipped) : null;
  if (!node || !overflows(node)) {
    tip.hide();
    return;
  }
  tip.show(node, node.textContent.trim());
});

document.addEventListener("pointerout", (event) => {
  const node = event.target instanceof Element ? event.target.closest(clipped) : null;
  if (!node) return;
  tip.hide();
});

document.addEventListener("scroll", () => tip.hide(), true);
