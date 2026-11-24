import { applyColors, applyStyles, swatchColor } from "./apply-styles.js";
import { animate, calm, reduceMotion, crossfade, playNumber, whenSettled } from "./motion.js?v=4";

const root = document.documentElement;
const page = document.querySelector(".page");
const scrollRoot = document.querySelector(".page-scroll");
const familyRow = document.querySelector(".family-row");
const collectionSelect = document.querySelector("#collection-select");
const brandSelect = document.querySelector("#brand-select");
const themeSwitch = document.querySelector("#theme-switch");
const menuButton = document.querySelector(".menu-button");
const sidebar = document.querySelector("#sidebar");
const menuSlot = document.querySelector("#sidebar-menu");
const scrollY = document.querySelector("#scroll-y");
const scrollX = document.querySelector("#scroll-x");
const sidebarScroll = document.querySelector("#sidebar-scroll");
const buttonsScreen = document.querySelector(".buttons-screen");
const buttonClassSelect = document.querySelector("#button-class");
const buttonSizeSelect = document.querySelector("#button-size");
const buttonColorSelect = document.querySelector("#button-color");
const buttonStyleSelect = document.querySelector("#button-style");
const buttonBadgeSelect = document.querySelector("#button-badge-color");
const buttonIconRow = document.querySelector("#button-row-icon");
const buttonShowDisabled = document.querySelector("#button-show-disabled");
const buttonShowIcon = document.querySelector("#button-show-icon");
const buttonShowBadge = document.querySelector("#button-show-badge");
const buttonsCaption = document.querySelector("#buttons-caption");
const buttonsScroll = document.querySelector("#buttons-scroll");
const demoButton = document.getElementById("demo-button");
const buttonsFigma = document.querySelector("#buttons-figma");

const styles = await fetch(new URL("../data/styles.json?v=6", import.meta.url)).then((response) => response.json());
const collections = await fetch(new URL("../data/collections.json?v=8", import.meta.url)).then((response) => response.json());
const sizeDoc = await fetch(new URL("../data/size.json?v=2", import.meta.url)).then((response) => response.json());
const typeDoc = await fetch(new URL("../data/typography.json?v=2", import.meta.url)).then((response) => response.json());
const shadowDoc = await fetch(new URL("../data/shadow.json?v=1", import.meta.url)).then((response) => response.json());
const copy = await fetch(new URL("../data/copy.json?v=2", import.meta.url)).then((response) => response.json());

applyStyles(styles);

let collection = collections.defaults.collection;
let brand = collections.defaults.brand;
let theme = collections.defaults.theme;
let shadowHover = false;
const remembered = { brand, theme };

function copyText(key) {
  const entry = copy[key];
  if (entry && typeof entry === "object" && "value" in entry) return String(entry.value);
  return entry == null ? "" : String(entry);
}

function channel(value) {
  return Math.max(0, Math.min(255, Math.round(Number(value)))).toString(16).padStart(2, "0");
}

function hexAlpha(input) {
  const color = String(input || "").trim();
  const mark = "#";
  if (color.startsWith(mark)) {
    let body = color.slice(1);
    if (body.length === 3 || body.length === 4) body = body.split("").map((part) => part + part).join("");
    if (body.length === 6) body += "ff";
    if (body.length === 8) return `${mark}${body.toUpperCase()}`;
  }
  const fn = "rgb";
  const match = color.match(new RegExp(`^${fn}a?\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*(?:,\\s*([\\d.]+)\\s*)?\\)$`, "i"));
  if (!match) return color;
  const alpha = match[4] == null ? 255 : Math.round(Number(match[4]) * 255);
  return `${mark}${channel(match[1])}${channel(match[2])}${channel(match[3])}${channel(alpha)}`.toUpperCase();
}

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function familyId(name) {
  return `family-${slug(name)}`;
}

function subgroupId(family, middle) {
  return `sub-${slug(family)}-${slug(middle)}`;
}

function rowId(name) {
  return `row-${slug(name)}`;
}

function activeTokens() {
  if (collection === "primitives") return collections.primitives;
  if (collection === "semantic") return collections.semantic;
  return [];
}

function measureDoc() {
  if (collection === "size") return sizeDoc;
  if (collection === "typography") return typeDoc;
  if (collection === "shadow") return shadowDoc;
  return null;
}

function stackedLayout() {
  return root.classList.contains("is-narrow") || collection === "size" || collection === "typography" || collection === "shadow";
}

function familyHead(parts) {
  if (parts[0] === "surface" && parts.length >= 2) return 2;
  return 1;
}

function groupTokens(tokens) {
  const families = new Map();
  for (const token of tokens) {
    const parts = token.name.split("/").filter(Boolean);
    const nest = parts[0] === "white" || parts[0] === "black";
    const head = familyHead(parts);
    const core = parts[0] === "surface" && parts[1] === "core";
    const familyName = nest ? "neutral" : core ? "surface/neutral" : parts.slice(0, head).join("/") || token.name;
    if (!families.has(familyName)) {
      families.set(familyName, { name: familyName, sections: [], byMiddle: new Map() });
    }
    const family = families.get(familyName);
    const rest = nest ? [parts[0], parts[parts.length - 1]] : core ? ["core", parts[parts.length - 1]] : parts.slice(head);
    const middle = rest.length >= 2 ? rest.slice(0, -1).join("/") : "";
    let section = family.byMiddle.get(middle);
    if (!section) {
      section = { middle, rows: [] };
      family.byMiddle.set(middle, section);
      family.sections.push(section);
    }
    const step = rest[rest.length - 1] || token.name;
    const hueStep = (familyName === "decorative" || familyName === "additional") && middle;
    section.rows.push({ token, rowName: hueStep ? `${middle}/${step}` : step });
  }
  const ordered = [...families.values()];
  ordered.sort((left, right) => {
    const leftSurface = left.name.startsWith("surface/");
    const rightSurface = right.name.startsWith("surface/");
    if (leftSurface === rightSurface) return 0;
    return leftSurface ? -1 : 1;
  });
  return orderPrimitives(ordered);
}

