import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import React from "react";

import getFocusableElement from "../getFocusableElement";

Enzyme.configure({ adapter: new Adapter() });

jest.mock("uuid/v4", () => jest.fn(() => "123"));

describe("getFocusableElement", () => {
  it("returns the element if it is focusable", () => {
    // Arrange
    const expectedAutomationId = "test";
    const wrapper = mount(<input data-automationid={expectedAutomationId} />);

    // Act
    const focusableElement = getFocusableElement(
      wrapper.getDOMNode<HTMLElement>()
    );

    // Assert
    expect(focusableElement?.getAttribute("data-automationid")).toBe(
      expectedAutomationId
    );
  });

  it("returns the first focusable child if the element is not focusable", () => {
    // Arrange
    const expectedId = "expected-input";
    const wrapper = mount(
      <div>
        <input id={expectedId} />
      </div>
    );

    // Act
    const focusableElement = getFocusableElement(
      wrapper.getDOMNode<HTMLElement>()
    );

    // Assert
    expect(focusableElement?.id).toBe(expectedId);
  });

  it("returns null if the element is not focusable and has no focusable children", () => {
    // Arrange
    const wrapper = mount(
      <div>
        <div />
      </div>
    );

    // Act
    const focusableElement = getFocusableElement(
      wrapper.getDOMNode<HTMLElement>()
    );

    // Assert
    expect(focusableElement).toBe(null);
  });

  it("returns null if no element is passed in", () => {
    expect(getFocusableElement(null)).toBe(null);
  });
});
