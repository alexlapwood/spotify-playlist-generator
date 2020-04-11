const focusableElements = [
  "[contentEditable]",
  "[tabindex]",
  "a[href]",
  "area[href]",
  "button",
  "details",
  "iframe",
  "input",
  "select",
  "textarea",
];

const unfocusableStates = [
  ':not([contentEditable="false"])',
  ":not([disabled])",
  ':not([tabindex="-1"])',
];

export const focusableDescendantsSelector = focusableElements
  .map((focusableElement) => [focusableElement, ...unfocusableStates].join(""))
  .join(", ");

export function getFocusableDescendants(element: HTMLElement) {
  return element.querySelectorAll<HTMLElement>(focusableDescendantsSelector);
}

/**
 * Ponyfill for
 * [Element.prototype.matches](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches)
 */
function elementMatchesSelector(
  element: HTMLElement & {
    msMatchesSelector?: typeof Element.prototype.matches;
    webkitMatchesSelector?: typeof Element.prototype.matches;
  },
  selector: string
) {
  if (element.msMatchesSelector) {
    return element.msMatchesSelector(selector);
  }
  if (element.webkitMatchesSelector) {
    return element.webkitMatchesSelector(selector);
  }
  return element.matches(selector);
}

/**
 * Gets the focusable part of an `HTMLElement`.
 *
 * @param {HTMLElement | null} element The element to search through. This can be focusable or have
 * focusable children.
 *
 * @returns {HTMLElement | null} The provided element if it is focusable, otherwise the first
 * focusable child of the provided element, or null if the element is not focusable and has no
 * focusable children.
 */
export default function getFocusableElement(element: HTMLElement | null) {
  if (!element) {
    return null;
  }

  if (elementMatchesSelector(element, focusableDescendantsSelector)) {
    return element;
  }

  const focusableDescendants = getFocusableDescendants(element);

  if (focusableDescendants.length === 0) {
    return null;
  }

  return focusableDescendants[0];
}
