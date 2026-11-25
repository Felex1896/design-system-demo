(function attachDropdownMenuStyles() {
  const script = document.currentScript;
  if (!script || !script.src) return;
  const href = script.src.replace(/dropdown-menu\.js(?=[?#]|$)/, "dropdown-menu.css");
  if (document.querySelector('link[href*="dropdown-menu.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
})();

class CcDropdownMenu extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

  constructor() {
    super();
    this._anchor = null;
    this._framed = false;
    this._watched = null;
    this._placeKey = "";
    this._raf = 0;
    this._onFrame = (event) => {
      if (!this._anchor || !this.hasAttribute("open")) return;
      if (event && event.type === "scroll" && event.target instanceof Node && (event.target === this || this.contains(event.target))) return;
      this._applyPlace(this._anchor);
    };
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(next) {
    if (next) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  connectedCallback() {
    if (this.getAttribute("role") !== "listbox") this.setAttribute("role", "listbox");
    this._syncOpen();
  }

  attributeChangedCallback(name) {
    if (name !== "open") return;
    this._syncOpen();
  }

  place(anchor) {
    if (anchor instanceof HTMLElement) this._anchor = anchor;
    if (!this._anchor || !this.isConnected || !this.hasAttribute("open")) return;
    this._bindFrame();
    this._applyPlace(this._anchor);
  }

  disconnectedCallback() {
    this._unbindFrame();
  }

  _syncOpen() {
    const open = this.hasAttribute("open");
    this.hidden = !open;
    this.inert = !open;
    if (!open) {
      this._unbindFrame();
      return;
    }
    if (!this._anchor || !this.isConnected) return;
    this._bindFrame();
    this._applyPlace(this._anchor);
  }

  _bindFrame() {
    if (!this._framed) {
      this._framed = true;
      window.addEventListener("resize", this._onFrame);
    }
    this._watchAnchor();
    this._watchScrollers();
    this._arm();
  }

  _watchAnchor() {
    if (!this._anchor) return;
    if (!this._resize) this._resize = new ResizeObserver(() => this._onFrame());
    if (this._watched === this._anchor) return;
    this._resize.disconnect();
    this._resize.observe(this._anchor);
    this._watched = this._anchor;
  }

  _watchScrollers() {
    const next = [];
    let node = this._anchor;
    while (node) {
      next.push(node);
      node = node.parentElement;
    }
    next.push(window);
    const same = this._scrollers && this._scrollers.length === next.length && this._scrollers.every((item, index) => item === next[index]);
    if (same) return;
    this._clearScrollers();
    this._scrollers = next;
    for (const item of next) item.addEventListener("scroll", this._onFrame, { passive: true });
  }

  _clearScrollers() {
    if (!this._scrollers) return;
    for (const item of this._scrollers) item.removeEventListener("scroll", this._onFrame);
    this._scrollers = null;
  }

  _unbindFrame() {
    if (!this._framed) return;
    this._framed = false;
    window.removeEventListener("resize", this._onFrame);
    if (this._resize) this._resize.disconnect();
    this._watched = null;
    this._clearScrollers();
    this._disarm();
    this._placeKey = "";
  }

  _arm() {
    if (this._raf) return;
    const tick = () => {
      this._raf = 0;
      if (!this.hasAttribute("open") || !this._anchor) return;
      this._applyPlace(this._anchor);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _disarm() {
    if (!this._raf) return;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
  }

  _applyPlace(anchor) {
    if (!anchor.isConnected) return;
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-2")) || 0;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    this.style.position = "fixed";
    this.style.right = "auto";
    this.style.bottom = "auto";
    const width = Math.min(anchor.offsetWidth, viewW);
    const widthPx = `${width}px`;
    if (this.style.width !== widthPx) this.style.width = widthPx;
    const borders = this.offsetHeight - this.clientHeight;
    const height = this.scrollHeight + Math.max(0, borders);
    const anchorBox = anchor.getBoundingClientRect();
    const key = `${anchorBox.top}|${anchorBox.left}|${anchorBox.bottom}|${anchorBox.width}|${viewW}|${viewH}|${height}`;
    if (key === this._placeKey) return;
    this._placeKey = key;
    let left = anchorBox.left;
    if (left + width > viewW) left = viewW - width;
    if (left < 0) left = 0;
    const below = Math.max(0, viewH - anchorBox.bottom - gap);
    const above = Math.max(0, anchorBox.top - gap);
    let top;
    let maxHeight;
    if (height <= below) {
      top = anchorBox.bottom + gap;
      maxHeight = below;
      this.removeAttribute("data-flip");
    } else if (height <= above) {
      top = anchorBox.top - gap - height;
      maxHeight = above;
      this.setAttribute("data-flip", "");
    } else if (below >= above) {
      top = anchorBox.bottom + gap;
      maxHeight = below;
      this.removeAttribute("data-flip");
    } else {
      maxHeight = above;
      top = anchorBox.top - gap - maxHeight;
      this.setAttribute("data-flip", "");
    }
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
    this.style.maxHeight = `${Math.max(0, maxHeight)}px`;
  }
}

if (!customElements.get("cc-dropdown-menu")) {
  customElements.define("cc-dropdown-menu", CcDropdownMenu);
}
