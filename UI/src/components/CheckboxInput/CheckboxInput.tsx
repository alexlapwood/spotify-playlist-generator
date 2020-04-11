import React from "react";
import cn from "classnames";

import "./CheckboxInput.css";

interface Props {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  isChecked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const CheckboxInput: React.FunctionComponent<Props> = ({
  children,
  className,
  id,
  isChecked,
  onChange,
}) => (
  <div className={cn("CheckboxInput", className)}>
    <input id={id} checked={isChecked} onChange={onChange} type="checkbox" />
    <label htmlFor={id}>{children}</label>
  </div>
);

export default CheckboxInput;
