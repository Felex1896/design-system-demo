class CcScrollbar extends HTMLElement {
  static #nativeHides = new WeakMap();

  #target = null;
  #bound = null;
  #track = null;
  #thumb = null;
  #resizeObserver = null;
  #mutationObserver = null;
  #frame = 0;
  #drag = null;

  static get observedAttributes() {
    return ["axis"];
  }

  get target() {
    return this.#target;
  }

  set target(node) {
    const next = node instanceof HTMLElement ? node : null;
    if (next === this.#target) return;
    this.#target = next;
    if (this.isConnected) this.#bind();
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    this.#ensure();
    this.#bind();
  }

  disconnectedCallback() {
    this.#unbind();
  }

  attributeChangedCallback(name, previous, next) {
    if (name !== "axis" || previous === next) return;
    this.#endDrag();
    if (this.#thumb) this.#refresh();
  }

  #vertical() {
    return this.getAttribute("axis") !== "horizontal";
  }

  #ensure() {
    if (this.#track) return;
    const track = document.createElement("div");
    track.className = "cc-scrollbar-track";
    const thumb = document.createElement("div");
    thumb.className = "cc-scrollbar-thumb";
    track.append(thumb);
    this.append(track);
    this.#track = track;
    this.#thumb = thumb;
    this.setAttribute("aria-hidden", "true");
    track.addEventListener("pointerdown", this.#onTrackPointerDown);
    thumb.addEventListener("pointerdown", this.#onThumbPointerDown);
    thumb.addEventListener("pointermove", this.#onThumbPointerMove);
    thumb.addEventListener("pointerup", this.#endDrag);
    thumb.addEventListener("pointercancel", this.#endDrag);
    thumb.addEventListener("lostpointercapture", this.#endDrag);
  }

  #bind() {
    this.#unbind();
    const target = this.#target;
    if (!this.isConnected) return;
    this.#ensure();
    if (!target) {
      this.#refresh();
      return;
    }
    this.#bound = target;
    CcScrollbar.#retain(target);
    target.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#resizeObserver = new ResizeObserver(this.#schedule);
    this.#observe(target);
    this.#mutationObserver = new MutationObserver(this.#onMutate);
    this.#mutationObserver.observe(target, { childList: true, subtree: true });
    this.#refresh();
  }

  #unbind() {
    this.#endDrag();
    this.#clearFrame();
    const target = this.#bound;
    if (target) {
      target.removeEventListener("scroll", this.#onScroll);
      CcScrollbar.#release(target);
    }
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();
    this.#resizeObserver = null;
    this.#mutationObserver = null;
    this.#bound = null;
  }

  #observe(target) {
    const observer = this.#resizeObserver;
    if (!observer) return;
    observer.observe(target);
    for (const node of target.querySelectorAll("*")) {
      if (node === this || this.contains(node)) continue;
      observer.observe(node);
    }
  }

  #onMutate = () => {
    if (this.#bound) this.#observe(this.#bound);
    this.#schedule();
  };

  #onScroll = () => {
    this.#refresh();
  };

  #schedule = () => {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#refresh();
    });
  };

  #clearFrame() {
    if (!this.#frame) return;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #length(name) {
    const value = Number.parseFloat(getComputedStyle(this).getPropertyValue(name));
    return Number.isFinite(value) ? value : 0;
  }

  #measure() {
    const target = this.#target;
    const track = this.#track;
    if (!target || !track || !this.isConnected) return null;
    const vertical = this.#vertical();
    const scrollSize = vertical ? target.scrollHeight : target.scrollWidth;
    const clientSize = vertical ? target.clientHeight : target.clientWidth;
    const maxScroll = Math.max(0, scrollSize - clientSize);
    const scrollPos = Math.min(Math.max(vertical ? target.scrollTop : target.scrollLeft, 0), maxScroll);
    const trackSize = vertical ? track.clientHeight : track.clientWidth;
    const minThumb = this.#length("--layout-scrollbar-size");
    const proportional = scrollSize > 0 ? (clientSize / scrollSize) * trackSize : 0;
    const thumbSize = Math.min(trackSize, Math.max(minThumb, proportional));
    const maxThumb = Math.max(0, trackSize - thumbSize);
    const overflows = maxScroll > 0;
    const offset = !overflows || maxScroll === 0 || maxThumb === 0 ? 0 : (scrollPos / maxScroll) * maxThumb;
    return { vertical, scrollPos, maxScroll, thumbSize, maxThumb, offset, overflows };
  }

  #refresh() {
    if (!this.#thumb) return;
    const metrics = this.#measure();
    const visible = Boolean(metrics && metrics.overflows);
    this.classList.toggle("is-idle", !visible);
    if (!visible) {
      this.#endDrag();
      return;
    }
    this.#set(this.#thumb, "top", metrics.vertical ? metrics.offset + "px" : "");
    this.#set(this.#thumb, "height", metrics.vertical ? metrics.thumbSize + "px" : "");
    this.#set(this.#thumb, "left", metrics.vertical ? "" : metrics.offset + "px");
    this.#set(this.#thumb, "width", metrics.vertical ? "" : metrics.thumbSize + "px");
  }

  #set(node, prop, value) {
    if (node.style[prop] !== value) node.style[prop] = value;
  }

  #onTrackPointerDown = (event) => {
    if (event.button !== 0 || event.target === this.#thumb || !this.#target) return;
    const metrics = this.#measure();
    if (!metrics || !metrics.overflows) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = this.#track.getBoundingClientRect();
    const click = metrics.vertical ? event.clientY - rect.top : event.clientX - rect.left;
    const offset = Math.min(Math.max(click - metrics.thumbSize / 2, 0), metrics.maxThumb);
    const next = metrics.maxThumb === 0 ? 0 : (offset / metrics.maxThumb) * metrics.maxScroll;
    this.#writeScroll(metrics.vertical, next);
  };

  #onThumbPointerDown = (event) => {
    if (event.button !== 0 || !this.#target) return;
    const metrics = this.#measure();
    if (!metrics || !metrics.overflows) return;
    event.preventDefault();
    event.stopPropagation();
    this.#drag = {
      pointerId: event.pointerId,
      origin: metrics.vertical ? event.clientY : event.clientX,
      scroll: metrics.scrollPos,
    };
    this.#thumb.classList.add("is-active");
    this.#capture(event.pointerId);
  };

  #onThumbPointerMove = (event) => {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.pointerId || !this.#target) return;
    const metrics = this.#measure();
    if (!metrics || !metrics.overflows) {
      this.#endDrag();
      return;
    }
    const point = metrics.vertical ? event.clientY : event.clientX;
    const scale = metrics.maxThumb === 0 ? 0 : metrics.maxScroll / metrics.maxThumb;
    this.#writeScroll(metrics.vertical, drag.scroll + (point - drag.origin) * scale);
  };

  #endDrag = (event) => {
    const drag = this.#drag;
    if (!drag) return;
    if (event && event.pointerId !== undefined && event.pointerId !== drag.pointerId) return;
    this.#drag = null;
    this.#thumb?.classList.remove("is-active");
    this.#releaseCapture(drag.pointerId);
  };

  #capture(pointerId) {
    try {
      this.#thumb.setPointerCapture(pointerId);
    } catch {
      /* Pointer is not active yet. Later moves still land on the thumb. */
    }
  }

  #releaseCapture(pointerId) {
    const thumb = this.#thumb;
    if (!thumb) return;
    try {
      if (thumb.hasPointerCapture(pointerId)) thumb.releasePointerCapture(pointerId);
    } catch {
      /* Pointer already ended. */
    }
  }

  #writeScroll(vertical, value) {
    const target = this.#target;
    if (!target) return;
    if (vertical) target.scrollTop = value;
    else target.scrollLeft = value;
    this.#refresh();
  }

  static #retain(target) {
    const count = CcScrollbar.#nativeHides.get(target) || 0;
    CcScrollbar.#nativeHides.set(target, count + 1);
    target.classList.add("cc-scroll-hidden");
  }

  static #release(target) {
    const count = (CcScrollbar.#nativeHides.get(target) || 1) - 1;
    if (count > 0) {
      CcScrollbar.#nativeHides.set(target, count);
      return;
    }
    CcScrollbar.#nativeHides.delete(target);
    target.classList.remove("cc-scroll-hidden");
  }
}

customElements.define("cc-scrollbar", CcScrollbar);
