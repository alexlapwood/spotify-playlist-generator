import React from "react";
import ReactDOM from "react-dom";
import Track from "./Track";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Track
      {...({
        album: {
          external_urls: {}
        },
        artists: [],
        external_urls: {}
      } as any)}
    />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
