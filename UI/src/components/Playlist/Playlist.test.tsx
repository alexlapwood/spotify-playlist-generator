import React from "react";
import ReactDOM from "react-dom";
import Playlist from "./Playlist";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Playlist {...({} as any)} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
