(function () {
  const script = document.currentScript;
  if (script && script.src) {
    const href = script.src.replace(/demo-form\.js(?=[?#]|$)/, "demo-form.css");
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.append(link);
    }
  }

  let bundle = null;
  let bundleTask = null;

  function loadBundle() {
    if (bundle) return Promise.resolve(bundle);
    if (!bundleTask) {
      const formsUrl = new URL("data/forms.json?v=6", document.baseURI);
      const copyUrl = new URL("data/form-copy.json?v=6", document.baseURI);
      bundleTask = Promise.all([
        fetch(formsUrl).then((response) => response.json()),
        fetch(copyUrl).then((response) => response.json()),
      ]).then(([forms, copy]) => {
        bundle = { forms, copy };
        return bundle;
      }).catch((error) => {
        bundleTask = null;
        throw error;
      });
    }
    return bundleTask;
  }

  const DEMO_PROPS = [
    "--demo-fill",
    "--demo-fill-hover",
    "--demo-fill-pressed",
    "--demo-fill-disabled",
    "--demo-ink",
    "--demo-ink-hover",
    "--demo-ink-pressed",
    "--demo-ink-disabled",
    "--demo-icon",
    "--demo-icon-hover",
    "--demo-icon-pressed",
    "--demo-icon-disabled",
    "--demo-border",
    "--demo-border-hover",
    "--demo-border-pressed",
    "--demo-border-disabled",
  ];

  function tokenVar(name) {
    return `var(--color-${name.replaceAll("/", "-")})`;
  }

  function paintAction(node, color, style) {
    for (const prop of DEMO_PROPS) node.style.removeProperty(prop);
    const set = (prop, value) => node.style.setProperty(prop, value);
    const surface = (layer, state) => tokenVar(`surface/${color}/${layer}/${state}`);
    if (style === "no-surface" || style === "outline") {
      set("--demo-fill", "transparent");
      set("--demo-fill-disabled", "transparent");
      set("--demo-fill-hover", surface("transparent", "hover"));
      set("--demo-fill-pressed", surface("transparent", "active"));
    } else {
      set("--demo-fill", surface(style, "default"));
      set("--demo-fill-hover", surface(style, "hover"));
      set("--demo-fill-pressed", surface(style, "active"));
      set("--demo-fill-disabled", surface(style, "disabled"));
    }
    const ghost = style === "transparent" || style === "no-surface" || style === "outline";
    const foreground = (scope, state) => {
      if (state === "disabled") {
        if (!ghost || color === "neutral") return `${scope}/core/disabled`;
        return `${scope}/${color}/disabled`;
      }
      if (style === "solid") return `${scope}/core/on-solid`;
      if (style === "faded" || color === "neutral") {
        return scope === "text" ? "text/core/primary" : "icon-shape/core/default";
      }
      return `${scope}/${color}/default`;
    };
    const ink = tokenVar(foreground("text", "default"));
    const icon = tokenVar(foreground("icon-shape", "default"));
    const inkDisabled = tokenVar(foreground("text", "disabled"));
    const iconDisabled = tokenVar(foreground("icon-shape", "disabled"));
    for (const prop of ["--demo-ink", "--demo-ink-hover", "--demo-ink-pressed"]) set(prop, ink);
    set("--demo-ink-disabled", inkDisabled);
    for (const prop of ["--demo-icon", "--demo-icon-hover", "--demo-icon-pressed"]) set(prop, icon);
    set("--demo-icon-disabled", iconDisabled);
    if (style === "outline") {
      const border = tokenVar(`border/${color}/default`);
      const borderDisabled = tokenVar(`border/${color}/disabled`);
      set("--demo-border", border);
      set("--demo-border-hover", border);
      set("--demo-border-pressed", border);
      set("--demo-border-disabled", borderDisabled);
      return;
    }
    set("--demo-border", "transparent");
    set("--demo-border-hover", "transparent");
    set("--demo-border-pressed", "transparent");
    set("--demo-border-disabled", "transparent");
  }

  class DemoForm extends HTMLElement {
    static get observedAttributes() {
      return ["template", "lang"];
    }

    constructor() {
      super();
      this._forms = null;
      this._copy = null;
      this._template = null;
      this._templateId = "";
      this._controls = new Map();
      this._meta = new Map();
      this._actions = [];
      this._snapshot = {};
      this._wired = false;
    }

    connectedCallback() {
      if (!this._wired) {
        this._wired = true;
        this.addEventListener("input", () => this._onEdit());
        this.addEventListener("cc-change", () => this._onEdit());
      }
      if (this._forms && this._copy) this._render();
      else {
        loadBundle().then((data) => {
          this._forms = data.forms;
          this._copy = data.copy;
          if (this.isConnected) this._render();
        }).catch(() => {});
      }
    }

    attributeChangedCallback(name) {
      if (!this.isConnected) return;
      if (name !== "template" && name !== "lang") return;
      this._render();
    }

    _lang() {
      return this.getAttribute("lang") === "ru" ? "ru" : "en";
    }

    _mask(kind) {
      const ru = this._lang() === "ru";
      if (kind === "date") return ru ? "ДД.ММ.ГГГГ" : "DD.MM.YYYY";
      if (kind === "time") return ru ? "ЧЧ:ММ" : "HH:MM";
      return "";
    }

    _text(key) {
      const row = key && this._copy ? this._copy[key] : null;
      if (!row || typeof row !== "object") return "";
      const value = row[this._lang()];
      if (value == null || value === "") {
        const fallback = row.en;
        return fallback == null ? "" : String(fallback);
      }
      return String(value);
    }

    _render() {
      if (!this._forms || !this._copy) return;
      const nextId = this.getAttribute("template") || "";
      const template = (this._forms.templates || []).find((item) => item.id === nextId) || null;
      const keep = Boolean(template) && this._templateId === nextId && this._controls.size > 0;
      const kept = keep ? this._capture() : null;
      const keptSnapshot = keep ? this._snapshot : null;
      this._template = template;
      this._templateId = template ? nextId : "";
      this.replaceChildren();
      this._controls = new Map();
      this._meta = new Map();
      this._actions = [];
      if (!template) {
        this._snapshot = {};
        return;
      }
      for (const block of template.sections || []) {
        const section = document.createElement("form-section");
        if (block.titleKey) section.setAttribute("title", this._text(block.titleKey));
        const content = document.createElement("div");
        content.className = "form-section__content";
        if (block.descriptionKey) {
          const description = document.createElement("p");
          description.className = "form-section__description";
          description.textContent = this._text(block.descriptionKey);
          content.append(description);
        }
        const body = document.createElement("div");
        body.className = "form-section__body";
        for (const row of block.rows || []) {
          const line = document.createElement("div");
          line.className = "form-section__row";
          if (row.length > 1) line.classList.add("is-pair");
          for (const spec of row) line.append(this._makeControl(spec));
          body.append(line);
        }
        content.append(body);
        section.append(content);
        this.append(section);
      }
      const footer = document.createElement("div");
      footer.className = "demo-form__footer";
      const actions = this._ranked(template.actions);
      const dismiss = actions.filter((action) => action.id === "cancel" || action.id === "reset").length;
      if (actions.length === 2 && dismiss === 1) footer.classList.add("is-pair");
      for (const action of actions) footer.append(this._makeButton(action));
      this.append(footer);
      if (kept) {
        for (const [id, value] of Object.entries(kept)) this._write(id, value);
        this._snapshot = keptSnapshot || {};
      } else {
        this._snapshot = this._capture();
      }
      this._onEdit();
    }

    _makeControl(spec) {
      const field = spec.component !== "select";
      const node = document.createElement(field ? "demo-field" : "cc-select");
      if (field) node.setAttribute("kind", spec.kind || "field-standard");
      else node.setAttribute("type", spec.kind || "large");
      if (spec.labelKey) node.setAttribute("label", this._text(spec.labelKey));
      if (spec.ariaKey) node.setAttribute("aria-label", this._text(spec.ariaKey));
      if (spec.hint || spec.hintKey) {
        node.setAttribute("show-hint", "");
        node.setAttribute("hint", spec.hintKey ? this._text(spec.hintKey) : "");
      }
      if (spec.placeholderKey) {
        node.setAttribute("show-placeholder", "");
        node.setAttribute("placeholder", this._text(spec.placeholderKey));
      }
      if (spec.mask) node.setAttribute("mask", this._mask(spec.mask));
      if (spec.tipKey) node.setAttribute("tip", this._text(spec.tipKey));
      if (spec.required) node.setAttribute("show-required", "");
      if (spec.suffixKey) {
        node.setAttribute("show-suffix", "");
        node.setAttribute("suffix", this._text(spec.suffixKey));
      }
      if (spec.icon) {
        node.setAttribute("show-icon", "");
        node.setAttribute("icon", spec.icon);
      }
      if (spec.showLabel) node.setAttribute("show-label", "");
      if (spec.input) node.setAttribute("input", spec.input);
      if (spec.digits) node.setAttribute("digits", "");
      if (spec.trailing) {
        node.setAttribute("show-trailing", "");
        node.setAttribute("trailing", spec.trailing);
      }
      if (!field && Array.isArray(spec.options)) {
        node.options = spec.options.map((option) => {
          const item = { value: option.value, label: option.labelKey ? this._text(option.labelKey) : "" };
          if (option.icon) item.icon = option.icon;
          return item;
        });
      }
      if (spec.values != null) node.values = spec.values;
      else if (spec.value != null) {
        if (field) node.value = spec.value;
        else node.setAttribute("value", String(spec.value));
      }
      this._controls.set(spec.id, node);
      this._meta.set(spec.id, {
        required: Boolean(spec.required),
        enableWhen: spec.enableWhen || null,
        hint: spec.hintKey ? this._text(spec.hintKey) : "",
        showHint: Boolean(spec.hint || spec.hintKey),
        min: Number.isFinite(spec.min) ? spec.min : null,
        max: Number.isFinite(spec.max) ? spec.max : null,
      });
      return node;
    }

    _ranked(actions) {
      const rank = (action) => {
        if (action.style === "solid") return 2;
        if (action.color === "accent") return 1;
        return 0;
      };
      return [...(actions || [])].sort((left, right) => rank(left) - rank(right));
    }

    _toastHost() {
      return this.closest(".buttons-play") || this;
    }

    _toastNode() {
      const host = this._toastHost();
      let toast = host.querySelector(":scope > .form-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "form-toast";
        toast.setAttribute("role", "status");
        toast.hidden = true;
        host.append(toast);
      }
      return toast;
    }

    _showToast(kind, text) {
      const toast = this._toastNode();
      toast.dataset.kind = kind;
      toast.textContent = text;
      toast.hidden = false;
      toast.classList.remove("is-in");
      void toast.offsetWidth;
      toast.classList.add("is-in");
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.hidden = true;
        toast.classList.remove("is-in");
      }, 2000);
    }

    _toastKey(action) {
      const keys = {
        create: "form.toast.create",
        add: "form.toast.add",
        "save-and-add": "form.toast.saveAndAdd",
        apply: "form.toast.apply",
        reset: "form.toast.reset",
        "set-default": "form.toast.setDefault",
        cancel: "form.toast.cancel",
        delete: "form.toast.delete",
      };
      return keys[action.id] || "";
    }

    _makeButton(action) {
      const button = document.createElement("demo-button");
      button.setAttribute("kind", "labeled-button");
      button.setAttribute("size", "medium");
      button.setAttribute("quiet", "");
      button.setAttribute("label", this._text(action.labelKey));
      paintAction(button, action.color, action.style);
      button.addEventListener("click", () => {
        if (button.hasAttribute("disabled")) return;
        this._activate(action);
      });
      this._actions.push({ action, button });
      return button;
    }

    _count(value) {
      const text = String(value);
      const grouped = text.replace(/\B(?=(\d{3})+(?!\d))/g, this._lang() === "ru" ? "\u00A0" : ",");
      return grouped;
    }

    _bound(key, value) {
      return this._text(key).replaceAll("{n}", this._count(value));
    }

    _setFault(node, kind, text) {
      const meta = [...this._meta.entries()].find((entry) => entry[1] && this._controls.get(entry[0]) === node);
      node.dataset.fault = kind;
      node.setAttribute("state", "error");
      if (meta && meta[1].showHint) node.setAttribute("hint", text);
    }

    _clearFault(id) {
      const node = this._controls.get(id);
      const meta = this._meta.get(id);
      if (!node || !meta) return;
      delete node.dataset.fault;
      if (node.getAttribute("state") === "error") node.removeAttribute("state");
      if (meta.showHint) node.setAttribute("hint", meta.hint);
    }

    _activate(action) {
      if (action.enables === "valid") {
        this._markRequired();
        this._checkRanges();
        if (!this._valid() || this._hasFault()) {
          const key = this._valid() ? "form.toast.invalid" : "form.toast.required";
          this._showToast("danger", this._text(key));
          return;
        }
      }
      this._clearFaults();
      if (action.id === "reset") {
        for (const [id, value] of Object.entries(this._snapshot)) this._write(id, value);
      } else if (action.applies === "preset" && this._template && this._template.preset) {
        for (const [id, value] of Object.entries(this._template.preset)) this._write(id, value);
      }
      if (Array.isArray(action.clears)) {
        for (const id of action.clears) this._clear(id);
      }
      this._onEdit();
      const done = this._toastKey(action);
      if (done) this._showToast("default", this._text(done));
    }

    _read(node) {
      if (node.localName === "cc-select") {
        if (node.getAttribute("type") === "multiple-values") return node.values.slice();
        return node.getAttribute("value") || "";
      }
      if (node.getAttribute("kind") === "field-with-chips") {
        return { chips: node.values.slice(), text: node.value };
      }
      return node.value;
    }

    _capture() {
      const data = {};
      for (const [id, node] of this._controls) data[id] = this._read(node);
      return data;
    }

    _write(id, value) {
      const node = this._controls.get(id);
      if (!node) return;
      if (node.localName === "cc-select" && node.getAttribute("type") === "multiple-values") {
        node.values = Array.isArray(value) ? value : [];
        return;
      }
      if (node.localName === "cc-select") {
        node.setAttribute("value", value == null ? "" : String(value));
        return;
      }
      if (node.getAttribute("kind") === "field-with-chips") {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          node.values = Array.isArray(value.chips) ? value.chips : [];
          node.value = value.text == null ? "" : String(value.text);
          return;
        }
        if (Array.isArray(value)) {
          node.values = value;
          node.value = "";
          return;
        }
        node.values = [];
        node.value = value == null ? "" : String(value);
        return;
      }
      node.value = value == null ? "" : String(value);
    }

    _clear(id) {
      const node = this._controls.get(id);
      if (!node) return;
      if (node.localName === "cc-select" && node.getAttribute("type") === "multiple-values") {
        node.values = [];
        return;
      }
      if (node.localName === "cc-select") {
        node.setAttribute("value", "");
        return;
      }
      if (node.getAttribute("kind") === "field-with-chips") {
        node.values = [];
        node.value = "";
        return;
      }
      node.value = "";
    }

    _filled(value) {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === "object") {
        const chips = Array.isArray(value.chips) ? value.chips : [];
        return chips.length > 0 || String(value.text || "").length > 0;
      }
      return String(value == null ? "" : value).length > 0;
    }

    _same(left, right) {
      if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
        return left.every((item, index) => item === right[index]);
      }
      if (left && right && typeof left === "object" && typeof right === "object") {
        return this._same(left.chips, right.chips) && left.text === right.text;
      }
      return left === right;
    }

    _scalar(node) {
      if (node.localName === "cc-select" && node.getAttribute("type") !== "multiple-values") {
        return node.getAttribute("value") || "";
      }
      if (node.getAttribute("kind") !== "field-with-chips") return node.value;
      return "";
    }

    _valid() {
      for (const [id, meta] of this._meta) {
        if (!meta.required) continue;
        const node = this._controls.get(id);
        if (!node || node.getAttribute("state") === "disabled") continue;
        if (!this._filled(this._read(node))) return false;
      }
      return true;
    }

    _dirty() {
      for (const [id, node] of this._controls) {
        if (!this._same(this._read(node), this._snapshot[id])) return true;
      }
      return false;
    }

    _applyGates() {
      for (const [id, meta] of this._meta) {
        if (!meta.enableWhen) continue;
        const node = this._controls.get(id);
        const other = this._controls.get(meta.enableWhen.id);
        if (!node) continue;
        const open = Boolean(other) && String(this._scalar(other)) === String(meta.enableWhen.equals);
        if (!open) node.setAttribute("state", "disabled");
        else if (node.getAttribute("state") === "disabled") node.removeAttribute("state");
      }
    }

    _markRequired() {
      for (const [id, meta] of this._meta) {
        const node = this._controls.get(id);
        if (!node || !meta.required || node.getAttribute("state") === "disabled") continue;
        if (this._filled(this._read(node))) {
          if (node.dataset.fault === "required") this._clearFault(id);
          continue;
        }
        this._setFault(node, "required", this._text("form.error.required"));
      }
    }

    _checkRanges() {
      for (const [id, meta] of this._meta) {
        if (meta.min == null && meta.max == null) continue;
        const node = this._controls.get(id);
        if (!node || node.getAttribute("state") === "disabled") continue;
        const raw = String(node.value == null ? "" : node.value).trim();
        if (!raw) {
          if (node.dataset.fault === "min" || node.dataset.fault === "max") this._clearFault(id);
          continue;
        }
        const value = Number(raw);
        if (!Number.isFinite(value)) continue;
        if (meta.min != null && value < meta.min) this._setFault(node, "min", this._bound("form.error.min", meta.min));
        else if (meta.max != null && value > meta.max) this._setFault(node, "max", this._bound("form.error.max", meta.max));
        else if (node.dataset.fault === "min" || node.dataset.fault === "max") this._clearFault(id);
      }
    }

    _hasFault() {
      for (const node of this._controls.values()) {
        if (node.getAttribute("state") === "disabled") continue;
        if (node.dataset.fault) return true;
      }
      return false;
    }

    _clearFaults() {
      for (const id of this._meta.keys()) {
        const node = this._controls.get(id);
        if (node && node.dataset.fault) this._clearFault(id);
      }
    }

    _clearFilledErrors() {
      for (const [id] of this._meta) {
        const node = this._controls.get(id);
        if (!node || node.dataset.fault !== "required") continue;
        if (this._filled(this._read(node))) this._clearFault(id);
      }
    }

    _syncButtons() {
      const dirty = this._dirty();
      for (const entry of this._actions) {
        const mode = entry.action.enables;
        let on = true;
        if (mode === "dirty") on = dirty;
        if (on) entry.button.removeAttribute("disabled");
        else entry.button.setAttribute("disabled", "");
      }
    }

    _onEdit() {
      this._applyGates();
      this._checkRanges();
      this._clearFilledErrors();
      this._syncButtons();
    }
  }

  if (!customElements.get("demo-form")) customElements.define("demo-form", DemoForm);
})();
