import React from "react";
import ReactDOM from "react-dom";
import ConfigurePlaylist from "./ConfigurePlaylist";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<ConfigurePlaylist />, div);
  ReactDOM.unmountComponentAtNode(div);
});
