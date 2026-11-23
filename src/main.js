import { applyColors, applyStyles, swatchColor } from "./apply-styles.js";

const root = document.documentElement;
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

const styles = await fetch(new URL("../data/styles.json?v=2", import.meta.url)).then((response) => response.json());
const collections = await fetch(new URL("../data/collections.json?v=3", import.meta.url)).then((response) => response.json());
const copy = await fetch(new URL("../data/copy.json", import.meta.url)).then((response) => response.json());

applyStyles(styles);

let collection = collections.defaults.collection;
let brand = collections.defaults.brand;
let theme = collections.defaults.theme;
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
  return collection === "primitives" ? collections.primitives : collections.semantic;
}

function familyHead(parts) {
  if (parts[0] === "surface" && parts.length >= 2) return 2;
  return 1;
}

function groupTokens(tokens) {
  const families = new Map();
  for (const token of tokens) {
    const parts = token.name.split("/").filter(Boolean);
    const head = familyHead(parts);
    const core = parts[0] === "surface" && parts[1] === "core";
    const familyName = core ? "surface/neutral" : parts.slice(0, head).join("/") || token.name;
    if (!families.has(familyName)) {
      families.set(familyName, { name: familyName, sections: [], byMiddle: new Map() });
    }
    const family = families.get(familyName);
    const rest = core ? ["core", parts[parts.length - 1]] : parts.slice(head);
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
  return foldPrimitives(ordered);
}

function foldPrimitives(families) {
  if (collection !== "primitives") return families;
  const list = [...families];
  const neutral = list.find((item) => item.name === "neutral");
  if (!neutral) return list;
  const folded = [];
  for (const name of ["white", "black"]) {
    const index = list.findIndex((item) => item.name === name);
    if (index < 0) continue;
    const [family] = list.splice(index, 1);
    folded.push({
      middle: name,
      rows: family.sections.flatMap((section) => section.rows),
    });
  }
  for (const section of folded.reverse()) {
    neutral.byMiddle.set(section.middle, section);
    neutral.sections.unshift(section);
  }
  const order = ["neutral", "status", "brand-blue", "brand-cyan", "additional"];
  const rank = (name) => {
    const index = order.indexOf(name);
    return index < 0 ? order.length : index;
  };
  list.sort((left, right) => rank(left.name) - rank(right.name));
  return list;
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
  if (collection === "primitives" && (parts[0] === "white" || parts[0] === "black")) {
    const neutral = families.find((item) => item.name === "neutral");
    if (!neutral) return "";
    if (parts.length === 1) return subgroupId(neutral.name, parts[0]);
    const joined = parts.join("/");
    for (const section of neutral.sections) {
      for (const row of section.rows) {
        if (row.token.name === joined) return rowId(row.token.name);
      }
    }
    return subgroupId(neutral.name, parts[0]);
  }
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
      let host = card;
      if (light) {
        host = card.querySelector(":scope > .tone-light");
        if (!host) {
          host = document.createElement("div");
          host.className = "tone-light";
          applyColors(styles, collections, "brand-blue", "light", host);
          card.append(host);
        }
      }
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
        host.append(group);
        for (const item of rows) group.append(item);
      } else {
        for (const item of rows) host.append(item);
      }
    });
    const cell = document.createElement("div");
    cell.className = "family-title-cell";
    titles.append(cell);
    familyRow.append(card);
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

function placeFamilyTitles() {
  const titles = familyRow.previousElementSibling;
  if (!titles || !titles.classList.contains("family-titles")) return;

  const narrow = root.classList.contains("is-narrow");
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
  themeSwitch.hidden = !semantic;
  brandSelect.hidden = !semantic;
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
}

function stickFamilies() {
  const narrow = root.classList.contains("is-narrow");
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

function paint() {
  const chromeBrand = collection === "primitives" ? "brand-blue" : brand;
  const chromeTheme = collection === "primitives" ? "dark" : theme;
  applyColors(styles, collections, chromeBrand, chromeTheme);
  const tokens = activeTokens();
  const families = groupTokens(tokens);
  renderFamilies(families);
  buildMenu(tokens, families);
  placeChrome();
  scrollY.target = scrollRoot;
  scrollX.target = scrollRoot;
  const menu = sidebar.querySelector(".menu");
  if (menu) sidebarScroll.target = menu;
  stickFamilies();
}

function closeSidebar() {
  sidebar.removeAttribute("open");
  scrollRoot.classList.remove("is-locked");
}

menuButton.setAttribute("label", copyText("menu.open"));
themeSwitch.setAttribute("label-dark", copyText("theme.dark"));
themeSwitch.setAttribute("label-light", copyText("theme.light"));
themeSwitch.setAttribute("mode", theme);
sidebar.querySelector("cc-icon-button").setAttribute("label", copyText("menu.close"));

const collectionLabels = {
  primitives: "colors-primitive",
  semantic: "colors-semantic",
};
collectionSelect.options = collections.collectionOrder.map((id) => ({
  value: id,
  label: collectionLabels[id] || id,
}));
collectionSelect.value = collection;
brandSelect.options = collections.brandOrder.slice();
brandSelect.value = brand;

collectionSelect.addEventListener("cc-change", (event) => {
  collection = event.detail.value;
  if (collection === "semantic") {
    brand = remembered.brand;
    theme = remembered.theme;
    brandSelect.value = brand;
    themeSwitch.setAttribute("mode", theme);
  }
  paint();
});

brandSelect.addEventListener("cc-change", (event) => {
  brand = event.detail.value;
  remembered.brand = brand;
  paint();
});

themeSwitch.addEventListener("cc-change", (event) => {
  theme = event.detail.mode;
  remembered.theme = theme;
  themeSwitch.setAttribute("mode", theme);
  paint();
});

menuButton.addEventListener("cc-press", () => {
  sidebar.setAttribute("open", "");
  scrollRoot.classList.add("is-locked");
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
    target.scrollIntoView({ block: "start", inline: "nearest" });
  }
  closeSidebar();
});

document.addEventListener("cc-open", (event) => {
  if (!(event.target instanceof HTMLElement) || event.target.localName !== "cc-select-small") return;
  for (const select of document.querySelectorAll("cc-select-small")) {
    if (select !== event.target) select.removeAttribute("open");
  }
});

window.addEventListener("resize", () => {
  syncNarrow();
  stickFamilies();
});
syncNarrow();
paint();
