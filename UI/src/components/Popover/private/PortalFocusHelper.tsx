import PropTypes from "prop-types";
import React from "react";

import {
  focusableDescendantsSelector,
  getFocusableDescendants,
} from "./helpers/getFocusableElement";
import getFocusableElement from "./helpers/getFocusableElement";

interface Props {
  children?: React.ReactNode;
  focusPortalRef: React.RefObject<HTMLElement>;
  onReturnFocus?: () => void;
}

export default class PortalFocusHelper extends React.Component<Props> {
  private wrapperRef = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    document.addEventListener("keydown", this.focusPortalKeyDownHandler);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.focusPortalKeyDownHandler);
  }

  public render() {
    const { children } = this.props;

    return (
      <React.Fragment>
        <div
          onFocus={() => {
            this.focusOnTheFirstElementOnThePage();
          }}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        />
        <div
          onFocus={() => {
            this.returnFocus();
          }}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        />
        <div ref={this.wrapperRef}>{children}</div>
        <div
          onFocus={() => {
            this.returnFocus(true);
          }}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        />
      </React.Fragment>
    );
  }

  focusPortalKeyDownHandler = (event: KeyboardEvent) => {
    const { focusPortalRef, onReturnFocus } = this.props;

    const focusableElement = getFocusableElement(focusPortalRef.current);

    if (!focusableElement) {
      return;
    }

    const nextFocusableElement = this.findNextFocusableElement(
      focusableElement
    );

    if (!focusableElement) {
      return;
    }

    if (event.target === focusableElement) {
      if (event.key === "Tab" && event.shiftKey) {
        onReturnFocus && onReturnFocus();
        return;
      }

      if (event.key === "Tab") {
        this.focusOnThePortalledElement() && event.preventDefault();
      }
    }

    if (event.target === nextFocusableElement) {
      if (event.key === "Tab" && event.shiftKey) {
        this.focusOnThePortalledElement(true) && event.preventDefault();
        return;
      }

      if (event.key === "Tab") {
        onReturnFocus && onReturnFocus();
      }
    }
  };

  /**
   * Focuses on the portalled element.
   *
   * @param {boolean} shouldFocusOnLastElement Determines whether to focus on the last element in
   * the Portal.
   *
   * @returns {boolean} `true` if an element gets focused, `false` if there is no element to focus
   * on.
   */
  private focusOnThePortalledElement = (shouldFocusOnLastElement?: boolean) => {
    const { onReturnFocus } = this.props;

    if (!this.wrapperRef.current) {
      return false;
    }

    const focusableDescendants = getFocusableDescendants(
      this.wrapperRef.current
    );

    if (focusableDescendants.length === 0) {
      onReturnFocus && onReturnFocus();
      return false;
    }

    if (!shouldFocusOnLastElement) {
      focusableDescendants[0].focus();
    } else {
      focusableDescendants[focusableDescendants.length - 1].focus();
    }

    return true;
  };

  private focusOnTheFirstElementOnThePage = () => {
    const firstElementOnThePage = document.querySelector<HTMLElement>(
      focusableDescendantsSelector
    );
    firstElementOnThePage?.focus();
  };

  /**
   * Returns the focus to the page.
   *
   * @param {boolean} shouldFocusOnNextElement Determines whether to return the focus to
   * `this.props.focusPortalRef` or the focusable element that follows it.
   */
  private returnFocus = (shouldFocusOnNextElement?: boolean) => {
    const { focusPortalRef, onReturnFocus } = this.props;

    const focusableElement = getFocusableElement(focusPortalRef.current);

    if (!focusableElement) {
      // eslint-disable-next-line no-console
      console.warn(
        `Unable to return focus to the page, ${focusPortalRef.current} is not focusable and does not contain any focusable children.`
      );
      return;
    }

    const nextFocusableElement = this.findNextFocusableElement(
      focusableElement
    );

    if (shouldFocusOnNextElement && nextFocusableElement) {
      nextFocusableElement.focus();
    } else {
      focusableElement.focus();
    }

    onReturnFocus && onReturnFocus();
  };

  /**
   * Finds the next focusable element after `element` in the DOM.
   *
   * *Note: This function treats positive tab-indexes as if they were 0.*
   *
   * @param {HTMLElement} element The element to use as a reference point.
   *
   * @returns {HTMLElement | undefined} The next focusable element. If `element` is the last
   * focusable element then the first focusable element on the page will be returned.
   */
  private findNextFocusableElement = (element: HTMLElement) => {
    const allFocusableElements: Array<HTMLElement> = Array.from(
      getFocusableDescendants(document.body)
    );
    const indexOfElement = allFocusableElements.indexOf(element);

    if (indexOfElement === allFocusableElements.length - 1) {
      return allFocusableElements[0];
    }

    return allFocusableElements[indexOfElement + 1];
  };

  static propTypes = {
    children: PropTypes.node,
    /**
     * An optional function to be called whenever the focus leaves the portal and is returned to the
     * page.
     */
    onReturnFocus: PropTypes.func,
    /**
     * An element that is focusable or has focusable children. Used as an entry point into the
     * Portal. Pressing `Tab` while it is focused will send the focus to the Portal. When the focus
     * needs to return back to the page, it will use this element to figure out where the focus
     * should return to.
     */
    focusPortalRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
      .isRequired,
  };
}
