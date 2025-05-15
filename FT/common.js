"use srtict";
export function _removeChildren(selector) {
  if (!selector) {
    console.warn("Attempted to remove a null or undefined element.");
    return;
  }
  const parent = _select(selector);

  while (parent.firstElementChild) {
    const child = parent.firstElementChild;
    parent.removeChild(child);
  }
  return parent;
}

export function _select(selector, parent = document) {
  return parent.querySelector(selector);
}

export function _selectAll(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/**
 * Create DOM element(s).
 *
 * @example specifier: "<div class='x'></div>", output a div element with a class
 * @example specifier: {div: {class: "x", style: "y"}} output: div element with class and style
 * @example specifier: {div: {class: "x", style: "y", button: {class:"z"}}} output: div element with class and style
 * and a child button with class
 *
 * @param {String|Object|Array} specifier
 * @returns {HTMLElement}
 */
export function _create(specifier) {
  const getTag = (tag) => {
    const underscore = tag.indexOf("_");
    if (underscore === -1) return tag;
    return tag.substring(0, underscore);
  };

  if (typeof specifier === "string") return document.createElement(specifier);

  if (typeof specifier !== "object") return;

  const key = Object.keys(specifier)[0];

  const element = document.createElement(getTag(key));
  const attributes = specifier[key];
  if (typeof attributes !== "object") return element;

  Object.entries(attributes).forEach(([attr, value]) => {
    if (typeof value === "object") {
      const childAttrs = {};
      childAttrs[attr] = value;
      const child = createElements(childAttrs);
      if (child) element.appendChild(child);
      return;
    }
    if (attr === undefined) return;

    if (attr === "class") {
      if (typeof value !== "string") return;
      const classes = value.split(" ").map((c) => c.trim());
      for (const c of classes) element.classList.add(c);
      return;
    }

    if (attr === "dataset") {
      if (typeof value !== "array") return;
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
      return;
    }

    if (attr === "text") {
      if (typeof value !== "string") return;
      element.textContent = value;
      return;
    }

    if (typeof value === "string") element.setAttribute(attr, value);
  });

  return element;
}


export function showError(err) {
    const error = select("#error");
    error.textContent = typeof err === "string" ? err : JSON.stringify(err);
  }
