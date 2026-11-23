import { animate } from "../vendor/motion.js";

const calm = { type: "spring", bounce: 0, duration: 0.42 };
let ghostRun = 0;

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function freezeTokens(node) {
  const from = document.documentElement.style;
  for (let index = 0; index < from.length; index += 1) {
    const name = from[index];
    if (!name.startsWith("--")) continue;
    node.style.setProperty(name, from.getPropertyValue(name));
  }
}

function copyScroll(source, ghost) {
  const from = [source, ...source.querySelectorAll("*")];
  const to = [ghost, ...ghost.querySelectorAll("*")];
  for (let index = 0; index < from.length && index < to.length; index += 1) {
    if (from[index].scrollTop) to[index].scrollTop = from[index].scrollTop;
    if (from[index].scrollLeft) to[index].scrollLeft = from[index].scrollLeft;
  }
}

function whenSettled(element) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const running = element ? [...element.getAnimations()] : [];
      if (!running.length) {
        resolve();
        return;
      }
      Promise.all(running.map((item) => item.finished.then(() => {}, () => {}))).then(resolve);
    });
  });
}

function crossfade(source, update) {
  if (reduceMotion() || !source) {
    update();
    return;
  }
  const run = ++ghostRun;
  document.querySelectorAll("[data-ghost]").forEach((node) => node.remove());
  const ghost = source.cloneNode(true);
  const rect = source.getBoundingClientRect();
  ghost.setAttribute("data-ghost", "");
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  freezeTokens(ghost);
  ghost.style.position = "fixed";
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.margin = "0";
  ghost.style.zIndex = "6";
  ghost.style.overflow = "hidden";
  ghost.style.pointerEvents = "none";
  ghost.style.transform = "translateZ(0)";
  document.body.append(ghost);
  copyScroll(source, ghost);
  update();
  animate(ghost, { opacity: [1, 0] }, calm);
  whenSettled(ghost).then(() => {
    if (run !== ghostRun) return;
    ghost.remove();
  });
}

const numberDrivers = new Map();

function readShift(driver) {
  const transform = getComputedStyle(driver).transform;
  if (!transform || transform === "none") return null;
  return new DOMMatrix(transform).m42;
}

function playNumber(key, from, to, onUpdate, options = calm) {
  const previous = numberDrivers.get(key);
  if (previous) previous.remove();
  if (reduceMotion() || from === to) {
    onUpdate(to);
    return;
  }
  const driver = document.createElement("div");
  numberDrivers.set(key, driver);
  driver.setAttribute("aria-hidden", "true");
  driver.inert = true;
  driver.style.position = "fixed";
  driver.style.left = "0";
  driver.style.top = "0";
  driver.style.width = "0";
  driver.style.height = "0";
  driver.style.overflow = "hidden";
  driver.style.pointerEvents = "none";
  driver.style.transform = `translateY(${from}px)`;
  document.body.append(driver);
  animate(driver, { y: [from, to] }, options);
  const settle = () => {
    if (numberDrivers.get(key) !== driver) return;
    onUpdate(to);
    numberDrivers.delete(key);
    driver.remove();
  };
  let waits = 0;
  const step = () => {
    if (numberDrivers.get(key) !== driver) return;
    const running = driver.getAnimations()[0];
    if (!running) {
      waits += 1;
      if (waits < 3) {
        requestAnimationFrame(step);
        return;
      }
      settle();
      return;
    }
    if (running.playState === "finished") {
      settle();
      return;
    }
    const shift = readShift(driver);
    onUpdate(shift == null ? from : shift);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(() => {
    const running = driver.getAnimations()[0];
    if (running) running.finished.then(settle, () => {});
    step();
  });
}

window.ccMotion = { animate, calm, reduce: reduceMotion };

export { animate, calm, reduceMotion, crossfade, playNumber, whenSettled };
