import React from "react";
import InputRange from "react-input-range";

import "./RangeInput.css";

interface Props extends React.ComponentProps<typeof InputRange> {
  id?: string;
  label?: React.ReactNode;
}

const RangeInput: React.FunctionComponent<Props> = ({
  id,
  label,
  ...props
}) => {
  return (
    <React.Fragment>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="RangeInput" id={id}>
        <InputRange draggableTrack {...props} />
      </div>
    </React.Fragment>
  );
};

export default RangeInput;
