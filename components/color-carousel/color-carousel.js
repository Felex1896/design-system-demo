const SCRIPT_URL = document.currentScript && document.currentScript.src;

function vendorHref(file) {
  if (SCRIPT_URL) return new URL(`../../vendor/${file}`, SCRIPT_URL).href;
  return `../../vendor/${file}`;
}

function ensureSwiperCss() {
  const href = vendorHref("swiper-bundle.min.css");
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  for (const link of links) {
    if (link.hasAttribute("data-cc-swiper")) return;
    const current = link.getAttribute("href") || "";
    if (current === href || current.endsWith("/swiper-bundle.min.css")) return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-cc-swiper", "");
  document.head.append(link);
}

function ensureSwiper() {
  if (window.Swiper) return Promise.resolve();
  if (ensureSwiper.pending) return ensureSwiper.pending;
  ensureSwiper.pending = new Promise((resolve, reject) => {
    const href = vendorHref("swiper-bundle.min.js");
    const finish = () => {
      if (window.Swiper) resolve();
      else reject(new Error("Swiper failed to load"));
    };
    const fail = () => reject(new Error("Swiper failed to load"));
    const scripts = document.querySelectorAll("script[src]");
    for (const script of scripts) {
      const src = script.getAttribute("src") || "";
      if (src !== href && !src.endsWith("/swiper-bundle.min.js")) continue;
      if (window.Swiper) {
        resolve();
        return;
      }
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", fail, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = href;
    script.async = false;
    script.setAttribute("data-cc-swiper", "");
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", fail, { once: true });
    document.head.append(script);
  });
  return ensureSwiper.pending;
}

function readToken(element, name) {
  const value = Number.parseFloat(getComputedStyle(element).getPropertyValue(name));
  return Number.isFinite(value) ? value : 0;
}

class CcColorCarousel extends HTMLElement {
  #colors = [];
  #swiper = null;
  #root = null;
  #wrapper = null;
  #generation = 0;
  #centeredId = "";
  #silent = false;
  #reflecting = false;
  #shifting = false;
  #copies = 1;
  #resize = null;

  static get observedAttributes() {
    return ["value"];
  }

  constructor() {
    super();
    if (Object.prototype.hasOwnProperty.call(this, "colors")) {
      const value = this.colors;
      delete this.colors;
      this.colors = value;
    }
  }

  get colors() {
    return this.#colors;
  }

  set colors(value) {
    const source = Array.isArray(value) ? value : [];
    this.#colors = source.map((item) => ({
      id: item && item.id != null ? String(item.id) : "",
      color: item && item.color != null ? String(item.color) : "",
    }));
    this.#schedule();
  }

  connectedCallback() {
    if (this.closest("[data-ghost]")) return;
    ensureSwiperCss();
    this.#ensure();
    this.#watch();
    if (this.#swiper) return;
    this.#schedule();
  }

  disconnectedCallback() {
    this.#resize?.disconnect();
    this.#resize = null;
    const generation = this.#generation;
    queueMicrotask(() => {
      if (this.isConnected) {
        this.#watch();
        return;
      }
      if (generation !== this.#generation) return;
      this.#generation += 1;
      this.removeAttribute("ready");
      this.#destroy();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "value" || oldValue === newValue || this.#reflecting) return;
    const swiper = this.#swiper;
    if (!swiper || swiper.destroyed) return;
    this.#slideToId(swiper, newValue, swiper.params.speed);
  }

  #ensure() {
    if (this.#root) return;
    const root = document.createElement("div");
    root.className = "swiper";
    const wrapper = document.createElement("div");
    wrapper.className = "swiper-wrapper";
    root.append(wrapper);
    const ring = document.createElement("span");
    ring.className = "cc-color-carousel__ring";
    ring.setAttribute("aria-hidden", "true");
    this.append(root, ring);
    this.#root = root;
    this.#wrapper = wrapper;
  }

  #schedule() {
    if (!this.isConnected) return;
    this.#ensure();
    const generation = ++this.#generation;
    ensureSwiper()
      .then(() => {
        if (generation !== this.#generation || !this.isConnected) return;
        this.#mount();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  #destroy() {
    if (this.#swiper && !this.#swiper.destroyed) this.#swiper.destroy(true, true);
    this.#swiper = null;
  }

  #watch() {
    if (this.#resize) return;
    this.#resize = new ResizeObserver(() => {
      if (!this.isConnected || this.#root.clientWidth === 0) return;
      if (!this.#swiper) {
        this.#mount();
        return;
      }
      this.#swiper.update();
      this.setAttribute("ready", "");
    });
    this.#resize.observe(this.#root);
  }

  #mount() {
    this.#destroy();
    this.removeAttribute("ready");
    const wrapper = this.#wrapper;
    wrapper.replaceChildren();
    if (!this.#colors.length || !window.Swiper || this.#root.clientWidth === 0) return;

    const count = this.#colors.length;
    this.#copies = count > 1 ? 3 : 1;
    for (let copy = 0; copy < this.#copies; copy += 1) {
      for (const item of this.#colors) {
        const slide = document.createElement("div");
        slide.className = "swiper-slide cc-color-carousel__slide";
        slide.setAttribute("data-id", item.id);
        const disk = document.createElement("span");
        disk.className = "cc-color-carousel__disk";
        disk.style.backgroundColor = item.color;
        slide.append(disk);
        slide.addEventListener("click", () => this.#choose(slide));
        wrapper.append(slide);
      }
    }

    const value = this.getAttribute("value");
    const selected = this.#colors.findIndex((item) => item.id === value);
    const start = (selected < 0 ? 0 : selected) + (this.#copies === 3 ? count : 0);

    this.#silent = true;
    const swiper = new window.Swiper(this.#root, {
      slidesPerView: "auto",
      centeredSlides: true,
      loop: false,
      initialSlide: start,
      grabCursor: true,
      speed: 280,
      spaceBetween: readToken(this, "--spacing-4"),
      on: {
        slideChange: (instance) => this.#publish(instance),
        transitionEnd: (instance) => {
          this.#recenter(instance);
          this.#publish(instance);
        },
      },
    });
    this.#swiper = swiper;
    const generation = this.#generation;
    window.requestAnimationFrame(() => {
      if (generation !== this.#generation || this.#swiper !== swiper) return;
      swiper.update();
      this.#silent = false;
      this.setAttribute("ready", "");
      this.#publish(swiper);
    });
  }

  #unstick(swiper) {
    if (!swiper.animating) return;
    const duration = getComputedStyle(swiper.wrapperEl).transitionDuration;
    if (duration === "0s") swiper.animating = false;
  }

  #band(index) {
    const count = this.#colors.length;
    if (this.#copies !== 3 || count < 2) return true;
    return index >= count && index < count * 2;
  }

  #recenter(swiper) {
    if (!swiper || swiper.destroyed || this.#shifting || this.#copies !== 3) return;
    const count = this.#colors.length;
    const index = swiper.activeIndex;
    if (this.#band(index)) return;
    const normalized = ((index % count) + count) % count;
    this.#shifting = true;
    swiper.slideTo(count + normalized, 0, false);
    this.#shifting = false;
  }

  #slideToId(swiper, id, speed) {
    if (!swiper || swiper.destroyed || id == null || id === "") return;
    const count = this.#colors.length;
    let best = -1;
    let bestDistance = Infinity;
    swiper.slides.forEach((slide, index) => {
      if (slide.getAttribute("data-id") !== id || !this.#band(index)) return;
      const distance = Math.abs(index - (count > 1 ? count : 0));
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    if (best < 0) return;
    this.#unstick(swiper);
    if (best === swiper.activeIndex) {
      if (!this.#isCentered(swiper)) swiper.slideToClosest(speed);
      return;
    }
    swiper.slideTo(best, speed);
  }

  #choose(slide) {
    const swiper = this.#swiper;
    if (!swiper || swiper.destroyed) return;
    const index = [...swiper.slides].indexOf(slide);
    if (index < 0) return;
    this.#unstick(swiper);
    swiper.slideTo(index);
  }

  #isCentered(swiper) {
    const slide = swiper.slides[swiper.activeIndex];
    if (!slide) return true;
    const view = swiper.el.getBoundingClientRect();
    if (view.width <= 0) return true;
    const box = slide.getBoundingClientRect();
    const delta = view.left + view.width / 2 - (box.left + box.width / 2);
    return Math.abs(delta) < 1;
  }

  #publish(swiper) {
    if (this.#silent || !swiper || swiper.destroyed) return;
    const slide = swiper.slides[swiper.activeIndex];
    if (!slide) return;
    const id = slide.getAttribute("data-id") || "";
    if (id === this.#centeredId) return;
    this.#centeredId = id;
    if (this.getAttribute("value") !== id) {
      this.#reflecting = true;
      this.setAttribute("value", id);
      this.#reflecting = false;
    }
    this.dispatchEvent(new CustomEvent("cc-change", { bubbles: true, detail: { id } }));
  }
}

customElements.define("cc-color-carousel", CcColorCarousel);
