import React from "react";
import ReactDOM from "react-dom";
import SelectPlaylist from "./SelectPlaylist";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<SelectPlaylist />, div);
  ReactDOM.unmountComponentAtNode(div);
});
