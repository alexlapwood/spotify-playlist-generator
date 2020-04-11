import React from "react";
import cn from "classnames";

import "./Loader.css";

interface Props {
  size?: "small" | "medium";
}

export default React.memo(function Loader({
  size,
  ...spreadProps
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("Loader", size === "small" && "Loader--small")}
      {...spreadProps}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
});
