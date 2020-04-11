import React from "react";
import cn from "classnames";

import "./TextInput.css";

interface Props {
  className?: string;
  errorMessage?: string;
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  inputRef?: React.RefObject<HTMLInputElement>;
  rightElement?: React.ReactNode;
  style?: React.CSSProperties;
}

const TextInput: React.FunctionComponent<Props> = ({
  className,
  inputRef,
  inputProps,
  rightElement,
  style,
}) => (
  <div className={cn("TextInput", className)} style={style}>
    <input ref={inputRef} type="text" {...inputProps} />
    {rightElement && (
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          height: "3.25rem",
          right: "0",
          top: "0",
        }}
      >
        {rightElement}
      </div>
    )}
  </div>
);

export default TextInput;
