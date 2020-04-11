import PositioningHelper from "../positioning";

const pageHeight = 600;
const pageWidth = 800;

/**
 * DOMRect polyfill
 */
class DOMRect {
  public bottom: number;
  public toJSON = () => "";
  public height: number;
  public left: number;
  public right: number;
  public top: number;
  public width: number;
  public x: number;
  public y: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.left = x;
    this.top = y;
    this.bottom = document.body.clientHeight - (y + height);
    this.right = document.body.clientWidth - (x + width);
  }
}

Object.defineProperties(document.body, {
  clientHeight: { value: pageHeight },
  clientWidth: { value: pageWidth },
  getBoundingClientRect: {
    value: () => new DOMRect(0, 0, pageWidth, pageHeight),
  },
});

describe("Positioning helper class", () => {
  it("prefers the bottom location if no preferred location is provided", () => {
    // Arrange
    const contentRect = new DOMRect(0, 0, 100, 100);
    const triggerRect = new DOMRect(0, 0, 100, 40);
    const positioningHelper = new PositioningHelper(
      undefined,
      contentRect,
      triggerRect
    );

    // Act
    const location = positioningHelper.getLocation();

    // Assert
    expect(location).toBe("bottom");
  });

  it("positions the element away from the edge of the page", () => {
    // Arrange
    const pageBuffer = 8;
    const preferredPosition = "right";
    const contentRect = new DOMRect(0, 0, 100, 100);
    const triggerRect = new DOMRect(0, 0, 100, 40);
    const positioningHelper = new PositioningHelper(
      preferredPosition,
      contentRect,
      triggerRect,
      0,
      pageBuffer
    );

    // Act
    const { top } = positioningHelper.getPositionStyle();

    // Assert
    expect(top).toBe(pageBuffer);
  });

  it("positions the content in the center when it starts overflowing the pageBuffer", () => {
    // Arrange
    const pageBuffer = 20;
    const distanceFromEdgeOfPage = pageBuffer / 2;
    const preferredPosition = "bottom";
    const contentRect = new DOMRect(
      0,
      0,
      pageWidth - distanceFromEdgeOfPage * 2,
      100
    );
    const triggerRect = new DOMRect(0, 0, 100, 40);
    const positioningHelper = new PositioningHelper(
      preferredPosition,
      contentRect,
      triggerRect,
      0,
      pageBuffer
    );

    // Act
    const { left } = positioningHelper.getPositionStyle();

    // Assert
    expect(left).toBe(distanceFromEdgeOfPage);
  });

  describe("getPositionStyle", () => {
    describe("available sides", () => {
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(200, 200, 100, 40);

      const theories = [
        {
          expectedPosition: { left: 200, top: 240 },
          preferredLocation: "bottom",
        },
        {
          expectedPosition: { left: 100, top: 170 },
          preferredLocation: "left",
        },
        {
          expectedPosition: { left: 300, top: 170 },
          preferredLocation: "right",
        },
        { expectedPosition: { left: 200, top: 100 }, preferredLocation: "top" },
      ];

      theories.forEach(({ expectedPosition, preferredLocation }) => {
        it(`calculates the correct position for the ${preferredLocation} side`, () => {
          // Arrange
          const positioningHelper = new PositioningHelper(
            preferredLocation as any,
            contentRect,
            triggerRect,
            0,
            0
          );

          // Act
          const style = positioningHelper.getPositionStyle();

          // Assert
          expect(style).toEqual(expectedPosition);
        });
      });
    });

    describe("close to the adjacent edge of the viewport", () => {
      const contentRect = new DOMRect(0, 0, 100, 100);

      const theories = [
        {
          expectedPosition: { left: pageWidth - 100, top: 240 },
          preferredLocation: "bottom",
          triggerRect: new DOMRect(pageWidth, 200, 100, 40),
        },
        {
          expectedPosition: { left: 100, top: 0 },
          preferredLocation: "left",
          triggerRect: new DOMRect(200, 0, 100, 40),
        },
        {
          expectedPosition: { left: 300, top: pageHeight - 100 },
          preferredLocation: "right",
          triggerRect: new DOMRect(200, pageHeight, 100, 40),
        },
        {
          expectedPosition: { left: 0, top: 100 },
          preferredLocation: "top",
          triggerRect: new DOMRect(0, 200, 100, 40),
        },
      ];

      theories.forEach(
        ({ expectedPosition, preferredLocation, triggerRect }) => {
          it(`calculates the correct position for the ${preferredLocation} side`, () => {
            // Arrange
            const positioningHelper = new PositioningHelper(
              preferredLocation as any,
              contentRect,
              triggerRect,
              0,
              0
            );

            // Act
            const style = positioningHelper.getPositionStyle();

            // Assert
            expect(style).toEqual(expectedPosition);
          });
        }
      );
    });
  });

  describe("isFullWidth", () => {
    it("returns true when the content is wider than document.body", () => {
      // Arrange
      const preferredPosition = "bottom";
      const contentRect = new DOMRect(0, 0, pageWidth, 100);
      const triggerRect = new DOMRect(0, 0, 100, 40);
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const isFullWidth = positioningHelper.isFullWidth();

      // Assert
      expect(isFullWidth).toBeTruthy();
    });

    it("returns false when the content is narrower than document.body", () => {
      // Arrange
      const preferredPosition = "bottom";
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(0, 0, 100, 40);
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const isFullWidth = positioningHelper.isFullWidth();

      // Assert
      expect(isFullWidth).toBeFalsy();
    });
  });

  describe("getLocation", () => {
    it("returns the preferred location if it is available", () => {
      // Arrange
      const preferredPosition = "right";
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(0, 0, 100, 40);
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const location = positioningHelper.getLocation();

      // Assert
      expect(location).toBe(preferredPosition);
    });

    it("prefers the opposite side when the preferred side is not available", () => {
      // Arrange
      const preferredPosition = "right";
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(
        document.body.clientWidth - 100,
        0,
        100,
        40
      );
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const location = positioningHelper.getLocation();

      // Assert
      expect(location).toBe("left");
    });

    it("prefers the bottom side when left and right are not available", () => {
      // Arrange
      const preferredPosition = "right";
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(0, 0, document.body.clientWidth, 40);
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const location = positioningHelper.getLocation();

      // Assert
      expect(location).toBe("bottom");
    });

    it("prefers the right side when top and bottom are not available", () => {
      // Arrange
      const preferredPosition = "right";
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(0, 0, document.body.clientWidth, 40);
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const location = positioningHelper.getLocation();

      // Assert
      expect(location).toBe("bottom");
    });

    it("falls back to bottom when no side is available", () => {
      // Arrange
      const preferredPosition = "right";
      const contentRect = new DOMRect(0, 0, 100, 100);
      const triggerRect = new DOMRect(
        0,
        0,
        document.body.clientWidth,
        document.body.clientHeight
      );
      const positioningHelper = new PositioningHelper(
        preferredPosition,
        contentRect,
        triggerRect
      );

      // Act
      const location = positioningHelper.getLocation();

      // Assert
      expect(location).toBe("bottom");
    });
  });
});
