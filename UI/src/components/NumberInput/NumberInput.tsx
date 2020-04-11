import React from "react";
import cn from "classnames";

import "./NumberInput.css";

interface Props {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  errorMessage?: string;
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  style?: React.CSSProperties;
  value?: string;
}

const NumberInput: React.FunctionComponent<Props> = ({
  children,
  className,
  id,
  inputRef,
  inputProps,
  onChange,
  style,
  value,
}) => (
  <div className={cn("NumberInput", className)} style={style}>
    <input
      id={id}
      onChange={onChange}
      ref={inputRef}
      type="number"
      value={value}
      {...inputProps}
    />
    <label htmlFor={id}>{children}</label>
  </div>
);

export default NumberInput;
