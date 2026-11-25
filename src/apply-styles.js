function unwrap(entry) {
  if (entry && typeof entry === "object" && !Array.isArray(entry) && "value" in entry) return entry.value;
  return entry;
}

function px(entry) {
  return `${unwrap(entry)}px`;
}

function colorName(role) {
  return `--color-${String(unwrap(role)).replaceAll("/", "-")}`;
}

export function applyStyles(styles) {
  const root = document.documentElement;
  const family = String(unwrap(styles.fontFamily));
  root.style.setProperty("--font-family", family);

  const faces = document.createElement("style");
  faces.textContent = styles.fontFiles.map((file) => {
    const weight = unwrap(file.weight);
    const style = unwrap(file.style);
    const href = unwrap(file.file);
    const range = unwrap(file.unicodeRange);
    const unicode = range ? `unicode-range:${range};` : "";
    return `@font-face{font-family:${JSON.stringify(family)};src:url("${href}") format("woff2");font-weight:${weight};font-style:${style};font-display:swap;${unicode}}`;
  }).join("");
  document.head.append(faces);

  for (const [name, type] of Object.entries(styles.typography)) {
    root.style.setProperty(`--font-${name}-size`, px(type.size));
    root.style.setProperty(`--font-${name}-line`, px(type.lineHeight));
    root.style.setProperty(`--font-${name}-tracking`, px(type.letterSpacing));
    root.style.setProperty(`--font-${name}-weight`, String(unwrap(type.weight)));
  }

  for (const group of ["spacing", "radius", "stroke", "layout"]) {
    for (const [key, value] of Object.entries(styles[group])) {
      root.style.setProperty(`--${group}-${key}`, px(value));
    }
  }

  for (const [key, value] of Object.entries(styles.shadow)) {
    root.style.setProperty(`--shadow-${key}`, String(unwrap(value)));
  }
}

export function applyColors(styles, collections, brand, theme, target = document.documentElement) {
  const byName = new Map(collections.semantic.map((token) => [token.name, token]));
  for (const role of styles.colorRoles) {
    const name = String(unwrap(role));
    const token = byName.get(name);
    const color = token && token.values && token.values[brand] && token.values[brand][theme];
    if (!color) continue;
    target.style.setProperty(colorName(name), String(unwrap(color)));
  }
}

export function swatchColor(token, collection, brand, theme) {
  if (collection === "primitives") return String(unwrap(token.value));
  const band = token.values && token.values[brand];
  return band ? String(unwrap(band[theme])) : "";
}
