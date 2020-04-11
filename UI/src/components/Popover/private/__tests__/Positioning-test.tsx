import React from "react";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import toJson from "enzyme-to-json";

import Positioning from "../Positioning";

Enzyme.configure({ adapter: new Adapter() });

describe("<Positioning />", () => {
  it("renders without crashing", () => {
    // Arrange
    const triggerRef = React.createRef<HTMLElement>();
    const wrapper = shallow(
      <Positioning triggerRef={triggerRef}>
        {(side) => <div>{side}</div>}
      </Positioning>
    );

    // Assert
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