function orderPrimitives(families) {
  if (collection !== "primitives") return families;
  const order = ["neutral", "status", "brand-blue", "brand-cyan", "additional"];
  const rank = (name) => {
    const index = order.indexOf(name);
    return index < 0 ? order.length : index;
  };
  return [...families].sort((left, right) => rank(left.name) - rank(right.name));
}

function familyTitle(name) {
  return name;
}

let primitiveByColor = null;

function colorKey(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function primitiveNameFor(swatch) {
  if (!primitiveByColor) {
    primitiveByColor = new Map();
    for (const token of collections.primitives) {
      const raw = token.value && typeof token.value === "object" && "value" in token.value ? token.value.value : token.value;
      const key = colorKey(raw);
      if (!primitiveByColor.has(key)) primitiveByColor.set(key, []);
      primitiveByColor.get(key).push(token.name);
    }
  }
  const names = primitiveByColor.get(colorKey(swatch)) || [];
  if (!names.length) return "";
  const prefix = brand === "brand-cyan" ? "brand-cyan/" : "brand-blue/";
  return names.find((name) => name.startsWith(prefix)) || names[0];
}

function shownAlias(token) {
  const alias = token.alias || "";
  if (!alias.startsWith("colors/")) return alias;
  return primitiveNameFor(swatchColor(token, collection, brand, theme)) || alias;
}

function lightPrefix(family, middle) {
  if (collection !== "primitives" || !middle) return false;
  const path = `${family}/${middle}`;
  return collections.lightInsetPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function menuTarget(parts, families) {
  if (parts[0] === "surface" && parts.length === 1) {
    const first = families.find((item) => item.name.startsWith("surface/"));
    return first ? familyId(first.name) : "";
  }
  const head = familyHead(parts);
  const family = families.find((item) => item.name === parts.slice(0, head).join("/"));
  if (!family) return "";
  if (parts.length <= head) return familyId(family.name);
  const joined = parts.join("/");
  for (const section of family.sections) {
    for (const row of section.rows) {
      if (row.token.name === joined) return rowId(row.token.name);
    }
  }
  const middle = parts.slice(head).join("/");
  const exact = family.byMiddle.get(middle);
  if (exact && exact.middle) return subgroupId(family.name, exact.middle);
  const match = family.sections.find((section) => section.middle === middle || section.middle.startsWith(`${middle}/`));
  if (match && match.middle) return subgroupId(family.name, match.middle);
  return familyId(family.name);
}

function menuPath(parts) {
  if (parts[0] === "white" || parts[0] === "black") return ["neutral", parts[0]];
  if (parts[0] === "surface" && parts[1] === "core") return ["surface", "neutral", "core"];
  const head = familyHead(parts);
  const rest = parts.slice(head);
  if (rest.length < 2) return parts.slice(0, head);
  return parts.slice(0, -1);
}

function buildMenu(tokens, families) {
  const root = { children: new Map() };
  for (const token of tokens) {
    const parts = menuPath(token.name.split("/").filter(Boolean));
    let level = root.children;
    const acc = [];
    for (const part of parts) {
      acc.push(part);
      if (!level.has(part)) {
        level.set(part, { segment: part, path: acc.slice(), children: new Map() });
      }
      level = level.get(part).children;
    }
  }

  const mount = (nodes, parent, depth) => {
    for (const node of nodes.values()) {
      const item = document.createElement("cc-menu-item");
      item.setAttribute("label", node.segment);
      item.setAttribute("depth", String(depth));
      item.setAttribute("expanded", "true");
      if (!node.children.size) item.setAttribute("leaf", "");
      item.dataset.target = menuTarget(node.path, families);
      parent.append(item);
      if (node.children.size) mount(node.children, item, depth + 1);
    }
  };

  menuSlot.replaceChildren();
  mount(root.children, menuSlot, 0);
}

function renderFamilies(families) {
  familyRow.parentElement.querySelectorAll(".family-titles").forEach((node) => node.remove());
  const titles = document.createElement("div");
  titles.className = "family-titles";
  familyRow.before(titles);
  familyRow.replaceChildren();
  for (const family of families) {
    const card = document.createElement("cc-family");
    card.setAttribute("title", familyTitle(family.name));
    card.setAttribute("heading-id", familyId(family.name));
    if (family.name === "decorative" || family.name === "additional") {
      const hues = family.sections.filter((section) => section.middle && section.rows.some((row) => row.token.name.endsWith("/100")));
      if (hues.length) {
        const carousel = document.createElement("cc-color-carousel");
        carousel.colors = hues.map((section) => {
          const sample = section.rows.find((row) => row.token.name.endsWith("/100"));
          return {
            id: section.middle,
            color: swatchColor(sample.token, collection, brand, theme),
          };
        });
        carousel.setAttribute("value", hues[0].middle);
        card.append(carousel);
      }
    }
    const sections = family.sections;
    sections.forEach((section, index) => {
      const light = lightPrefix(family.name, section.middle);
      const rows = section.rows.map((row) => {
        const item = document.createElement("cc-color-row");
        item.id = rowId(row.token.name);
        item.name = row.rowName;
        const swatch = swatchColor(row.token, collection, brand, theme);
        item.alias = collection === "primitives" ? hexAlpha(swatch) : shownAlias(row.token);
        item.description = row.token.description || "";
        item.swatch = swatch;
        return item;
      });
      const lastSection = index === sections.length - 1;
      if (rows.length && (section.middle || lastSection)) rows[rows.length - 1].dataset.last = "true";
      if (section.middle) {
        const group = document.createElement("cc-subgroup");
        group.id = subgroupId(family.name, section.middle);
        group.setAttribute("label", section.middle);
        card.append(group);
        for (const item of rows) group.append(item);
        if (light) {
          group.dataset.tone = "light";
          applyColors(styles, collections, "brand-blue", "light", group);
        }
      } else {
        for (const item of rows) card.append(item);
      }
    });
    const cell = document.createElement("div");
    cell.className = "family-title-cell";
    titles.append(cell);
    familyRow.append(card);
    for (const group of card.querySelectorAll('cc-subgroup[data-tone="light"]')) {
      const panel = group.querySelector(".cc-subgroup__panel");
      panel.classList.add("tone-light");
      applyColors(styles, collections, "brand-blue", "light", panel);
      group.style.cssText = "";
      for (const row of panel.querySelectorAll("cc-color-row")) {
        const swatch = row.getAttribute("swatch");
        row.removeAttribute("swatch");
        if (swatch != null) row.setAttribute("swatch", swatch);
      }
    }
    const title = card.querySelector(":scope > .cc-family-title");
    if (title) cell.append(title);
    const carousel = card.querySelector(":scope > cc-color-carousel");
    if (carousel) {
      const show = () => showHue(card, carousel.getAttribute("value"));
      carousel.addEventListener("cc-change", show);
      show();
    }
  }
  const end = document.createElement("div");
  end.className = "family-row-end";
  end.setAttribute("aria-hidden", "true");
  familyRow.append(end);
  titles.append(end.cloneNode(true));
  placeFamilyTitles();
}

function sizeRow(family, token) {
  const item = document.createElement("cc-size-row");
  item.id = rowId(token.name);
  item.label = token.label;
  item.kind = family.kind;
  item.amount = String(token.value);
  item.description = token.description || "";
  return item;
}

function shadowRow(token) {
  const item = document.createElement("cc-shadow-row");
  item.id = rowId(token.name);
  item.label = token.label;
  item.description = token.description || "";
  item.setAttribute("tip", "above");
  item.style.setProperty("--shadow-sample", `var(--shadow-${token.token})`);
  if (shadowHover) item.dataset.rest = "hover";
  return item;
}

function typeRow(token) {
  const item = document.createElement("cc-type-row");
  item.id = rowId(token.name);
  item.sample = token.sample;
  item.caption = token.caption;
  item.weight = String(token.weight);
  item.size = String(token.size);
  item.line = String(token.lineHeight);
  item.tracking = String(token.letterSpacing);
  item.description = token.description || "";
  return item;
}

function renderMeasure(doc) {
  familyRow.parentElement.querySelectorAll(".family-titles").forEach((node) => node.remove());
  familyRow.replaceChildren();
  if (collection === "shadow") familyRow.append(shadowSwitch());
  for (const family of doc.families) {
    const card = document.createElement("cc-family");
    card.setAttribute("title", family.title);
    card.setAttribute("heading-id", familyId(family.id));
    for (const token of family.tokens) {
      if (collection === "size") card.append(sizeRow(family, token));
      else if (collection === "shadow") card.append(shadowRow(token));
      else card.append(typeRow(token));
    }
    familyRow.append(card);
  }
}

function shadowSwitch() {
  const item = document.createElement("cc-switcher-end");
  item.setAttribute("label", copyText("shadow.hover"));
  if (shadowHover) item.setAttribute("selected", "");
  item.addEventListener("cc-change", (event) => {
    shadowHover = Boolean(event.detail && event.detail.selected);
    if (shadowHover) item.setAttribute("selected", "");
    else item.removeAttribute("selected");
    for (const row of familyRow.querySelectorAll("cc-shadow-row")) {
      if (shadowHover) row.dataset.rest = "hover";
      else delete row.dataset.rest;
    }
  });
  return item;
}

function buildMeasureMenu(doc) {
  menuSlot.replaceChildren();
  for (const family of doc.families) {
    const item = document.createElement("cc-menu-item");
    item.setAttribute("label", family.title);
    item.setAttribute("depth", "0");
    item.setAttribute("expanded", "true");
    item.setAttribute("leaf", "");
    item.dataset.target = familyId(family.id);
    menuSlot.append(item);
  }
}

function placeFamilyTitles() {
  const titles = familyRow.previousElementSibling;
  if (!titles || !titles.classList.contains("family-titles")) return;

  const narrow = stackedLayout();
  const cards = [...familyRow.querySelectorAll(":scope > cc-family")];
  const cells = [...titles.querySelectorAll(":scope > .family-title-cell")];
  cards.forEach((card, index) => {
    const id = card.getAttribute("heading-id");
    const title = id ? document.getElementById(id) : null;
    const home = narrow ? card : cells[index];
    if (!title || !home || title.parentElement === home) return;
    if (narrow) home.prepend(title);
    else home.append(title);
  });
}

function showHue(card, id) {
  const carousel = card.querySelector("cc-color-carousel");
  for (const group of card.querySelectorAll("cc-subgroup")) {
    const match = group.getAttribute("label") === id;
    if (match && carousel) {
      const head = group.querySelector(".cc-subgroup__head");
      if (head && carousel.parentElement !== head) head.append(carousel);
    }
    group.hidden = !match;
    const rows = [...group.querySelectorAll("cc-color-row")];
    rows.forEach((row, index) => {
      if (match && index === rows.length - 1) row.dataset.last = "true";
      else delete row.dataset.last;
    });
  }
  stickFamilies();
}

function placeChrome() {
  const narrow = root.classList.contains("is-narrow");
  const semantic = collection === "semantic";
  const buttons = collection === "buttons";
  const themed = semantic || collection === "shadow" || buttons;
  themeSwitch.hidden = !themed;
  brandSelect.hidden = !semantic;
  menuButton.hidden = buttons;
  if (!semantic) {
    closeSidebar();
    return;
  }
  if (narrow) {
    brandSelect.setAttribute("slot", "brand");
    sidebar.append(brandSelect);
  } else {
    brandSelect.removeAttribute("slot");
    themeSwitch.before(brandSelect);
    closeSidebar();
  }
}

function syncNarrow() {
  const limit = Number.parseFloat(getComputedStyle(root).getPropertyValue("--layout-breakpoint-narrow"));
  root.classList.toggle("is-narrow", window.innerWidth < limit);
  placeFamilyTitles();
  placeChrome();
  syncStacked();
}

function syncStacked() {
  const limit = Number.parseFloat(getComputedStyle(root).getPropertyValue("--layout-buttons-stack"));
  root.classList.toggle("is-stacked", collection === "buttons" && window.innerWidth < limit);
}

function stickFamilies() {
  const narrow = stackedLayout();
  const inset = Number.parseFloat(getComputedStyle(scrollRoot).paddingBottom) || 0;
  const view = scrollRoot.clientHeight;
  for (const card of familyRow.querySelectorAll(":scope > cc-family")) {
    if (narrow) {
      card.style.top = "";
      continue;
    }
    const room = view - card.offsetHeight - inset;
    const bar = familyRow.previousElementSibling;
    const barHeight = bar && bar.classList.contains("family-titles") ? bar.offsetHeight : 0;
    card.style.top = `${Math.min(barHeight, room)}px`;
  }
  stickCarousels();
}

function stickCarousels() {
  const narrow = root.classList.contains("is-narrow");
  const bar = familyRow.previousElementSibling;
  const wideTop = !narrow && bar && bar.classList.contains("family-titles") ? bar.offsetHeight : 0;
  for (const card of familyRow.querySelectorAll(":scope > cc-family")) {
    const title = card.querySelector(":scope > .cc-family-title");
    const top = narrow && title ? title.offsetHeight : wideTop;
    for (const head of card.querySelectorAll(".cc-subgroup__head")) {
      if (!head.querySelector("cc-color-carousel")) continue;
      head.style.top = `${top}px`;
    }
  }
}

function paint(fade) {
  const draw = () => {
    const chromeBrand = collection === "semantic" ? brand : "brand-blue";
    const chromeTheme = collection === "semantic" || collection === "shadow" || collection === "buttons" ? theme : "dark";
    applyColors(styles, collections, chromeBrand, chromeTheme);
    page.dataset.collection = collection;
    const buttons = collection === "buttons";
    buttonsScreen.hidden = !buttons;
    if (buttons) {
      syncDemo();
    } else {
      const doc = measureDoc();
      if (doc) {
        renderMeasure(doc);
        buildMeasureMenu(doc);
      } else {
        const tokens = activeTokens();
        const families = groupTokens(tokens);
        renderFamilies(families);
        buildMenu(tokens, families);
      }
    }
    placeChrome();
    syncStacked();
    if (buttons) {
      syncButtonsScroll();
    } else {
      scrollY.target = scrollRoot;
      scrollX.target = scrollRoot;
      const menu = sidebar.querySelector(".menu");
      if (menu) sidebarScroll.target = menu;
      stickFamilies();
    }
  };
  if (fade === "page") crossfade(page, draw);
  else if (fade === "content") crossfade(scrollRoot, draw);
  else draw();
}

let sidebarToken = 0;

function sidebarParts() {
  return {
    scrim: sidebar.querySelector(".scrim"),
    panel: sidebar.querySelector(".panel"),
  };
}

function stopSidebarMotion() {
  const { scrim, panel } = sidebarParts();
  for (const node of [scrim, panel]) {
    if (!node) continue;
    node.getAnimations().forEach((animation) => animation.cancel());
  }
}

function clearSidebarMotion() {
  stopSidebarMotion();
  const { scrim, panel } = sidebarParts();
  if (scrim) scrim.style.opacity = "";
  if (panel) panel.style.transform = "";
}

function whenSidebarSettles() {
  const { scrim, panel } = sidebarParts();
  return Promise.all([whenSettled(scrim), whenSettled(panel)]);
}

function openSidebar() {
  const token = ++sidebarToken;
  sidebar.setAttribute("open", "");
  scrollRoot.classList.add("is-locked");
  stopSidebarMotion();
  const { scrim, panel } = sidebarParts();
  if (!scrim || !panel || reduceMotion()) return;
  animate(scrim, { opacity: [0, 1] }, calm);
  animate(panel, { x: ["-100%", "0%"] }, calm);
  whenSidebarSettles().then(() => {
    if (token !== sidebarToken) return;
  });
}

function closeSidebar() {
  const token = ++sidebarToken;
  scrollRoot.classList.remove("is-locked");
  if (!sidebar.hasAttribute("open")) return;
  stopSidebarMotion();
  const { scrim, panel } = sidebarParts();
  if (!scrim || !panel || reduceMotion()) {
    sidebar.removeAttribute("open");
    clearSidebarMotion();
    return;
  }
  animate(scrim, { opacity: 0 }, calm);
  animate(panel, { x: "-100%" }, calm);
  whenSidebarSettles().then(() => {
    if (token !== sidebarToken) return;
    sidebar.removeAttribute("open");
    clearSidebarMotion();
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function flowPoint(node) {
  let top = 0;
  let left = 0;
  let current = node;
  while (current && current !== scrollRoot) {
    top += current.offsetTop;
    left += current.offsetLeft;
    const parent = current.offsetParent;
    if (!(parent instanceof HTMLElement)) break;
    current = parent;
  }
  return { top, left, width: node.offsetWidth };
}

function scrollAnchor(target) {
  if (!target.classList.contains("cc-family-title") || !target.id) return target;
  const card = familyRow.querySelector(`cc-family[heading-id="${CSS.escape(target.id)}"]`);
  return card || target;
}

function scrollCover(target, anchor) {
  if (anchor === target) return Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const narrow = root.classList.contains("is-narrow");
  if (narrow) return Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const bar = familyRow.previousElementSibling;
  return bar && bar.classList.contains("family-titles") ? bar.offsetHeight : 0;
}

function scrollDuration(fromTop, toTop, fromLeft, toLeft) {
  const distance = Math.abs(toTop - fromTop) + Math.abs(toLeft - fromLeft);
  return Math.min(1.2, Math.max(0.85, 0.55 + distance / 2200));
}

function scrollToTarget(target) {
  const anchor = scrollAnchor(target);
  const point = flowPoint(anchor);
  const cover = scrollCover(target, anchor);
  const maxTop = Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight);
  const top = clamp(point.top - cover, 0, maxTop);
  let left = scrollRoot.scrollLeft;
  const view = scrollRoot.clientWidth;
  const start = point.left - left;
  const end = start + point.width;
  if (start < 0) left += start;
  else if (end > view) left += end - view;
  const maxLeft = Math.max(0, scrollRoot.scrollWidth - scrollRoot.clientWidth);
  left = clamp(left, 0, maxLeft);
  if (reduceMotion()) {
    scrollRoot.scrollTop = top;
    scrollRoot.scrollLeft = left;
    return;
  }
  const glide = { ease: "easeInOut", duration: scrollDuration(scrollRoot.scrollTop, top, scrollRoot.scrollLeft, left) };
  playNumber("scroll-top", scrollRoot.scrollTop, top, (value) => {
    scrollRoot.scrollTop = value;
  }, glide);
  playNumber("scroll-left", scrollRoot.scrollLeft, left, (value) => {
    scrollRoot.scrollLeft = value;
  }, glide);
}

menuButton.setAttribute("label", copyText("menu.open"));
themeSwitch.setAttribute("label-dark", copyText("theme.dark"));
themeSwitch.setAttribute("label-light", copyText("theme.light"));
themeSwitch.setAttribute("mode", theme);
sidebar.querySelector("cc-icon-button").setAttribute("label", copyText("menu.close"));

const collectionLabels = {
  primitives: "colors-primitive",
  semantic: "colors-semantic",
  size: "size",
  shadow: "shadow",
  typography: "typography",
};
collectionSelect.options = [
  { kind: "group", label: "token-collections" },
  ...collections.collectionOrder.map((id) => ({
    value: id,
    label: collectionLabels[id] || id,
  })),
  { kind: "group", label: "components-demo" },
  { value: "buttons", label: "buttons" },
];
collectionSelect.value = collection;
brandSelect.options = collections.brandOrder.slice();
brandSelect.value = brand;

collectionSelect.addEventListener("cc-change", (event) => {
  collection = event.detail.value;
  if (collection === "semantic" || collection === "shadow" || collection === "buttons") {
    theme = remembered.theme;
    themeSwitch.setAttribute("mode", theme);
  }
  if (collection === "semantic") {
    brand = remembered.brand;
    brandSelect.value = brand;
  }
  hideNoAccess();
  paint("content");
});

brandSelect.addEventListener("cc-change", (event) => {
  brand = event.detail.value;
  remembered.brand = brand;
  paint("page");
});

themeSwitch.addEventListener("cc-change", (event) => {
  theme = event.detail.mode;
  remembered.theme = theme;
  themeSwitch.setAttribute("mode", theme);
  paint("page");
});

menuButton.addEventListener("cc-press", () => {
  openSidebar();
});

sidebar.addEventListener("cc-close", closeSidebar);

menuSlot.addEventListener("cc-toggle", (event) => {
  const item = event.target.closest("cc-menu-item");
  if (!item) return;
  item.setAttribute("expanded", event.detail.expanded ? "true" : "false");
});

menuSlot.addEventListener("cc-navigate", (event) => {
  const item = event.target.closest("cc-menu-item");
  if (!item) return;
  for (const other of menuSlot.querySelectorAll("cc-menu-item")) other.removeAttribute("selected");
  item.setAttribute("selected", "");
  const target = document.getElementById(item.dataset.target);
  if (target) {
    const card = target.closest("cc-family");
    const group = target.closest("cc-subgroup");
    const carousel = card && card.querySelector("cc-color-carousel");
    if (carousel && group) {
      const id = group.getAttribute("label") || "";
      carousel.setAttribute("value", id);
      showHue(card, id);
    }
    scrollToTarget(target);
  }
  closeSidebar();
});

document.addEventListener("cc-open", (event) => {
  if (!(event.target instanceof HTMLElement) || event.target.localName !== "cc-select-small") return;
  for (const select of document.querySelectorAll("cc-select-small")) {
    if (select !== event.target) select.removeAttribute("open");
  }
});

const buttonState = {
  kind: "labeled-button",
  size: "large",
  color: "brand-blue",
  style: "solid",
  disabled: false,
  showIcon: true,
  showBadge: false,
  badgeColor: "danger",
  tab: "settings",
};

const buttonColors = ["brand-blue", "brand-cyan", "neutral", "danger", "success", "warning", "info"];
const semanticByName = new Map(collections.semantic.map((token) => [token.name, token]));
const demoProps = [
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
  "--demo-badge-fill",
  "--demo-badge-ink",
  "--demo-badge-dot",
  "--demo-badge-plate",
];

let docToken = 0;
let accessAnchor = null;

function toneFamily(color) {
  if (color === "brand-blue" || color === "brand-cyan") return "accent";
  return color;
}

function toneBrand(color) {
  return color === "brand-cyan" ? "brand-cyan" : "brand-blue";
}

function colorOf(name, brandKey) {
  const token = semanticByName.get(name);
  const band = token && token.values && token.values[brandKey];
  const raw = band && band[theme];
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && "value" in raw) return raw.value == null ? "" : String(raw.value);
  return String(raw);
}

function writeDemo(node, prop, value) {
  if (!value) return;
  node.style.setProperty(prop, value);
}

function paintDemo(node) {
  for (const prop of demoProps) node.style.removeProperty(prop);
  const family = toneFamily(buttonState.color);
  const brandKey = toneBrand(buttonState.color);
  const style = buttonState.style;
  const surface = (layer, state) => colorOf(`surface/${family}/${layer}/${state}`, brandKey);
  if (style === "no-surface" || style === "outline") {
    writeDemo(node, "--demo-fill", "transparent");
    writeDemo(node, "--demo-fill-disabled", "transparent");
    writeDemo(node, "--demo-fill-hover", surface("transparent", "hover"));
    writeDemo(node, "--demo-fill-pressed", surface("transparent", "active"));
  } else {
    writeDemo(node, "--demo-fill", surface(style, "default"));
    writeDemo(node, "--demo-fill-hover", surface(style, "hover"));
    writeDemo(node, "--demo-fill-pressed", surface(style, "active"));
    writeDemo(node, "--demo-fill-disabled", surface(style, "disabled"));
  }
  const ghost = style === "transparent" || style === "no-surface" || style === "outline";
  const foreground = (scope, state) => {
    if (state === "disabled") {
      if (!ghost || family === "neutral") return `${scope}/core/disabled`;
      return `${scope}/${family}/disabled`;
    }
    if (style === "solid") return `${scope}/core/on-solid`;
    if (style === "faded" || family === "neutral") {
      return scope === "text" ? "text/core/primary" : "icon-shape/core/default";
    }
    return `${scope}/${family}/default`;
  };
  const ink = colorOf(foreground("text", "default"), brandKey);
  const icon = colorOf(foreground("icon-shape", "default"), brandKey);
  const inkDisabled = colorOf(foreground("text", "disabled"), brandKey);
  const iconDisabled = colorOf(foreground("icon-shape", "disabled"), brandKey);
  for (const prop of ["--demo-ink", "--demo-ink-hover", "--demo-ink-pressed"]) writeDemo(node, prop, ink);
  writeDemo(node, "--demo-ink-disabled", inkDisabled);
  for (const prop of ["--demo-icon", "--demo-icon-hover", "--demo-icon-pressed"]) writeDemo(node, prop, icon);
  writeDemo(node, "--demo-icon-disabled", iconDisabled);
  if (style === "outline") {
    const border = colorOf(`border/${family}/default`, brandKey);
    const borderDisabled = colorOf(`border/${family}/disabled`, brandKey);
    writeDemo(node, "--demo-border", border);
    writeDemo(node, "--demo-border-hover", border);
    writeDemo(node, "--demo-border-pressed", border);
    writeDemo(node, "--demo-border-disabled", borderDisabled);
  } else {
    writeDemo(node, "--demo-border", "transparent");
    writeDemo(node, "--demo-border-hover", "transparent");
    writeDemo(node, "--demo-border-pressed", "transparent");
    writeDemo(node, "--demo-border-disabled", "transparent");
  }
  const badgeKey = toneBrand(buttonState.badgeColor);
  const badgeFamily = toneFamily(buttonState.badgeColor);
  writeDemo(node, "--demo-badge-plate", colorOf("surface/core/undertone", badgeKey));
  if (buttonState.badgeColor === "neutral") {
    writeDemo(node, "--demo-badge-fill", colorOf("surface/neutral/faded/default", "brand-blue"));
    writeDemo(node, "--demo-badge-ink", colorOf("text/core/primary", "brand-blue"));
    writeDemo(node, "--demo-badge-dot", colorOf("icon-shape/core/disabled", "brand-blue"));
  } else {
    writeDemo(node, "--demo-badge-fill", colorOf(`surface/${badgeFamily}/solid/default`, badgeKey));
    writeDemo(node, "--demo-badge-ink", colorOf("text/core/on-solid", badgeKey));
    writeDemo(node, "--demo-badge-dot", colorOf(`icon-shape/${badgeFamily}/default`, badgeKey));
  }
}

function setFlag(node, name, on) {
  if (on) node.setAttribute(name, "");
  else node.removeAttribute(name);
}

function coerceButtonStyle() {
  if (buttonState.color === "neutral" && buttonState.style === "solid") buttonState.style = "faded";
}

function syncDemo() {
  coerceButtonStyle();
  buttonStyleSelect.value = buttonState.style;
  buttonIconRow.hidden = buttonState.kind === "icon-button";
  buttonsCaption.textContent = `${buttonState.kind} / ${buttonState.size} / ${buttonState.color} / ${buttonState.style}`;
  demoButton.setAttribute("kind", buttonState.kind);
  demoButton.setAttribute("size", buttonState.size);
  demoButton.setAttribute("label", "Label");
  setFlag(demoButton, "show-icon", buttonState.kind === "icon-button" || buttonState.showIcon);
  setFlag(demoButton, "show-badge", buttonState.showBadge);
  setFlag(demoButton, "disabled", buttonState.disabled);
  paintDemo(demoButton);
}

function bindButtonSelect(node, options, key) {
  node.options = options;
  node.value = buttonState[key];
  node.addEventListener("cc-change", (event) => {
    buttonState[key] = event.detail.value;
    if (key === "color" || key === "style") coerceButtonStyle();
    syncDemo();
    if (key === "kind" && (buttonState.tab === "spec" || buttonState.tab === "usage")) loadDoc(buttonState.tab);
  });
}

function bindButtonToggle(node, key) {
  node.setAttribute("aria-pressed", buttonState[key] ? "true" : "false");
  node.addEventListener("click", () => {
    buttonState[key] = !buttonState[key];
    node.setAttribute("aria-pressed", buttonState[key] ? "true" : "false");
    syncDemo();
  });
}

function showButtonTab(tab) {
  buttonState.tab = tab;
  for (const name of ["settings", "spec", "usage"]) {
    const on = name === tab;
    document.querySelector(`#buttons-tab-${name}`).setAttribute("aria-selected", on ? "true" : "false");
    document.querySelector(`#buttons-panel-${name}`).hidden = !on;
  }
  if (tab === "spec" || tab === "usage") loadDoc(tab);
  syncButtonsScroll();
}

function syncButtonsScroll() {
  const panel = document.querySelector(`#buttons-panel-${buttonState.tab}`);
  if (panel) buttonsScroll.target = panel;
}

function showEmpty(panel) {
  panel.classList.remove("buttons-doc");
  panel.replaceChildren();
  const empty = document.createElement("p");
  empty.className = "buttons-empty";
  empty.textContent = "Nothing here yet.";
  panel.append(empty);
}

function stripFrontmatter(text) {
  const normalized = String(text).replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---")) return normalized;
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) return normalized;
  return normalized.slice(end + 4).replace(/^\r?\n/, "");
}

function appendInline(parent, text) {
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parent.append(text.slice(last, match.index));
    if (match[1] != null) {
      const link = document.createElement("a");
      link.href = match[2];
      link.textContent = match[1];
      parent.append(link);
    } else if (match[3] != null) {
      const code = document.createElement("code");
      code.textContent = match[3];
      parent.append(code);
    } else if (match[4] != null) {
      const strong = document.createElement("strong");
      strong.textContent = match[4];
      parent.append(strong);
    } else if (match[5] != null) {
      const em = document.createElement("em");
      em.textContent = match[5];
      parent.append(em);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parent.append(text.slice(last));
}

function splitCells(line) {
  let body = line.trim();
  if (body.startsWith("|")) body = body.slice(1);
  if (body.endsWith("|")) body = body.slice(0, -1);
  return body.split("|").map((cell) => cell.trim());
}

function isTableStart(lines, index) {
  if (index + 1 >= lines.length || !lines[index].includes("|")) return false;
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]);
}

function blockStart(lines, index) {
  const line = lines[index];
  if (!line || !line.trim()) return true;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (/^\s*[-*+]\s+/.test(line)) return true;
  if (/^\s*\d+\.\s+/.test(line)) return true;
  return isTableStart(lines, index);
}

function appendList(host, lines, start, tag) {
  const list = document.createElement(tag);
  const marker = tag === "ul" ? /^\s*[-*+]\s+(.*)$/ : /^\s*\d+\.\s+(.*)$/;
  let index = start;
  while (index < lines.length) {
    const match = marker.exec(lines[index]);
    if (!match) break;
    const item = document.createElement("li");
    appendInline(item, match[1]);
    list.append(item);
    index += 1;
  }
  host.append(list);
  return index;
}

function appendTable(host, lines, start) {
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const cell of splitCells(lines[start])) {
    const th = document.createElement("th");
    appendInline(th, cell);
    headRow.append(th);
  }
  head.append(headRow);
  table.append(head);
  const body = document.createElement("tbody");
  let index = start + 2;
  while (index < lines.length && lines[index].trim() && lines[index].includes("|")) {
    const row = document.createElement("tr");
    for (const cell of splitCells(lines[index])) {
      const td = document.createElement("td");
      appendInline(td, cell);
      row.append(td);
    }
    body.append(row);
    index += 1;
  }
  table.append(body);
  host.append(table);
  return index;
}

