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
  #middle = 0;
  #resize = null;
  #wheelTimer = 0;
  #settleTimer = 0;
  #pumping = false;
  #settling = false;

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
    const next = source.map((item) => ({
      id: item && item.id != null ? String(item.id) : "",
      color: item && item.color != null ? String(item.color) : "",
    }));
    const same = next.length === this.#colors.length
      && next.every((item, index) => item.id === this.#colors[index].id);
    this.#colors = next;
    if (same && this.#wrapper && this.#wrapper.childElementCount) {
      for (const slide of this.#wrapper.querySelectorAll(".cc-color-carousel__slide")) {
        const item = next.find((entry) => entry.id === slide.getAttribute("data-id"));
        const disk = slide.querySelector(".cc-color-carousel__disk");
        if (item && disk) disk.style.backgroundColor = item.color;
      }
      return;
    }
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
    clearTimeout(this.#wheelTimer);
    clearTimeout(this.#settleTimer);
    this.#wheelTimer = 0;
    this.#settleTimer = 0;
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
      if (this.#swiper.animating || this.#swiper.touchEventsData?.isTouched) return;
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
    const span = readToken(this, "--spacing-32") + readToken(this, "--spacing-4");
    if (count > 1) {
      const side = span > 0 ? Math.max(1, Math.ceil(4000 / (count * span))) : 1;
      this.#middle = side;
      this.#copies = side * 2 + 1;
    } else {
      this.#middle = 0;
      this.#copies = 1;
    }
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
    const start = (selected < 0 ? 0 : selected) + this.#middle * count;

    this.#silent = true;
    const swiper = new window.Swiper(this.#root, {
      slidesPerView: "auto",
      centeredSlides: true,
      loop: false,
      initialSlide: start,
      grabCursor: true,
      speed: 280,
      spaceBetween: readToken(this, "--spacing-4"),
      freeMode: {
        enabled: true,
        momentum: true,
        momentumRatio: 0.64,
        momentumBounce: false,
        momentumVelocityRatio: 1,
        sticky: false,
      },
      mousewheel: {
        enabled: true,
        forceToAxis: true,
        sensitivity: 1,
      },
      on: {
        setTranslate: (instance) => {
          this.#markCenter(instance);
          if (instance.animating) this.#pump();
        },
        transitionStart: (instance) => this.#pump(),
        touchEnd: (instance) => {
          requestAnimationFrame(() => this.#released(instance));
        },
        transitionEnd: (instance) => this.#released(instance),
        scroll: (instance) => {
          this.#markCenter(instance);
          clearTimeout(this.#wheelTimer);
          this.#wheelTimer = setTimeout(() => {
            this.#wheelTimer = 0;
            this.#released(instance);
          }, 140);
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
      this.#markCenter(swiper);
    });
  }

  #unstick(swiper) {
    if (!swiper.animating) return;
    const duration = getComputedStyle(swiper.wrapperEl).transitionDuration;
    if (duration === "0s") swiper.animating = false;
  }

  #inMiddle(index) {
    const count = this.#colors.length;
    if (this.#copies === 1 || count < 2) return true;
    const start = this.#middle * count;
    return index >= start && index < start + count;
  }

  #closest(swiper) {
    const view = swiper.el.getBoundingClientRect();
    if (view.width <= 0) return null;
    const mid = view.left + view.width / 2;
    let best = null;
    let bestDist = Infinity;
    for (const slide of swiper.slides) {
      const box = slide.getBoundingClientRect();
      const dist = Math.abs(mid - (box.left + box.width / 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = slide;
      }
    }
    return best;
  }

  #markCenter(swiper) {
    if (!swiper || swiper.destroyed) return;
    const slide = this.#closest(swiper);
    for (const item of swiper.slides) item.classList.toggle("is-centered", item === slide);
    if (!swiper.animating) this.#publishSlide(slide);
  }

  #armSettle(swiper) {
    clearTimeout(this.#settleTimer);
    const seconds = Number.parseFloat(swiper.wrapperEl.style.transitionDuration);
    const wait = (Number.isFinite(seconds) ? seconds * 1000 : swiper.params.speed) + 90;
    this.#settleTimer = setTimeout(() => {
      this.#settleTimer = 0;
      if (this.#swiper !== swiper || swiper.destroyed || !swiper.animating) return;
      swiper.setTransition(0);
      swiper.animating = false;
      this.#released(swiper);
    }, wait);
  }

  #pump() {
    if (this.#pumping) return;
    this.#pumping = true;
    if (this.#swiper) this.#armSettle(this.#swiper);
    const step = () => {
      const swiper = this.#swiper;
      if (!swiper || swiper.destroyed) {
        this.#pumping = false;
        return;
      }
      this.#markCenter(swiper);
      if (swiper.animating) {
        requestAnimationFrame(step);
        return;
      }
      this.#pumping = false;
    };
    requestAnimationFrame(step);
  }

  #recenter(swiper) {
    if (!swiper || swiper.destroyed || this.#shifting || this.#middle === 0) return;
    const count = this.#colors.length;
    const slide = this.#closest(swiper);
    const index = slide ? [...swiper.slides].indexOf(slide) : -1;
    if (index < 0 || this.#inMiddle(index)) return;
    const normalized = ((index % count) + count) % count;
    this.#shifting = true;
    swiper.slideTo(this.#middle * count + normalized, 0, false);
    this.#shifting = false;
    this.#markCenter(swiper);
  }

  #released(swiper) {
    if (!swiper || swiper.destroyed || this.#shifting || this.#silent) return;
    if (swiper.animating) return;
    const slide = this.#closest(swiper);
    if (!slide) return;
    const view = swiper.el.getBoundingClientRect();
    const box = slide.getBoundingClientRect();
    const delta = view.left + view.width / 2 - (box.left + box.width / 2);
    if (Math.abs(delta) >= 1) {
      if (this.#settling) return;
      this.#settling = true;
      this.#unstick(swiper);
      const moved = swiper.slideToClosest(swiper.params.speed);
      this.#settling = false;
      if (moved && swiper.animating) {
        this.#armSettle(swiper);
        return;
      }
    }
    clearTimeout(this.#settleTimer);
    this.#settleTimer = 0;
    swiper.animating = false;
    this.#recenter(swiper);
    this.#markCenter(swiper);
  }

  #slideToId(swiper, id, speed) {
    if (!swiper || swiper.destroyed || id == null || id === "") return;
    const count = this.#colors.length;
    let best = -1;
    let bestDistance = Infinity;
    swiper.slides.forEach((slide, index) => {
      if (slide.getAttribute("data-id") !== id || !this.#inMiddle(index)) return;
      const distance = Math.abs(index - this.#middle * count);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    if (best < 0) return;
    const current = this.#closest(swiper);
    if (current && current.getAttribute("data-id") === id) {
      const view = swiper.el.getBoundingClientRect();
      const box = current.getBoundingClientRect();
      const delta = view.left + view.width / 2 - (box.left + box.width / 2);
      if (Math.abs(delta) < 1) return;
    }
    this.#unstick(swiper);
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

  #publishSlide(slide) {
    if (this.#silent || !slide) return;
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
