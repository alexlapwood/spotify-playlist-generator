import React from "react";

import "./RangeInput.css";

interface Props {
  id: string;
  format: (value: string) => string;
  label: React.ReactNode;
  onChange?: (value: number) => void;
  min: number;
  max: number;
  value: {
    min: number;
    max: number;
  };
}

const RangeInput: React.FunctionComponent<Props> = ({
  id,
  format,
  label,
  onChange,
  min,
  max,
  value,
}) => {
  const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX } = event;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const percent = (clientX - left) / width;
    const newValue = Math.round((max - min) * percent + min);
    onChange && onChange(newValue);
  };

  return (
    <React.Fragment>
      {label && <label htmlFor={id}>{label}</label>}
      <div
        className="RangeInput"
        style={
          {
            "--min": value.min,
            "--max": value.max,
            "--min-percent": format(
              String(((value.min - min) / (max - min)) * 100)
            ),
            "--max-percent": format(
              String(((value.max - min) / (max - min)) * 100)
            ),
          } as React.CSSProperties
        }
        onPointerDown={(event) => {
          if (event.buttons === 1) {
            event.preventDefault();
            handleOnClick(event);
          }
        }}
        onTouchMove={(event) => {
          event.preventDefault();
          // @ts-ignore
          handleOnClick(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handleOnClick(event);
          }
        }}
      >
        <div className="RangeInput--track"></div>
        <div className="RangeInput--range"></div>
      </div>
    </React.Fragment>
  );
};

export default RangeInput;