function renderMarkdown(panel, source) {
  panel.classList.add("buttons-doc");
  panel.replaceChildren();
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(lines[index]);
    if (heading) {
      const level = heading[1].length;
      const node = document.createElement(`h${level}`);
      appendInline(node, heading[2]);
      panel.append(node);
      index += 1;
      continue;
    }
    if (isTableStart(lines, index)) {
      index = appendTable(panel, lines, index);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(lines[index])) {
      index = appendList(panel, lines, index, "ul");
      continue;
    }
    if (/^\s*\d+\.\s+/.test(lines[index])) {
      index = appendList(panel, lines, index, "ol");
      continue;
    }
    const para = [lines[index]];
    index += 1;
    while (index < lines.length && !blockStart(lines, index)) {
      para.push(lines[index]);
      index += 1;
    }
    const node = document.createElement("p");
    appendInline(node, para.join(" "));
    panel.append(node);
  }
}

async function loadDoc(tab) {
  const kind = buttonState.kind;
  const token = ++docToken;
  const panel = document.querySelector(tab === "spec" ? "#buttons-panel-spec" : "#buttons-panel-usage");
  const file = tab === "spec" ? "spec.md" : "usage.md";
  try {
    const response = await fetch(`components/${kind}/${file}`);
    if (token !== docToken || buttonState.tab !== tab || buttonState.kind !== kind) return;
    if (!response.ok) {
      showEmpty(panel);
      return;
    }
    const body = stripFrontmatter(await response.text()).trim();
    if (token !== docToken || buttonState.tab !== tab || buttonState.kind !== kind) return;
    if (!body) showEmpty(panel);
    else renderMarkdown(panel, body);
    syncButtonsScroll();
  } catch {
    if (token !== docToken || buttonState.tab !== tab || buttonState.kind !== kind) return;
    showEmpty(panel);
  }
}

