import React from "react";
import convert from "color-convert";

import StoreContext, { Store } from "../../contexts/StoreContext";

import "./Background.css";

interface Props {}

type PropsFromStore = ReturnType<typeof select>;

class Background extends React.PureComponent<Props & PropsFromStore> {
  public render() {
    const { color } = this.props;

    document.documentElement.style.setProperty(
      "--accent-darken-2",
      color ? `rgb(${this.darkenColor(color, 1).join(", ")})` : null
    );
    document.documentElement.style.setProperty(
      "--accent-darken",
      color ? `rgb(${this.darkenColor(color, 1.3).join(", ")})` : null
    );
    document.documentElement.style.setProperty(
      "--accent",
      color ? `rgb(${this.darkenColor(color, 2.2).join(", ")})` : null
    );
    document.documentElement.style.setProperty(
      "--accent-lighten",
      color ? `rgb(${this.darkenColor(color, 2.5).join(", ")})` : null
    );
    document.documentElement.style.setProperty(
      "--accent-lighten-2",
      color ? `rgb(${this.darkenColor(color, 3.2).join(", ")})` : null
    );

    return (
      <div
        className="Background"
        style={{
          background: this.getLinearGradient(color),
        }}
      />
    );
  }

  private getLinearGradient = (
    requestedFromColor?: [number, number, number],
    requestedToColor?: [number, number, number]
  ) => {
    const black: [number, number, number] = [24, 24, 24];
    const blackLighten: [number, number, number] = [32, 32, 32];

    const fromColor =
      requestedFromColor || (requestedToColor ? black : blackLighten);
    const toColor =
      (requestedToColor && this.darkenColor(requestedToColor, 0.4)) ||
      (requestedFromColor
        ? this.darkenColor(fromColor, 0.1)
        : this.darkenColor(blackLighten, 0.4));

    return `
      linear-gradient(
      to bottom right,
      rgb(${fromColor.join(", ")}),
      rgb(${toColor.join(", ")})
    )`;
  };

  private darkenColor(
    color: [number, number, number],
    luminosityMultiplier: number
  ) {
    const colorHSL = convert.rgb.hsl(color);
    colorHSL[2] = colorHSL[2] * luminosityMultiplier;
    return convert.hsl.rgb(colorHSL);
  }
}

function select(store: Store) {
  const destinationPlaylistColor = store.destinationPlaylistId
    ? store.playlistColors[store.destinationPlaylistId]
    : undefined;
  const sourcePlaylistColor = store.sourcePlaylistId
    ? store.playlistColors[store.sourcePlaylistId]
    : undefined;

  let color = destinationPlaylistColor || sourcePlaylistColor;

  if (color) {
    const [hue, saturation] = convert.rgb.hsl(color);
    color = convert.hsl.rgb([hue, saturation, 30]);
  }

  return {
    color,
  };
}

export default React.memo((props: Props) => {
  const { store } = React.useContext(StoreContext);
  const selectors = select(store);
  return <Background {...selectors} {...props} />;
});
