type Axis = "left" | "top";
type AxisSize = "height" | "width";
export type Location = "bottom" | "left" | "right" | "top";

export default class PositioningHelper {
  preferredLocation: Location;

  contentRect: DOMRect;
  triggerRect: DOMRect;

  pageBuffer: number;
  triggerBuffer: number;

  /**
   * Map of the vertical/horizontal (top/left) axis for a side.
   */
  axisMap: {
    [index: string]: Axis;
  } = {
    bottom: "top",
    left: "left",
    right: "left",
    top: "top",
  };

  /**
   * Map of the vertical/horizontal (top/left) axis adjacent to a side.
   */
  adjacentAxisMap: {
    [index: string]: Axis;
  } = {
    bottom: "left",
    left: "top",
    right: "top",
    top: "left",
  };

  /**
   * Creates a helper for positioning content next to a trigger. Useful for elements like tooltips
   * and popovers.
   *
   * The helper needs to be instantiated with the correct information before calling `getLocation`
   * or `getPositionStyle`.
   *
   * @param preferredLocation Determines the side of the trigger that the content should be
   * displayed. If the preferred location is unavailable then a valid location will be chosen.
   * @param contentRect A [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect)
   * representing the content to be positioned.
   * @param triggerRect A [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect)
   * representing the trigger to position the content around.
   * @param triggerBuffer How much space should be left around the trigger.
   * @param pageBuffer How close the content can get to the edge of the page.
   */
  constructor(
    preferredLocation: Location = "bottom",
    contentRect: DOMRect,
    triggerRect: DOMRect,
    triggerBuffer = 0,
    pageBuffer = 0
  ) {
    this.preferredLocation = preferredLocation;

    this.contentRect = contentRect;
    this.triggerRect = triggerRect;

    this.pageBuffer = pageBuffer;
    this.triggerBuffer = triggerBuffer;
  }

  /**
   * If the preferred location is not available the opposite side of the trigger will be checked,
   * followed by the right and bottom sides, and finally the left and top sides.
   *
   * @returns {string} The best available location.
   */
  public getLocation() {
    const oppositeLocationMap: {
      [index: string]: Location;
    } = {
      bottom: "top",
      left: "right",
      right: "left",
      top: "bottom",
    };

    const validLocationMap: {
      [index: string]: boolean;
    } = {
      left: this.getPosition("left") >= this.pageBuffer,
      top: this.getPosition("top") >= this.pageBuffer,
      bottom:
        this.getPosition("bottom") + this.contentRect.height <=
        document.body.clientHeight - this.pageBuffer,
      right:
        this.getPosition("right") + this.contentRect.width <=
        document.body.clientWidth - this.pageBuffer,
    };

    const preferredLocations = [
      this.preferredLocation,
      oppositeLocationMap[this.preferredLocation],
      "right",
      "bottom",
      "left",
      "top",
    ];

    const finalLocation = preferredLocations.filter(
      (location) => validLocationMap[location]
    )[0] as Location;

    return finalLocation || "bottom";
  }

  /**
   * Calculates the absolute position for the content based on the positions and sizes of the
   * trigger, content, and page.
   *
   * @returns {{left: number, top: number}} The absolute position for the content.
   */
  public getPositionStyle() {
    const location = this.getLocation();
    const position = this.getPosition(location);
    const alignment = this.getAlignment(location);

    return {
      [this.axisMap[location]]: position,
      [this.adjacentAxisMap[location]]: alignment,
    };
  }

  /**
   * Calculates whether the content is narrower than the body. Useful for switching to a full-width
   * style.
   *
   * @returns {boolean} True if the content is as wide as or wider than the body.
   */
  public isFullWidth() {
    return (
      this.contentRect.width >= document.body.getBoundingClientRect().width
    );
  }

  private getAlignment(location: Location) {
    const axisSizeMap: {
      [index: string]: AxisSize;
    } = {
      left: "width",
      top: "height",
    };

    const alignment =
      this.triggerRect[this.adjacentAxisMap[location]] +
      this.triggerRect[axisSizeMap[this.adjacentAxisMap[location]]] / 2 -
      this.contentRect[axisSizeMap[this.adjacentAxisMap[location]]] / 2 +
      this.getScrollOffset(this.adjacentAxisMap[location]);

    const axis = this.adjacentAxisMap[location];

    const clampedAlignment = Math.max(
      Math.min(
        alignment,
        document.body.getBoundingClientRect()[axisSizeMap[axis]] -
          this.pageBuffer -
          this.contentRect[axisSizeMap[this.adjacentAxisMap[location]]]
      ),
      axis === "top"
        ? this.pageBuffer
        : Math.min(
            this.pageBuffer,
            (document.body.getBoundingClientRect().width -
              this.contentRect.width) /
              2
          )
    );

    return clampedAlignment;
  }

  private getPosition(side: Location) {
    const bufferMap = {
      bottom: this.triggerBuffer,
      left: -this.triggerBuffer,
      right: this.triggerBuffer,
      top: -this.triggerBuffer,
    };

    const positionOffsetMap = {
      bottom: this.triggerRect.height,
      left: -this.contentRect.width,
      right: this.triggerRect.width,
      top: -this.contentRect.height,
    };

    return (
      this.triggerRect[this.axisMap[side]] +
      positionOffsetMap[side] +
      bufferMap[side] +
      this.getScrollOffset(this.axisMap[side])
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private getScrollOffset(axis?: Axis) {
    return axis === "left" ? window.pageXOffset : window.pageYOffset;
  }
}
