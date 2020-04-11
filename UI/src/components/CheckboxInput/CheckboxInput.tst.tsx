import React from "react";
import ReactDOM from "react-dom";
import CheckboxInput from "./CheckboxInput";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<CheckboxInput />, div);
  ReactDOM.unmountComponentAtNode(div);
});
