import React from "react";
import { MdMusicNote } from "react-icons/md";

import "./Track.css";

export default class Track extends React.PureComponent<
  SpotifyApi.TrackObjectFull
> {
  public render() {
    const { duration_ms } = this.props;
    const duration_s = Math.floor(duration_ms / 1000);
    const duration = {
      minutes: Math.floor(duration_s / 60),
      seconds: String(Math.round(duration_s % 60)).padStart(2, "0"),
    };

    return (
      <div className="Track">
        <div style={{ marginTop: "0.125rem" }}>
          <MdMusicNote size="1rem" />
        </div>
        <div>
          <div className="Track-name utility-truncate">
            <a href={this.props.external_urls.spotify}>{this.props.name}</a>
          </div>
          <div className="Track-details">
            {this.props.explicit && (
              <div className="Track-tags">
                <span className="Tag">Explicit</span>
              </div>
            )}
            <div className="Track-artists utility-truncate">
              {this.props.artists.map((artist, i) => {
                return (
                  <a
                    href={artist.external_urls.spotify}
                    key={`${artist.id}${i}`}
                  >
                    {artist.name}
                    {i < this.props.artists.length - 1 && ","}
                  </a>
                );
              })}
            </div>
            <span>•</span>
            <div className="Track-album utility-truncate">
              <a href={this.props.album.external_urls.spotify}>
                {this.props.album.name}
              </a>
            </div>
          </div>
        </div>
        <div>
          <span className="Track-duration">
            {duration.minutes}:{duration.seconds}
          </span>
        </div>
      </div>
    );
  }
}
