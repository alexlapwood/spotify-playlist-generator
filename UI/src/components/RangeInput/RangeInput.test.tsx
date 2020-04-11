import React from "react";
import ReactDOM from "react-dom";
import RangeInput from "./RangeInput";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<RangeInput />, div);
  ReactDOM.unmountComponentAtNode(div);
});
