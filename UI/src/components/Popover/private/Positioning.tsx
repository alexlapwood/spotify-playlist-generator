import React from "react";
import { Portal } from "react-portal";

import PositioningHelper, { Location } from "./helpers/positioning";

/**
 * Checks equality by iterating through keys on an object and returning false when any key has
 * values which are not strictly equal.
 *
 * @param object1 The first object to compare.
 * @param object2 The second object to compare.
 *
 * @returns {boolean} True when the objects pass a shallow compare, false when the objects fail a
 * shallow compare.
 */
function shallowCompare(
  object1?: { [index: string]: any },
  object2?: { [index: string]: any }
) {
  return (
    object1 &&
    object2 &&
    Object.keys(object1).length === Object.keys(object2).length &&
    Object.keys(object1).every((key) => object1[key] === object2[key])
  );
}

interface Props {
  children: (location?: Location, isFullWidth?: boolean) => React.ReactNode;
  pageBuffer?: number;
  preferredLocation?: Location;
  triggerBuffer?: number;
  triggerRef: React.RefObject<HTMLElement>;
}

interface State {
  isFullWidth?: boolean;
  location?: Location;
  style?: React.CSSProperties;
}

export default class Positioning extends React.Component<Props, State> {
  private ref = React.createRef<HTMLDivElement>();
  private updatePositionTimeoutId?: ReturnType<typeof setTimeout>;
  private windowHasResizeListener = false;

  state: State = {};

  public componentDidMount() {
    this.updatePosition();

    window.addEventListener("resize", this.updatePosition);
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.updatePosition);
  }

  public componentDidUpdate() {
    this.updatePosition();
  }

  public render() {
    const { children } = this.props;
    const { isFullWidth, location, style } = this.state;
    return (
      <Portal>
        <div ref={this.ref} style={{ position: "absolute", ...style }}>
          {children(location, isFullWidth)}
        </div>
      </Portal>
    );
  }

  /* eslint-disable no-param-reassign */
  private getContentRect = (contentElement: HTMLElement) => {
    const previousStyle = {
      left: contentElement.style.left,
      top: contentElement.style.top,
    };
    /**
     * We place the contentElement at the top left of the page before retrieving its measurements so
     * that the size is not influenced by the edges of the page.
     */
    contentElement.style.left = "0";
    contentElement.style.top = "0";

    const contentRect = contentElement.getBoundingClientRect();

    contentElement.style.left = previousStyle.left;
    contentElement.style.top = previousStyle.top;

    return contentRect;
  };
  /* eslint-enable no-param-reassign */

  private updatePosition = () => {
    const { pageBuffer, preferredLocation, triggerBuffer } = this.props;

    /**
     * Running `updatePosition` regularly accommodates the following situations:
     * - The content resizes (could be handled with a ResizeObserver)
     * - The trigger resizes (could be handled with a ResizeObserver)
     * - The trigger changes position (currently we have no way of observing this reliably)
     */
    if (this.updatePositionTimeoutId) {
      clearTimeout(this.updatePositionTimeoutId);
    }
    setTimeout(this.updatePosition, 100);

    if (!this.ref.current || !this.props.triggerRef.current) {
      return;
    }

    const contentRect = this.getContentRect(this.ref.current);
    const triggerRect = this.props.triggerRef.current.getBoundingClientRect();

    const positionHelper = new PositioningHelper(
      preferredLocation,
      contentRect,
      triggerRect,
      triggerBuffer,
      pageBuffer
    );

    const location = positionHelper.getLocation();
    const style = positionHelper.getPositionStyle();
    const isFullWidth = positionHelper.isFullWidth();

    // This function is called often so we only call `setState` if something has changed.
    if (
      location !== this.state.location ||
      !shallowCompare(style, this.state.style)
    ) {
      this.setState({
        isFullWidth,
        location,
        style,
      });
    }
  };
}
