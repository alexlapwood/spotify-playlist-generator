import React from "react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import Popover from "../Popover";
import Positioning from "../private/Positioning";

jest.mock("uuid/v4", () => jest.fn(() => "123"));

describe("<Popover />", () => {
  it("renders without crashing", () => {
    // Arrange
    const triggerRef = React.createRef<HTMLElement>();
    const wrapper = mount(
      <Popover id="test-popover" triggerRef={triggerRef} />
    );

    // Assert
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it("calls onClickOutside when a click event occurs outside the popover", () => {
    // Arrange
    const onClickOutsideMock = jest.fn();
    const triggerRef = React.createRef<HTMLElement>();
    mount(
      <Popover
        id="test-popover"
        onClickOutside={onClickOutsideMock}
        triggerRef={triggerRef}
      />
    );

    // Act
    const clickEvent = new MouseEvent("click");
    document.dispatchEvent(clickEvent);

    // Assert
    expect(onClickOutsideMock).toHaveBeenCalled();
  });

  it("closing the popover from within the popover returns the focus to the trigger", () => {
    // Arrange
    const triggerFocusMock = jest.fn();
    const closeButtonRef = React.createRef<HTMLButtonElement>();
    const trigger = document.createElement("button");
    const triggerRef = { current: trigger };
    triggerRef.current.addEventListener("focus", triggerFocusMock);
    const wrapper = mount(
      <Popover id="test-popover" triggerRef={triggerRef}>
        <button ref={closeButtonRef} type="button" />
      </Popover>
    );

    // Act
    closeButtonRef.current?.focus();
    wrapper.instance().componentWillUnmount?.();

    // Assert
    expect(triggerFocusMock).toHaveBeenCalled();
  });

  it("closing the popover from outside the popover does not return the focus to the trigger", () => {
    // Arrange
    const triggerFocusMock = jest.fn();
    const trigger = document.createElement("button");
    const triggerRef = { current: trigger };
    triggerRef.current.addEventListener("focus", triggerFocusMock);
    const wrapper = mount(
      <Popover id="test-popover" triggerRef={triggerRef} />
    );

    // Act
    wrapper.instance().componentWillUnmount?.();

    // Assert
    expect(triggerFocusMock).not.toHaveBeenCalled();
  });

  describe("triggerRef", () => {
    it("proxies the rootNode callback ref of class components", () => {
      // Arrange
      const trigger = document.createElement("button");
      const triggerClassComponent = { rootNode: trigger };
      const triggerRef = { current: triggerClassComponent };
      const wrapper = mount(
        <Popover id="test-popover" triggerRef={triggerRef} />
      );

      // Assert
      expect(wrapper.find(Positioning).first().props().triggerRef.current).toBe(
        trigger
      );
    });

    it("proxies the rootNode ref object of class components", () => {
      // Arrange
      const trigger = document.createElement("button");
      const triggerClassComponent = { rootNode: { current: trigger } };
      const triggerRef = { current: triggerClassComponent };
      const wrapper = mount(
        <Popover id="test-popover" triggerRef={triggerRef} />
      );

      // Assert
      expect(wrapper.find(Positioning).first().props().triggerRef.current).toBe(
        trigger
      );
    });
  });
});