function tipNode() {
  return document.querySelector("cc-tooltip");
}

function showNoAccess(anchor) {
  const tip = tipNode();
  if (!tip) return;
  if (accessAnchor === anchor && !tip.hidden) {
    accessAnchor = null;
    tip.hide();
    return;
  }
  accessAnchor = anchor;
  tip.show(anchor, "no access");
}

function hideNoAccess() {
  if (!accessAnchor) return;
  accessAnchor = null;
  const tip = tipNode();
  if (tip) tip.hide();
}

function anchorFrom(event) {
  if (event.target instanceof Element) return event.target;
  return event.target && event.target.parentElement ? event.target.parentElement : null;
}

bindButtonSelect(buttonClassSelect, ["labeled-button", "icon-button"], "kind");
bindButtonSelect(buttonSizeSelect, ["large", "medium", "small"], "size");
bindButtonSelect(buttonColorSelect, buttonColors, "color");
bindButtonSelect(buttonStyleSelect, ["solid", "faded", "transparent", "no-surface", "outline"], "style");
bindButtonSelect(buttonBadgeSelect, buttonColors, "badgeColor");
bindButtonToggle(buttonShowDisabled, "disabled");
bindButtonToggle(buttonShowIcon, "showIcon");
bindButtonToggle(buttonShowBadge, "showBadge");

for (const name of ["settings", "spec", "usage"]) {
  document.querySelector(`#buttons-tab-${name}`).addEventListener("click", () => showButtonTab(name));
}

buttonsFigma.addEventListener("click", () => showNoAccess(buttonsFigma));

for (const id of ["#buttons-panel-spec", "#buttons-panel-usage"]) {
  document.querySelector(id).addEventListener("click", (event) => {
    const origin = anchorFrom(event);
    const link = origin && origin.closest("a");
    if (!link || !event.currentTarget.contains(link)) return;
    event.preventDefault();
    showNoAccess(link);
  });
}

document.addEventListener("pointerdown", (event) => {
  if (!accessAnchor) return;
  const origin = anchorFrom(event);
  if (origin && (accessAnchor === origin || accessAnchor.contains(origin))) return;
  const tip = tipNode();
  if (tip && origin && tip.contains(origin)) return;
  hideNoAccess();
}, true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideNoAccess();
});

window.addEventListener("resize", () => {
  syncNarrow();
  stickFamilies();
});
syncNarrow();
paint();
