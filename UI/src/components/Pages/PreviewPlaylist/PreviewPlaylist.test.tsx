import React from "react";
import ReactDOM from "react-dom";
import PreviewPlaylist from "./PreviewPlaylist";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<PreviewPlaylist />, div);
  ReactDOM.unmountComponentAtNode(div);
});
